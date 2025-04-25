# backend/backend/settings.py

# Ensure NO leading whitespace on these import lines
import os 
from pathlib import Path
from dotenv import load_dotenv 

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file (especially DB_PASSWORD)
# Place .env file in the 'backend' directory (same level as manage.py)
load_dotenv(BASE_DIR / '.env') # Restore this call

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# Generate a strong secret key for production
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', '*mzj*88_kiiu8*w_ocwwk4tmggs#$rr)j*bf3&07x-u@(fy1_6') # Use the generated key

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DJANGO_DEBUG', 'True') == 'True' # Default to True for dev

# Define allowed hosts. '*' is insecure for production.
# Use environment variable in production (e.g., 'yourdomain.com,localhost')
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # --- Restore 3rd party and custom apps ---
    'rest_framework',
    'rest_framework.authtoken', # For Token Authentication
    'corsheaders',              # For Cross-Origin Resource Sharing
    'django_filters',           # For API filtering
    'vault',                    # Our file vault application
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # Add WhiteNoiseMiddleware here for serving static files in production
    # 'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # Restore CorsMiddleware
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware', # Keep commented out if primarily using Token Auth for API
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# --- Restore original ROOT_URLCONF ---
ROOT_URLCONF = 'backend.urls' 

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # Values below will be overridden by environment variables in docker-compose.yml
        'NAME': os.getenv('POSTGRES_DB', 'abnormal_vault_db'),
        'USER': os.getenv('POSTGRES_USER', 'abnormal_vault_user'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'fallback_password'), # Get password from .env or docker-compose
        'HOST': os.getenv('POSTGRES_HOST', 'db'), # 'db' when running in docker-compose
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': { # Example: Enforce minimum length
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC' # Or your preferred timezone, e.g., 'Asia/Kolkata'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images) for Django Admin etc.
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
# Directory where collectstatic will gather static files for deployment
STATIC_ROOT = BASE_DIR / 'staticfiles'
# Optional: Add directories outside apps where Django should look for static files
# STATICFILES_DIRS = [ BASE_DIR / "static", ]

# Media files (User-uploaded content)
MEDIA_URL = '/media/'
# Directory where user-uploaded files will be stored
MEDIA_ROOT = BASE_DIR / 'mediafiles'


# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Django Rest Framework Settings
# Restore REST_FRAMEWORK settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',   # Primary API auth
        'rest_framework.authentication.SessionAuthentication', # For browsable API login
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', # Require login by default
    ],
    'DEFAULT_FILTER_BACKENDS': [ # Enable filtering globally
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

# CORS Settings (Cross-Origin Resource Sharing)
# Restore CORS settings
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
# CORS_ALLOW_CREDENTIALS = True # Uncomment if needed later

