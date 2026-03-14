from django.contrib import admin
from .models import Farmer, LandDetail

@admin.register(Farmer)
class FarmerAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'district', 'state', 'land_size_acres', 'soil_type', 'date_joined']
    search_fields = ['full_name', 'email', 'district']
    list_filter = ['soil_type', 'state']

@admin.register(LandDetail)
class LandDetailAdmin(admin.ModelAdmin):
    list_display = ['field_name', 'farmer', 'area_acres', 'soil_type', 'irrigation_type']
