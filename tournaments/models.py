from django.db import models
from django.conf import settings
from games.models import Game, Map

User = settings.AUTH_USER_MODEL


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to="team_logos/", blank=True, null=True)

    def __str__(self):
        return self.name


class Tournament(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tournaments")
    name = models.CharField(max_length=200)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    teams = models.ManyToManyField(Team, blank=True)
    no_of_matches = models.PositiveIntegerField(default=1)
    maps = models.ManyToManyField(Map, blank=True)
    from_date = models.DateField()
    to_date = models.DateField()
    overall_score = models.IntegerField(default=0)

    def clean(self):
        if self.teams.count() > 25:
            raise ValueError("Maximum 25 teams allowed for BGMI")
        if self.maps.count() != self.no_of_matches:
            raise ValueError(f"Number of maps ({self.maps.count()}) must equal number of matches ({self.no_of_matches})")

    def __str__(self):
        return self.name
