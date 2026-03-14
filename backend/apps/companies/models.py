from django.db import models


class Company(models.Model):
    CATEGORY_CHOICES = [
        ('food_processing', 'Food Processing'),
        ('logistics', 'Logistics Partner'),
        ('corporate_buyer', 'Corporate Buyer'),
        ('export', 'Export Company'),
        ('retail', 'Retail Chain'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    contact_person = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    website = models.URLField(blank=True)
    address = models.TextField()
    description = models.TextField()
    crops_interested = models.TextField(help_text='Comma-separated crop names')
    monthly_requirement_tonnes = models.FloatField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    logo = models.ImageField(upload_to='companies/', blank=True, null=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'Companies'

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class PurchaseInterest(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='interests')
    crop_name = models.CharField(max_length=100)
    quantity_tonnes = models.FloatField()
    price_per_tonne = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_by = models.DateField()
    quality_requirements = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'purchase_interests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company.name} wants {self.quantity_tonnes}t of {self.crop_name}"
