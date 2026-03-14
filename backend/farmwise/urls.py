"""
FarmWise URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/soil/', include('apps.soil.urls')),
    path('api/crops/', include('apps.crops.urls')),
    path('api/experts/', include('apps.experts.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/companies/', include('apps.companies.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
