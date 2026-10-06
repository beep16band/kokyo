"""Assemble generated stone components into connected maps; preserve gameplay coordinates."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
A=ROOT/'assets/kotoba-tower'
atlas=Image.open(A/'underground-tiles-v2.webp').convert('RGB')
N=Image.Resampling.NEAREST
floor=atlas.crop((0,0,512,512)).resize((256,256),N)
wall=atlas.crop((512,0,1024,512)).resize((256,256),N)
trim=atlas.crop((1024,210,1536,255)).resize((256,22),N)

def fill(im,tile,box):
 x0,y0,x1,y1=box
 for y in range(y0,y1,tile.height):
  for x in range(x0,x1,tile.width):
   im.paste(tile.crop((0,0,min(tile.width,x1-x),min(tile.height,y1-y))),(x,y))

for name in ['descent','entry','corridor','central','archive','record','joined','memory','bakuro','gate']:
 im=Image.new('RGB',(960,640))
 fill(im,floor,(0,190,960,600))
 fill(im,wall,(0,0,960,168));fill(im,trim,(0,168,960,190))
 fill(im,wall,(0,622,960,640));fill(im,trim,(0,600,960,622))
 if name!='archive':
  for x in [0,912]:
   fill(im,wall,(x,190,x+48,416));fill(im,wall,(x,546,x+48,600))
 if name=='central':fill(im,floor,(430,0,550,190))
 if name=='archive':fill(im,floor,(425,600,555,640))
 if name=='descent':
  stair=atlas.crop((536,512,994,1024)).transpose(Image.Transpose.ROTATE_270).resize((600,308),N)
  im.paste(stair,(210,240))
 # Render at logical 480x320 resolution then upscale exactly for matching pixel density.
 im=im.resize((480,320),N).resize((960,640),N)
 p=A/('ch1-'+name+'-v2.webp');im.save(p,'WEBP',lossless=True);Image.open(p).verify()
 print(p.name,p.stat().st_size)
