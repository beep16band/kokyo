"""Assemble original art and existing tiles; no remote runtime dependencies."""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageDraw
import numpy as np
from io import BytesIO

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets/kotoba-tower'
SOURCE = ROOT.parent / 'generated_images'
NEAREST = Image.Resampling.NEAREST

def write(im, name):
    buffer = BytesIO()
    im.save(buffer, 'WEBP', lossless=True)
    data = buffer.getvalue()
    if len(data) < 32:
        raise ValueError('Empty encoded image: ' + name)
    Image.open(BytesIO(data)).verify()
    target = ASSETS / (name + '.webp')
    temporary = target.with_suffix('.webp.tmp')
    temporary.write_bytes(data)
    temporary.replace(target)

def cut(im, box, width=None, height=None):
    part = im.crop(box).convert('RGBA')
    a = np.array(part)
    a[:,:,3][a[:,:,3] < 24] = 0
    part = Image.fromarray(a)
    bounds = part.getbbox()
    if not bounds:
        raise ValueError('Empty sprite: ' + str(box))
    part = part.crop(bounds)
    if width or height:
        scale = min((width or 99999)/part.width, (height or 99999)/part.height)
        part = part.resize((round(part.width*scale), round(part.height*scale)), NEAREST)
    return part

characters = Image.open(SOURCE / 'exec-3320646d-b021-4a0d-bc82-a99f413511a9.png')
for name, box, size in [
    ('elder-man', (0,0,512,512), (66,94)),
    ('elder-woman', (512,0,1024,512), (66,94)),
    ('shopkeeper', (1024,0,1536,512), (66,94)),
    ('village-child', (0,512,512,1024), (60,70)),
    ('bakuro-small', (512,512,1024,1024), (68,66)),
    ('bakuro-battle', (1024,512,1536,1024), (210,200)),
]:
    write(cut(characters, box, *size), name)

environment = Image.open(SOURCE / 'exec-ad1a72a8-3cd1-429f-83f9-4a37a6ea7f79.png')
for name, box, size in [
    ('cottage', (0,0,550,554), (240,220)),
    ('village-shop', (550,0,1058,552), (250,220)),
    ('distant-tower', (1058,0,1536,600), (150,200)),
    ('stone-door', (0,560,575,1024), (230,310)),
    ('treasure-chest', (620,645,970,1024), (64,52)),
    ('archive-shelf', (1000,600,1510,1024), (190,160)),
]:
    write(cut(environment, box, *size), name)

# Each sheet frame has the same foot anchor; resampling never changes facing.
sheet = Image.open(SOURCE / 'exec-0b598d8a-ac2f-4b70-bd75-6d7ee666236c.png')
ren = Image.new('RGBA', (300,440))
for row in range(4):
    for col in range(3):
        part = cut(sheet, (col*362,row*362,(col+1)*362,(row+1)*362), 64,100)
        ren.alpha_composite(part, (col*100+(100-part.width)//2, row*110+103-part.height))
write(ren, 'ren-sheet')
write(ren.crop((0,0,100,110)), 'ren-front')
write(Image.open(ASSETS / 'hero-classroom-v4.webp').crop((0,0,362,362)), 'hero-current-battle')
for name, original in [('normal-enemy-field','kanyoku-slime-field-v2.png'),('normal-enemy-battle','kanyoku-slime-battle-v2.png')]:
    original_image = Image.open(ASSETS / original)
    write(cut(original_image, (0,0,original_image.width,original_image.height)), name)


outdoor = Image.open(ASSETS / 'tiles_outdoor.png').convert('RGBA')
for name, box, size in [
    ('tree-cut',(0,0,90,178),(132,155)),
    ('rock-cut',(0,516,174,690),(100,85)),
    ('jar-cut',(1280,514,1368,621),(48,66)),
    ('sign-cut',(1280,775,1448,909),(58,64)),
]:
    write(cut(outdoor, box, *size), name)

terrain = Image.open(ASSETS / 'tiles_terrain.png').convert('RGB')
wall = terrain.crop((1030,8,1105,168)).resize((48,96), NEAREST)
floor = terrain.crop((1288,550,1526,764)).resize((96,96), NEAREST)
floor = ImageEnhance.Color(ImageEnhance.Brightness(floor).enhance(.66)).enhance(.55)
wall = ImageEnhance.Brightness(wall).enhance(.70)

def tiled(im, tile, bounds):
    x0,y0,x1,y1 = bounds
    for y in range(y0,y1,tile.height):
        for x in range(x0,x1,tile.width):
            w,h = min(tile.width,x1-x),min(tile.height,y1-y)
            im.paste(tile.crop((0,0,w,h)), (x,y))

for name in ['descent','entry','corridor','central','archive','record','joined','memory','bakuro','gate','shop']:
    im = Image.new('RGB', (960,640), '#171920')
    tiled(im, wall, (0,0,960,190))
    tiled(im, floor, (0,190,960,600))
    tiled(im, wall, (0,600,960,640))
    d = ImageDraw.Draw(im)
    # Existing stone tile trim defines the same main passage at both edges.
    trim = terrain.crop((858,8,934,35)).resize((96,22), NEAREST)
    tiled(im, trim, (0,168,960,190))
    tiled(im, trim, (0,600,960,622))
    if name not in ['archive','shop']:
        for x in [0,912]:
            tiled(im, wall, (x,190,x+48,416))
            tiled(im, wall, (x,546,x+48,600))
    if name == 'central':
        tiled(im,floor,(430,0,550,190))
    if name in ['archive','shop']:
        tiled(im,floor,(425,600,555,640))
    if name == 'descent':
        for x in range(210,820,52):
            d.line((x,240,x,548), fill='#acaa97', width=3)
            d.line((x+5,240,x+5,548), fill='#282a2b', width=7)
    if name == 'record':
        panel = terrain.crop((780,520,1020,764)).resize((240,244),NEAREST)
        im.paste(ImageEnhance.Brightness(panel).enhance(.75), (400,230))
    write(im, 'ch1-' + name)

# One outdoor master, then exact cuts: road widths and terrain seams match.
master = Image.new('RGB', (1920,640))
grass = terrain.crop((8,8,166,168)).resize((96,96), NEAREST)
tiled(master,grass,(0,0,1920,640))
road = terrain.crop((100,780,153,1018)).resize((96,96), NEAREST)
tiled(master,road,(0,416,1920,548))
tiled(master,road,(1670,294,1766,548))
water = terrain.crop((8,370,250,508)).resize((96,64),NEAREST)
tiled(master,water,(0,0,1920,130))
bank = terrain.crop((8,345,250,366)).resize((96,24),NEAREST)
tiled(master,bank,(0,122,1920,146))
# The river stays north of the walkable path; distant banks continue across cuts.
for name,x in [('grass',0),('village',960)]:
    write(master.crop((x,0,x+960,640)), 'ch1-'+name)
write(master, 'ch1-outdoor-master')
print('Chapter art assembled; outdoor master 1920 x 640.')
