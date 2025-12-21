from rest_framework import viewsets, permissions, status, exceptions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Tournament, Match, Score, Team, FeaturedContent
from .serializers import TournamentSerializer, MatchSerializer, ScoreSerializer, TeamSerializer, FeaturedContentSerializer
from .permissions import IsOrganiserOrReadOnly
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsOrganiserOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        tournament = self.get_object()
        match_id = request.query_params.get('match_id')

        teams = tournament.teams.all()
        leaderboard = []
        for team in teams:
            scores = Score.objects.filter(team=team, match__tournament=tournament)
            if match_id:
                scores = scores.filter(match_id=match_id)
            
            total_points = sum(s.total_points for s in scores)
            total_kills = sum(s.kills for s in scores)
            total_wwcd = scores.filter(placement=1).count()
            
            # Position points = Total Points - Kill Points
            # Assuming logic from Score.save or just total - kills
            total_position_points = total_points - total_kills
            
            leaderboard.append({
                "team_id": team.id,
                "team_name": team.name,
                "team_logo": team.logo.url if team.logo else None,
                "total_points": total_points,
                "total_kills": total_kills,
                "total_wwcd": total_wwcd,
                "total_position_points": total_position_points
            })
        
        # Sort by Total Points (desc), then WWCD (desc), then Position Points (desc)
        leaderboard.sort(key=lambda x: (x['total_points'], x['total_wwcd'], x['total_position_points']), reverse=True)
        return Response(leaderboard)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsOrganiserOrReadOnly]

    def perform_create(self, serializer):
        tournament = serializer.validated_data['tournament']
        if tournament.creator != self.request.user and not self.request.user.role == 'ADMIN' and not self.request.user.is_superuser:
             raise exceptions.PermissionDenied("You are not the creator of this tournament.")
        team = serializer.save()
        team.members.add(self.request.user)

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsOrganiserOrReadOnly]

    def perform_create(self, serializer):
        tournament = serializer.validated_data['tournament']
        if tournament.creator != self.request.user and not self.request.user.role == 'ADMIN' and not self.request.user.is_superuser:
             raise exceptions.PermissionDenied("You are not the creator of this tournament.")
        serializer.save()

class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer
    permission_classes = [IsOrganiserOrReadOnly]

    def create(self, request, *args, **kwargs):
        # Custom logic to handle "Update if exists"
        match_id = request.data.get('match')
        team_id = request.data.get('team')
        
        # Check if score already exists
        try:
            instance = Score.objects.get(match_id=match_id, team_id=team_id)
            # If exists, update it
            serializer = self.get_serializer(instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer) # Reuse perform_update logic
            return Response(serializer.data)
        except Score.DoesNotExist:
            # If not, create standard
            return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        match = serializer.validated_data['match']
        if match.tournament.creator != self.request.user and not self.request.user.role == 'ADMIN' and not self.request.user.is_superuser:
             raise exceptions.PermissionDenied("You are not the creator of this tournament.")
        score = serializer.save()
        self.trigger_update(score)

    def perform_update(self, serializer):
        score = serializer.save()
        self.trigger_update(score)
    
    def perform_destroy(self, instance):
        self.trigger_update(instance)
        instance.delete()

    def trigger_update(self, score_instance):
        channel_layer = get_channel_layer()
        tournament_id = score_instance.match.tournament.id
        async_to_sync(channel_layer.group_send)(
            f"tournament_{tournament_id}_leaderboard",
            {
                "type": "leaderboard_update",
                "message": "Leaderboard updated"
            }
        )

class FeaturedContentViewSet(viewsets.ModelViewSet):
    queryset = FeaturedContent.objects.filter(active=True).order_by('-priority', '-id')
    serializer_class = FeaturedContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Allow read for all, write for auth? Or admin only?
    # For MVP: Admin/Organiser only write check is needed ideally, but IsAuthenticatedOrReadOnly covers 'superuser can add' via admin panel anyway if using API. 
    # But if adding via frontend dashboard? 'superuser can add from dashboard' -> implies frontend dashboard.
    # So we need write permission for admin.
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
