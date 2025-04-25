# Abnormal File Vault

A secure and efficient file hosting web application built with React, Django, and PostgreSQL, running in Docker containers. This project focuses on core file management features, including storage optimization through file-level deduplication.

## Key Features

* **Secure User Authentication:** User registration and login using Token Authentication (via Django Rest Framework).
* **File Upload:** Users can upload files to their personal vault.
* **File Listing & Management:** View uploaded files, download content, and delete files.
* **File-Level Deduplication:** Saves storage space by storing only one physical copy of identical file content (based on SHA-256 hash). Reference counting ensures physical files are deleted only when the last reference is removed.
* **API Filtering:** Backend API supports filtering the file list based on filename, content type, size, and upload date (`django-filter`).
* **Containerized Deployment:** Uses Docker and Docker Compose for easy setup and deployment of the entire stack (Frontend, Backend, Database).

## Tech Stack

* **Frontend:** React (with Hooks, Axios)
* **Backend:** Python, Django, Django Rest Framework (DRF)
* **Database:** PostgreSQL
* **Web Server (Frontend):** Nginx (serving static build)
* **Application Server (Backend):** Gunicorn
* **Containerization:** Docker, Docker Compose
* **Libraries:** `django-filter`, `django-cors-headers`, `python-dotenv`, `psycopg2`

## Project Structure

abnormal-file-vault/├── backend/│   ├── backend/          # Django project settings, urls, wsgi│   ├── vault/            # Django app for file vault logic (models, views, etc.)│   ├── mediafiles/       # (Created at runtime, volume mounted) User uploads│   ├── staticfiles/      # (Created at runtime, volume mounted) Collected static files│   ├── manage.py│   ├── requirements.txt│   ├── Dockerfile        # Builds the backend image│   ├── .env              # Environment variables (DB creds, SECRET_KEY) - DO NOT COMMIT│   └── .dockerignore├── frontend/│   ├── public/│   ├── src/              # React source code (components, etc.)│   ├── package.json│   ├── Dockerfile        # Builds the frontend image (React build + Nginx)│   ├── nginx.conf        # Nginx configuration│   └── .dockerignore├── docker-compose.yml    # Defines services, networks, volumes└── README.md             # This file
## Setup and Running with Docker Compose

**Prerequisites:**

* Docker Engine installed ([Install Docker](https://docs.docker.com/engine/install/))
* Docker Compose installed (usually included with Docker Desktop or installed as a plugin - check `docker compose version`)
* Git (for cloning)
* A terminal or command prompt

**Instructions:**

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd abnormal-file-vault
    ```

2.  **Configure Backend Environment:**
    * Navigate to the `backend` directory: `cd backend`
    * Copy the example environment file (if you create one) or create `.env` directly: `cp .env.example .env` (if applicable) or `touch .env`
    * Edit the `backend/.env` file:
        * Generate a strong, unique `DJANGO_SECRET_KEY`. You can use the command (requires Django installed locally or run via Docker exec later):
            ```bash
            # Ensure venv is active if running locally
            # python manage.py shell -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())' 
            ```
        * Set a strong `POSTGRES_PASSWORD`.
        * Ensure `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_HOST=db` are set.
        * Configure `DJANGO_DEBUG=False` for production-like testing (optional for local dev).
        * Configure `DJANGO_ALLOWED_HOSTS` (e.g., `localhost,127.0.0.1`).
        * Configure `CORS_ALLOWED_ORIGINS` (e.g., `http://localhost:3000,http://127.0.0.1:3000`).

3.  **Configure Docker Compose Database Password:**
    * Edit the main `docker-compose.yml` file in the project root.
    * In the `db` service definition, ensure the `POSTGRES_PASSWORD` under `environment:` **exactly matches** the one you set in `backend/.env`.
    * Ensure `POSTGRES_DB` and `POSTGRES_USER` also match `backend/.env`.

4.  **Build and Start Containers:**
    * Navigate back to the project root directory: `cd ..`
    * Run Docker Compose (use `sudo` if your user isn't in the `docker` group):
        ```bash
        # Build images first (needed initially or after code/Dockerfile changes)
        docker compose build 

        # Start containers in detached mode
        docker compose up -d
        ```

5.  **Initial Database Setup (Run Once):**
    * Apply database migrations:
        ```bash
        docker compose exec backend python manage.py migrate
        ```
    * Collect static files for the admin interface:
        ```bash
        docker compose exec backend python manage.py collectstatic --noinput
        ```
    * Create a superuser account to log in:
        ```bash
        docker compose exec backend python manage.py createsuperuser
        ```
        (Follow the prompts for username, email, password)

6.  **Access the Application:**
    * Open your web browser and navigate to: `http://localhost:3000`

7.  **Stopping the Application:**
    * To stop the containers:
        ```bash
        docker compose down
        ```
    * To stop and remove data volumes (database, media, static):
        ```bash
        docker compose down -v
        ```

## Further Development

* Implement frontend filtering UI.
* Add more robust error handling and user feedback.
* Improve styling and layout.
* Add tests (backend and frontend).
* Consider chunked uploads for very large files.

