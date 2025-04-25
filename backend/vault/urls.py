# vault/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter # Restore router import
# Import all necessary views
from .views import FileMetadataViewSet, UserCreate # Restore FileMetadataViewSet import

# Create a router and register our FileMetadata viewset with it.
# This automatically creates URLs for list, create, retrieve, update, destroy actions
# and the custom 'download' action.
router = DefaultRouter() # Restore router definition
router.register(r'files', FileMetadataViewSet, basename='filemetadata') # Restore router registration

# Define urlpatterns
urlpatterns = [
    # Add the specific path for user registration FIRST
    path('register/', UserCreate.as_view(), name='user_register'),

    # Include the router URLs for the 'files' endpoint AFTER specific paths
    # This handles /api/vault/files/, /api/vault/files/{pk}/, /api/vault/files/{pk}/download/ etc.
    path('', include(router.urls)), # Restore including router URLs
]

