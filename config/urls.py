from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # auth endpoints
    path("auth/", include("authapp.urls")),

    # games endpoints
    path("games/", include("games.urls")),

    # tournaments endpoints
    path("tournaments/", include("tournaments.urls")),
]
