from django.urls import path, include # type: ignore
from rest_framework.routers import DefaultRouter # type: ignore
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView # type: ignore
from .views import (
    CategoryViewSet, ProductViewSet, FabricViewSet, HeroCampaignViewSet, 
    ClientDiaryViewSet, TestimonialViewSet, MeasurementPartViewSet,
    StandardSizeViewSet, SleeveTypeViewSet, NeckDesignViewSet, BespokeOrderViewSet,
    InquiryViewSet, WishlistViewSet, UserViewSet, dashboard_stats, SiteConfigViewSet, update_theme, OrderViewSet,
    staff_create_user
)
from .auth_views import MyTokenObtainPairView, RegisterView, MeView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet, basename='product')
router.register(r'fabrics', FabricViewSet)
router.register(r'measurement-parts', MeasurementPartViewSet)
router.register(r'standard-sizes', StandardSizeViewSet)
router.register(r'sleeve-types', SleeveTypeViewSet)
router.register(r'neck-designs', NeckDesignViewSet)
router.register(r'custom-orders', BespokeOrderViewSet)
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'hero-campaigns', HeroCampaignViewSet, basename='hero-campaign')
router.register(r'diaries', ClientDiaryViewSet)
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')
router.register(r'inquiries', InquiryViewSet)
router.register(r'config', SiteConfigViewSet, basename='config')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/auth/login/', MyTokenObtainPairView.as_view(), name='auth_login'),
    path('api/auth/me/', MeView.as_view(), name='auth_me'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    path('api/staff/summary/', dashboard_stats, name='dashboard_stats'),
    path('api/staff/update-theme/', update_theme, name='update_theme'),
    path('api/staff/create-user/', staff_create_user, name='staff_create_user'),
]
