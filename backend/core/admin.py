from django.contrib import admin

from .models import Bar, ChatMessage, ChatRoom, Match, ScreeningTag

admin.site.register(Bar)
admin.site.register(Match)
admin.site.register(ScreeningTag)
admin.site.register(ChatRoom)
admin.site.register(ChatMessage)
