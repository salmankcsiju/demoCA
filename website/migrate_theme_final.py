import os

files_to_update = [
    r'c:\Users\user\Documents\project\casa amora\website\src\pages\Home.tsx',
    r'c:\Users\user\Documents\project\casa amora\website\src\pages\Shop.tsx',
    r'c:\Users\user\Documents\project\casa amora\website\src\pages\ProductPage.tsx',
    r'c:\Users\user\Documents\project\casa amora\website\src\pages\Customizer.tsx',
    r'c:\Users\user\Documents\project\casa amora\website\src\pages\Account.tsx',
    r'c:\Users\user\Documents\project\casa amora\website\src\components\Navbar.tsx',
    r'c:\Users\user\Documents\project\casa amora\website\src\components\AuthModal.tsx',
    r'c:\Users\user\Documents\project\casa amora\website\src\pages\Wishlist.tsx'
]

replacements = {
    'bg-[#FAF9F6]': 'bg-brand-light',
    'bg-[#FAF9F6]/90': 'bg-brand-light/90',
    'bg-[#FAF9F6]/95': 'bg-brand-light/95',
    '#FAF9F6/90': 'bg-brand-light/90',
    '#FAF9F6/95': 'bg-brand-light/95',
    'bg-[#FDFBF7]': 'bg-brand-light',
    '#E7ACCF': '#A67B7B',  # Pearl Pink -> Muted Rose
    'text-white': 'text-brand-light',
    'bg-white': 'bg-brand-light',
}

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
    
    # Add italics to buttons and headers if missing
    new_content = new_content.replace('className="btn-prestige', 'className="btn-prestige italic')
    new_content = new_content.replace('className="font-serif', 'className="font-serif italic')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
