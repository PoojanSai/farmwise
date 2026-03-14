from django.db import models
from apps.accounts.models import Farmer


class SoilReport(models.Model):
    HEALTH_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('moderate', 'Moderate'),
        ('poor', 'Poor'),
        ('critical', 'Critical'),
    ]

    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, related_name='soil_reports')
    field_name = models.CharField(max_length=100, default='Main Field')
    ph = models.FloatField(help_text='pH level (0-14)')
    moisture = models.FloatField(help_text='Moisture percentage (0-100)')
    nitrogen = models.FloatField(help_text='Nitrogen mg/kg')
    phosphorus = models.FloatField(help_text='Phosphorus mg/kg')
    potassium = models.FloatField(help_text='Potassium mg/kg')
    temperature = models.FloatField(help_text='Soil temperature °C', default=25.0)
    organic_matter = models.FloatField(help_text='Organic matter %', default=2.5)

    # Computed health score
    health_status = models.CharField(max_length=20, choices=HEALTH_CHOICES, editable=False)
    health_score = models.IntegerField(editable=False, default=0)
    notes = models.TextField(blank=True)

    tested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'soil_reports'
        ordering = ['-tested_at']

    def save(self, *args, **kwargs):
        self.health_score = self._calculate_health_score()
        if self.health_score >= 80:
            self.health_status = 'excellent'
        elif self.health_score >= 65:
            self.health_status = 'good'
        elif self.health_score >= 50:
            self.health_status = 'moderate'
        elif self.health_score >= 35:
            self.health_status = 'poor'
        else:
            self.health_status = 'critical'
        super().save(*args, **kwargs)

    def _calculate_health_score(self):
        score = 0
        # pH (ideal 6.0–7.5)
        if 6.0 <= self.ph <= 7.5:
            score += 20
        elif 5.5 <= self.ph <= 8.0:
            score += 10
        # Moisture (ideal 40–70%)
        if 40 <= self.moisture <= 70:
            score += 20
        elif 30 <= self.moisture <= 80:
            score += 10
        # Nitrogen (ideal 280–560 mg/kg)
        if 280 <= self.nitrogen <= 560:
            score += 20
        elif 140 <= self.nitrogen <= 700:
            score += 10
        # Phosphorus (ideal 25–50 mg/kg)
        if 25 <= self.phosphorus <= 50:
            score += 20
        elif 10 <= self.phosphorus <= 70:
            score += 10
        # Potassium (ideal 200–400 mg/kg)
        if 200 <= self.potassium <= 400:
            score += 20
        elif 100 <= self.potassium <= 500:
            score += 10
        return score

    def __str__(self):
        return f"Soil Report – {self.farmer.full_name} ({self.tested_at.date()})"
