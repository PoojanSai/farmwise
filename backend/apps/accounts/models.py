"""
Farmer/User model for FarmWise.
Extends AbstractBaseUser for custom farmer profile.
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class FarmerManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class Farmer(AbstractBaseUser, PermissionsMixin):
    SOIL_TYPES = [
        ('clay', 'Clay'),
        ('sandy', 'Sandy'),
        ('loamy', 'Loamy'),
        ('silty', 'Silty'),
        ('peaty', 'Peaty'),
        ('chalky', 'Chalky'),
    ]

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=15, blank=True)
    village = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    land_size_acres = models.FloatField(default=0)
    soil_type = models.CharField(max_length=20, choices=SOIL_TYPES, default='loamy')
    crops_grown = models.TextField(blank=True, help_text='Comma-separated crop names')
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = FarmerManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'farmers'
        verbose_name = 'Farmer'
        verbose_name_plural = 'Farmers'

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def crops_list(self):
        return [c.strip() for c in self.crops_grown.split(',') if c.strip()]


class LandDetail(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='lands')
    field_name = models.CharField(max_length=100)
    area_acres = models.FloatField()
    location_lat = models.FloatField(blank=True, null=True)
    location_lng = models.FloatField(blank=True, null=True)
    soil_type = models.CharField(max_length=20, choices=Farmer.SOIL_TYPES, default='loamy')
    irrigation_type = models.CharField(max_length=50, default='Rain-fed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'land_details'

    def __str__(self):
        return f"{self.field_name} – {self.farmer.full_name}"
