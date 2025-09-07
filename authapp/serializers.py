from rest_framework import serializers
from .models import CustomUser

class SignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["name", "organisation_name", "whatsapp_number", "org_insta_page", "whatsapp_channel", "email"]

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
