// Technical atlas packing only: AI supplies the artwork; this normalizes alpha,
// cell bounds, padding and foot anchors without drawing replacement characters.
// Usage: node tools/pack_character_atlases.cjs input-map.json
const fs=require('node:fs/promises'),path=require('node:path'),{chromium}=require('playwright');
(async()=>{
 const inputs=JSON.parse(await fs.readFile(process.argv[2],'utf8')),root=path.resolve(__dirname,'..'),out=path.join(root,'assets/characters/drawn');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox']});
 const manifest={revision:1,cell:128,columns:4,rows:4,directions:['down','left','right','up'],animation:'Four-phase walk. Idle holds a neutral frame; dash reuses walk at the game dash speed. Action feedback uses the same character art and tool/reaction overlays.',characters:{}};
 try{const p=await browser.newPage();
 for(const[id,file]of Object.entries(inputs)){
 const data='data:image/png;base64,'+(await fs.readFile(file)).toString('base64');
 const result=await p.evaluate(async({data,id})=>{
  const im=new Image();im.src=data;await im.decode();if(im.width!==im.height)throw Error(id+': expected square 4x4 source');
  const raw=document.createElement('canvas');raw.width=im.width;raw.height=im.height;const g=raw.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
  const pixels=g.getImageData(0,0,raw.width,raw.height);for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i]<32)pixels.data[i]=0;g.putImageData(pixels,0,0);
  const bounds=[],cell=im.width/4;
  const split=(length,count)=>{const marks=[0];for(let k=1;k<4;k++){let best=-1,bestCount=Infinity;for(let q=Math.floor(length*(k/4-.065));q<Math.ceil(length*(k/4+.065));q++){const n=count(q);if(n<bestCount||(n===bestCount&&Math.abs(q-length*k/4)<Math.abs(best-length*k/4))){best=q;bestCount=n;}}if(bestCount>4)throw Error(id+': no transparent gutter near '+k);marks.push(best);}marks.push(length);return marks;};
  const rowMarks=split(im.height,y=>{let count=0;for(let x=0;x<im.width;x++)if(pixels.data[(y*im.width+x)*4+3]>96)count++;return count;});
  const colMarks=[];for(let row=0;row<4;row++)colMarks.push(split(im.width,x=>{let count=0;for(let y=rowMarks[row];y<rowMarks[row+1];y++)if(pixels.data[(y*im.width+x)*4+3]>96)count++;return count;}));
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
   const x0=colMarks[row][col],y0=rowMarks[row],w=colMarks[row][col+1]-x0,h=rowMarks[row+1]-y0,d=g.getImageData(x0,y0,w,h).data;
   let minx=w,miny=h,maxx=-1,maxy=-1,count=0;
   for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>96){minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);count++;}
   if(count<1000||maxx-minx>w*.97||maxy-miny>h*.99)throw Error(id+': missing/cut/background frame '+row+','+col);
   bounds.push({x:x0+minx,y:y0+miny,w:maxx-minx+1,h:maxy-miny+1,count});
  }
  const scale=Math.min(112/Math.max(...bounds.map(b=>b.h)),96/Math.max(...bounds.map(b=>b.w))),atlas=document.createElement('canvas');atlas.width=atlas.height=512;const a=atlas.getContext('2d',{willReadFrequently:true}),frames=[];
  for(let n=0;n<16;n++){
   const b=bounds[n],x=n%4*128,y=Math.floor(n/4)*128,w=b.w*scale,h=b.h*scale,dx=64-w/2,dy=120-h;
   a.drawImage(raw,b.x,b.y,b.w,b.h,x+dx,y+dy,w,h);
   const dat=a.getImageData(x,y,128,128).data,dir=['down','left','right','up'][Math.floor(n/4)],left=dir==='left'||dir==='up',candidates=[];
   for(let yy=Math.floor(dy+h*.55);yy<Math.min(119,dy+h*.84);yy++)for(let xx=8;xx<120;xx++){
    const k=(yy*128+xx)*4,r=dat[k],gg=dat[k+1],bb=dat[k+2];
    if(dat[k+3]>180&&r>165&&gg>95&&bb>55&&r>gg+12&&r>bb*1.12&&r-gg<105&&gg-bb<95&&(left?xx<62:xx>66))candidates.push([xx,yy]);
   }
   let grip={x:left?43:85,y:90};if(candidates.length){candidates.sort((aa,bb)=>left?aa[0]-bb[0]:bb[0]-aa[0]);const near=candidates.filter(v=>Math.abs(v[0]-candidates[0][0])<7);const mean={x:near.reduce((s,v)=>s+v[0],0)/near.length,y:near.reduce((s,v)=>s+v[1],0)/near.length};near.sort((a,b)=>Math.hypot(a[0]-mean.x,a[1]-mean.y)-Math.hypot(b[0]-mean.x,b[1]-mean.y));grip={x:near[0][0],y:near[0][1]};}
   frames.push({sourceBounds:b,packedBounds:{x:dx,y:dy,w,h},grip});
  }
  return{png:atlas.toDataURL('image/png').split(',')[1],frames};
 },{data,id});
 await fs.writeFile(path.join(out,id+'.png'),Buffer.from(result.png,'base64'));
 manifest.characters[id]={file:id+'.png',frames:result.frames};console.log('PACK '+id);
 }
 await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 const art=Object.fromEntries(Object.entries(manifest.characters).map(([id,c])=>[id,{src:'assets/characters/drawn/'+id+'.png?v=1',grips:c.frames.map(f=>f.grip)}]));
 const runtime=path.join(root,'town-atlases.js');await fs.writeFile(runtime,(await fs.readFile(runtime,'utf8')).replace(/const TOWN_DRAWN_ART=.*?; \/\/ atlas metadata inserted by build step/, 'const TOWN_DRAWN_ART='+JSON.stringify(art)+'; // atlas metadata inserted by build step'));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
