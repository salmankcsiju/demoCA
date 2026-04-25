from django.contrib import admin # type: ignore
from django.utils.html import format_html # type: ignore
from django.urls import reverse, path # type: ignore
from django.utils import timezone # type: ignore
from django.db.models import Sum, Q # type: ignore
from django.shortcuts import render, get_object_or_404 # type: ignore
from unfold.admin import ModelAdmin, TabularInline # type: ignore
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin # type: ignore
from django.utils.translation import gettext_lazy as _ # type: ignore
from itertools import islice
from ecommerce.models import (
    Category, Fabric, Product, HeroCampaign, ClientDiary, Testimonial, Inquiry, CustomUser,
    MeasurementPart, StandardSize, StandardSizeValue, SleeveType, NeckDesign, BespokeOrder, 
    MeasurementValue, SiteConfig
) # type: ignore
from ecommerce.forms import CustomUserCreationForm, CustomUserChangeForm

# --- Site Configuration ---

@admin.register(SiteConfig)
class SiteConfigAdmin(ModelAdmin):
    list_display = ("whatsapp_number", "business_email", "default_country_code", "theme_mode")

    def has_add_permission(self, request):
        return not SiteConfig.objects.exists()

# --- Helper Functions for Badges ---

def get_status_badge(status, label):
    colors = {
        'New': 'bg-blue-100 text-blue-800 border-blue-200',
        'Cutting': 'bg-amber-100 text-amber-800 border-amber-200',
        'Stitching': 'bg-amber-100 text-amber-800 border-amber-200',
        'Finished': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Ready': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'pending': 'bg-red-100 text-red-800 border-red-200',
        'urgent': 'bg-red-100 text-red-800 border-red-200 animate-pulse',
        'resolved': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    }
    color_class = colors.get(status, 'bg-gray-100 text-gray-800 border-gray-200')
    return format_html(
        '<span class="px-2 py-1 rounded-full text-xs font-semibold border {}">{}</span>',
        color_class,
        label
    )

# --- Admin Classes ---

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    list_display = ("phone", "name", "whatsapp", "is_staff", "is_active")
    search_fields = ("phone", "name", "email")
    ordering = ("phone",)
    
    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        (_("Personal Info"), {"fields": ("name", "email", "whatsapp")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Timestamps"), {"fields": ("last_login", "date_joined")}),
    )
    
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "name", "password", "is_staff", "is_active"),
        }),
    )
    
    readonly_fields = ("date_joined", "last_login")

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ("name", "parent", "slug")
    prepopulated_fields = {"slug": ("name",)}

@admin.register(Fabric)
class FabricAdmin(ModelAdmin):
    list_display = ("name", "color_preview", "price_per_meter")
    def color_preview(self, obj):
        color = getattr(obj, 'hex_code', '#000000')
        return format_html('<div style="width: 20px; height: 20px; background-color: {}; border-radius: 50%; border: 1px solid #ccc;"></div>', color)

@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = ("title", "category", "base_price", "is_trending", "image_preview")
    list_filter = ("category", "is_trending")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: auto; border-radius: 8px;" />', obj.image.url)
        return "-"

@admin.register(MeasurementPart)
class MeasurementPartAdmin(ModelAdmin):
    list_display = ("name", "order", "image_preview")
    def image_preview(self, obj):
        if obj.instruction_image:
            return format_html('<img src="{}" style="width: 50px; height: auto;" />', obj.instruction_image.url)
        return "-"

class StandardSizeValueInline(TabularInline):
    model = StandardSizeValue
    extra = 0

@admin.register(StandardSize)
class StandardSizeAdmin(ModelAdmin):
    list_display = ("name",)
    inlines = [StandardSizeValueInline]

@admin.register(SleeveType)
class SleeveTypeAdmin(ModelAdmin):
    list_display = ("name", "image_preview")
    def image_preview(self, obj):
        if obj.image: return format_html('<img src="{}" style="width: 50px; height: auto;" />', obj.image.url)
        return "-"

@admin.register(NeckDesign)
class NeckDesignAdmin(ModelAdmin):
    list_display = ("name", "image_preview")
    def image_preview(self, obj):
        if obj.image: return format_html('<img src="{}" style="width: 50px; height: auto;" />', obj.image.url)
        return "-"

class MeasurementValueInline(TabularInline):
    model = MeasurementValue
    extra = 0

@admin.register(BespokeOrder)
class BespokeOrderAdmin(ModelAdmin):
    list_display = ("id", "user_link", "status", "status_badge", "print_button", "whatsapp_link", "created_at")
    list_filter = ("status", "created_at")
    list_editable = ("status",)
    search_fields = ("user__email", "user__name", "id")
    inlines = [MeasurementValueInline]
    readonly_fields = ("design_summary", "order_timeline", "print_blueprint_tool")
    
    fieldsets = (
        (None, {"fields": ("status", "user", "print_blueprint_tool")}),
        ("🧵 Tailoring Summary", {"fields": ("design_summary",)}),
        ("📅 Timeline", {"fields": ("order_timeline",)}),
        ("📦 Configuration", {"fields": ("fabric", "custom_fabric_preference", "original_photo", "sleeve_type", "neck_design", "total_price")}),
    )

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:order_id>/worksheet/', self.admin_site.admin_view(self.print_worksheet_view), name='order-worksheet'),
        ]
        return custom_urls + urls

    def print_worksheet_view(self, request, order_id):
        order = get_object_or_404(BespokeOrder, id=order_id)
        return render(request, 'admin/ecommerce/bespokeorder/worksheet.html', {'order': order, 'auto_print': True})

    @admin.display(description="Print Blueprint")
    def print_blueprint_tool(self, obj):
        if obj.id:
            url = reverse('admin:order-worksheet', args=[obj.id])
            return format_html(
                '<a href="{}" target="_blank" class="bg-emerald-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-800 transition-all flex items-center gap-2 w-fit">🖨️ Execute Print Ritual</a>',
                url
            )
        return "Save first to print."

    @admin.display(description="Print")
    def print_button(self, obj):
        url = reverse('admin:order-worksheet', args=[obj.id])
        return format_html('<a href="{}" target="_blank" class="text-emerald-600 font-black hover:scale-110 transition-transform block">PRINT</a>', url)

    @admin.display(description="Client")
    def user_link(self, obj):
        return format_html('<span class="font-bold text-gray-900">{}</span>', obj.user.name if obj.user else "Anonymous")

    @admin.display(description="Technical Summary")
    def design_summary(self, obj):
        measurements = obj.measurements.all()
        measurements_html = "".join([
            f'<div class="flex justify-between py-1 border-b border-gray-100"><span class="font-bold text-gray-500">{m.part.name}:</span> <span class="text-emerald-600 font-black">{m.value} IN</span></div>'
            for m in measurements
        ])
        image_url = obj.original_photo.url if obj.original_photo else "#"
        html = f'''
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div class="space-y-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-block">Reference Concept</p>
                <div class="aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gray-50">
                    <img src="{image_url}" class="w-full h-full object-cover" />
                </div>
            </div>
            <div class="space-y-6">
                <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Technical Anatomy</p>
                <div class="grid grid-cols-1 gap-1 text-[11px]">{measurements_html or '<p class="text-gray-400 italic">No measurement data</p>'}</div>
                <div class="p-6 bg-emerald-900 text-white rounded-2xl shadow-lg">
                    <p class="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-emerald-400">Design Soul</p>
                    <div class="space-y-2 text-xs">
                         <div class="flex justify-between opacity-80 border-b border-emerald-800 pb-1"><span>Fabric</span> <b>{obj.fabric.name if obj.fabric else obj.custom_fabric_preference or 'Bespoke Selection'}</b></div>
                         <div class="flex justify-between opacity-80 border-b border-emerald-800 pb-1"><span>Sleeve</span> <b>{obj.sleeve_type.name if obj.sleeve_type else 'Standard'}</b></div>
                         <div class="flex justify-between opacity-80 pb-1"><span>Neckline</span> <b>{obj.neck_design.name if obj.neck_design else 'Signature'}</b></div>
                    </div>
                </div>
            </div>
        </div>
        '''
        return format_html(html)

    @admin.display(description="Status")
    def status_badge(self, obj):
        return get_status_badge(obj.status, obj.get_status_display())

    @admin.display(description="WhatsApp")
    def whatsapp_link(self, obj):
        config = SiteConfig.objects.first()
        biz_phone = config.whatsapp_number if config else "7356198300"
        cust_name = obj.user.name
        message = f"Hi {cust_name}, this is Casa Amora. We've reviewed your bespoke order #{obj.id}. We're excited to start your journey!"
        url = f"https://wa.me/{biz_phone}?text={message.replace(' ', '%20')}"
        return format_html('<a href="{}" target="_blank" class="text-emerald-600 font-bold hover:underline">Reply</a>', url)

    @admin.display(description="Journey")
    def order_timeline(self, obj):
        stages = [('New', '📦'), ('Cutting', '✂️'), ('Stitching', '🪡'), ('Finished', '✨')]
        # Simple detection for badges
        current_idx = -1
        for i, (s, icon) in enumerate(stages):
            if s == obj.status:
               current_idx = i
               break
        if obj.status == 'Ready': current_idx = 4
        html = '<div style="display: flex; gap: 20px; align-items: center; margin-top: 10px;">'
        for i, (status, icon) in enumerate(stages):
            is_active = i <= current_idx
            color = "#064e3b" if is_active else "#f3f4f6"
            html += f'<div style="width: 40px; height: 40px; background-color: {color}; border-radius: 12px; display: flex; items-center; justify-center; font-size: 20px;">{icon}</div>'
            if i < len(stages)-1: html += f'<div style="height:2px; flex:1; background-color: {color}"></div>'
        html += '</div>'
        return format_html(html)

@admin.register(Testimonial)
class TestimonialAdmin(ModelAdmin):
    list_display = ("user", "rating_stars", "is_approved_badge", "publish_rituals", "created_at")
    list_filter = ("is_approved", "rating")
    actions = ['publish_selected_stories']

    @admin.display(description="Rating")
    def rating_stars(self, obj):
        return "⭐" * obj.rating

    @admin.display(description="Status")
    def is_approved_badge(self, obj):
        label = "PUBLISHED" if obj.is_approved else "PENDING"
        color = "bg-emerald-100 text-emerald-800" if obj.is_approved else "bg-amber-100 text-amber-800"
        return format_html('<span class="px-2 py-1 rounded-full text-xs font-black uppercase {}">{}</span>', color, label)

    @admin.display(description="Actions")
    def publish_rituals(self, obj):
        if not obj.is_approved:
            url = reverse('admin:testimonial-publish', args=[obj.id])
            return format_html('<a href="{}" class="text-emerald-600 font-black hover:underline">APPROVE STORY</a>', url)
        return "-"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [path('<int:pk>/publish/', self.admin_site.admin_view(self.publish_view), name='testimonial-publish')]
        return custom_urls + urls

    def publish_view(self, request, pk):
        testimonial = get_object_or_404(Testimonial, pk=pk)
        testimonial.is_approved = True
        testimonial.save()
        return self.response_post_save_change(request, testimonial)

    @admin.action(description="Publish & Curate Selected Stories")
    def publish_selected_stories(self, request, queryset):
        queryset.update(is_approved=True)

@admin.register(Inquiry)
class InquiryAdmin(ModelAdmin):
    list_display = ("lead_name", "source", "status_badge", "whatsapp_link", "created_at")
    list_filter = ("source", "status", "created_at")
    
    @admin.display(description="Lead")
    def lead_name(self, obj):
        if not obj.is_read: return format_html('<span class="font-black text-emerald-700">{} <span class="text-[8px] bg-emerald-100 px-1 py-0.5 rounded ml-2">NEW</span></span>', obj.name)
        return obj.name

    @admin.display(description="Status")
    def status_badge(self, obj): return get_status_badge(obj.status, obj.get_status_display())

    @admin.display(description="Atelier Quick Reply")
    def whatsapp_link(self, obj):
        config = SiteConfig.objects.first()
        biz_phone = config.whatsapp_number if config else "7356198300"
        url = f"https://wa.me/{biz_phone}?text=Hi%20{obj.name},%20this%20is%20Casa%20Amora.%20How%20can%20we%20help%20you?"
        return format_html('<a href="{}" target="_blank" class="text-emerald-600 font-black hover:underline">REPLY</a>', url)

@admin.register(ClientDiary)
class ClientDiaryAdmin(ModelAdmin):
    list_display = ("client_name", "created_at")

@admin.register(HeroCampaign)
class HeroCampaignAdmin(ModelAdmin):
    list_display = ("title", "is_active", "order")
    list_editable = ("is_active", "order")

# --- Dashboard Pulse Callback ---

def dashboard_callback(request, context):
    today = timezone.now().date()
    # KPIs
    today_revenue = BespokeOrder.objects.filter(status='Finished', created_at__date=today).aggregate(Sum('total_price'))['total_price__sum'] or 0
    active_inquiries = Inquiry.objects.filter(Q(status__in=['pending', 'urgent']) | Q(is_read=False)).count()
    pipeline = BespokeOrder.objects.filter(status__in=['Cutting', 'Stitching']).count()
    pending_stories = Testimonial.objects.filter(is_approved=False).count()

    context.update({
        "today_revenue": f"₹{float(today_revenue):,.2f}",
        "active_enquiries": active_inquiries,
        "tailoring_pipeline": pipeline,
        "new_testimonials": pending_stories,
    })

    # Recent Activity (Live Feed)
    orders = list(BespokeOrder.objects.order_by('-created_at')[:5])
    inquiries = list(Inquiry.objects.order_by('-created_at')[:5])
    feed = []
    for o in orders:
        feed.append({"type": "order", "title": f"Bespoke Order from {o.user.name}", "time": o.created_at, "link": reverse("admin:ecommerce_bespokeorder_change", args=[o.id]), "icon": "shopping_cart"})
    for i in inquiries:
        feed.append({"type": "inquiry", "title": f"New Lead: {i.name}", "time": i.created_at, "link": reverse("admin:ecommerce_inquiry_change", args=[i.id]), "icon": "mail"})
    feed.sort(key=lambda x: x["time"], reverse=True)
    context["recent_activity"] = list(islice(feed, 5))

    # Chart
    chart = []
    for i in range(6, -1, -1):
        day = today - timezone.timedelta(days=i)
        chart.append({"day": day.strftime("%a"), "orders": BespokeOrder.objects.filter(created_at__date=day).count()})
    context["order_growth_chart"] = chart
    return context
