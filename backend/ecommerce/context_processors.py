from ecommerce.models import BespokeOrder, Inquiry
from django.urls import reverse

def admin_notifications(request):
    if not request.user.is_staff:
        return {}

    # Unread Customize on Your Style Orders
    new_orders = BespokeOrder.objects.filter(status='New', is_read=False).order_by('-created_at')
    
    # Unread Inquiries
    new_inquiries = Inquiry.objects.filter(status='pending', is_read=False).order_by('-created_at')

    unread_count = new_orders.count() + new_inquiries.count()
    
    recent_notifications = []
    
    for order in new_orders[:5]:
        recent_notifications.append({
            'type': 'Order',
            'title': f"New Customize on Your Style: {order.user.name}",
            'subtitle': order.product.title if order.product else "Custom Design",
            'time': order.created_at,
            'url': reverse('admin:ecommerce_bespokeorder_change', args=[order.id])
        })

    for inq in new_inquiries[:5]:
        recent_notifications.append({
            'type': 'Inquiry',
            'title': f"Enquiry: {inq.name}",
            'subtitle': inq.message[:40] + "...",
            'time': inq.created_at,
            'url': reverse('admin:ecommerce_inquiry_change', args=[inq.id])
        })

    # Sort combined by time and take top 5
    recent_notifications = sorted(recent_notifications, key=lambda x: x['time'], reverse=True)[:5]

    return {
        'unread_notifications_count': unread_count,
        'recent_notifications': recent_notifications,
    }
