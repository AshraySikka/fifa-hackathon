from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Bar, ChatMessage, ChatRoom, Match, ScreeningTag


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ["id", "team_a", "team_b", "date", "time", "venue"]


class ScreeningTagSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    match_label = serializers.SerializerMethodField()

    class Meta:
        model = ScreeningTag
        fields = ["id", "bar", "match", "match_label", "user", "username", "created_at"]
        read_only_fields = ["user"]

    def get_match_label(self, obj):
        return f"{obj.match.team_a} vs {obj.match.team_b}"


class BarSerializer(serializers.ModelSerializer):
    screening_tags = ScreeningTagSerializer(many=True, read_only=True)
    team_tag_list = serializers.SerializerMethodField()

    class Meta:
        model = Bar
        fields = [
            "id", "name", "address", "phone", "rating", "hours",
            "lat", "lng", "vibe", "team_tags", "team_tag_list",
            "google_place_id", "source", "screening_tags",
        ]

    def get_team_tag_list(self, obj):
        return [t.strip() for t in obj.team_tags.split(",") if t.strip()]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ["id", "sender_name", "text", "created_at"]


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ["id", "code", "kind", "created_at"]


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)

    class Meta:
        model = User
        fields = ["username", "password"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )
