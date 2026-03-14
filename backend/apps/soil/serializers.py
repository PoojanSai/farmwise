from rest_framework import serializers
from .models import SoilReport


class SoilReportSerializer(serializers.ModelSerializer):
    tested_at = serializers.DateTimeField(read_only=True, format='%Y-%m-%d %H:%M')
    health_status_display = serializers.SerializerMethodField()

    class Meta:
        model = SoilReport
        fields = '__all__'
        read_only_fields = ['farmer', 'health_status', 'health_score', 'tested_at']

    def get_health_status_display(self, obj):
        return obj.get_health_status_display()


class SoilReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoilReport
        fields = ['field_name', 'ph', 'moisture', 'nitrogen', 'phosphorus',
                  'potassium', 'temperature', 'organic_matter', 'notes']
