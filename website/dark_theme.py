import os
import glob
import re

def migrate():
    base_dir = r"c:\Users\user\Documents\project\casa amora\website\src"
    
    # Files to ignore (e.g. ones that are already dark or don't need changes)
    # We want to change the light sections to dark.
    
    patterns = [
        os.path.join(base_dir, "pages", "*.tsx"),
        os.path.join(base_dir, "components", "*.tsx")
    ]
    
    # We are swapping light mode for dark mode!
    # Light Mode usually uses: bg-brand-secondary (FAF9F6) or bg-white
    # Dark Mode uses: bg-brand-accent (1A0A16) or bg-brand-warm (2D1526)
    
    # Light mode text usually uses: text-brand-light (3B1C32)
    # Dark mode text usually uses: text-brand-secondary (FAF9F6)
    
    for pattern in patterns:
        for file_path in glob.glob(pattern):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            
            # Step 1: Text color migrations
            # If the background is becoming dark, the text must become light.
            # Replace text-brand-light with text-brand-secondary
            new_content = re.sub(r'text-brand-light([^A-Za-z0-9_-])', r'text-brand-secondary\1', new_content)
            
            # Replace text-brand-warm with text-brand-secondary/80
            new_content = re.sub(r'text-brand-warm([^A-Za-z0-9_-])', r'text-brand-secondary/80\1', new_content)
            
            # Step 2: Background color migrations
            # Replace main solid backgrounds bg-brand-secondary -> bg-brand-accent
            new_content = re.sub(r'bg-brand-secondary([^/A-Za-z0-9_-])', r'bg-brand-accent\1', new_content)
            # For translucent/border contexts, bg-brand-secondary/X -> bg-white/X (keep some highlight)
            # Actually, let's make it bg-brand-primary/X for dark luxury
            new_content = re.sub(r'bg-brand-secondary/(\d+)', r'bg-brand-primary/\1', new_content)
            
            new_content = re.sub(r'bg-white([^/A-Za-z0-9_-])', r'bg-brand-warm\1', new_content)
            new_content = re.sub(r'bg-white/(\d+)', r'bg-brand-warm/\1', new_content)
            
            if content != new_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file_path}")

if __name__ == "__main__":
    migrate()
