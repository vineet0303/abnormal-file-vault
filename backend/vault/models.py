# vault/models.py
from django.db import models
from django.conf import settings # To get the User model

# Create your models here.
class FileMetadata(models.Model):
    """
    Stores metadata about uploaded files, handling deduplication via file_hash.
    """
    # Link to the user who uploaded this instance of the file
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, # If user is deleted, delete their file metadata
        related_name='files'
    )
    # The original filename provided by the user during upload
    original_filename = models.CharField(max_length=255)
    
    # SHA-256 hash of the file content, used for deduplication
    # Indexed for faster lookups during upload and deletion checks
    file_hash = models.CharField(max_length=64, db_index=True)
    
    # Size of the file in bytes
    file_size = models.BigIntegerField()
    
    # MIME type of the file (e.g., 'image/jpeg', 'text/plain')
    content_type = models.CharField(max_length=100)
    
    # Timestamp when this specific metadata record was created (upload instance)
    upload_date = models.DateTimeField(auto_now_add=True)

    # Optional: Add description or tags later if needed
    # description = models.TextField(blank=True, null=True)
    # tags = models.ManyToManyField('Tag', blank=True) 

    def __str__(self):
        """String representation of the model."""
        return f"{self.original_filename} (Owner: {self.owner.username}, Hash: {self.file_hash[:8]}...)"

    class Meta:
        # Optional: Add ordering if desired
        ordering = ['-upload_date'] 
        # Optional: Ensure a user cannot upload the exact same original filename twice?
        # Usually not needed as hash handles content duplication.
        # unique_together = ('owner', 'original_filename') 

