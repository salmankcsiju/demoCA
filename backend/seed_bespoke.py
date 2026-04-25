import os
import django # type: ignore

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ecommerce.models import MeasurementPart, StandardSize, StandardSizeValue, SleeveType, NeckDesign # type: ignore

def seed():
    # Parts
    parts = [
        ('Shoulder', 1),
        ('Bust', 2),
        ('Waist', 3),
        ('Length', 4),
    ]
    created_parts = []
    for name, order in parts:
        part, _ = MeasurementPart.objects.get_or_create(name=name, order=order)
        created_parts.append(part)
        print(f"Created Part: {name}")

    # Sizes
    sizes = ['S', 'M', 'L', 'XL']
    for s_name in sizes:
        size, _ = StandardSize.objects.get_or_create(name=s_name)
        # Dummy values
        for i, part in enumerate(created_parts):
            val = 14 + (i * 10) + (sizes.index(s_name) * 2)
            StandardSizeValue.objects.get_or_create(size=size, part=part, defaults={'value': val})
        print(f"Created Size: {s_name}")

    # Sleeves
    sleeves = ['Half Sleeve', 'Full Sleeve', 'Cap Sleeve', 'No Sleeve']
    for s in sleeves:
        SleeveType.objects.get_or_create(name=s)
        print(f"Created Sleeve: {s}")

    # Necks
    necks = ['Round Neck', 'V-Neck', 'Square Neck', 'Boat Neck']
    for n in necks:
        NeckDesign.objects.get_or_create(name=n)
        print(f"Created Neck: {n}")

if __name__ == '__main__':
    seed()
