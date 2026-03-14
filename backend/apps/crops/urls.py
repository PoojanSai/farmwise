from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import recommend_crop, CropRecommendationViewSet, CropListingViewSet, BuyerInterestViewSet

router = DefaultRouter()
router.register('recommendations', CropRecommendationViewSet, basename='crop-recommendation')
router.register('listings', CropListingViewSet, basename='crop-listing')
router.register('buyer-interests', BuyerInterestViewSet, basename='buyer-interest')

urlpatterns = [
    path('recommend-crop/', recommend_crop, name='recommend-crop'),
    path('', include(router.urls)),
]
