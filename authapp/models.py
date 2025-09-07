from datetime import timedelta
from django.utils import timezone
import random
import string

from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin
)


class CustomUserManager(BaseUserManager):
    """Manager for CustomUser with email login & OTP auth"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create superuser with email + password (for Django admin)"""
        if not password:
            raise ValueError("Superuser must have a password")

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """Custom user model with role support"""

    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("organiser", "Organiser"),
        ("player", "Player"),
    )

    # Core fields
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    organisation_name = models.CharField(max_length=150, blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20)
    org_insta_page = models.CharField(max_length=150, blank=True, null=True)
    whatsapp_channel = models.CharField(max_length=150, blank=True, null=True)

    # Role and permissions
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="player")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = CustomUserManager()

    class Meta:
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return f"{self.email} ({self.role})"

    # Role helpers
    def is_admin(self):
        return self.role == "admin"

    def is_organiser(self):
        return self.role == "organiser"

    def is_player(self):
        return self.role == "player"


class OTP(models.Model):
    """OTP codes for email login (valid 5 min)"""

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="otps")
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        """Check if OTP is still valid (5 minutes expiry)"""
        return timezone.now() < self.created_at + timedelta(minutes=5)

    @staticmethod
    def generate_code():
        """Generate 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def cleanup_expired():
        """Delete expired OTPs"""
        cutoff = timezone.now() - timedelta(minutes=5)
        OTP.objects.filter(created_at__lt=cutoff).delete()

    def __str__(self):
        return f"OTP for {self.user.email} - {self.code}"
