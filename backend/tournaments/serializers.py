from rest_framework import serializers
from .models import User, Tournament, Team, Match, Score, FeaturedContent

class FeaturedContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeaturedContent
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'is_pro', 'is_approved']
        read_only_fields = ['role', 'is_pro', 'is_approved'] # Only admin can change these

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
    
    force_update = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Score
        fields = ['id', 'match', 'team', 'team_name', 'kills', 'placement', 'total_points', 'force_update']
        read_only_fields = ['total_points'] # calculated on save

    def validate(self, data):
        # 2) make sure no match can have two same positions
        match = data.get('match')
        placement = data.get('placement')
        force_update = data.get('force_update', False)
        
        # If this is an update, we need to handle instance
        instance = self.instance

        if match and placement:
            # Check if any OTHER score in this match has the same placement
            qs = Score.objects.filter(match=match, placement=placement)
            if instance:
                qs = qs.exclude(pk=instance.pk)
            
            conflicting_score = qs.first()
            if conflicting_score:
                if force_update:
                    # Perform Delete
                    conflicting_score.delete()
                else:
                    raise serializers.ValidationError({
                        "placement": f"Placement {placement} is already taken by {conflicting_score.team.name}.",
                        "code": "placement_conflict"
                    })
        
        return data
