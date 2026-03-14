from django.contrib import admin
from .models import Company, PurchaseInterest

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'contact_person', 'email', 'status', 'monthly_requirement_tonnes']
    list_filter = ['category', 'status']

@admin.register(PurchaseInterest)
class PurchaseInterestAdmin(admin.ModelAdmin):
    list_display = ['company', 'crop_name', 'quantity_tonnes', 'price_per_tonne', 'delivery_by', 'is_active']
