from django.db import models  # type: ignore
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin # type: ignore
from django.conf import settings # type: ignore

class CustomUserManager(BaseUserManager):
    def create_user(self, phone, name, password=None, **extra_fields):
        if not phone:
            raise ValueError('The Phone field must be set')
        user = self.model(phone=phone, name=name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, name, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(null=True, blank=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True, default='0000000000')
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    parent = models.ForeignKey('self', related_name='subcategories', null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

import io
from PIL import Image
from django.core.files.base import ContentFile

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_trending = models.BooleanField(default=False)
    is_out_of_stock = models.BooleanField(default=False)
    stock_level = models.PositiveIntegerField(default=10)
    caption = models.CharField(max_length=200, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.image:
            img = Image.open(self.image)
            if img.format != 'WEBP':
                output = io.BytesIO()
                img.save(output, format='WEBP', quality=90)
                output.seek(0)
                self.image.save(f"{self.title}.webp", ContentFile(output.read()), save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Order Received'),
        ('Cutting', 'Cutting'),
        ('Stitching', 'Stitching 🧵'),
        ('Finishing', 'Finishing'),
        ('Ready', 'Ready for Delivery'),
        ('Shipped', 'Shipped ✈️'),
        ('Delivered', 'Delivered ✅'),
    ]
    PAYMENT_METHODS = [
        ('UPI', 'UPI / Google Pay'),
        ('COD', 'Cash on Delivery'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS, default='UPI')
    payment_confirmed = models.BooleanField(default=False)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stitching_notes = models.TextField(blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"

class Fabric(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='fabrics/')
    hex_code = models.CharField(max_length=7, default="#000000")
    price_per_meter = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    in_stock = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class MeasurementPart(models.Model):
    name = models.CharField(max_length=100)
    instruction_image = models.ImageField(upload_to='measurements/instructions/')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

class StandardSize(models.Model):
    name = models.CharField(max_length=20) # e.g. S, M, L, XL

    def __str__(self):
        return self.name

class StandardSizeValue(models.Model):
    size = models.ForeignKey(StandardSize, related_name='values', on_delete=models.CASCADE)
    part = models.ForeignKey(MeasurementPart, on_delete=models.CASCADE)
    value = models.FloatField(help_text="Default value in inches")

    class Meta:
        unique_together = ('size', 'part')

    def __str__(self):
        return f"{self.size.name} - {self.part.name}: {self.value}"

class SleeveType(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='designs/sleeves/')

    def __str__(self):
        return self.name

class NeckDesign(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='designs/necks/')

    def __str__(self):
        return self.name

class BespokeOrder(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'New Enquiry 🔔'),
        ('Cutting', 'Cutting'),
        ('Stitching', 'Stitching 🧵'),
        ('Finishing', 'Finishing'),
        ('Ready', 'Ready for Pickup'),
        ('Shipped', 'Shipped ✈️'),
        ('Delivered', 'Delivered ✅'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    original_photo = models.ImageField(upload_to='orders/references/', help_text="User's uploaded photo", null=True, blank=True)
    fabric = models.ForeignKey(Fabric, on_delete=models.SET_NULL, null=True, blank=True)
    custom_fabric_preference = models.CharField(max_length=255, blank=True, null=True)
    
    sleeve_type = models.ForeignKey(SleeveType, on_delete=models.SET_NULL, null=True, blank=True)
    neck_design = models.ForeignKey(NeckDesign, on_delete=models.SET_NULL, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    is_read = models.BooleanField(default=False)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Customize on Your Style Order"
        verbose_name_plural = "Customize on Your Style Orders"

    def __str__(self):
        return f"Order #{self.id} for {self.user.email}"

class MeasurementValue(models.Model):
    bespoke_order = models.ForeignKey(BespokeOrder, related_name='measurements', on_delete=models.CASCADE, null=True, blank=True)
    part = models.ForeignKey(MeasurementPart, on_delete=models.CASCADE)
    value = models.FloatField()

    def __str__(self):
        return f"{self.bespoke_order.id} - {self.part.name}: {self.value}"

class HeroCampaign(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True, null=True)
    desktop_image = models.ImageField(upload_to='campaigns/desktop/', blank=True, null=True)
    mobile_image = models.ImageField(upload_to='campaigns/mobile/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True, help_text="Optional background video URL")
    cta_text = models.CharField(max_length=50, default="Discover")
    cta_link = models.CharField(max_length=200, default="/shop")
    text_light = models.BooleanField(default=True, help_text="Check if text should be light (for dark backgrounds)")
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name = "Hero Campaign"
        verbose_name_plural = "Hero Campaigns"

    def __str__(self):
        return self.title

class ClientDiary(models.Model):
    client_name = models.CharField(max_length=100)
    before_image = models.ImageField(upload_to='diaries/before/')
    after_image = models.ImageField(upload_to='diaries/after/')
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Client Diary"
        verbose_name_plural = "Client Diaries"

    def __str__(self):
        return f"Diary: {self.client_name}"

class Testimonial(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.PositiveIntegerField(default=5)
    text_review = models.TextField()
    photo = models.ImageField(upload_to='testimonials/', null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Client Story"
        verbose_name_plural = "Client Stories"

    def __str__(self):
        return f"Story from {self.user.name if self.user else 'Guest'}"

class Inquiry(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    message = models.TextField()
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    source = models.CharField(max_length=50, default='WhatsApp')
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('urgent', 'Urgent'),
        ('resolved', 'Resolved'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Special Inquiry"
        verbose_name_plural = "Special Inquiries"

    def __str__(self):
        return f"Request from {self.name} via {self.source}"

class SiteConfig(models.Model):
    THEME_CHOICES = [
        ('monochrome', 'Modern Atelier (Monochrome)'),
        ('wine_red', 'Wine Red Editorial'),
    ]
    whatsapp_number = models.CharField(max_length=20, default="7356198300")
    business_email = models.EmailField(default="contact@casaamora.com")
    display_phone = models.CharField(max_length=30, default="+91 73561 98300", blank=True)
    address = models.TextField(default="Casa Amora Atelier, Kozhikode, Kerala, India", blank=True)
    default_country_code = models.CharField(max_length=5, default="+91")
    theme_mode = models.CharField(max_length=20, choices=THEME_CHOICES, default='wine_red')
    # Social Media
    instagram_url = models.URLField(default="https://instagram.com/casaamora", blank=True)
    facebook_url = models.URLField(default="https://facebook.com/casaamora", blank=True)
    youtube_url = models.URLField(default="", blank=True)
    twitter_url = models.URLField(default="", blank=True)

    class Meta:
        verbose_name = "Atelier Configuration"
        verbose_name_plural = "Atelier Configuration"

    def __str__(self):
        return "Global Atelier Settings"

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    fabric = models.ForeignKey(Fabric, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product', 'fabric')
        verbose_name = "Registry Wishlist"
        verbose_name_plural = "Registry Wishlists"

    def __str__(self):
        return f"Wishlist item for {self.user.email}"
