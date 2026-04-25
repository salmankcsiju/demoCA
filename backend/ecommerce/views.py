import os
import time
import uuid
import shutil
import requests # type: ignore
from django.conf import settings
from django.http import HttpResponse
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAdminUser
from .permissions import IsStaffMember
from .models import (
    Category, Product, Fabric, ClientDiary, Testimonial, 
    MeasurementPart, StandardSize, SleeveType, NeckDesign, BespokeOrder, Inquiry, Wishlist, SiteConfig, Order, HeroCampaign
)
from .serializers import (
    CategorySerializer, ProductSerializer, FabricSerializer, HeroCampaignSerializer, 
    ClientDiarySerializer, TestimonialSerializer, MeasurementPartSerializer,
    StandardSizeSerializer, SleeveTypeSerializer, NeckDesignSerializer, BespokeOrderSerializer,
    InquirySerializer, WishlistSerializer, BespokeOrderDetailedSerializer, SiteConfigSerializer, OrderSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsStaffMember()]

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsStaffMember()]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            queryset = Product.objects.all()
        else:
            queryset = Product.objects.filter(is_active=True)
            
        category_slug = self.request.query_params.get('category')
        is_trending = self.request.query_params.get('trending')

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if is_trending:
            queryset = queryset.filter(is_trending=True)
        
        return queryset

class FabricViewSet(viewsets.ModelViewSet):
    queryset = Fabric.objects.all()
    serializer_class = FabricSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsStaffMember()]

class MeasurementPartViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MeasurementPart.objects.all()
    serializer_class = MeasurementPartSerializer
    permission_classes = [AllowAny]

class StandardSizeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StandardSize.objects.all()
    serializer_class = StandardSizeSerializer
    permission_classes = [AllowAny]

class SleeveTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SleeveType.objects.all()
    serializer_class = SleeveTypeSerializer
    permission_classes = [AllowAny]

class NeckDesignViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NeckDesign.objects.all()
    serializer_class = NeckDesignSerializer
    permission_classes = [AllowAny]

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Wishlist.objects.filter(user=self.request.user)
        return Wishlist.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BespokeOrderViewSet(viewsets.ModelViewSet):
    queryset = BespokeOrder.objects.all().order_by('-created_at')
    serializer_class = BespokeOrderSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return BespokeOrder.objects.all().order_by('-created_at')
        return BespokeOrder.objects.none()

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve'] and self.request.user.is_authenticated and self.request.user.is_staff:
            return BespokeOrderDetailedSerializer
        return BespokeOrderSerializer

    @action(detail=True, methods=['patch'], permission_classes=[IsStaffMember])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        amount_paid = request.data.get('amount_paid')
        
        if new_status:
            order.status = new_status
        if 'amount_paid' in request.data:
            order.amount_paid = amount_paid
            
        order.save()
        return Response({'status': f'Bespoke order updated'})
            
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Not authenticated"}, status= status.HTTP_401_UNAUTHORIZED)
        orders = BespokeOrder.objects.filter(user=request.user).order_by('-created_at')
        serializer = BespokeOrderDetailedSerializer(orders, many=True)
        return Response(serializer.data)

class HeroCampaignViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = HeroCampaignSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from django.utils import timezone
        from django.db.models import Q
        now = timezone.now()
        qs = HeroCampaign.objects.filter(is_active=True)
        return qs.filter(
            Q(start_date__isnull=True) | Q(start_date__lte=now),
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        )

class ClientDiaryViewSet(viewsets.ModelViewSet):
    queryset = ClientDiary.objects.all().order_by('-created_at')
    serializer_class = ClientDiarySerializer
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsStaffMember()]

from rest_framework.decorators import action
from rest_framework.response import Response

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        quantity = serializer.validated_data.get('quantity', 1)
        total_price = product.base_price * quantity
        serializer.save(user=self.request.user, total_price=total_price)

    @action(detail=True, methods=['patch'], permission_classes=[IsStaffMember])
    def confirm_payment(self, request, pk=None):
        order = self.get_object()
        order.payment_confirmed = True
        order.save()
        return Response({'status': 'Payment confirmed'})

    @action(detail=True, methods=['patch'], permission_classes=[IsStaffMember])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        tracking_number = request.data.get('tracking_number')
        
        if new_status:
            order.status = new_status
        if tracking_number:
            order.tracking_number = tracking_number
        if 'amount_paid' in request.data:
            order.amount_paid = request.data.get('amount_paid')
        if 'stitching_notes' in request.data:
            order.stitching_notes = request.data.get('stitching_notes')
            
        order.save()
        return Response({'status': f'Order updated to {new_status}'})

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.action == 'list' and not self.request.user.is_staff:
            return Testimonial.objects.filter(is_approved=True)
        return Testimonial.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['patch'], permission_classes=[IsStaffMember])
    def approve(self, request, pk=None):
        testimonial = self.get_object()
        testimonial.is_approved = True
        testimonial.save()
        return Response({'status': 'Story approved and published'})

    @action(detail=True, methods=['patch'], permission_classes=[IsStaffMember])
    def reject(self, request, pk=None):
        testimonial = self.get_object()
        testimonial.is_approved = False
        testimonial.save()
        return Response({'status': 'Story removed from gallery'})

class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all().order_by('-created_at')
    serializer_class = InquirySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Inquiry.objects.all().order_by('-created_at')
        return Inquiry.objects.none()

    @action(detail=True, methods=['patch'], permission_classes=[IsStaffMember])
    def resolve(self, request, pk=None):
        inquiry = self.get_object()
        inquiry.status = 'resolved'
        inquiry.save()
        return Response({'status': 'Inquiry marked as resolved'})

from django.contrib.auth import get_user_model
User = get_user_model()
from rest_framework import serializers

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'is_staff', 'date_joined']

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSummarySerializer
    permission_classes = [IsStaffMember]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserDetailSerializer
        return UserSummarySerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(email__icontains=search) | queryset.filter(name__icontains=search) | queryset.filter(phone__icontains=search)
        return queryset

class SiteConfigViewSet(viewsets.ModelViewSet):
    queryset = SiteConfig.objects.all()
    serializer_class = SiteConfigSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsStaffMember()]

    def get_object(self):
        obj = SiteConfig.objects.first()
        if obj is None:
            obj = SiteConfig.objects.create()
        return obj

    def list(self, request, *args, **kwargs):
        # Always return the single config object as a flat dict (not a list)
        obj = SiteConfig.objects.first()
        if obj is None:
            obj = SiteConfig.objects.create()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsStaffMember])
def dashboard_stats(request):
    total_orders = BespokeOrder.objects.count()
    total_inquiries = Inquiry.objects.count()
    
    # Kanban Specific Counts
    kanban = {
        'new': BespokeOrder.objects.filter(status='New').count(),
        'cutting': BespokeOrder.objects.filter(status='Cutting').count(),
        'stitching': BespokeOrder.objects.filter(status='Stitching').count(),
        'finished': BespokeOrder.objects.filter(status='Finished').count(),
        'ready': BespokeOrder.objects.filter(status='Ready').count(),
    }
    
    recent_orders = BespokeOrderDetailedSerializer(BespokeOrder.objects.all().order_by('-created_at')[:5], many=True).data
    recent_inquiries = InquirySerializer(Inquiry.objects.all().order_by('-created_at')[:5], many=True).data
    
    # Revenue calculation (Verified Payments Only)
    from django.db.models import Sum
    verified_revenue = Order.objects.filter(payment_confirmed=True).aggregate(Sum('total_price'))['total_price__sum'] or 0
    
    return Response({
        'total_orders': total_orders,
        'total_inquiries': total_inquiries,
        'verified_revenue': verified_revenue,
        'kanban': kanban,
        'recent_orders': recent_orders,
        'recent_inquiries': recent_inquiries
    })

@api_view(['POST'])
@permission_classes([IsStaffMember])
def update_theme(request):
    theme = request.data.get('theme')
    if theme not in ['monochrome', 'wine_red']:
        return Response({'error': 'Invalid theme'}, status=status.HTTP_400_BAD_REQUEST)
    
    config, _ = SiteConfig.objects.get_or_create(id=1)
    config.theme_mode = theme
    config.save()
    
    return Response({'status': 'Theme updated', 'theme': theme})

@api_view(['POST'])
@permission_classes([IsStaffMember])
def staff_create_user(request):
    """Staff/Admin can create new User or Staff accounts from the portal."""
    email = request.data.get('email')
    name = request.data.get('name')
    password = request.data.get('password')
    is_staff = request.data.get('is_staff', False)

    if not email or not name or not password:
        return Response({'error': 'Email, name, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            is_staff=bool(is_staff)
        )
        return Response({'status': 'User created', 'id': user.id, 'email': user.email}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def serve_staff_portal(request):
    """
    Nuclear View: Explicitly loads index.html from dist and forces no-cache headers.
    Bypasses standard TemplateView to ensure freshness on port 8000.
    """
    try:
        # Path to the built React index.html
        dist_path = os.path.join(settings.BASE_DIR, '..', 'website', 'dist', 'index.html')
        with open(dist_path, 'r', encoding='utf-8') as f:
            html = f.read()
        
        response = HttpResponse(html)
        # Force the browser to ignore any cached version of this HTML
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response
    except FileNotFoundError:
        return HttpResponse(
            "Atelier Dist Not Found. Please run website/deploy.ps1 to build the project.", 
            status=404
        )
