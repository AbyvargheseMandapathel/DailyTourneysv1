from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Superuser'
        ORGANISER = 'ORGANISER', 'Organiser'
        PLAYER = 'PLAYER', 'Player'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PLAYER)

    def is_organiser(self):
        return self.role == self.Role.ORGANISER
    
    def is_player(self):
        return self.role == self.Role.PLAYER

class Tournament(models.Model):
    name = models.CharField(max_length=255)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tournaments')
    created_at = models.DateTimeField(auto_now_add=True)
    # Default points: 1st=12, 2nd=9, 3rd=7, 4th=5, 5th=4, 6-7=3, 8-10=2, 11-12=1, Kill=1
    points_config = models.JSONField(default=dict) 
    status = models.CharField(max_length=20, default='ACTIVE')
    description = models.TextField(blank=True, default='')
    logo = models.ImageField(upload_to='tournament_logos/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='tournament_covers/', blank=True, null=True)

    def __str__(self):
        return self.name

class Team(models.Model):
    name = models.CharField(max_length=255)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='teams')
    members = models.ManyToManyField(User, related_name='teams', blank=True)
    logo = models.ImageField(upload_to='team_logos/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.tournament.name})"

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    match_number = models.IntegerField()
    map_name = models.CharField(max_length=100, default="Erangel")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tournament', 'match_number')

    def __str__(self):
        return f"{self.tournament.name} - Match {self.match_number} ({self.map_name})"

class Score(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='scores')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='scores')
    kills = models.IntegerField(default=0)
    placement = models.IntegerField()
    total_points = models.IntegerField(default=0)

    class Meta:
        unique_together = ('match', 'team')
    
    def save(self, *args, **kwargs):
        # Calculate points based on tournament config
        config = self.match.tournament.points_config
        # Simple logic: config might be {"placement": {"1": 10}, "kill": 1}
        # Or just flat {"1": 10, "kill": 1}
        # MVP: assume kills is 'kill' key, placement is string of rank
        
        place_pts = config.get(str(self.placement), 0)
        self.total_points = kill_pts + place_pts
        super().save(*args, **kwargs)

class FeaturedContent(models.Model):
    class ContentType(models.TextChoices):
        MAIN = 'MAIN', 'Main Hero (Large)'
        SIDE = 'SIDE', 'Side Card (Small Vertical)'
        BOTTOM = 'BOTTOM', 'Bottom Card (Small Horizontal)'

    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='featured_images/')
    link_url = models.CharField(max_length=255, default='/')
    content_type = models.CharField(max_length=20, choices=ContentType.choices, default=ContentType.MAIN)
    priority = models.IntegerField(default=0, help_text="Higher number appears first/top")
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.content_type})"
