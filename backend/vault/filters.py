# vault/filters.py
import django_filters
from .models import FileMetadata

class FileMetadataFilter(django_filters.FilterSet):
    """
    Defines filters for the FileMetadata model for use with the API.
    Allows filtering by filename, content type, date range, and size range.
    """
    # --- Define specific filters for more control ---

    # Allow filtering by partial filename (case-insensitive)
    # Query param: ?original_filename__icontains=...
    original_filename = django_filters.CharFilter(
        field_name='original_filename',
        lookup_expr='icontains' # icontains = case-insensitive contains
    )

    # Allow filtering by partial content type (case-insensitive)
    # Query param: ?content_type__icontains=...
    content_type = django_filters.CharFilter(
        field_name='content_type',
        lookup_expr='icontains'
    )

    # Allow filtering by upload date range
    # Query params: ?upload_date_after=YYYY-MM-DD&upload_date_before=YYYY-MM-DD
    upload_date = django_filters.DateFromToRangeFilter(field_name='upload_date')

    # Allow filtering by file size range
    # Query params: ?file_size_min=BYTES&file_size_max=BYTES
    file_size = django_filters.RangeFilter(field_name='file_size')

    class Meta:
        model = FileMetadata
        # Define the model fields you want to enable filtering on.
        # The filters defined explicitly above override the default behavior for these fields.
        # You could add more model fields here for default (exact match) filtering if needed.
        fields = ['original_filename', 'content_type', 'upload_date', 'file_size']
        # Note: Filtering by 'owner' is already handled by get_queryset in the view.

