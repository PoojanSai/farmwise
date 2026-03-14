from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import Expert, Appointment, ChatMessage
from .serializers import ExpertSerializer, AppointmentSerializer, ChatMessageSerializer


class ExpertViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Expert.objects.filter(is_available=True)
    serializer_class = ExpertSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'specialization', 'organization']


class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(farmer=self.request.user).select_related('expert')

    def perform_create(self, serializer):
        apt = serializer.save(farmer=self.request.user)
        # Auto-generate meeting link for video calls
        if apt.appointment_type == 'video':
            apt.meeting_link = f'https://meet.farmwise.in/room/{apt.id}-{apt.farmer.id}'
            apt.save()

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        from datetime import date
        upcoming = Appointment.objects.filter(
            farmer=request.user,
            scheduled_date__gte=date.today(),
            status__in=['pending', 'confirmed']
        ).order_by('scheduled_date', 'scheduled_time')[:5]
        return Response(AppointmentSerializer(upcoming, many=True).data)


class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        appointment_id = self.request.query_params.get('appointment')
        if appointment_id:
            return ChatMessage.objects.filter(appointment_id=appointment_id)
        return ChatMessage.objects.none()
