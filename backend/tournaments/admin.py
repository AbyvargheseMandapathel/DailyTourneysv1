from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Tournament, Team, Match, Score

# Register custom User model
admin.site.register(User, UserAdmin)

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'creator', 'status', 'created_at')
    list_filter = ('status', 'creator')
    search_fields = ('name', 'creator__username')

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'tournament', 'member_count')
    list_filter = ('tournament',)
    search_fields = ('name',)

    def member_count(self, obj):
        return obj.members.count()

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('tournament', 'match_number', 'map_name', 'created_at')
    list_filter = ('tournament', 'map_name')

@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('match', 'team', 'kills', 'placement', 'total_points')
    list_filter = ('match__tournament', 'match')
    readonly_fields = ('total_points',)

from .models import FeaturedContent

@admin.register(FeaturedContent)
class FeaturedContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'priority', 'active')
    list_list = ('content_type', 'active')
    search_fields = ('title',)
    ordering = ('-priority',)
