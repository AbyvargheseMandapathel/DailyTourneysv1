from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser, OTP
from .serializers import SignupSerializer, VerifyOTPSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user, created = CustomUser.objects.get_or_create(
                email=serializer.validated_data["email"],
                defaults=serializer.validated_data
            )
            otp_code = OTP.generate_code()
            OTP.objects.create(user=user, code=otp_code)

            send_mail(
                "Your Daily Tourneys OTP",
                f"Your OTP is {otp_code}. It expires in 5 minutes.",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
            )
            return Response({"message": "OTP sent to email"}, status=201)
        return Response(serializer.errors, status=400)

class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            otp = serializer.validated_data["otp"]
            try:
                user = CustomUser.objects.get(email=email)
                otp_obj = OTP.objects.filter(user=user, code=otp).last()
                if otp_obj and otp_obj.is_valid():
                    tokens = get_tokens_for_user(user)
                    return Response({"message": "Login successful", "tokens": tokens})
                return Response({"error": "Invalid or expired OTP"}, status=400)
            except CustomUser.DoesNotExist:
                return Response({"error": "User not found"}, status=404)
        return Response(serializer.errors, status=400)
