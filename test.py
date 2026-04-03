with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
match = re.search(r'<div class="room-card-img".*', text)
if match:
    print(text[match.start():match.start()+500])
