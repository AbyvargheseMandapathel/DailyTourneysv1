from rest_framework import permissions

class IsOrganiserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if not (request.user and request.user.is_authenticated):
             return False
        
        # Check if user is Superuser/Admin (using model method or attribute)
        if getattr(request.user, 'role', None) == 'ADMIN' or request.user.is_superuser:
            return True

        # For Tournament
        if hasattr(obj, 'creator'):
            return obj.creator == request.user
        
        # For Match and Team (both have tournament FK)
        if hasattr(obj, 'tournament'):
            return obj.tournament.creator == request.user
            
        # For Score
        if hasattr(obj, 'match'):
            return obj.match.tournament.creator == request.user

        return False
