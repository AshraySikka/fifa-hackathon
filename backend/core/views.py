import requests

from django.conf import settings
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .llm import call_claude
from .models import Bar, Match, ScreeningTag
from .serializers import (
    BarSerializer,
    MatchSerializer,
    ScreeningTagSerializer,
    SignupSerializer,
)
from .team_stats import elo_predict


# --------------------------------------------------------------------------
# Auth
# --------------------------------------------------------------------------
class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED)


# login uses DRF's built-in obtain_auth_token, wired directly in urls.py


# --------------------------------------------------------------------------
# Challenge 4 -- Watch Party Finder
# --------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def bar_list(request):
    """List bars, optionally filtered by team and/or vibe."""
    qs = Bar.objects.all()
    team = request.query_params.get("team")
    vibe = request.query_params.get("vibe")
    if team:
        qs = qs.filter(team_tags__icontains=team)
    if vibe:
        qs = qs.filter(vibe=vibe)
    return Response(BarSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def bar_search_google_places(request):
    """
    Live search against Google Places Text Search API for bars/pubs in
    Toronto. Requires GOOGLE_PLACES_API_KEY in backend/.env -- returns a
    clear error message (not a crash) if it's missing so the rest of the
    demo still works off seed data.
    """
    query = request.query_params.get("q", "sports bar Toronto")

    if not settings.GOOGLE_PLACES_API_KEY:
        return Response(
            {"error": "GOOGLE_PLACES_API_KEY not set in backend/.env. Showing seed data only."},
            status=status.HTTP_200_OK,
        )

    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": (
            "places.displayName,places.formattedAddress,places.rating,"
            "places.internationalPhoneNumber,places.location,"
            "places.regularOpeningHours,places.id"
        ),
    }
    body = {"textQuery": query, "locationBias": {
        "circle": {"center": {"latitude": 43.6532, "longitude": -79.3832}, "radius": 15000.0}
    }}

    try:
        resp = requests.post(url, json=body, headers=headers, timeout=10)
        resp.raise_for_status()
        places = resp.json().get("places", [])
    except requests.RequestException as exc:
        return Response({"error": f"Google Places request failed: {exc}"}, status=status.HTTP_502_BAD_GATEWAY)

    created = []
    for p in places:
        loc = p.get("location", {})
        hours_list = p.get("regularOpeningHours", {}).get("weekdayDescriptions", [])
        bar, _ = Bar.objects.update_or_create(
            google_place_id=p.get("id"),
            defaults={
                "name": p.get("displayName", {}).get("text", "Unknown"),
                "address": p.get("formattedAddress", ""),
                "phone": p.get("internationalPhoneNumber", ""),
                "rating": p.get("rating", 0) or 0,
                "hours": "; ".join(hours_list) if hours_list else "",
                "lat": loc.get("latitude", 43.6532),
                "lng": loc.get("longitude", -79.3832),
                "vibe": "casual",
                "source": "google_places",
            },
        )
        created.append(bar)

    return Response(BarSerializer(created, many=True).data)


class ScreeningTagView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ScreeningTagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tag, _ = ScreeningTag.objects.get_or_create(
            bar_id=request.data["bar"],
            match_id=request.data["match"],
            user=request.user,
        )
        return Response(ScreeningTagSerializer(tag).data, status=status.HTTP_201_CREATED)


# --------------------------------------------------------------------------
# Match schedule
# --------------------------------------------------------------------------
@api_view(["GET"])
@permission_classes([AllowAny])
def match_list(request):
    return Response(MatchSerializer(Match.objects.all(), many=True).data)


# --------------------------------------------------------------------------
# Challenge 6 -- Referee Decision Explainer
# --------------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def ref_explain(request):
    question = request.data.get("question", "").strip()
    commentary_context = request.data.get("commentary_context", "").strip()
    if not question:
        return Response({"error": "question is required"}, status=status.HTTP_400_BAD_REQUEST)

    if commentary_context:
        system = (
            "You are a FIFA-certified referee explainer for a World Cup 2026 fan app. "
            "The fan is watching a live match and just saw the commentary passage below. "
            "Use ONLY that passage as your factual account of what happened -- don't invent "
            "extra details. Explain the referee's likely decision in plain, friendly English, "
            "and always cite the specific IFAB Law of the Game number and name "
            "(e.g. 'Law 11 - Offside') that applies. Keep it under 120 words.\n\n"
            f"Live commentary: \"{commentary_context}\""
        )
    else:
        system = (
            "You are a FIFA-certified referee explainer for a World Cup 2026 fan app. "
            "Answer the fan's rules question in plain, friendly English. "
            "Always cite the specific IFAB Law of the Game number and name "
            "(e.g. 'Law 11 - Offside') that applies. Keep it under 120 words."
        )

    answer = call_claude(question, system=system, max_tokens=300)
    return Response({"question": question, "answer": answer})


# --------------------------------------------------------------------------
# Challenge 1 -- Match Predictor
# --------------------------------------------------------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
def match_predict(request):
    team_a = request.data.get("team_a", "").strip()
    team_b = request.data.get("team_b", "").strip()
    if not team_a or not team_b:
        return Response({"error": "team_a and team_b are required"}, status=status.HTTP_400_BAD_REQUEST)

    probs = elo_predict(team_a, team_b)

    prompt = (
        f"Explain this football prediction in 2-3 punchy sentences, like a confident "
        f"sports analyst, no hedging filler. Do not invent stats beyond what's given here.\n\n"
        f"{team_a} (FIFA rating {probs['team_a_rating']}) vs {team_b} (FIFA rating {probs['team_b_rating']}).\n"
        f"Rating gap: {probs['rating_gap']} points in {team_a}'s favor (negative means {team_b} favored).\n"
        f"Model output: {probs['team_a_win_pct']}% {team_a} win, {probs['draw_pct']}% draw, "
        f"{probs['team_b_win_pct']}% {team_b} win."
    )
    explanation = call_claude(prompt, max_tokens=200)
    return Response({"team_a": team_a, "team_b": team_b, **probs, "explanation": explanation})
