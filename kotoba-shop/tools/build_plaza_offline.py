"""Bundle the isolated 3D plaza as a single locally playable HTML file."""
from pathlib import Path
import re
from urllib.parse import urlsplit

root = Path(__file__).resolve().parent.parent / 'lowpoly-plaza'
html = (root / 'index.html').read_text()
css = (root / 'plaza.css').read_text()
html = html.replace('<link rel="stylesheet" href="plaza.css">', '<style>\n' + css + '\n</style>')

def inline(match):
    source = (root / urlsplit(match.group(1)).path).read_text()
    source = re.sub(r'</script', lambda m: m[0].replace('</', '<\\/'), source, flags=re.I)
    return '<script>\n' + source + '\n</script>'

html = re.sub(r'<script src="([^"]+)"></script>', inline, html)
html = re.sub(r'<a class="downloadGame"[^>]*>.*?</a>', '', html)
license_text = (root / 'THREE-LICENSE.txt').read_text()
html = html.replace('</head>', '<!-- Three.js license\n' + license_text + '\n-->\n</head>')
output = root / 'play-3d.html'
output.write_text(html)
print(f'{output}: {output.stat().st_size:,} bytes')
