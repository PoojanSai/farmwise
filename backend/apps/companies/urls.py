from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, PurchaseInterestViewSet

router = DefaultRouter()
router.register('companies', CompanyViewSet, basename='company')
router.register('purchase-interests', PurchaseInterestViewSet, basename='purchase-interest')

urlpatterns = [path('', include(router.urls))]
