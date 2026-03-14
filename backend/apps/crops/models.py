from django.db import models
from apps.accounts.models import Farmer


class CropRecommendation(models.Model):
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='recommendations')
    # Input parameters
    nitrogen = models.FloatField()
    phosphorus = models.FloatField()
    potassium = models.FloatField()
    temperature = models.FloatField()
    humidity = models.FloatField()
    ph = models.FloatField()
    rainfall = models.FloatField()

    # ML Output
    recommended_crop = models.CharField(max_length=100)
    confidence_score = models.FloatField(help_text='0.0 to 1.0')
    top_crops = models.JSONField(default=list)         # [{'crop': 'rice', 'score': 0.92}, ...]
    yield_estimate = models.CharField(max_length=100)  # e.g. "3.5–4.2 tonnes/acre"
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crop_recommendations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recommended_crop} for {self.farmer.full_name}"


class CropListing(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('partial', 'Partially Sold'),
        ('sold', 'Sold Out'),
    ]

    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='crop_listings')
    crop_name = models.CharField(max_length=100)
    variety = models.CharField(max_length=100, blank=True)
    quantity_kg = models.FloatField()
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    quality_grade = models.CharField(max_length=10, default='A')
    harvest_date = models.DateField()
    available_from = models.DateField()
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='crops/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'crop_listings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.crop_name} – {self.farmer.full_name}"


class BuyerInterest(models.Model):
    listing = models.ForeignKey(CropListing, on_delete=models.CASCADE, related_name='interests')
    buyer_name = models.CharField(max_length=200)
    buyer_email = models.EmailField()
    buyer_phone = models.CharField(max_length=15)
    quantity_needed_kg = models.FloatField()
    offered_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'buyer_interests'
        ordering = ['-created_at']
