from rest_framework import serializers
from .models import Company, PurchaseInterest


class PurchaseInterestSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = PurchaseInterest
        fields = '__all__'
        read_only_fields = ['created_at']


class CompanySerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    interests = PurchaseInterestSerializer(many=True, read_only=True)

    class Meta:
        model = Company
        fields = '__all__'
        read_only_fields = ['status', 'registered_at']
