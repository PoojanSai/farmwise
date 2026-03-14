from rest_framework import serializers
from .models import Expert, Appointment, ChatMessage


class ExpertSerializer(serializers.ModelSerializer):
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)

    class Meta:
        model = Expert
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    expert_name = serializers.CharField(source='expert.name', read_only=True)
    expert_specialization = serializers.CharField(source='expert.get_specialization_display', read_only=True)
    farmer_name = serializers.CharField(source='farmer.full_name', read_only=True)
    type_display = serializers.CharField(source='get_appointment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['farmer', 'status', 'meeting_link', 'created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ['sent_at']
