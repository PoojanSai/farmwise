from django.contrib import admin
from .models import CropRecommendation, CropListing, BuyerInterest

@admin.register(CropRecommendation)
class CropRecAdmin(admin.ModelAdmin):
    list_display = ['farmer', 'recommended_crop', 'confidence_score', 'yield_estimate', 'created_at']

@admin.register(CropListing)
class CropListingAdmin(admin.ModelAdmin):
    list_display = ['crop_name', 'farmer', 'quantity_kg', 'price_per_kg', 'status', 'location']

@admin.register(BuyerInterest)
class BuyerInterestAdmin(admin.ModelAdmin):
    list_display = ['listing', 'buyer_name', 'quantity_needed_kg', 'created_at']
