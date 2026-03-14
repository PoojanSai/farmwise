from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Company, PurchaseInterest
from .serializers import CompanySerializer, PurchaseInterestSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Company.objects.all()
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category=cat)
        return qs


class PurchaseInterestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PurchaseInterest.objects.filter(is_active=True)
    serializer_class = PurchaseInterestSerializer
    permission_classes = [AllowAny]
