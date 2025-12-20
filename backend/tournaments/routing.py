from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/leaderboard/(?P<tournament_id>\w+)/$', consumers.LeaderboardConsumer.as_asgi()),
]
