# backend/backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token # For token endpoint

urlpatterns = [
    path('admin/', admin.site.urls), # Restore admin

    # Include URLs from the vault app under '/api/vault/' prefix
    path('api/vault/', include('vault.urls')), # <-- Restore this

    # Include DRF login/logout URLs for the browsable API
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')), # <-- Restore this

    # Add endpoint for obtaining authentication token
    path('api/token-auth/', obtain_auth_token, name='api_token_auth'), # <-- Restore this
]

# --- Serve Media Files during Development ---
# This is ONLY for development (DEBUG=True).
# In production, Nginx or another web server should handle media files.
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

