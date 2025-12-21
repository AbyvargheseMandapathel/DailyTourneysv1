import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'daily_tourneys.settings')
django.setup()

from tournaments.views import TournamentViewSet
from tournaments.models import Tournament
from rest_framework.test import APIRequestFactory

def debug_zip():
    try:
        # Get first tournament
        tournament = Tournament.objects.first()
        if not tournament:
            print("No tournaments found.")
            return

        print(f"Testing Zip for Tournament: {tournament.name} (ID: {tournament.id})")

        # Mock Request
        factory = APIRequestFactory()
        request = factory.get(f'/tournaments/{tournament.id}/generate_zip/')
        request.user = tournament.creator # Mock user if needed

        # Instantiate View
        view = TournamentViewSet.as_view({'get': 'generate_zip'})
        
        # Call View
        response = view(request, pk=tournament.id)
        
        if response.status_code == 200:
            print("Zip generation SUCCESS!")
            print(f"Content Type: {response['Content-Type']}")
        else:
            print(f"Zip generation FAILED: {response.status_code}")
            # print(response.data) # response.data might be a streaming content buffer sometimes if FileResponse fails early? No, FileResponse is 200.
            if hasattr(response, 'data'):
                print(response.data)
            else:
                print("No data in response (StreamingHttpResponse?)")

    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_zip()
