"""Bundle the current entry point, local artwork and font into offline.html."""
from pathlib import Path
import base64
import mimetypes
import re

root = Path(__file__).resolve().parents[1]

def embed_assets(text):
    def replace(match):
        path = root / match.group(1)
        mime = mimetypes.guess_type(path)[0] or 'application/octet-stream'
        return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()
    return re.sub(r'(assets/[A-Za-z0-9_.-]+)(?:\?[A-Za-z0-9_.=-]+)?', replace, text)

html = (root / 'index.html').read_text()
html = re.sub(r'<link rel="stylesheet" href="\./([^"?]+)(?:\?[^"]*)?">',
              lambda m: '<style>' + embed_assets((root / m[1]).read_text()) + '</style>', html)
html = re.sub(r'<script defer src="\./([^"?]+)(?:\?[^"]*)?"></script>',
              lambda m: '<script>\n' + embed_assets((root / m[1]).read_text()).replace('</script', '<\\/script') + '\n</script>', html)
html = '\n'.join(line.rstrip() for line in html.splitlines()) + '\n'
(root / 'offline.html').write_text(html)
print('Built offline.html:', len(html.encode()), 'bytes')
