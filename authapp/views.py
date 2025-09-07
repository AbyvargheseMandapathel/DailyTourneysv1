from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
import os

from .models import CustomUser, OTP
from .serializers import (
    SignupSerializer, OTPRequestSerializer,
    OTPVerifySerializer, UserSerializer
)


# 🔹 User Signup
class SignupView(generics.CreateAPIView):
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Automatically generate an OTP for verification
        OTP.objects.create(user=user, code=OTP.generate_code())


# 🔹 Request OTP for login
class RequestOTPView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

            # Delete any previous OTPs for this user
            OTP.objects.filter(user=user).delete()

            # Generate new OTP
            code = OTP.generate_code()
            OTP.objects.create(user=user, code=code)

            # Send OTP via email
            send_mail(
                subject="Your Daily Tourneys OTP",
                message=f"Your OTP for login is: {code}. It expires in 5 minutes.",
                from_email=os.getenv("EMAIL_FROM", "noreply@daily-tourneys.com"),
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({"message": "OTP sent to your email"}, status=200)

        return Response(serializer.errors, status=400)



# 🔹 Verify OTP and issue JWT
class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            code = serializer.validated_data["code"]

            try:
                user = CustomUser.objects.get(email=email)
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found"}, status=404)

            otp = OTP.objects.filter(user=user, code=code).last()
            if otp and otp.is_valid():
                # ✅ Issue JWT token
                refresh = RefreshToken.for_user(user)
                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data
                })
            return Response({"error": "Invalid or expired OTP"}, status=400)

        return Response(serializer.errors, status=400)


# 🔹 Get Current User
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)
