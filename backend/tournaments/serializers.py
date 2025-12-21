from rest_framework import serializers
from .models import User, Tournament, Team, Match, Score, FeaturedContent, TournamentTheme

class FeaturedContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeaturedContent
        fields = '__all__'

class TournamentThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentTheme
        fields = ['id', 'name', 'theme_image', 'custom_font', 'layout_config', 'teams_per_page', 'tournament', 'created_at']
        read_only_fields = ['created_at']

    def to_internal_value(self, data):
        # Handle layout_config sent as JSON string in FormData
        print(f"DEBUG: to_internal_value received raw data: {data}")
        if 'layout_config' in data:
             print(f"DEBUG: layout_config type: {type(data['layout_config'])}")
             print(f"DEBUG: layout_config value: {data['layout_config']}")

        if 'layout_config' in data and isinstance(data['layout_config'], str):
            import json
            try:
                # Handle QueryDict immutability for Multipart
                if hasattr(data, 'dict'):
                    data = data.dict()
                else:
                    data = data.copy()
                
                data['layout_config'] = json.loads(data['layout_config'])
                print(f"DEBUG: Parsed layout_config: {data['layout_config']}")
                return super().to_internal_value(data)
            except json.JSONDecodeError as e:
                print(f"DEBUG: JSONDecodeError: {e}")
                pass # Let standard validation handle error
        return super().to_internal_value(data)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'is_pro', 'is_approved']
        read_only_fields = ['role', 'is_pro', 'is_approved'] # Only admin can change these

class TournamentSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField()
    themes = TournamentThemeSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'creator', 'creator_username', 'created_at', 'points_config', 'status', 'description', 'logo', 'cover_image', 'theme_image', 'layout_config', 'themes']
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
    winner = serializers.SerializerMethodField()
    
    class Meta:
        model = Match
        fields = ['id', 'tournament', 'tournament_name', 'match_number', 'map_name', 'created_at', 'winner']

    def get_winner(self, obj):
        # Find score with placement 1
        winning_score = obj.scores.filter(placement=1).first()
        if winning_score:
            return {
                "team_name": winning_score.team.name,
                "team_logo": winning_score.team.logo.url if winning_score.team.logo else None,
                "kills": winning_score.kills,
                "total_points": winning_score.total_points
            }
        return None

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

    def create(self, validated_data):
        # Remove 'force_update' from validated_data because it's not a model field
        validated_data.pop('force_update', None)
        return super().create(validated_data)
