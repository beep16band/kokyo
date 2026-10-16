"""Create an OFL-compliant renamed subset covering the local UI's characters.
Pass the upstream NotoSansCJKjp-Regular.otf as argv[1]. No network at build time.
"""
from pathlib import Path
import sys
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
text = ''.join(p.read_text() for p in root.glob('*.js'))
text += (root / 'index.html').read_text() + (root / 'base.css').read_text()
characters = set(map(ord, text)) | set(range(32, 127))
font = TTFont(sys.argv[1])
options = subset.Options()
options.flavor = 'woff'
options.name_IDs = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=characters)
subsetter.subset(font)
for record in font['name'].names:
    if record.nameID in (1, 3, 4, 6, 16):
        name = 'TownPaperSans-Regular' if record.nameID == 6 else 'Town Paper Sans'
        record.string = name.encode(record.getEncoding())
font.flavor = 'woff'
font.save(root / 'assets' / 'town-jp.woff')
print('Wrote town-jp.woff:', (root / 'assets' / 'town-jp.woff').stat().st_size)
