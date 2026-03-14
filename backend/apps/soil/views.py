from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import SoilReport
from .serializers import SoilReportSerializer, SoilReportCreateSerializer


class SoilReportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return SoilReportCreateSerializer
        return SoilReportSerializer

    def get_queryset(self):
        return SoilReport.objects.filter(farmer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(farmer=request.user)
        return Response(
            SoilReportSerializer(report).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def latest(self, request):
        report = SoilReport.objects.filter(farmer=request.user).first()
        if report:
            return Response(SoilReportSerializer(report).data)
        return Response({'detail': 'No soil reports yet.'}, status=404)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        reports = SoilReport.objects.filter(farmer=request.user)[:10]
        data = {
            'total_reports': reports.count(),
            'latest': SoilReportSerializer(reports.first()).data if reports else None,
            'history': SoilReportSerializer(reports, many=True).data
        }
        return Response(data)
