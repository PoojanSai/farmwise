"""
Analytics API - Supply/Demand, farmer participation, crop trends.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.accounts.models import Farmer
from apps.crops.models import CropListing, CropRecommendation
from apps.soil.models import SoilReport
from apps.marketplace.models import Order
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth


@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_overview(request):
    # Top crops by listing
    crop_supply = list(
        CropListing.objects.values('crop_name')
        .annotate(total_kg=Sum('quantity_kg'), count=Count('id'))
        .order_by('-total_kg')[:10]
    )

    # Top recommended crops
    crop_demand = list(
        CropRecommendation.objects.values('recommended_crop')
        .annotate(count=Count('id'))
        .order_by('-count')[:10]
    )

    # Farmer participation by state
    state_participation = list(
        Farmer.objects.values('state')
        .annotate(count=Count('id'))
        .order_by('-count')[:10]
    )

    # Monthly farmer registrations (last 12 months) — portable, no raw SQL
    farmer_trend = list(
        Farmer.objects
        .annotate(month=TruncMonth('date_joined'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')[:12]
    )
    # Convert datetime to string for JSON serialisation
    for row in farmer_trend:
        if row.get('month'):
            row['month'] = row['month'].strftime('%Y-%m')

    # Soil health distribution
    soil_health = list(
        SoilReport.objects.values('health_status')
        .annotate(count=Count('id'))
    )

    # Total stats
    stats = {
        'total_farmers': Farmer.objects.count(),
        'total_soil_reports': SoilReport.objects.count(),
        'total_recommendations': CropRecommendation.objects.count(),
        'total_crop_listings': CropListing.objects.count(),
        'total_orders': Order.objects.count(),
        'total_supply_kg': CropListing.objects.aggregate(t=Sum('quantity_kg'))['t'] or 0,
    }

    # Monthly supply/demand chart data (demo values for visualization)
    monthly_supply = [
        {'month': 'Apr', 'supply': 42000, 'demand': 38000},
        {'month': 'May', 'supply': 55000, 'demand': 48000},
        {'month': 'Jun', 'supply': 48000, 'demand': 52000},
        {'month': 'Jul', 'supply': 60000, 'demand': 55000},
        {'month': 'Aug', 'supply': 72000, 'demand': 65000},
        {'month': 'Sep', 'supply': 68000, 'demand': 70000},
        {'month': 'Oct', 'supply': 85000, 'demand': 78000},
        {'month': 'Nov', 'supply': 91000, 'demand': 82000},
        {'month': 'Dec', 'supply': 78000, 'demand': 88000},
        {'month': 'Jan', 'supply': 65000, 'demand': 72000},
        {'month': 'Feb', 'supply': 58000, 'demand': 62000},
        {'month': 'Mar', 'supply': 70000, 'demand': 68000},
    ]

    return Response({
        'stats': stats,
        'crop_supply': crop_supply,
        'crop_demand': crop_demand,
        'state_participation': state_participation,
        'farmer_trend': farmer_trend,
        'soil_health': soil_health,
        'monthly_supply': monthly_supply,
    })
