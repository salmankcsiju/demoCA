from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-test-key-do-not-use-in-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'unfold',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'ecommerce',
]

AUTH_USER_MODEL = 'ecommerce.CustomUser'

from django.urls import reverse_lazy # type: ignore

UNFOLD = {
    "SITE_TITLE": "Casa Amora Admin",
    "SITE_HEADER": "Atelier Control Center",
    "SITE_SYMBOL": "diamond",
    "COLORS": {
        "primary": {
            "50": "236 253 245",
            "100": "209 250 229",
            "200": "167 243 208",
            "300": "110 231 183",
            "400": "52 211 153",
            "500": "16 185 129",
            "600": "5 150 105",
            "700": "4 120 87",
            "800": "6 95 70",
            "900": "6 78 59", # Deep Emerald (#064e3b)
            "950": "2 44 34",
        },
        "accent": {
            "500": "212 175 55", # Champagne Gold (#D4AF37)
        }
    },
    "SIDEBAR": {
        "show_search": True,
        "show_all_applications": False,
        "navigation": [
            {
                "title": "📦 Sales Operations",
                "items": [
                    {"title": "Management Dashboard", "link": reverse_lazy("admin:index"), "icon": "dashboard"},
                    {"title": "Bespoke Orders", "link": reverse_lazy("admin:ecommerce_bespokeorder_changelist"), "icon": "shopping_cart"},
                    {"title": "Client Enquiries", "link": reverse_lazy("admin:ecommerce_inquiry_changelist"), "icon": "mail"},
                ],
            },
            {
                "title": "🛍️ Boutique Catalog",
                "items": [
                    {"title": "Product Gallery", "link": reverse_lazy("admin:ecommerce_product_changelist"), "icon": "inventory_2"},
                    {"title": "Categories", "link": reverse_lazy("admin:ecommerce_category_changelist"), "icon": "category"},
                    {"title": "Fabric Library", "link": reverse_lazy("admin:ecommerce_fabric_changelist"), "icon": "texture"},
                    {"title": "Heritage Spotlights", "link": reverse_lazy("admin:ecommerce_herocampaign_changelist"), "icon": "star"},
                ],
            },
            {
                "title": "📖 Brand Presence",
                "items": [
                    {"title": "Client Diaries", "link": reverse_lazy("admin:ecommerce_clientdiary_changelist"), "icon": "auto_stories"},
                    {"title": "Public Testimonials", "link": reverse_lazy("admin:ecommerce_testimonial_changelist"), "icon": "reviews"},
                ],
            },
            {
                "title": "📐 Atelier Studio",
                "items": [
                    {"title": "Measurement Guides", "link": reverse_lazy("admin:ecommerce_measurementpart_changelist"), "icon": "straighten"},
                    {"title": "Sizing Templates", "link": reverse_lazy("admin:ecommerce_standardsize_changelist"), "icon": "format_size"},
                    {"title": "Atelier Users", "link": reverse_lazy("admin:ecommerce_customuser_changelist"), "icon": "person"},
                    {"title": "Registry Settings", "link": reverse_lazy("admin:ecommerce_siteconfig_changelist"), "icon": "settings"},
                ],
            },
        ],
    },
    "DASHBOARD": {
        "callback": "ecommerce.admin.dashboard_callback",
        "widgets": [
            {
                "title": "Business Performance",
                "width": "full",
                "metrics": [
                    {"title": "Today's Revenue", "value": "today_revenue"},
                    {"title": "Active Enquiries", "value": "active_enquiries"},
                    {"title": "Tailoring Pipeline", "value": "tailoring_pipeline"},
                    {"title": "Approval Pending", "value": "new_testimonials"},
                ],
            },
            {
                "title": "Market Trends (Last 7 Days)",
                "width": "half",
                "chart": "order_growth_chart",
            },
            {
                "title": "Recent Activity Feed",
                "width": "half",
                "template": "unfold/widgets/activity_feed.html",
            },
        ],
    },
    "GLOBAL_SEARCH": {
        "models": [
            {"model": "ecommerce.CustomUser", "fields": ["name", "email", "phone"]},
            {"model": "ecommerce.BespokeOrder", "fields": ["id"]},
            {"model": "ecommerce.Inquiry", "fields": ["name", "phone"]},
        ]
    }
}


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'
WSGI_APPLICATION = 'core.wsgi.application'

CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:8000",
]

SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),
            os.path.join(BASE_DIR, '..', 'website', 'dist')
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'ecommerce.context_processors.admin_notifications',
            ],
        },
    },
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/assets/'
WHITENOISE_INDEX_FILE = True
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, '..', 'website', 'dist', 'assets'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
