from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Tournament, Team, Match, Score, FeaturedContent

# Register custom User model
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'is_pro', 'is_approved', 'is_staff']
    list_filter = ['role', 'is_pro', 'is_approved', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Esports Daily Info', {'fields': ('role', 'is_pro', 'is_approved')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Esports Daily Info', {'fields': ('role', 'is_pro', 'is_approved')}),
    )

admin.site.register(User, CustomUserAdmin)

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

@admin.register(FeaturedContent)
class FeaturedContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'priority', 'active')
    list_filter = ('content_type', 'active') # fixed typo list_list -> list_filter
    search_fields = ('title',)
    ordering = ('-priority',)
