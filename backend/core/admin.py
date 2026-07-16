from django.contrib import admin

from .models import Bar, Match, ScreeningTag

admin.site.register(Bar)
admin.site.register(Match)
admin.site.register(ScreeningTag)
