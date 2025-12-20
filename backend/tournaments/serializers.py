from rest_framework import serializers
from .models import User, Tournament, Team, Match, Score, FeaturedContent

class FeaturedContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeaturedContent
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']
        read_only_fields = ['role'] # Only admin can change role potentially? For MVP user creation handles role.

class TournamentSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'creator', 'creator_username', 'created_at', 'points_config', 'status', 'description', 'logo', 'cover_image']
        read_only_fields = ['creator', 'created_at']

    def get_creator_username(self, obj):
        try:
            return obj.creator.username if obj.creator else "Unknown"
        except AttributeError:
             return "Unknown"
        except Exception:
             return "Unknown"

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'tournament', 'members', 'logo']

class MatchSerializer(serializers.ModelSerializer):
    tournament_name = serializers.ReadOnlyField(source='tournament.name')
    
    class Meta:
        model = Match
        fields = ['id', 'tournament', 'tournament_name', 'match_number', 'map_name', 'created_at']

class ScoreSerializer(serializers.ModelSerializer):
    team_name = serializers.ReadOnlyField(source='team.name')
    
    class Meta:
        model = Score
        fields = ['id', 'match', 'team', 'team_name', 'kills', 'placement', 'total_points']
        read_only_fields = ['total_points'] # calculated on save
