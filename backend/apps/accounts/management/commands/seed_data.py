"""
Management command to seed demo data into FarmWise.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, time, timedelta
import random


class Command(BaseCommand):
    help = 'Seed FarmWise database with demo data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌾 Seeding FarmWise demo data...'))
        self._create_farmers()
        self._create_soil_reports()
        self._create_experts()
        self._create_marketplace()
        self._create_crop_listings()
        self._create_companies()
        self._create_recommendations()
        self.stdout.write(self.style.SUCCESS('✅ Demo data seeded successfully!'))
        self.stdout.write(self.style.WARNING('📧 Demo login: farmer@farmwise.com / farmwise123'))

    def _create_farmers(self):
        from apps.accounts.models import Farmer, LandDetail
        self.stdout.write('  Creating farmers...')

        farmers_data = [
            {
                'email': 'farmer@farmwise.com',
                'full_name': 'Ramu Reddy',
                'phone': '9876543210',
                'village': 'Anantapur Village',
                'district': 'Anantapur',
                'state': 'Andhra Pradesh',
                'land_size_acres': 12.5,
                'soil_type': 'loamy',
                'crops_grown': 'Rice, Wheat, Maize',
                'password': 'farmwise123',
            },
            {
                'email': 'krishna@farmwise.com',
                'full_name': 'Krishna Murthy',
                'phone': '9876543211',
                'village': 'Nizamabad Town',
                'district': 'Nizamabad',
                'state': 'Telangana',
                'land_size_acres': 8.0,
                'soil_type': 'clay',
                'crops_grown': 'Cotton, Soybean',
                'password': 'farmwise123',
            },
            {
                'email': 'lakshmi@farmwise.com',
                'full_name': 'Lakshmi Devi',
                'phone': '9876543212',
                'village': 'Salem Rural',
                'district': 'Salem',
                'state': 'Tamil Nadu',
                'land_size_acres': 5.5,
                'soil_type': 'sandy',
                'crops_grown': 'Banana, Sugarcane',
                'password': 'farmwise123',
            },
            {
                'email': 'suresh@farmwise.com',
                'full_name': 'Suresh Patel',
                'phone': '9876543213',
                'village': 'Surat District',
                'district': 'Surat',
                'state': 'Gujarat',
                'land_size_acres': 20.0,
                'soil_type': 'loamy',
                'crops_grown': 'Rice, Groundnut, Cotton',
                'password': 'farmwise123',
            },
            {
                'email': 'priya@farmwise.com',
                'full_name': 'Priya Kumari',
                'phone': '9876543214',
                'village': 'Patna Rural',
                'district': 'Patna',
                'state': 'Bihar',
                'land_size_acres': 3.5,
                'soil_type': 'silty',
                'crops_grown': 'Wheat, Mustard',
                'password': 'farmwise123',
            },
        ]

        self.farmers = []
        for fd in farmers_data:
            password = fd.pop('password')
            farmer, created = Farmer.objects.get_or_create(email=fd['email'], defaults=fd)
            if created:
                farmer.set_password(password)
                farmer.save()
            self.farmers.append(farmer)

        # Create admin
        admin, created = Farmer.objects.get_or_create(
            email='admin@farmwise.com',
            defaults={'full_name': 'FarmWise Admin', 'is_staff': True, 'is_superuser': True}
        )
        if created:
            admin.set_password('admin123')
            admin.save()

        # Land details
        lands = [
            (self.farmers[0], 'North Field', 6.5, 'loamy', 'Drip Irrigation'),
            (self.farmers[0], 'South Field', 6.0, 'clay', 'Sprinkler'),
            (self.farmers[1], 'Main Plot', 8.0, 'clay', 'Rain-fed'),
            (self.farmers[2], 'Banana Grove', 3.0, 'sandy', 'Drip Irrigation'),
            (self.farmers[2], 'Sugarcane Field', 2.5, 'loamy', 'Canal'),
            (self.farmers[3], 'East Farm', 12.0, 'loamy', 'Flood Irrigation'),
            (self.farmers[3], 'West Farm', 8.0, 'sandy', 'Drip Irrigation'),
        ]
        for farmer, name, area, soil, irr in lands:
            LandDetail.objects.get_or_create(
                farmer=farmer, field_name=name,
                defaults={'area_acres': area, 'soil_type': soil, 'irrigation_type': irr}
            )

        self.stdout.write(f'    ✓ {len(self.farmers)} farmers created')

    def _create_soil_reports(self):
        from soil.models import SoilReport
        self.stdout.write('  Creating soil reports...')

        reports = [
            (self.farmers[0], 'North Field', 6.5, 65, 320, 38, 280, 26),
            (self.farmers[0], 'South Field', 5.8, 72, 180, 22, 340, 24),
            (self.farmers[0], 'North Field', 6.8, 60, 360, 42, 295, 27),
            (self.farmers[1], 'Main Plot', 7.2, 45, 280, 31, 210, 28),
            (self.farmers[2], 'Banana Grove', 6.3, 78, 420, 55, 380, 30),
            (self.farmers[3], 'East Farm', 6.9, 55, 310, 40, 260, 25),
            (self.farmers[4], 'Main Field', 7.5, 38, 200, 28, 190, 22),
        ]

        for farmer, field, ph, moist, n, p, k, temp in reports:
            SoilReport.objects.get_or_create(
                farmer=farmer, field_name=field, ph=ph,
                defaults={'moisture': moist, 'nitrogen': n, 'phosphorus': p,
                          'potassium': k, 'temperature': temp}
            )

        self.stdout.write(f'    ✓ Soil reports created')

    def _create_experts(self):
        from experts.models import Expert
        self.stdout.write('  Creating experts...')

        experts_data = [
            {
                'name': 'Dr. Anand Kumar',
                'email': 'anand@farmwise.com',
                'phone': '9800001111',
                'specialization': 'soil',
                'experience_years': 15,
                'qualification': 'PhD Soil Science, IARI Delhi',
                'organization': 'ICAR – Indian Agricultural Research Institute',
                'bio': 'Expert in soil fertility management and sustainable farming practices. Has worked with 2000+ farmers across South India.',
                'consultation_fee': 500,
                'rating': 4.8,
                'total_consultations': 348,
            },
            {
                'name': 'Dr. Meena Sharma',
                'email': 'meena@farmwise.com',
                'phone': '9800002222',
                'specialization': 'crops',
                'experience_years': 12,
                'qualification': 'PhD Agronomy, Punjab Agricultural University',
                'organization': 'State Agriculture Department, Punjab',
                'bio': 'Specialist in high-yield crop varieties and precision agriculture. Pioneer in digital farming extension services.',
                'consultation_fee': 450,
                'rating': 4.9,
                'total_consultations': 512,
            },
            {
                'name': 'Dr. Rajesh Verma',
                'email': 'rajesh@farmwise.com',
                'phone': '9800003333',
                'specialization': 'pest',
                'experience_years': 10,
                'qualification': 'MSc Entomology, BHU Varanasi',
                'organization': 'National Plant Protection Organisation',
                'bio': 'IPM (Integrated Pest Management) expert. Specializes in organic and bio-pesticide alternatives.',
                'consultation_fee': 400,
                'rating': 4.7,
                'total_consultations': 289,
            },
            {
                'name': 'Prof. Sindhu Nair',
                'email': 'sindhu@farmwise.com',
                'phone': '9800004444',
                'specialization': 'organic',
                'experience_years': 18,
                'qualification': 'PhD Organic Agriculture, University of Agricultural Sciences',
                'organization': 'Kerala Agriculture University',
                'bio': 'Leading authority on organic farming certification and transition strategies. Has helped 50+ farms get certified.',
                'consultation_fee': 600,
                'rating': 4.9,
                'total_consultations': 421,
            },
            {
                'name': 'Dr. Venkat Rao',
                'email': 'venkat@farmwise.com',
                'phone': '9800005555',
                'specialization': 'irrigation',
                'experience_years': 8,
                'qualification': 'MTech Agricultural Engineering, IIT Kharagpur',
                'organization': 'Water Technology Centre, IARI',
                'bio': 'Water management specialist focusing on drip irrigation and micro-irrigation systems for smallholder farmers.',
                'consultation_fee': 350,
                'rating': 4.6,
                'total_consultations': 178,
            },
        ]

        for ed in experts_data:
            Expert.objects.get_or_create(email=ed['email'], defaults=ed)

        self.stdout.write(f'    ✓ {len(experts_data)} experts created')

    def _create_marketplace(self):
        from marketplace.models import Category, Product
        self.stdout.write('  Creating marketplace products...')

        categories = {
            'Seeds': ('🌱', 'Premium quality seeds for all major crops'),
            'Fertilizers': ('🧪', 'Organic and chemical fertilizers for optimal yield'),
            'Pesticides': ('🛡️', 'Safe and effective pest management solutions'),
            'Tools & Equipment': ('🔧', 'Modern farming tools and equipment'),
            'Irrigation': ('💧', 'Drip, sprinkler, and flood irrigation systems'),
        }

        cat_objects = {}
        for name, (icon, desc) in categories.items():
            cat, _ = Category.objects.get_or_create(name=name, defaults={'icon': icon, 'description': desc})
            cat_objects[name] = cat

        products = [
            # Seeds
            ('Hybrid Rice Seed IR64', 'Bayer CropScience', cat_objects['Seeds'], 'Quality hybrid rice for high yield', 280, 'kg', 200, 10, 4.5),
            ('Wheat Variety HD-3086', 'IFFCO Kisan', cat_objects['Seeds'], 'Heat-tolerant wheat variety', 65, 'kg', 500, 0, 4.7),
            ('BT Cotton Seed', 'Mahyco', cat_objects['Seeds'], 'Bollworm-resistant Bt cotton seed', 1200, 'packet (450g)', 150, 15, 4.3),
            ('Maize Hybrid 900M', 'Pioneer', cat_objects['Seeds'], 'High-yield maize hybrid for Kharif season', 350, 'kg', 300, 5, 4.6),
            ('Tomato F1 Hybrid', 'Namdhari Seeds', cat_objects['Seeds'], 'Disease-resistant F1 tomato variety', 950, '10g packet', 200, 0, 4.8),
            # Fertilizers
            ('Urea (46% N)', 'IFFCO', cat_objects['Fertilizers'], 'Granular urea – most widely used nitrogen fertilizer', 270, '50 kg bag', 500, 0, 4.4),
            ('DAP Fertilizer', 'IFFCO', cat_objects['Fertilizers'], 'Di-ammonium phosphate for phosphorus & nitrogen', 1350, '50 kg bag', 400, 0, 4.5),
            ('NPK 19-19-19', 'Coromandel', cat_objects['Fertilizers'], 'Balanced NPK complex fertilizer', 2100, '50 kg bag', 300, 8, 4.6),
            ('Organic Compost', 'Bio-Kisan', cat_objects['Fertilizers'], 'Certified organic compost with micronutrients', 450, '50 kg bag', 1000, 20, 4.9),
            ('Potassium Sulphate', 'SQM', cat_objects['Fertilizers'], 'Chloride-free potassium for fruits & vegetables', 1800, '25 kg bag', 250, 0, 4.3),
            # Pesticides
            ('Chlorpyrifos 20 EC', 'Dhanuka Agritech', cat_objects['Pesticides'], 'Broad-spectrum insecticide for soil & foliar pests', 380, '500 ml', 400, 0, 4.2),
            ('Mancozeb 75 WP', 'UPL', cat_objects['Pesticides'], 'Contact fungicide for fruit & vegetable crops', 220, '500g', 350, 10, 4.4),
            ('Neem Oil (EC)', 'Bioworks', cat_objects['Pesticides'], 'Certified organic neem oil biopesticide', 650, 'litre', 200, 0, 4.8),
            ('Carbendazim 50 WP', 'BASF', cat_objects['Pesticides'], 'Systemic fungicide for soil-borne diseases', 180, '100g', 300, 5, 4.1),
            # Tools
            ('Hand Sprayer 16L', 'Aspee', cat_objects['Tools & Equipment'], 'Knapsack pressure sprayer with adjustable nozzle', 850, 'unit', 150, 15, 4.5),
            ('Soil pH Meter', 'HM Digital', cat_objects['Tools & Equipment'], 'Digital soil pH & moisture meter', 1200, 'unit', 100, 0, 4.7),
            ('Sickle (Serrated)', 'Shaktiman', cat_objects['Tools & Equipment'], 'Heavy-duty serrated sickle for harvesting', 180, 'unit', 500, 0, 4.3),
            ('Tarpaulin Sheet 20x20', 'Supreme', cat_objects['Tools & Equipment'], 'Heavy-duty HDPE tarpaulin for grain storage', 750, 'unit', 200, 10, 4.4),
            # Irrigation
            ('Drip Kit (1 Acre)', 'Jain Irrigation', cat_objects['Irrigation'], 'Complete drip irrigation kit for 1 acre', 8500, 'kit', 80, 20, 4.8),
            ('Sprinkler Set', 'Netafim', cat_objects['Irrigation'], 'Overhead sprinkler irrigation system for large fields', 4200, 'set', 60, 0, 4.6),
        ]

        for name, brand, cat, desc, price, unit, stock, disc, rating in products:
            Product.objects.get_or_create(
                name=name,
                defaults={
                    'brand': brand, 'category': cat, 'description': desc,
                    'price': price, 'unit': unit, 'stock_quantity': stock,
                    'discount_percent': disc, 'rating': rating
                }
            )

        self.stdout.write(f'    ✓ {len(products)} products in {len(categories)} categories')

    def _create_crop_listings(self):
        from crops.models import CropListing
        self.stdout.write('  Creating crop listings...')

        listings = [
            (self.farmers[0], 'Rice', 'IR64', 2500, 22.50, 'A', date(2025, 10, 15), date(2025, 11, 1), 'Anantapur, AP'),
            (self.farmers[0], 'Wheat', 'HD-3086', 1800, 18.00, 'A+', date(2025, 3, 20), date(2025, 4, 1), 'Anantapur, AP'),
            (self.farmers[1], 'Cotton', 'Bt Cotton', 500, 60.00, 'A', date(2025, 11, 10), date(2025, 11, 20), 'Nizamabad, TS'),
            (self.farmers[2], 'Banana', 'Robusta', 3000, 15.00, 'A', date(2025, 9, 5), date(2025, 9, 10), 'Salem, TN'),
            (self.farmers[2], 'Sugarcane', 'Co-86032', 8000, 3.50, 'A', date(2025, 12, 1), date(2025, 12, 15), 'Salem, TN'),
            (self.farmers[3], 'Groundnut', 'TAG-24', 1200, 45.00, 'A+', date(2025, 10, 20), date(2025, 11, 5), 'Surat, GJ'),
            (self.farmers[4], 'Mustard', 'Pusa Bold', 800, 42.00, 'A', date(2025, 2, 28), date(2025, 3, 10), 'Patna, BR'),
        ]

        for farmer, crop, variety, qty, price, grade, harvest, avail, loc in listings:
            CropListing.objects.get_or_create(
                farmer=farmer, crop_name=crop, variety=variety,
                defaults={
                    'quantity_kg': qty, 'price_per_kg': price, 'quality_grade': grade,
                    'harvest_date': harvest, 'available_from': avail, 'location': loc
                }
            )

        self.stdout.write(f'    ✓ {len(listings)} crop listings created')

    def _create_companies(self):
        from companies.models import Company, PurchaseInterest
        self.stdout.write('  Creating companies...')

        companies = [
            {
                'name': 'AgroProcess Industries Ltd.',
                'category': 'food_processing',
                'contact_person': 'Ramesh Gupta',
                'email': 'procurement@agroprocess.in',
                'phone': '9900001111',
                'address': 'Industrial Area, Hyderabad, Telangana',
                'description': 'Leading food processing company specializing in rice, wheat and pulses. Processing capacity of 500 MT/day.',
                'crops_interested': 'Rice, Wheat, Maize, Pulses',
                'monthly_requirement_tonnes': 1500,
                'status': 'approved',
                'website': 'https://agroprocess.in',
            },
            {
                'name': 'FreshRoute Logistics',
                'category': 'logistics',
                'contact_person': 'Vijay Sharma',
                'email': 'ops@freshroute.in',
                'phone': '9900002222',
                'address': 'Transport Nagar, Bangalore, Karnataka',
                'description': 'Cold chain logistics partner for fresh produce. Fleet of 200+ refrigerated trucks across India.',
                'crops_interested': 'Banana, Tomato, Onion, Potato',
                'monthly_requirement_tonnes': 800,
                'status': 'approved',
                'website': 'https://freshroute.in',
            },
            {
                'name': 'Reliance Retail Agro',
                'category': 'corporate_buyer',
                'contact_person': 'Pradeep Joshi',
                'email': 'agro@relianceretail.com',
                'phone': '9900003333',
                'address': 'Maker Chambers, Mumbai, Maharashtra',
                'description': 'Corporate buyer for fresh fruits, vegetables and grains for retail chain distribution.',
                'crops_interested': 'All vegetables, Fruits, Rice, Wheat',
                'monthly_requirement_tonnes': 5000,
                'status': 'approved',
                'website': 'https://relianceretail.com',
            },
            {
                'name': 'Export India Agriculture',
                'category': 'export',
                'contact_person': 'Sunita Kapoor',
                'email': 'export@exportindia.com',
                'phone': '9900004444',
                'address': 'JNPT SEZ, Navi Mumbai, Maharashtra',
                'description': 'APEDA-registered export house shipping Indian agricultural produce to 30+ countries.',
                'crops_interested': 'Basmati Rice, Cotton, Spices, Groundnut',
                'monthly_requirement_tonnes': 2000,
                'status': 'approved',
                'website': 'https://exportindia.com',
            },
        ]

        for cd in companies:
            company, created = Company.objects.get_or_create(email=cd['email'], defaults=cd)
            if created:
                # Add purchase interests
                pi_data = [
                    ('Rice', 500, 22000, date.today() + timedelta(days=60)),
                    ('Wheat', 300, 18500, date.today() + timedelta(days=90)),
                ]
                for crop, qty, price, delivery in pi_data:
                    PurchaseInterest.objects.create(
                        company=company, crop_name=crop,
                        quantity_tonnes=qty, price_per_tonne=price,
                        delivery_by=delivery
                    )

        self.stdout.write(f'    ✓ {len(companies)} companies created')

    def _create_recommendations(self):
        from crops.models import CropRecommendation
        self.stdout.write('  Creating crop recommendations...')

        recs = [
            (self.farmers[0], 90, 42, 43, 21, 82, 6.5, 202, 'rice', 0.92, '3.5–5.0 tonnes/acre'),
            (self.farmers[1], 117, 46, 19, 24, 80, 6.8, 80, 'cotton', 0.88, '0.5–1.2 tonnes/acre (lint)'),
            (self.farmers[2], 100, 82, 50, 27, 80, 5.9, 105, 'banana', 0.94, '10.0–15.0 tonnes/acre'),
            (self.farmers[3], 78, 48, 20, 22, 65, 6.2, 85, 'maize', 0.85, '2.5–4.0 tonnes/acre'),
        ]

        for farmer, n, p, k, temp, hum, ph, rain, crop, conf, yld in recs:
            CropRecommendation.objects.get_or_create(
                farmer=farmer, recommended_crop=crop,
                defaults={
                    'nitrogen': n, 'phosphorus': p, 'potassium': k,
                    'temperature': temp, 'humidity': hum, 'ph': ph, 'rainfall': rain,
                    'confidence_score': conf,
                    'top_crops': [{'crop': crop, 'score': conf}],
                    'yield_estimate': yld
                }
            )

        self.stdout.write(f'    ✓ Crop recommendations created')
