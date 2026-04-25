from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Order

@receiver(post_save, sender=Order)
def send_order_status_update_notification(sender, instance, created, **kwargs):
    if not created:
        # Check if status was changed
        # Note: In a production app, we'd compare with the previous state.
        # For minimalism, we'll notify on any save that isn't creation.
        subject = f"Atelier Status Update: Order #{instance.id}"
        message = f"Hello,\n\nYour order for {instance.product.title} has been updated to: {instance.get_status_display()}.\n\n"
        
        if instance.status == 'In-Stitching':
            message += "Our master tailors have begun working on your customize on your style piece. 🧵\n"
        elif instance.status == 'Shipped':
            message += f"Your item has been shipped! Tracking Number: {instance.tracking_number or 'Not assigned yet'} ✈️\n"
        
        message += "\nThank you for choosing Casa Amora."
        recipient_list = [instance.user.email]
        
        try:
            send_mail(subject, message, settings.EMAIL_HOST_USER, recipient_list)
        except Exception as e:
            print(f"Error sending email: {e}")
