    # backend/Dockerfile

    # --- Base Stage ---
    # Use a different base image (Bookworm instead of Buster)
    # Temporarily removed 'AS base' for debugging FROM error
    FROM python:3.11-bookworm 

    # Set environment variables
    ENV PYTHONDONTWRITEBYTECODE 1  # Prevents python from writing pyc files to disc
    ENV PYTHONUNBUFFERED 1         # Prevents python from buffering stdout and stderr

    # Set the working directory in the container
    WORKDIR /app

    # Install system dependencies required by some Python packages (like psycopg2)
    # Update packages and install dependencies in one layer to reduce image size
    # Ensure backslashes (\) are correctly placed for line continuation
    RUN apt-get update \
        && apt-get install -y --no-install-recommends \
           build-essential \
           libpq-dev \
           gettext \
        # Clean up apt cache to reduce image size
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

    # --- Build Stage ---
    # Used to install python dependencies
    # Changed 'FROM base' to explicit image name due to alias removal above
    FROM python:3.11-bookworm AS builder 

    # Copy the requirements file into the container
    COPY requirements.txt .

    # Install Python dependencies
    # Use a virtual environment within the build stage for cleaner installs (optional but good practice)
    RUN python -m venv /opt/venv
    ENV PATH="/opt/venv/bin:$PATH"
    # Upgrade pip first
    RUN pip install --upgrade pip
    # Install dependencies from requirements.txt
    RUN pip install --no-cache-dir -r requirements.txt

    # --- Final Stage ---
    # Use the base image again for a smaller final image
    # Changed 'FROM base' to explicit image name due to alias removal above
    FROM python:3.11-bookworm AS final 

    # Copy the virtual environment from the builder stage
    COPY --from=builder /opt/venv /opt/venv

    # Set the path to include the venv
    ENV PATH="/opt/venv/bin:$PATH"

    # Copy the Django project code into the container
    # This should copy manage.py, backend/, vault/, requirements.txt etc. into /app/
    COPY . .

    # Create directories for media and static files if they don't exist
    # These will typically be mounted via volumes in docker-compose, but ensure they exist
    RUN mkdir -p /app/mediafiles /app/staticfiles

    # Expose the port the app runs on (Gunicorn will run on 8000)
    EXPOSE 8000

    # Define the command to run the application using Gunicorn
    # Use 0.0.0.0 to bind to all network interfaces within the container
    CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"] # Restore original CMD

    
