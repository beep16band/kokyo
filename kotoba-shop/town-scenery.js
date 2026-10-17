// Original low-poly town details. Decorations never alter maps, collisions or saves.
const TownScenery={flowers:new WeakMap(),version:1};
function townSceneryFlowers(m){
  if(TownScenery.flowers.has(m))return TownScenery.flowers.get(m);
  const points=[];
  for(let y=2;y<m.h-2;y++)for(let x=2;x<m.w-2;x++){
    if(m.tiles[y][x]!==0||m.blocked.has(x+','+y))continue;
    const nearRoad=[[-1,0],[1,0],[0,-1],[0,1]].some(([dx,dy])=>[1,2].includes(m.tiles[y+dy]?.[x+dx]));
    const n=(x*17+y*31+m.key.length*13)%97;
    if(nearRoad&&n%4===0&&!m.buildings.some(b=>x>=b.x-1&&x<=b.x+b.w&&y>=b.y-1&&y<=b.y+b.h))points.push({x:x+.3+(n%3)*.15,z:y+.5,color:n%3});
  }
  // Fixed order makes rebuilding/season changes stable, with a modest polygon budget.
  const flowers=points.filter((_,i)=>i%Math.max(1,Math.ceil(points.length/36))===0).slice(0,36);
  TownScenery.flowers.set(m,flowers);return flowers;
}
function townSceneryPalette(s=season()){
  return s==='冬'?['#e8e2cd','#cad9d3','#d8c9d6']:s==='秋'?['#e4be86','#cf9c80','#e8d6a6']:s==='夏'?['#f1d58d','#d6cae0','#e7b1a6']:['#e9b1bd','#f2dfad','#d1c6df'];
}
function townSceneryLanternMaterial(){
  if(!Town3D.materials.has('scenery-lantern'))Town3D.materials.set('scenery-lantern',new THREE.MeshStandardMaterial({color:'#ffe3a0',emissive:'#ffbd59',emissiveIntensity:.08,roughness:1}));
  return Town3D.materials.get('scenery-lantern');
}
function townSceneryTime3D(evening){
  const material=Town3D.materials.get('scenery-lantern');if(material)material.emissiveIntensity=evening?.85:.08;
}
function townSceneryBuilding3D(b,g){
  const w=b.w,h=b.h,blue=b.color==='blue',roof=blue?'#82aaa6':'#c78f78';
  // Roof ridge, chimney and foundation stay inside the existing building footprint.
  town3DMesh(g,'box',roof,w/2,3.65,h/2,w+.35,.12,.16);
  town3DMesh(g,'box','#cbb493',w-.85,3.6,h*.35,.36,.85,.4);
  town3DMesh(g,'box','#e5d2af',w-.85,4.05,h*.35,.49,.12,.52);
  town3DMesh(g,'box','#cbb493',w/2,.32,h-.04,w-.22,.12,.12);
  for(const x of [.3,w-.3]){
    town3DMesh(g,'box','#d8c8a3',x,1.4,h-.04,.13,2.5,.13);
    town3DMesh(g,'sphere','#8db183',x,.4,h-.3,.27,.3,.24);
  }
  // A flat doorstep is walkable. Wall lamps hang above head height, with no new posts.
  const door=Math.floor(w/2)+.5;
  town3DMesh(g,'box','#dfd0b0',door,.09,h+.23,1.05,.08,.48);
  if(['ownShop','ownHome','kuan','cafe'].includes(b.type)){
    const x=w-.35,z=h+.24;
    town3DMesh(g,'box','#826d57',x,2.65,h+.1,.06,.06,.36);
    town3DMesh(g,'box','#826d57',x,2.57,z,.34,.07,.34);
    const lamp=town3DMesh(g,'box','#ffe3a0',x,2.37,z,.22,.3,.22);lamp.material=townSceneryLanternMaterial();lamp.userData={sceneryLantern:true,wallFront:h};
    town3DMesh(g,'box','#826d57',x,2.19,z,.3,.06,.3);
  }
}
function townSceneryPoi3D(p,parent){
  if(!['well','board','view','festival'].includes(p.type))return false;
  const g=new THREE.Group();g.userData.sceneryType=p.type;g.position.set(p.x+.5,0,p.y+.5);parent.add(g);
  if(p.type==='well'){
    // Ring of stones leaves an open centre; all solid parts fit its blocked tile.
    for(let i=0;i<10;i++){
      const a=i*Math.PI/5,stone=town3DMesh(g,'box',i%2?'#d3ccb0':'#bdbba3',Math.sin(a)*.34,.29,Math.cos(a)*.34,.24,.42,.2);stone.rotation.y=a;
    }
    town3DMesh(g,'cylinder','#83bfca',0,.28,0,.25,.02,.25);
    for(const x of [-.4,.4])town3DMesh(g,'box','#a98766',x,.82,0,.07,1.5,.07);
    for(const side of [-1,1]){const roof=town3DMesh(g,'box','#82aaa6',0,1.55,side*.18,1,.1,.48);roof.rotation.x=side*.5;}
    town3DMesh(g,'cylinder','#a98766',0,1.15,0,.035,.8,.035).rotation.z=Math.PI/2;
    town3DMesh(g,'box','#d3c6a3',0,.93,0,.025,.46,.025);
    town3DMesh(g,'cylinder','#b3946d',0,.66,0,.1,.16,.1);
  }else if(p.type==='board'){
    for(const x of [-.36,.36])town3DMesh(g,'box','#a98766',x,.67,0,.09,1.34,.09);
    town3DMesh(g,'box','#b3946d',0,1.17,0,.96,.79,.1);
    town3DMesh(g,'box','#dfd0b0',0,1.18,.06,.8,.63,.025);
    for(let i=0;i<3;i++){const note=town3DMesh(g,'box',i%2?'#fff2ce':'#e3c7aa',-.25+i*.24,1.19+(i%2)*.09,.085,.19,.3,.012);note.rotation.z=(i-1)*.08;}
    town3DMesh(g,'box','#82aaa6',0,1.63,0,1.08,.13,.25);
  }else{
    for(const x of [-.34,.34])town3DMesh(g,'box','#826d57',x,.24,0,.08,.46,.45);
    for(const z of [-.14,0,.14])town3DMesh(g,'box','#d3b28a',0,.48,z,.94,.07,.11);
    for(const y of [.7,.88])town3DMesh(g,'box','#c9a675',0,y,-.19,.94,.12,.07);
    if(p.type==='festival'){
      town3DMesh(g,'box','#a98766',.4,1,-.23,.035,1.9,.035);
      town3DMesh(g,'box','#e9b1bd',.24,1.7,-.23,.32,.3,.025);
    }
  }
  return true;
}
function townSceneryGround3D(m,parent,s){
  const grass=[],pavers=[],petals=[[],[],[]],stems=[],centres=[];
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){
    const t=m.tiles[y][x],n=(x*17+y*31)%97;
    if(t===0&&n%7===0)grass.push([x+.5,.066,y+.5,.98,.006,.98]);
    if(t===2&&n%3===0){pavers.push([x+.24,.069,y+.23,.43,.009,.36],[x+.73,.069,y+.73,.43,.009,.36]);}
  }
  town3DInstances('box',s==='冬'?'#d5dfce':s==='秋'?'#b7c187':'#a3be88',grass,parent);
  town3DInstances('box','#e9e1c6',pavers,parent);
  for(const p of townSceneryFlowers(m)){
    for(const [dx,dz,height] of [[0,0,.3],[-.14,.1,.23],[.13,.13,.26]]){
      stems.push([p.x+dx,height/2+.05,p.z+dz,.025,height-.05,.025]);
      petals[p.color].push([p.x+dx,height,p.z+dz,.11,.045,.11]);
      centres.push([p.x+dx,height+.04,p.z+dz,.035,.018,.035]);
    }
  }
  town3DInstances('box','#7d9d6a',stems,parent);
  petals.forEach((tr,i)=>town3DInstances('sphere',townSceneryPalette(s)[i],tr,parent));
  town3DInstances('cylinder','#e5c785',centres,parent);
}
// Lightweight artwork uses the same flower positions and seasonal palette.
const groundBeforeScenery=worldGround;
worldGround=function(m,now){
  groundBeforeScenery(m,now);const palette=townSceneryPalette();
  for(const p of townSceneryFlowers(m)){
    const x=p.x*T,y=p.z*T;if(x<camera.x-24||x>camera.x+c.width+24||y<camera.y-24||y>camera.y+c.height+24)continue;
    for(const [dx,dy,size] of [[0,0,.85],[-4,3,.65],[4,4,.75]])cozyFlower(ctx,x+dx,y+dy,palette[p.color],size);
  }
};
const buildingBeforeScenery=drawWorldBuilding;
drawWorldBuilding=function(b){
  buildingBeforeScenery(b);if(!['ownShop','ownHome','kuan','cafe'].includes(b.type))return;
  const evening=timePhase()==='夕方',stamp=cozyStamp('scenery-wall-lamp-'+evening,24,34,g=>{
    if(evening)cozyOval(g,12,17,12,15,'#ffe3a02b');
    cozyRound(g,10,18,3,11,1,'#826d57');cozyRound(g,5,9,14,19,3,'#826d57');
    cozyRound(g,7,12,10,12,2,evening?'#ffe3a0':'#dfd0b0');
    cozyPoly(g,[[3,10],[12,3],[21,10]],'#826d57');
  });ctx.drawImage(stamp,(b.x+b.w-.35)*T-12,(b.y+b.h)*T-73);
};
const poiBeforeScenery=drawPoi;
drawPoi=function(p,now){
  if(p.type!=='festival'){poiBeforeScenery(p,now);return;}
  const x=p.x*T,y=p.y*T;
  cozyShadow(ctx,x+16,y+28,16,3);
  for(const dx of [4,25])cozyRound(ctx,x+dx,y+10,3,20,1,'#826d57');
  cozyRound(ctx,x+1,y+4,30,7,2,'#c9a675');cozyRound(ctx,x+1,y+14,30,7,2,'#d3b28a');
  cozyRound(ctx,x+28,y-23,2,42,1,'#a98766');cozyRound(ctx,x+17,y-22,12,10,1,'#e9b1bd');
  if(Math.hypot(p.x-visualX,p.y-visualY)<5)label(p.name,x+16,y-30,'#fff1cf');
};
Town3D.area='';
