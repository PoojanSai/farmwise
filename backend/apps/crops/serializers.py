from rest_framework import serializers
from .models import CropRecommendation, CropListing, BuyerInterest


class CropRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropRecommendation
        fields = '__all__'
        read_only_fields = ['farmer', 'recommended_crop', 'confidence_score', 'top_crops', 'yield_estimate', 'created_at']


class CropRecommendRequestSerializer(serializers.Serializer):
    nitrogen = serializers.FloatField(min_value=0, max_value=200)
    phosphorus = serializers.FloatField(min_value=0, max_value=200)
    potassium = serializers.FloatField(min_value=0, max_value=250)
    temperature = serializers.FloatField(min_value=0, max_value=55)
    humidity = serializers.FloatField(min_value=0, max_value=100)
    ph = serializers.FloatField(min_value=0, max_value=14)
    rainfall = serializers.FloatField(min_value=0, max_value=3000)


class BuyerInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerInterest
        fields = '__all__'
        read_only_fields = ['created_at']


class CropListingSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    farmer_phone = serializers.CharField(source='farmer.phone', read_only=True)
    interests_count = serializers.IntegerField(source='interests.count', read_only=True)

    class Meta:
        model = CropListing
        fields = '__all__'
        read_only_fields = ['farmer', 'created_at']
