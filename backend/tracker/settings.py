import os
from pathlib import Path
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialise environment variables
env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

DEV = 'dev'
PRODUCTION = 'production'
ENV = env('DJANGO_ENV')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

DEBUG = False if ENV == PRODUCTION else True

ALLOWED_HOSTS = env('ALLOWED_HOSTS').split()

# Application definition
INSTALLED_APPS = [
    'grappelli',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # My apps
    'user.apps.UserConfig',
    'core.apps.CoreConfig',

    # 3rd Party
    'rest_framework',
    'djoser',
    'rest_framework.authtoken',
    "corsheaders",
    "django_celery_results",
    "django_celery_beat",
    'mptt',
    'django_inlinecss',
    'channels'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'tracker.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
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

WSGI_APPLICATION = 'tracker.wsgi.application'

ASGI_APPLICATION = "tracker.asgi.application"


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DATABASE_NAME'),
        'USER': env('DATABASE_USER'),
        'PASSWORD': env('DATABASE_PASSWORD'),
        'HOST': env('DATABASE_HOST'),
        'PORT': env('DATABASE_PORT'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'

STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# STATICFILES_DIRS = [
#     os.path.join(BASE_DIR, 'static'),
# ]

MEDIA_URL = '/media/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

WEB_URL = env('WEB_URL')

X_FRAME_OPTIONS = 'ALLOWALL'

AUTH_USER_MODEL = 'user.User'

CORS_ALLOWED_ORIGINS = env('CORS_ALLOWED_ORIGINS').split()

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

SALT = "CLHGCYF#@klmknlk!@#KNLKLNBUI12jn"

# REST FRAMEWORK SETTINGS
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),
}

# DJOSER SETTINGS
DJOSER = {
    'PASSWORD_RESET_CONFIRM_URL': 'password/reset/confirm/{uid}/{token}',
    'USERNAME_RESET_CONFIRM_URL': '#/username/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL': '#/activate/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': True,
    'LOGOUT_ON_PASSWORD_CHANGE': True,
    'PASSWORD_RESET_CONFIRM_RETYPE': True,
    'SERIALIZERS': {
        'user': 'user.api.serializers.UserSerializer',
        'current_user': 'user.api.serializers.UserSerializer',
    },
    'EMAIL': {
        'password_reset': 'core.email.PasswordResetEmail'
    },
}

PASSWORD_RESET_TIMEOUT = 900

# CELERY SETTINGS
CELERY_BROKER_URL = f"redis://{env('REDIS_PASSWORD')}@{env('REDIS_HOST')}:{env('REDIS_PORT')}/0"
CELERY_RESULT_BACKEND = f"redis://{env('REDIS_PASSWORD')}@{env('REDIS_HOST')}:{env('REDIS_PORT')}/0"
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TASK_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# CELERY BEAT
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# EMAIL SETTINGS
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL')
# DEFAULT_FROM_NAME = env('DEFAULT_FROM_EMAIL')
EMAIL_HOST = env('SMTP_SERVER')
EMAIL_PORT = env('SMTP_PORT')
EMAIL_HOST_USER = env('SMTP_USERNAME')
EMAIL_HOST_PASSWORD = env('SMTP_PASSWORD')
EMAIL_USE_TLS = True


# ADD THE REDIS PASSWORD
host = [{
        'address': f"redis://{env('REDIS_HOST')}:{env('REDIS_PORT')}", 
        # 'password': ''
    }]

# CHANNELS
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": host,
        },
    },
}

# GRAPELLI ADMIN SETTINGS
GRAPPELLI_ADMIN_TITLE = "Ghana Cocoa Board | Cocoa Papers"
