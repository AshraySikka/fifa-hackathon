from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from . import views

urlpatterns = [
    path("auth/signup/", views.SignupView.as_view(), name="signup"),
    path("auth/login/", obtain_auth_token, name="login"),

    path("bars/", views.bar_list, name="bar-list"),
    path("bars/search-google/", views.bar_search_google_places, name="bar-search-google"),
    path("screening-tags/", views.ScreeningTagView.as_view(), name="screening-tag-create"),

    path("matches/", views.match_list, name="match-list"),

    path("ref-explain/", views.ref_explain, name="ref-explain"),
    path("predict/", views.match_predict, name="match-predict"),

    path("chat/nearby-room/", views.chat_nearby_room, name="chat-nearby-room"),
    path("chat/rooms/", views.chat_create_global_room, name="chat-create-room"),
    path("chat/rooms/<str:code>/messages/", views.chat_room_messages, name="chat-room-messages"),
]
