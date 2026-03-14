from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SoilReportViewSet

router = DefaultRouter()
router.register('reports', SoilReportViewSet, basename='soil-report')

urlpatterns = [path('', include(router.urls))]
