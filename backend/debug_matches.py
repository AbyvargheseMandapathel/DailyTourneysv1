import os
import django
import sys
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'daily_tourneys.settings')
django.setup()

from tournaments.models import Match, Score
from tournaments.serializers import MatchSerializer

def check_match_winners():
    matches = Match.objects.all()
    serializer = MatchSerializer(matches, many=True)
    data = serializer.data
    
    print(f"Found {len(data)} matches.")
    for m in data:
        if m.get('winner'):
            print(f"Match {m['match_number']} Winner: {m['winner']['team_name']} | Kills: {m['winner'].get('kills')} | Pts: {m['winner'].get('total_points')}")
            
            # Cross reference with DB directly
            score = Score.objects.filter(match_id=m['id'], placement=1).first()
            if score:
                print(f"   -> DB Verification: Score ID {score.id} has kills={score.kills}")
            else:
                print("   -> DB Verification: No winner score found (placement=1)")
        else:
            print(f"Match {m['match_number']} has no winner.")

if __name__ == "__main__":
    check_match_winners()
