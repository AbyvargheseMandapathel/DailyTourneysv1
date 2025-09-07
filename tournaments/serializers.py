from rest_framework import serializers
from .models import Tournament, Team 
from games.models import Map


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name", "logo"]


class TournamentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source="author.email")
    teams = TeamSerializer(many=True, read_only=True)
    maps = serializers.PrimaryKeyRelatedField(queryset=Map.objects.all(), many=True)

    class Meta:
        model = Tournament
        fields = [
            "id", "author", "name", "game", "description",
            "teams", "no_of_matches", "maps",
            "from_date", "to_date", "overall_score"
        ]

    def validate(self, data):
        no_of_matches = data.get("no_of_matches")
        maps = data.get("maps", [])

        if no_of_matches and len(maps) != no_of_matches:
            raise serializers.ValidationError(
                {"maps": f"Must provide exactly {no_of_matches} maps"}
            )
        return data

    def create(self, validated_data):
        maps = validated_data.pop("maps", [])
        tournament = Tournament.objects.create(**validated_data)
        tournament.maps.set(maps)
        return tournament
