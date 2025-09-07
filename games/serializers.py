from rest_framework import serializers
from .models import Game, Map


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "name"]


class MapSerializer(serializers.ModelSerializer):
    game_name = serializers.ReadOnlyField(source="game.name")

    class Meta:
        model = Map
        fields = ["id", "name", "game", "game_name"]
