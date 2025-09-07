from rest_framework import generics, permissions
from .models import Tournament, Team
from .serializers import TournamentSerializer, TeamSerializer
from .permissions import IsAdminOrOrganiserAuthor


class TeamListCreateView(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAdminUser]


class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]  # must be logged in
        return []  # GET is public (no login required)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TournamentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAdminOrOrganiserAuthor]
