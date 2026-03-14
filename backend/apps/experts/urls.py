from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpertViewSet, AppointmentViewSet, ChatMessageViewSet

router = DefaultRouter()
router.register('experts', ExpertViewSet, basename='expert')
router.register('appointments', AppointmentViewSet, basename='appointment')
router.register('messages', ChatMessageViewSet, basename='chat-message')

urlpatterns = [path('', include(router.urls))]
