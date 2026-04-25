from django.contrib.auth import get_user_model # type: ignore
from rest_framework import serializers # type: ignore
from .models import (
    Category, Product, Order, Fabric, ClientDiary, Testimonial, 
    MeasurementPart, StandardSize, StandardSizeValue, SleeveType, NeckDesign, BespokeOrder, MeasurementValue, Inquiry, Wishlist, SiteConfig, HeroCampaign
) # type: ignore

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'whatsapp')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data.get('name', ''),
            phone=validated_data.get('phone', '')
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'parent', 'subcategories']

    def get_subcategories(self, obj):
        if obj.subcategories.exists():
            return CategorySerializer(obj.subcategories.all(), many=True).data # type: ignore
        return []

class ProductSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_details', 'title', 'description', 
            'base_price', 'image', 'is_active', 'is_trending', 
            'is_out_of_stock', 'stock_level', 'caption'
        ]

class OrderSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    user_email = serializers.ReadOnlyField(source='user.email')
    user_name = serializers.ReadOnlyField(source='user.name')
    user_phone = serializers.ReadOnlyField(source='user.phone')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    financial_status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_email', 'user_name', 'user_phone', 'product', 'product_details', 
            'quantity', 'total_price', 'amount_paid', 'financial_status', 'status', 'status_display', 
            'payment_method', 'payment_confirmed', 'stitching_notes', 
            'tracking_number', 'created_at', 'updated_at'
        ]

    def get_financial_status(self, obj):
        if obj.amount_paid <= 0:
            return "Unpaid"
        if obj.amount_paid < obj.total_price:
            return "Partial"
        return "Paid"
        read_only_fields = ['user', 'total_price', 'created_at', 'updated_at']

class FabricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fabric
        fields = '__all__'

class MeasurementPartSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeasurementPart
        fields = '__all__'

class StandardSizeValueSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source='part.name', read_only=True)
    class Meta:
        model = StandardSizeValue
        fields = ['id', 'part', 'part_name', 'value']

class StandardSizeSerializer(serializers.ModelSerializer):
    values = StandardSizeValueSerializer(many=True, read_only=True) # type: ignore
    class Meta:
        model = StandardSize
        fields = ['id', 'name', 'values']

class SleeveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SleeveType
        fields = '__all__'

class NeckDesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = NeckDesign
        fields = '__all__'

class MeasurementValueSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source='part.name', read_only=True)
    class Meta:
        model = MeasurementValue
        fields = ['id', 'part', 'part_name', 'value']

import json

class BespokeOrderSerializer(serializers.ModelSerializer):
    measurements = MeasurementValueSerializer(many=True, required=False) # type: ignore
    
    class Meta:
        model = BespokeOrder
        fields = '__all__'
        
    def create(self, validated_data):
        measurements_data = validated_data.pop('measurements', [])
        
        # If measurements comes as a string (from FormData), parse it
        if isinstance(measurements_data, str):
            try:
                measurements_data = json.loads(measurements_data)
            except json.JSONDecodeError:
                measurements_data = []

        order = BespokeOrder.objects.create(**validated_data)
        
        for m_data in measurements_data:
            part_id = m_data.get('part')
            val = m_data.get('value')
            if part_id and val:
                MeasurementValue.objects.create(
                    bespoke_order=order, 
                    part_id=part_id, 
                    value=float(val)
                )
        return order

class HeroCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroCampaign
        fields = '__all__'

class ClientDiarySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientDiary
        fields = '__all__'

class TestimonialSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.name', read_only=True)
    class Meta:
        model = Testimonial
        fields = ['id', 'user', 'name', 'rating', 'text_review', 'photo', 'is_approved', 'created_at']

class InquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inquiry
        fields = '__all__'
        read_only_fields = ('is_read', 'status', 'created_at')

class WishlistSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    fabric_details = FabricSerializer(source='fabric', read_only=True)
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'fabric', 'product_details', 'fabric_details', 'created_at']

class BespokeOrderDetailedSerializer(serializers.ModelSerializer):
    fabric_name = serializers.CharField(source='fabric.name', read_only=True)
    sleeve_name = serializers.CharField(source='sleeve_type.name', read_only=True)
    neck_name = serializers.CharField(source='neck_design.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    measurements = MeasurementValueSerializer(many=True, read_only=True)
    financial_status = serializers.SerializerMethodField()
    user_email = serializers.ReadOnlyField(source='user.email')
    user_name = serializers.ReadOnlyField(source='user.name')
    user_phone = serializers.ReadOnlyField(source='user.phone')
    
    class Meta:
        model = BespokeOrder
        fields = [
            'id', 'user', 'user_email', 'user_name', 'user_phone', 'status', 'status_display', 
            'total_price', 'amount_paid', 'financial_status', 'created_at',
            'fabric_name', 'sleeve_name', 'neck_name', 'measurements', 
            'original_photo', 'custom_fabric_preference'
        ]

    def get_financial_status(self, obj):
        if not obj.total_price or obj.amount_paid <= 0:
            return "Unpaid"
        if obj.amount_paid < obj.total_price:
            return "Partial"
        return "Paid"

class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = [
            'id', 'whatsapp_number', 'business_email', 'display_phone',
            'address', 'default_country_code', 'theme_mode',
            'instagram_url', 'facebook_url', 'youtube_url', 'twitter_url'
        ]

class UserDetailSerializer(serializers.ModelSerializer):
    all_orders = serializers.SerializerMethodField()
    wishlist = WishlistSerializer(many=True, read_only=True)
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'phone', 'whatsapp', 'all_orders', 'wishlist', 'total_spent', 'is_staff', 'date_joined')

    def get_all_orders(self, obj):
        standard = Order.objects.filter(user=obj)
        bespoke = BespokeOrder.objects.filter(user=obj)
        
        unified = [
            {**OrderSerializer(o).data, 'type': 'standard'} for o in standard
        ] + [
            {**BespokeOrderDetailedSerializer(o).data, 'type': 'bespoke'} for o in bespoke
        ]
        
        return sorted(unified, key=lambda x: x['created_at'], reverse=True)

    def get_total_spent(self, obj):
        from django.db.models import Sum
        standard_sum = Order.objects.filter(user=obj, payment_confirmed=True).aggregate(Sum('total_price'))['total_price__sum'] or 0
        bespoke_sum = BespokeOrder.objects.filter(user=obj).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
        return float(standard_sum) + float(bespoke_sum)
