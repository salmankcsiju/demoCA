import os, sys, django
import urllib.request
sys.path.append(r'c:\Users\user\Documents\project\casa amora\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ecommerce.models import Fabric
from django.core.files.base import ContentFile

url = 'https://placehold.co/400x400/Crimson/White.png?text=Kurthy'
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        img_data = response.read()
        f, created = Fabric.objects.get_or_create(name='Kurthy')
        f.image.save('kurthy.png', ContentFile(img_data), save=True)
        print('Added Kurthy fabric to db')
except Exception as e:
    print('Error:', e)
