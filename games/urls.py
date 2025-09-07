from django.urls import path
from .views import GameListCreateView, GameDetailView, MapListCreateView, MapDetailView

urlpatterns = [
    path("games/", GameListCreateView.as_view(), name="game-list-create"),
    path("games/<int:pk>/", GameDetailView.as_view(), name="game-detail"),
    path("maps/", MapListCreateView.as_view(), name="map-list-create"),
    path("maps/<int:pk>/", MapDetailView.as_view(), name="map-detail"),
]
