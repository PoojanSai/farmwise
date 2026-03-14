from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmerRegisterView, FarmerLoginView, farmer_profile, LandDetailViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register('lands', LandDetailViewSet, basename='land')

urlpatterns = [
    path('register/', FarmerRegisterView.as_view(), name='farmer-register'),
    path('login/', FarmerLoginView.as_view(), name='farmer-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', farmer_profile, name='farmer-profile'),
    path('', include(router.urls)),
]
