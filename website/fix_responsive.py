import os
import glob
import re

def fix_responsive():
    base_dir = r"c:\Users\user\Documents\project\casa amora\website\src"
    
    patterns = [
        os.path.join(base_dir, "pages", "*.tsx"),
        os.path.join(base_dir, "components", "*.tsx")
    ]
    
    replacements = [
        # Typography scaling
        (r'text-8xl', r'text-6xl md:text-8xl'),
        (r'text-7xl', r'text-4xl md:text-7xl'),
        (r'text-6xl', r'text-4xl md:text-6xl'),
        (r'text-5xl', r'text-3xl md:text-5xl'),
        
        # Eliminate duplicate breakpoint classes (if script runs twice or they already existed)
        (r'text-6xl md:text-4xl md:text-8xl', r'text-5xl md:text-8xl'),
        
        # Spacing scaling (huge paddings breaking mobile)
        (r'p-24', r'p-8 md:p-24'),
        (r'p-20', r'p-8 md:p-20'),
        (r'p-16', r'p-6 md:p-16'),
        (r'p-12', r'p-6 md:p-12'),
        
        # Rounding breaking mobile layouts (aspect ratios usually fix themselves if rounding is smaller)
        (r'rounded-\[4rem\]', r'rounded-[2rem] md:rounded-[4rem]'),
        (r'rounded-\[3\.5rem\]', r'rounded-[2rem] md:rounded-[3.5rem]'),
        (r'rounded-\[3rem\]', r'rounded-[1.5rem] md:rounded-[3rem]'),
        
        # Gaps causing overflow
        (r'gap-16', r'gap-8 md:gap-16'),
        (r'gap-12', r'gap-6 md:gap-12')
    ]
    
    for pattern in patterns:
        for file_path in glob.glob(pattern):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            
            for old_pat, new_pat in replacements:
                # Use regex replace with lookahead/lookbehind if needed, but naive string match is safer for Tailwind
                # except we do not want to replace "md:text-8xl" with "md:text-6xl md:text-8xl".
                # We'll use a regex that only matches when NOT preceded by "md:" or "lg:" or "-"
                regex = r'(?<![A-Za-z0-9:-])' + old_pat + r'(?![a-zA-Z0-9-])'
                new_content = re.sub(regex, new_pat, new_content)
                
            # Clean up potential duplications just to be sure
            new_content = new_content.replace('md:text-6xl md:text-8xl', 'md:text-8xl')
            new_content = new_content.replace('md:text-4xl md:text-7xl', 'md:text-7xl')
            new_content = new_content.replace('md:text-4xl md:text-6xl', 'md:text-6xl')
            new_content = new_content.replace('md:text-3xl md:text-5xl', 'md:text-5xl')
            
            if content != new_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file_path}")

if __name__ == "__main__":
    fix_responsive()
