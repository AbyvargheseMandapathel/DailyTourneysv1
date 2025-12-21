from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Superuser'
        ORGANISER = 'ORGANISER', 'Organiser'
        PLAYER = 'PLAYER', 'Player'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PLAYER)
    is_pro = models.BooleanField(default=False, help_text="Designates whether this user is a Pro Organiser (only configurable by Superuser).")
    is_approved = models.BooleanField(default=False, help_text="Designates whether this organiser is approved.")

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
        try:
            # Calculate points based on tournament config
            if not self.match or not self.match.tournament:
                 print("Score Save Error: Match or Tournament not found")
                 super().save(*args, **kwargs)
                 return

            config = self.match.tournament.points_config
            # Ensure config is a dict
            if not isinstance(config, dict):
                 print(f"Score Save Warning: points_config is not a dict: {type(config)}")
                 config = {}

            # MVP: assume kills is 'kill' key (default 1), placement is string of rank
            
            kill_mult = config.get('kill', 1)
            # Ensure it's int
            try:
                kill_mult = int(kill_mult)
            except (ValueError, TypeError):
                kill_mult = 1
                
            kill_pts = self.kills * kill_mult
            
            # Calculate placement points handling ranges like "7-8"
            place_pts = 0
            placement_str = str(self.placement)
            
            # Direct lookup first
            if placement_str in config:
                place_value = config[placement_str]
            else:
                # Check ranges
                found_range_points = 0
                for key, value in config.items():
                    if '-' in key:
                        try:
                            start, end = map(int, key.split('-'))
                            if start <= self.placement <= end:
                                found_range_points = value
                                break
                        except ValueError:
                            continue # Skip malformed keys
                place_value = found_range_points

            # Ensure it's int
            try:
                place_pts = int(place_value)
            except (ValueError, TypeError):
                place_pts = 0

            self.total_points = kill_pts + place_pts
            super().save(*args, **kwargs)
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"CRITICAL ERROR IN SCORE.SAVE: {e}")
            # Re-raise to alert DRF
            raise e

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
