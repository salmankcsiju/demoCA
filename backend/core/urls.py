from django.contrib import admin # type: ignore
from django.urls import path, include # type: ignore
from django.conf import settings # type: ignore
from django.conf.urls.static import static # type: ignore
from ecommerce.views import serve_staff_portal # type: ignore

urlpatterns = [
    path('staff-portal/', serve_staff_portal),
    path('admin/', admin.site.urls),
    path('', include('ecommerce.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
