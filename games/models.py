from django.db import models

# Create your models here.
class Game(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Map(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="maps")
    name = models.CharField(max_length=100)

    class Meta:
        unique_together = ("game", "name")

    def __str__(self):
        return f"{self.game.name} - {self.name}"