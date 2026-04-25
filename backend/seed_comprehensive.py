import os
import django
import urllib.request
import random
from django.core.files import File
from django.utils.text import slugify

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ecommerce.models import (
    Category, Product, Fabric, NeckDesign, SleeveType, 
    MeasurementPart, StandardSize, StandardSizeValue
)
from django.conf import settings

def download_image(url, filename):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        temp_path = f"temp_{filename}"
        with urllib.request.urlopen(req) as response, open(temp_path, 'wb') as out_file:
            out_file.write(response.read())
        return temp_path
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return None

def create_category(name, parent=None, image_seed=None):
    slug = slugify(name)
    if Category.objects.filter(slug=slug).exists():
        return Category.objects.get(slug=slug)
    
    cat = Category(name=name, slug=slug, parent=parent)
    if image_seed:
        url = f"https://picsum.photos/seed/{image_seed}/800/1000"
        temp = download_image(url, f"{slug}.jpg")
        if temp:
            with open(temp, 'rb') as f:
                cat.image.save(f"{slug}.jpg", File(f), save=True)
            os.remove(temp)
    cat.save()
    print(f"Created Category: {name}")
    return cat

def create_product(title, category, price, image_seed):
    product = Product(
        title=title,
        category=category,
        base_price=price,
        description=f"Exquisite {title} from our premium collection.",
        is_active=True,
        is_trending=random.choice([True, False]),
        caption="Masterpiece Collection"
    )
    url = f"https://picsum.photos/seed/{image_seed}/800/1200"
    temp = download_image(url, f"{slugify(title)}.jpg")
    if temp:
        with open(temp, 'rb') as f:
            product.image.save(f"{slugify(title)}.jpg", File(f), save=True)
        os.remove(temp)
    product.save()
    print(f"Created Product: {title}")
    return product

def run_seed():
    print("--- Starting Comprehensive Seed ---")
    
    # 1. Categories & Subcategories
    ethnic = create_category("Ethnic Wear", image_seed="ethnic")
    
    sarees = create_category("Sarees", parent=ethnic, image_seed="saree")
    create_category("Silk Sarees", parent=sarees, image_seed="silk-saree")
    create_category("Chiffon Sarees", parent=sarees, image_seed="chiffon-saree")
    
    gowns = create_category("Gowns", parent=ethnic, image_seed="gown")
    create_category("Evening Gowns", parent=gowns, image_seed="evening-gown")
    create_category("Bridal Gowns", parent=gowns, image_seed="bridal-gown")
    
    mens = create_category("Menswear", image_seed="mens")
    create_category("Kurthas", parent=mens, image_seed="kurtha")
    create_category("Sherwanis", parent=mens, image_seed="sherwanis")

    # 2. Products
    create_product("Royal Silk Gown", gowns, 18500, "royal-gown")
    create_product("Ethereal Chiffon Saree", sarees, 12000, "ethereal-chiffon")
    create_product("Majestic Wedding Lehenga", ethnic, 45000, "lehenga")
    create_product("Velvet Evening Piece", gowns, 22000, "velvet-gown")
    
    # 3. Fabrics
    fabric_list = [
        ("Pure Mulberry Silk", "#3B1115", 4500),
        ("Handloom Cotton", "#FAF9F6", 1200),
        ("Crinkle Chiffon", "#D4AF37", 2500),
        ("Classic Velvet", "#1A0105", 3500)
    ]
    for name, hex, price in fabric_list:
        if not Fabric.objects.filter(name=name).exists():
            fab = Fabric(name=name, hex_code=hex, price_per_meter=price)
            url = f"https://picsum.photos/seed/{slugify(name)}/400/400"
            temp = download_image(url, f"{slugify(name)}.jpg")
            if temp:
                with open(temp, 'rb') as f:
                    fab.image.save(f"{slugify(name)}.jpg", File(f), save=True)
                os.remove(temp)
            print(f"Created Fabric: {name}")

    # 4. Designs (For Customizer)
    sleeves = ["Full Sleeve", "3/4 Sleeve", "Half Sleeve", "Sleeveless"]
    for s in sleeves:
        if not SleeveType.objects.filter(name=s).exists():
            obj = SleeveType(name=s)
            url = f"https://picsum.photos/seed/sleeve-{slugify(s)}/400/400"
            temp = download_image(url, f"sleeve-{slugify(s)}.jpg")
            if temp:
                with open(temp, 'rb') as f:
                    obj.image.save(f"sleeve-{slugify(s)}.jpg", File(f), save=True)
                os.remove(temp)
            print(f"Created Sleeve: {s}")

    necks = ["V-Neck", "Round Neck", "Boat Neck", "Square Neck"]
    for n in necks:
        if not NeckDesign.objects.filter(name=n).exists():
            obj = NeckDesign(name=n)
            url = f"https://picsum.photos/seed/neck-{slugify(n)}/400/400"
            temp = download_image(url, f"neck-{slugify(n)}.jpg")
            if temp:
                with open(temp, 'rb') as f:
                    obj.image.save(f"neck-{slugify(n)}.jpg", File(f), save=True)
                os.remove(temp)
            print(f"Created Neck: {n}")

    # 5. Measurements
    parts = ["Shoulder", "Chest", "Waist", "Hip", "Length"]
    for i, p in enumerate(parts):
        if not MeasurementPart.objects.filter(name=p).exists():
            obj = MeasurementPart(name=p, order=i)
            url = f"https://picsum.photos/seed/measure-{slugify(p)}/400/400"
            temp = download_image(url, f"measure-{slugify(p)}.jpg")
            if temp:
                with open(temp, 'rb') as f:
                    obj.instruction_image.save(f"measure-{slugify(p)}.jpg", File(f), save=True)
                os.remove(temp)
            print(f"Created Measurement Part: {p}")

    print("--- Seeding Complete ---")

if __name__ == "__main__":
    run_seed()
