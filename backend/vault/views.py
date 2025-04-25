# vault/views.py
from rest_framework import viewsets, permissions, generics # Added generics
from rest_framework.decorators import action
from django.http import FileResponse, Http404
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model
import hashlib

# Imports for filtering
from django_filters.rest_framework import DjangoFilterBackend
from .filters import FileMetadataFilter

# Imports for models and serializers
from .models import FileMetadata
from .serializers import FileMetadataSerializer, UserSerializer # Import both serializers

User = get_user_model() # Get active user model

# --- File Metadata ViewSet ---
class FileMetadataViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows logged-in users to view, upload, download,
    and delete their file metadata, with deduplication handling.
    """
    serializer_class = FileMetadataSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users

    # --- Filtering Setup ---
    filter_backends = [DjangoFilterBackend] # Specify the backend to use
    filterset_class = FileMetadataFilter    # Specify our custom filter class

    def get_queryset(self):
        """
        This view returns a list of all file metadata records owned by the
        currently authenticated user making the request.
        Filtering is applied automatically by DjangoFilterBackend based on filterset_class.
        """
        # Filter files based on the logged-in user
        return FileMetadata.objects.filter(owner=self.request.user).order_by('-upload_date')

    def perform_create(self, serializer):
        """
        Handle file upload, calculate hash, perform deduplication,
        save file if new, and save metadata associated with the logged-in user.
        """
        # --- Get the uploaded file ---
        # 'file' should be the name of the file field in the upload request
        uploaded_file = self.request.FILES.get('file')

        if not uploaded_file:
            # Raise validation error if no file is provided
            raise serializers.ValidationError("No file uploaded.")

        # --- Calculate Hash ---
        hasher = hashlib.sha256()
        for chunk in uploaded_file.chunks():
            hasher.update(chunk)
        file_hash = hasher.hexdigest()
        uploaded_file.seek(0) # Reset file pointer

        # --- Deduplication Check ---
        existing_file = FileMetadata.objects.filter(file_hash=file_hash).first()
        storage_key = f"uploads/{file_hash}" # Path within MEDIA_ROOT

        if existing_file:
            # Duplicate detected based on hash
            print(f"Duplicate detected. Hash: {file_hash}")
            # Physical file already exists, no need to save blob again.
        else:
            # File hash is new, save the actual file content to storage
            print(f"New file detected. Saving with hash: {file_hash}")
            try:
                saved_file_name = default_storage.save(storage_key, ContentFile(uploaded_file.read()))
                print(f"File saved to: {saved_file_name}")
            except Exception as e:
                print(f"ERROR saving file {storage_key}: {e}")
                # Raise an error to prevent metadata creation if file save fails
                raise serializers.ValidationError("Failed to save file to storage.")
            uploaded_file.seek(0) # Reset pointer again after read()

        # --- Save Metadata ---
        # Pass necessary metadata derived from the file and the request.
        # Serializer uses read_only_fields to prevent client overwriting these.
        serializer.save(
            owner=self.request.user,
            original_filename=uploaded_file.name,
            file_hash=file_hash,
            file_size=uploaded_file.size,
            content_type=uploaded_file.content_type
        )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Custom action to download the actual file blob associated
        with a specific FileMetadata record ID (pk).
        """
        instance = self.get_object() # Retrieves instance, checks permissions
        storage_key = f"uploads/{instance.file_hash}"

        if not default_storage.exists(storage_key):
            print(f"Error: File not found in storage at {storage_key}")
            raise Http404(f"File not found in storage for hash {instance.file_hash}")

        try:
            file_handle = default_storage.open(storage_key, 'rb')
        except IOError as e:
            print(f"Error opening file {storage_key}: {e}")
            raise Http404(f"Could not open file in storage for hash {instance.file_hash}")

        # Use FileResponse for efficient streaming
        response = FileResponse(file_handle, as_attachment=True, filename=instance.original_filename)
        return response

    def perform_destroy(self, instance):
        """
        Overrides deletion behavior. Checks reference count based on hash
        before deleting the physical file, then deletes metadata.
        """
        file_hash_to_check = instance.file_hash
        instance_pk = instance.pk

        print(f"Attempting deletion for metadata instance {instance_pk} with hash {file_hash_to_check}")

        if file_hash_to_check:
            # Count OTHER records with the same hash
            reference_count = FileMetadata.objects.filter(
                file_hash=file_hash_to_check
            ).exclude(pk=instance_pk).count()

            print(f"Found {reference_count} other metadata records referencing hash {file_hash_to_check}.")

            if reference_count == 0:
                # Last reference, delete physical file
                storage_key = f"uploads/{file_hash_to_check}"
                if default_storage.exists(storage_key):
                    try:
                        default_storage.delete(storage_key)
                        print(f"Deleted physical file from storage: {storage_key}")
                    except Exception as e: # Catch broader exceptions during delete
                        print(f"ERROR: Could not delete file {storage_key} from storage: {e}")
                else:
                    print(f"Physical file {storage_key} already gone from storage.")
            else:
                print(f"Other metadata records reference hash {file_hash_to_check}. Physical file not deleted.")

        # Always delete the metadata record itself
        instance.delete()
        print(f"Deleted metadata instance {instance_pk}.")


# --- User Registration View ---
class UserCreate(generics.CreateAPIView):
    """
    API endpoint for creating (registering) new users.
    Accessible by any user (authenticated or not).
    """
    queryset = User.objects.all() # Required for CreateAPIView
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] # Allow anyone to register

