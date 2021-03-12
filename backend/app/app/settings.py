"""
Django settings for app project.

Generated by 'django-admin startproject' using Django 2.2.6.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""
import os
import django

import environ

from django.core.wsgi import get_wsgi_application
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(BASE_DIR,  "app")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")


# ENVIRONEMENT VARIABLES SEE env.example
env = environ.Env()
# reading .env file
environ.Env.read_env()



#SECRET_KEY = env("SECRET_KEY")
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# Crypto section
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')
SECRET_KEY_RESET = env('SECRET_KEY_RESET') # key for password reset token generation
SECRET_KEY_CONFIRM =  env('SECRET_KEY_CONFIRM') # key for email confirm token
SECRET_KEY_TOTP = env('SECRET_KEY_TOTP')
TOTP_CONFIRM_SALT = env('TOTP_CONFIRM_SALT')
SALT_CONFIRM_MAIL = env('SALT_CONFIRM_MAIL')
SALT_RESET_PASSWORD = env('SALT_RESET_PASSWORD')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')



ALLOWED_HOSTS = [
    'testserver',
    'localhost',
]

CORS_ORIGIN_WHITELIST = (
    'http://localhost:8080',
)
# CORS_ORIGIN_WHITELIST = (
#     '.localhost', '127.0.0.1', '[::1]',
# )

# Tokens valdity
PASSWORD_RESET_TIMEOUT = env('PASSWORD_RESET_TIMEOUT')  # client requirement
TOTP_CONFIRM_RESET_TIMEOUT = env('TOTP_CONFIRM_RESET_TIMEOUT')
AUTHENTICATION_TOKEN_EXPIRE_HOURS = env('AUTHENTICATION_TOKEN_EXPIRE_HOURS')
AUTHENTICATION_TOKEN_EXPIRE_SECONDS = env('AUTHENTICATION_TOKEN_EXPIRE_SECONDS')


EMAIL_BACKEND = env('EMAIL_BACKEND')
# Email configuration
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_HOST_USER =  env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
EMAIL_PORT = env("EMAIL_PORT")
EMAIL_USE_TLS = env("EMAIL_USE_TLS")

# Application definition
INSTALLED_APPS = [
    'django_otp',
    'django_otp.plugins.otp_totp',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'core',
    'user',
    'diagram',
    'taggit',
    'django_extensions',
    'corsheaders',
    'pydot',
    'pydotplus',
    'drf_yasg',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',
]

ROOT_URLCONF = 'app.urls'

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

WSGI_APPLICATION = 'app.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': env('DB_HOST'),
        'NAME': env('DB_NAME'),
        'USER': env('DB_USER'),
        'PASSWORD': env('DB_PASS'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',

    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 9,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    {
        'NAME': 'user.validators.LowercaseValidator',
    },
    {
        'NAME':'user.validators.UppercaseValidator',
    },
    {
        'NAME': 'user.validators.SymbolValidator',
    },
]

# defining the custom token authentication as primary authentication (in the place of TokenAuthentication)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
         'user.authentication.ExpiringTokenAuthentication',
    ],

    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

LOGGING = {
    'version': 1,
    # Version of logging
    'disable_existing_loggers': False,
 
    'filters':{
        #information regarding filters
    },
 
    'formatters':{
        'Simple_Format':{
            'format': '{levelname} {message}',
            'style': '{',
        }
    },
 
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'logs/log_authentication.log',
            'formatter': 'Simple_Format',
        },
 
        # 'console': {
        #     'level': 'DEBUG',
        #     'class': 'logging.StreamHandler',
        # },
    },
 
    'loggers': {
        'django': {
            'handlers': ['file',],
            'level': 'DEBUG',
        },
    },
}


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE ='en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'

AUTH_USER_MODEL = 'core.User'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'
application = get_wsgi_application()
django.setup()
