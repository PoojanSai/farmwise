from django.contrib import admin
from .models import Expert, Appointment, ChatMessage

@admin.register(Expert)
class ExpertAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'experience_years', 'rating', 'is_available']

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['farmer', 'expert', 'appointment_type', 'scheduled_date', 'status']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'sender_name', 'is_farmer', 'sent_at']
