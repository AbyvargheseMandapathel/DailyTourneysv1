from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, TeamViewSet, MatchViewSet, ScoreViewSet, FeaturedContentViewSet
from .auth_views import RegisterView, CustomAuthToken, SetProStatusView, UserProfileView

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'scores', ScoreViewSet)
router.register(r'featured', FeaturedContentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view()),
    path('login/', CustomAuthToken.as_view()),
    path('set-pro-status/', SetProStatusView.as_view()),
    path('user/profile/', UserProfileView.as_view()),
]
