from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        role = 'ORGANISER'
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username exists'}, status=400)
        
        user = User.objects.create_user(username=username, password=password, role=role, is_approved=False)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user_id': user.id, 'role': user.role, 'is_pro': user.is_pro, 'is_approved': user.is_approved})

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'role': user.role,
            'is_pro': user.is_pro,
            'is_approved': user.is_approved
        })

class SetProStatusView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get('user_id')
        is_pro = request.data.get('is_pro')

        if user_id is None or is_pro is None:
             return Response({'error': 'user_id and is_pro are required'}, status=400)

        try:
            user = User.objects.get(id=user_id)
            user.is_pro = bool(is_pro)
            user.save()
            return Response({'status': 'success', 'is_pro': user.is_pro})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

class UserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'is_pro': user.is_pro,
            'is_approved': user.is_approved,
            'is_superuser': user.is_superuser
        })
