from django.contrib import admin
from .models import SoilReport

@admin.register(SoilReport)
class SoilReportAdmin(admin.ModelAdmin):
    list_display = ['farmer', 'field_name', 'ph', 'nitrogen', 'phosphorus', 'potassium', 'health_status', 'health_score', 'tested_at']
    list_filter = ['health_status']
    search_fields = ['farmer__full_name']
    ordering = ['-tested_at']
