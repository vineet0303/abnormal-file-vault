# vault/serializers.py
from rest_framework import serializers
from .models import FileMetadata
from django.contrib.auth import get_user_model # Import user model helper

User = get_user_model() # Get the active User model

class FileMetadataSerializer(serializers.ModelSerializer):
    """
    Serializer for the FileMetadata model.
    Handles conversion between model instances and JSON representation for the API.
    Defines which fields are read-only (set by server logic).
    """
    class Meta:
        model = FileMetadata
        # These are the fields that will be included in the API JSON representation (output)
        fields = [
            'id',
            'owner',             # Owner ID (read-only, set by view)
            'original_filename', # Filename (read-only, set by view)
            'file_hash',         # Hash (read-only, set by view)
            'file_size',         # Size (read-only, set by view)
            'content_type',      # Type (read-only, set by view)
            'upload_date',       # Upload date (read-only, set by model)
        ]
        # Mark all fields that are set by the server/view logic,
        # NOT expected directly from the client API request during creation.
        read_only_fields = [
            'owner',
            'upload_date',
            'original_filename', # Derived from uploaded file in perform_create
            'file_hash',         # Calculated in perform_create
            'file_size',         # Derived from uploaded file in perform_create
            'content_type',      # Derived from uploaded file in perform_create
        ]

# --- User Serializer for Registration ---
class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User registration. Handles password hashing.
    """
    class Meta:
        model = User
        # Fields to accept during registration & potentially return (id/username)
        fields = ['id', 'username', 'password', 'email'] # Add/remove fields as needed
        # Ensure password is never sent back in API responses
        # Also enforce minimum length (should match backend validator if set)
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}} 

    def create(self, validated_data):
        """
        Handles user creation and password hashing using Django's create_user.
        """
        # Use create_user which handles password hashing automatically
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '') # Get email if provided, default to empty
        )
        # Return the created user instance (required by DRF)
        return user 

