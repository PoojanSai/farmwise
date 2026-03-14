from django.db import models
from apps.accounts.models import Farmer


class Expert(models.Model):
    SPECIALIZATIONS = [
        ('soil', 'Soil Science'),
        ('crops', 'Crop Management'),
        ('pest', 'Pest Control'),
        ('irrigation', 'Irrigation'),
        ('organic', 'Organic Farming'),
        ('agribusiness', 'Agri-Business'),
        ('horticulture', 'Horticulture'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATIONS)
    experience_years = models.IntegerField()
    qualification = models.CharField(max_length=200)
    organization = models.CharField(max_length=200, blank=True)
    bio = models.TextField()
    profile_image = models.ImageField(upload_to='experts/', blank=True, null=True)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_available = models.BooleanField(default=True)
    rating = models.FloatField(default=4.5)
    total_consultations = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'experts'

    def __str__(self):
        return f"Dr. {self.name} – {self.get_specialization_display()}"


class Appointment(models.Model):
    TYPE_CHOICES = [
        ('video', 'Video Call'),
        ('farm_visit', 'Farm Visit'),
        ('chat', 'Chat Consultation'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='appointments')
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='appointments')
    appointment_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    meeting_link = models.URLField(blank=True, help_text='Video call link')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'appointments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.farmer.full_name} ↔ {self.expert.name} on {self.scheduled_date}"


class ChatMessage(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='messages')
    sender_name = models.CharField(max_length=200)
    is_farmer = models.BooleanField(default=True)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['sent_at']
