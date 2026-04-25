import os
import django
import urllib.request
from django.core.files import File

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ecommerce.models import Category, Fabric
from django.conf import settings

def download_image(url, filepath):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
        out_file.write(response.read())
    return filepath

os.makedirs(os.path.join(settings.MEDIA_ROOT, 'categories'), exist_ok=True)
os.makedirs(os.path.join(settings.MEDIA_ROOT, 'fabrics'), exist_ok=True)

seed_categories = [
    {"name": "Churidar", "slug": "churidar", "url": "https://picsum.photos/seed/churidar/800/800"},
    {"name": "Party Wear", "slug": "party-wear", "url": "https://picsum.photos/seed/gown/800/800"},
]

seed_fabrics = [
    {"name": "Silk Fabric", "url": "https://picsum.photos/seed/silk/800/800"},
    {"name": "Chiffon", "url": "https://picsum.photos/seed/chiffon/800/800"}
]

print("Seeding Categories...")
for cat in seed_categories:
    if not Category.objects.filter(slug=cat['slug']).exists():
        temp_path = f"temp_{cat['slug']}.jpg"
        download_image(cat['url'], temp_path)
        obj = Category(name=cat['name'], slug=cat['slug'])
        with open(temp_path, 'rb') as f:
            obj.image.save(f"{cat['slug']}.jpg", File(f), save=True)
        os.remove(temp_path)
        print(f"Created Category {cat['name']}")

print("Seeding Fabrics...")
for fab in seed_fabrics:
    if not Fabric.objects.filter(name=fab['name']).exists():
        slugified = fab['name'].lower().replace(' ', '-')
        temp_path = f"temp_{slugified}.jpg"
        download_image(fab['url'], temp_path)
        obj = Fabric(name=fab['name'])
        with open(temp_path, 'rb') as f:
            obj.image.save(f"{slugified}.jpg", File(f), save=True)
        os.remove(temp_path)
        print(f"Created Fabric {fab['name']}")

print("Seeding Complete!")
