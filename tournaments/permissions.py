from rest_framework import permissions


class IsAdminOrOrganiserAuthor(permissions.BasePermission):
    """
    - Everyone can view tournaments
    - Only Admins can manage all tournaments
    - Only the organiser who created the tournament can edit/delete it
    """

    def has_object_permission(self, request, view, obj):
        # Safe methods (GET, HEAD, OPTIONS) → allow for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Require login for modifying
        if not request.user or not request.user.is_authenticated:
            return False

        # Admins can manage all events
        if request.user.role == "admin":
            return True

        # Organiser can manage only their own tournaments
        if request.user.role == "organiser" and obj.author == request.user:
            return True

        return False
