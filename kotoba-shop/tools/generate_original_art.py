from PIL import Image,ImageDraw
from pathlib import Path
import shutil
out=Path(__file__).resolve().parents[1]/'assets';out.mkdir(exist_ok=True,parents=True)
# 16x24px、全員4方向×3歩行フレームのオリジナル住民。パレットを地形に合わせる。
colors=[('#edc29a','#397d79','human'),('#a16b45','#b45b45','bear'),('#eed9c1','#cb8f9f','rabbit'),('#a5a087','#55756a','owl'),('#d99352','#597e99','fox'),('#b2c6d1','#b78a4d','otter'),('#dbbb8b','#8a86a1','squirrel')]
atlas=Image.new('RGBA',(16*12,24*len(colors)))
for row,(fur,shirt,kind) in enumerate(colors):
 for dr in range(4):
  for fr in range(3):
   im=Image.new('RGBA',(16,24));d=ImageDraw.Draw(im);r=lambda x,y,w,h,c:d.rectangle((x,y,x+w-1,y+h-1),fill=c)
   dark='#463d39';shade='#755542';skin=fur;side=-1 if dr==1 else 1 if dr==2 else 0;back=dr==3;step=[0,1,-1][fr]
   r(4,20+max(step,0),3,3,dark);r(9,20+max(-step,0),3,3,dark)
   r(3,12,10,9,dark);r(4,12,8,8,shirt);r(2,14,2,5,dark);r(12,14,2,5,dark);r(2,14,1,4,skin);r(13,14,1,4,skin);r(5,13,6,2,'#e8d2ad');r(7,17,2,2,'#ebc777')
   if kind=='human':
    r(3,3,10,11,dark);r(4,5,8,8,skin);r(3,3,10,3,'#604a39');r(3,5,2,5,'#604a39');r(10,4,3,3,'#604a39');r(5,2,6,2,'#806046')
    if back:r(4,5,8,7,'#604a39')
   else:
    if kind=='rabbit':
     r(3,0,3,7,dark);r(10,0,3,7,dark);r(4,1,1,5,'#e8afb0');r(11,1,1,5,'#e8afb0')
    elif kind in ['fox','squirrel']:
     d.polygon([(2,7),(2,1),(7,5),(11,1),(14,1),(14,7)],fill=dark);r(3,3,2,4,fur);r(11,3,2,4,fur)
    elif kind=='owl':
     r(2,3,4,5,dark);r(10,3,4,5,dark)
    else:
     r(2,3,4,5,dark);r(10,3,4,5,dark);r(3,4,2,3,skin);r(11,4,2,3,skin)
    r(3,6,10,8,dark);r(4,5,8,8,skin);r(3,7,10,4,skin)
    if not back:
     r(5,10,6,3,'#f0dec1')
     if kind=='owl':r(4,7,3,4,'#f5e8ca');r(9,7,3,4,'#f5e8ca')
   if not back:
    r(5+side,8,1,2,dark);r(10+side,8,1,2,dark);r(7+side,11,2,1,'#d29a53' if kind=='owl' else dark)
    if kind!='owl':r(4,10,1,1,'#cf8d83');r(11,10,1,1,'#cf8d83')
   atlas.alpha_composite(im,(16*(dr*3+fr),row*24))
atlas.save(out/'residents.png')
# 同じ16px規格の補助地形と屋内チップ。
sheet=Image.new('RGBA',(16*8,16*4));D=ImageDraw.Draw(sheet)
for i in range(32):
 im=Image.new('RGBA',(16,16));d=ImageDraw.Draw(im);r=lambda x,y,w,h,c:d.rectangle((x,y,x+w-1,y+h-1),fill=c)
 if i in (0,1):
  r(0,0,16,16,'#5c99a6' if i==0 else '#4e8297');r(0,0,16,2,'#77b5be');r(2,5,5,1,'#a3d4cb');r(9,11,5,1,'#83bdbb');r(3,14,3,1,'#79b1b3')
 elif i==2:
  r(0,0,16,16,'#7c573d');r(0,0,16,2,'#493f36');r(0,14,16,2,'#493f36')
  for y in range(3,14,3):r(0,y,16,2,'#c59865');r(2,y,1,1,'#e0b47e');r(13,y,1,1,'#e0b47e')
 elif i==3:
  r(0,0,16,16,'#c7ac78');r(0,14,16,2,'#ae8c5f');r(0,0,1,16,'#e8ce99');r(3,5,8,1,'#b99c6f')
 elif i==4:
  r(0,0,16,16,'#866347');r(1,2,14,2,'#a78050');r(1,8,14,2,'#a78050');r(1,14,14,1,'#5b4939')
 elif i==5:
  r(5,5,7,11,'#714c37');r(3,2,11,11,'#3d6347');r(4,1,8,9,'#638957');r(5,2,5,2,'#89ae6e')
 elif i==6:
  r(3,7,11,8,'#4e5c4b');r(4,5,9,9,'#8f9b82');r(5,6,6,2,'#bec7a9');r(6,10,7,1,'#64755f')
 elif i==7:
  r(6,5,3,11,'#76543d');r(1,2,14,8,'#4b4436');r(2,3,12,6,'#b88a58');r(4,4,7,1,'#e2b77a');r(4,7,4,1,'#795c40')
 elif i==8:
  r(2,4,12,11,'#675a43');r(3,2,10,11,'#c9bc8d');r(5,4,6,1,'#8f8568');r(5,7,6,1,'#8f8568');r(5,10,4,1,'#8f8568')
 elif i==9:
  r(3,9,10,7,'#56463b');r(4,8,8,6,'#a77445');r(3,5,10,5,'#6b543d');r(4,4,8,5,'#d7b35e');r(7,8,2,3,'#f4d98b')
 elif i in (10,11,12):
  r(7,7,2,9,'#467247');r(3,9,5,3,'#638f51');r(9,8,4,3,'#638f51');col=['#e5a2ad','#e7c668','#9ebfd8'][i-10];r(4,3,8,7,col);r(6,1,4,10,col);r(7,5,2,3,'#efdca5')
 elif i==13:
  r(0,0,16,16,'#887c60');r(0,0,16,3,'#c5b68b');r(0,4,16,1,'#5b5b48');r(3,7,4,5,'#9d9472');r(11,9,4,6,'#a89c76')
 elif i==14:
  r(3,3,10,12,'#5f6251');r(4,1,8,13,'#a3a88a');r(5,2,5,2,'#d0d2ad');r(7,5,2,6,'#59796a');r(6,8,4,2,'#78aca1')
 elif i==15:
  r(2,13,12,3,'#596448');r(4,9,8,5,'#8b9d65');r(7,2,2,9,'#6a7d51');r(4,3,8,2,'#e1cf89');r(6,1,4,6,'#e1cf89')
 elif i==31:
  r(0,0,16,16,'#8e9f87');r(1,1,7,6,'#b8c2a4');r(9,1,6,6,'#b2bd9e');r(1,8,4,7,'#acb99b');r(6,8,9,7,'#bdc7ab');r(2,2,4,1,'#d2d8bb')
 elif i>=16:
  # 家具は本編のデザインから用途ごとに輪郭を追加。
  col=['#aa7953','#60885c','#b98291','#e4c37b','#b38c62','#86624b','#9c90b4','#c9ac68'][i%8]
  r(3,5,11,10,'#4b4339');r(4,4,9,10,col);r(5,5,6,2,'#eed7a5');r(4,14,2,2,'#4b4339');r(11,14,2,2,'#4b4339')
 sheet.alpha_composite(im,(i%8*16,i//8*16))
sheet.save(out/'details.png')
