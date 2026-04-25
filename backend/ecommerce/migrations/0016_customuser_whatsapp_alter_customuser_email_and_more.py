from django.db import migrations, models

def set_unique_phones(apps, schema_editor):
    CustomUser = apps.get_model('ecommerce', 'CustomUser')
    for i, user in enumerate(CustomUser.objects.all()):
        if not user.phone or user.phone == '0000000000':
             user.phone = f"999999{i+1:04d}"
             user.save()



class Migration(migrations.Migration):

    dependencies = [
        ('ecommerce', '0015_herocampaign_delete_spotlight'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='whatsapp',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.RunPython(set_unique_phones),
        migrations.AlterField(
            model_name='customuser',
            name='phone',
            field=models.CharField(default='0000000000', max_length=20, unique=True),
        ),
    ]
