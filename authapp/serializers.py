from rest_framework import serializers
from .models import CustomUser, OTP


class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "email", "name", "organisation_name",
            "whatsapp_number", "org_insta_page",
            "whatsapp_channel", "role"
        ]


class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "name", "role"]
