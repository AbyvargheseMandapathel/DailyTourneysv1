from django.urls import path
from .views import TournamentListCreateView, TournamentDetailView, TeamListCreateView

urlpatterns = [
    path("teams/", TeamListCreateView.as_view(), name="teams"),
    path("", TournamentListCreateView.as_view(), name="tournament-list"),
    path("<int:pk>/", TournamentDetailView.as_view(), name="tournament-detail"),
]
