import os
import glob

html_files = glob.glob('*.html')

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace ' near Taj Mahal' with ''
    content = content.replace(' near Taj Mahal', '')
    # Replace 'Near Taj Mahal' with 'Agra'
    content = content.replace('Near Taj Mahal', 'Agra')
    
    # Add favicon
    if '<link rel="icon"' not in content:
        content = content.replace('<title>', '<link rel="icon" type="image/png" href="Images/Navlogo.png">\n  <title>')
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
print("Updated all HTML files.")
