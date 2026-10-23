/* Mesh wardrobe study based on the user's four-character reference, 2026-10-24.
   Faces are small original textures attached to curved head surfaces, never camera-facing sprites. */
'use strict';
window.PlazaHeroModels=(()=>{
const profiles={
 girl:{name:'ひより',hair:'#a96848',hairLight:'#c38962',iris:'#9d5748',jacket:'#f4e7e1',trim:'#dea5b8',bottom:'#38445f',shoe:'#d69ab8',bag:'#db9eb7',female:true,style:'tails',flower:true,joy:true},
 boy:{name:'そら',hair:'#343c56',hairLight:'#4e566f',iris:'#61718f',jacket:'#444755',trim:'#e6e1db',bottom:'#343745',shoe:'#454452',bag:'#303947',female:false,style:'messy',hood:true},
 tsuki:{name:'つき',hair:'#b7a0c4',hairLight:'#d2bbd8',iris:'#9a68ad',jacket:'#3e3549',trim:'#bd8eb0',bottom:'#6d536c',shoe:'#403745',bag:'#393241',female:true,style:'bob',beret:true},
 green:{name:'男の子②',hair:'#b17a45',hairLight:'#c99758',iris:'#997140',jacket:'#71834d',trim:'#e3d0a0',bottom:'#373e39',shoe:'#718459',bag:'#36443b',female:false,style:'short',hood:true,shorts:true,joy:true}
};
function make(T){
const skin='#ffe0c2',cheek='#efb3a9',textures=new Map(),materials=new Map();
const sphere=new T.SphereGeometry(1,24,16),smallSphere=new T.SphereGeometry(1,12,8);
// Rounded cuboid with actual curved edge topology for clothing, soles and bags.
const boxG=new T.BoxGeometry(1,1,1,4,4,4);{const a=boxG.attributes.position,n=new T.Vector3(),q=new T.Vector3();for(let i=0;i<a.count;i++){n.fromBufferAttribute(a,i);q.copy(n).clampScalar(-.38,.38);n.sub(q).normalize().multiplyScalar(.12).add(q);a.setXYZ(i,n.x,n.y,n.z);}boxG.computeVertexNormals();}
function material(color,smooth=true){const key=color+smooth;if(!materials.has(key))materials.set(key,new T.MeshPhongMaterial({color,specular:'#303038',shininess:12,flatShading:false}));return materials.get(key);}
function part(p,g,c,x,y,z,sx=1,sy=sx,sz=sx){const m=new T.Mesh(g,typeof c==='string'?material(c):c);m.position.set(x,y,z);m.scale.set(sx,sy,sz);p.add(m);return m;}
const orb=(p,c,x,y,z,sx,sy=sx,sz=sx)=>part(p,sx<.065?smallSphere:sphere,c,x,y,z,sx,sy,sz),box=(p,c,x,y,z,w,h,d)=>part(p,boxG,c,x,y,z,w,h,d);
function curve(p,c,points,r=.012){return part(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),12,r,8,false),c,0,0,0);}
// Smooth swept hair with a transported frame; no abrupt twist where a strand turns downward.
function lock(p,c,points,width=.12,depth=.045,endWidth=.02){const line=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),v=[],uv=[],indices=[],steps=16,sides=10;let previousTangent=null,right=null;
 for(let i=0;i<=steps;i++){const t=i/steps,pos=line.getPoint(t),tangent=line.getTangent(t).normalize();
 if(!right){right=new T.Vector3().crossVectors(tangent,new T.Vector3(0,0,1));if(right.lengthSq()<.001)right.set(1,0,0);right.normalize();}else{right.applyQuaternion(new T.Quaternion().setFromUnitVectors(previousTangent,tangent)).normalize();}
 previousTangent=tangent.clone();const normal=new T.Vector3().crossVectors(right,tangent).normalize(),r=i===steps?endWidth:(.80+.2*Math.sin(t*Math.PI))*Math.pow(1-t,.48);

 for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,q=pos.clone().addScaledVector(right,Math.cos(a)*width*r).addScaledVector(normal,Math.sin(a)*depth*r);v.push(q.x,q.y,q.z);uv.push(j/sides,t);if(i<steps&&j<sides){const k=i*(sides+1)+j;indices.push(k,k+sides+1,k+1,k+1,k+sides+1,k+sides+2);}}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const normals=g.attributes.normal;for(let i=0;i<=steps;i++){const first=i*(sides+1),last=first+sides,average=new T.Vector3().fromBufferAttribute(normals,first).add(new T.Vector3().fromBufferAttribute(normals,last)).normalize();normals.setXYZ(first,average.x,average.y,average.z);normals.setXYZ(last,average.x,average.y,average.z);}return part(p,g,material(c,true),0,0,0);}
function flower(p,x,y,z,size=.12){const g=new T.Group();g.position.set(x,y,z);p.add(g);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const m=orb(g,'#df8fb3',Math.sin(a)*size*.55,Math.cos(a)*size*.55,.015,size*.35,size*.49,.026);m.rotation.z=-a;}orb(g,'#f0d391',0,0,.046,size*.23,size*.23,.026);return g;}
function tex(key,paint){if(!textures.has(key)){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.scale(2,2);paint(g);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;textures.set(key,t);}return textures.get(key);}
function eyeTexture(p,expression,right=false){return tex('eye-'+p.iris+'-'+expression+'-'+right,g=>{
 g.clearRect(0,0,128,128);g.lineCap='round';g.lineJoin='round';
 if(expression==='smile'){g.strokeStyle='#52434b';g.lineWidth=9;g.beginPath();g.moveTo(17,70);g.quadraticCurveTo(62,16,108,69);g.stroke();return;}
 // Soft almond outline, coloured iris and two visible light reflections.
 g.fillStyle='#fcf3eb';g.beginPath();g.moveTo(13,56);g.bezierCurveTo(28,17,92,10,113,52);g.bezierCurveTo(118,93,89,115,59,114);g.bezierCurveTo(25,114,13,94,13,56);g.fill();
 const ir=g.createLinearGradient(0,25,0,115);ir.addColorStop(0,'#424052');ir.addColorStop(.52,p.iris);ir.addColorStop(1,'#cfb292');g.fillStyle=ir;g.beginPath();g.ellipse(64,72,36,44,0,0,Math.PI*2);g.fill();
 g.fillStyle='#3a3644';g.beginPath();g.ellipse(64,66,16,29,0,0,Math.PI*2);g.fill();
 g.strokeStyle='#56434b';g.lineWidth=8;g.beginPath();g.moveTo(12,58);g.bezierCurveTo(27,15,93,13,114,52);g.stroke();
 g.lineWidth=4;g.beginPath();g.moveTo(25,108);g.quadraticCurveTo(65,126,103,106);g.stroke();
 g.fillStyle='#fffdf4';g.beginPath();g.ellipse(48,43,12,15,-.2,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(86,91,6,7,0,0,Math.PI*2);g.fill();
 if(p.female){g.save();if(right){g.translate(128,0);g.scale(-1,1);}g.strokeStyle='#56434b';g.lineWidth=5;g.beginPath();g.moveTo(22,37);g.lineTo(12,27);g.moveTo(34,26);g.lineTo(28,18);g.stroke();g.restore();}
 });}
function mouthTexture(expression,joy){return tex('mouth-'+expression+'-'+joy,g=>{g.clearRect(0,0,128,128);g.lineCap='round';if(expression==='surprise'||expression==='smile'||joy){g.fillStyle='#a95b5b';g.beginPath();if(expression==='surprise')g.ellipse(64,68,22,30,0,0,Math.PI*2);else{g.moveTo(20,40);g.quadraticCurveTo(64,51,108,40);g.quadraticCurveTo(103,107,64,108);g.quadraticCurveTo(25,106,20,40);}g.fill();g.fillStyle='#ed9e96';g.beginPath();g.ellipse(64,96,29,13,0,Math.PI*2);g.fill();if(expression!=='surprise'){g.fillStyle='#fff5e7';g.beginPath();g.moveTo(27,42);g.quadraticCurveTo(64,53,101,42);g.lineTo(95,54);g.quadraticCurveTo(64,60,33,54);g.fill();}}else{g.strokeStyle='#a3796d';g.lineWidth=6;g.beginPath();g.moveTo(36,69);g.quadraticCurveTo(64,83,92,69);g.stroke();}});}
// A curved decal follows the facial volume. Geometry is fixed to the head and turns with it.
function decal(parent,cx,cy,width,height,texture){const v=[],uv=[],ix=[],n=10;
 for(let y=0;y<=n;y++)for(let x=0;x<=n;x++){const px=cx+(x/n-.5)*width,py=cy+(y/n-.5)*height,z=.012+.445*Math.sqrt(Math.max(.08,1-(px/.57)**2-(py/.51)**2));v.push(px,py,z);uv.push(x/n,y/n);if(x<n&&y<n){const k=y*(n+1)+x;ix.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();const m=new T.MeshLambertMaterial({map:texture,transparent:true,alphaTest:.08,depthWrite:false,side:T.DoubleSide});const obj=part(parent,g,m,0,0,.008);obj.renderOrder=2;return obj;}
function build(kind,api){const p=profiles[kind];if(!p)throw Error('Unknown character '+kind);const root=new T.Group(),body=new T.Group(),head=new T.Group(),limbs=[],knees=[[],[]],outfits=[],armOutfits=[[],[]],legOutfits=[[],[]];root.add(body);head.position.y=1.78;head.rotation.x=-.07;body.add(head);
 // Shared skin volumes, ears and subtle cheeks.
 const faceShape=new T.SphereGeometry(1,32,24);{const a=faceShape.attributes.position;for(let i=0;i<a.count;i++){const y=a.getY(i),t=Math.max(0,(-y-.25)/.75);a.setX(i,a.getX(i)*(1-.14*t*t));}faceShape.computeVertexNormals();}part(head,faceShape,skin,0,0,0,.57,.51,.445);
 for(const x of [-.565,.565]){orb(head,skin,x,-.045,-.015,.075,.105,.074);orb(head,'#eab79e',x,-.045,.047,.028,.05,.014);}
 for(const side of [-1,1]){orb(head,cheek,side*.365,-.185,.30,.085,.029,.013);curve(head,p.style==='bob'?'#94829c':'#a07c6a',[[side*.17,.13,.421],[side*.235,.155,.41],[side*.29,.135,.388]],.008);}
 // Skull cap and back shell, with a clear opening for the expression.
 part(head,new T.SphereGeometry(1,32,16,0,Math.PI*2,0,Math.PI*.46),p.hair,0,.025,-.028,.587,.54,.47);
 const back=new T.Group();head.add(back);
 const backCount=p.style==='bob'?13:p.female?9:10;
 for(let i=0;i<backCount;i++){const a=.78+i/(backCount-1)*(Math.PI*2-1.56),x=Math.sin(a)*.51,z=Math.cos(a)*.36;
 const endY=p.style==='bob'?-.49:p.style==='tails'?-.24:-.20-(i%3)*.035;
 lock(back,i%4===0?p.hairLight:p.hair,[[x*.75,.32,z*.8],[x*1.05,.04,z*1.12],[x*1.04,endY,z*1.13]],p.style==='bob'?.14:.16,.07,p.style==='bob'?.52:.02);}
 const bangs=p.style==='messy'?[[-.48,-.22],[-.34,-.08],[-.15,-.13],[.035,-.04],[.24,-.08],[.43,-.20]]:p.style==='short'?[[-.48,-.13],[-.29,.01],[-.10,-.07],[.10,-.02],[.30,.02],[.47,-.14]]:[[-.45,-.10],[-.29,.045],[-.12,.005],[.065,.04],[.24,.025],[.43,-.10]];
 for(let i=0;i<bangs.length;i++){const [x,y]=bangs[i];lock(head,i===1||i===4?p.hairLight:p.hair,[[x*.54,.47,.14],[x*.88,.27,.425],[x,y,.40-Math.abs(x)*.16]],p.style==='messy'?.155:.12,p.female?.028:.043);}
 if(p.style==='messy'||p.style==='short'){
  for(let i=0;i<7;i++){const a=.45+i*.82;lock(head,i%4===0?p.hairLight:p.hair,[[Math.sin(a)*.23,.43,Math.cos(a)*.23],[Math.sin(a)*.44,.41,Math.cos(a)*.40],[Math.sin(a)*.64,.22,Math.cos(a)*.53]],.14,.055);}
  lock(head,p.hairLight,[[-.03,.46,-.03],[-.15,.63,-.01],[-.30,.58,.025]],.10,.035);
  for(const side of [-1,1])lock(head,p.hair,[[side*.41,.23,.12],[side*.58,.02,.15],[side*.54,-.26,.14]],.12,.045);
 }
 if(p.style==='tails'){for(const side of [-1,1]){orb(head,p.hair,side*.56,-.21,-.15,.205,.22,.17);for(let i=0;i<3;i++)lock(head,i===0?p.hairLight:p.hair,[[side*.53,-.13,-.1],[side*(.63+i*.045),-.26,-.15],[side*(.63+i*.035),-.41+i*.025,-.10]],.09,.065);orb(head,'#df8fb3',side*.54,-.15,-.015,.07,.065,.035);}flower(head,-.51,.18,.22,.13);}
 // Beret and optional hats stay separate so wardrobes do not rebuild meshes.
 const hats={base:new T.Group(),cap:new T.Group(),straw:new T.Group(),none:new T.Group()};
 if(p.beret){const b=hats.base;b.position.set(-.035,.45,-.025);b.rotation.z=-.14;orb(b,'#393341',0,.055,-.015,.65,.21,.52);part(b,new T.TorusGeometry(.51,.04,10,32),'#4b4052',0,-.07,0,1,1,.87).rotation.x=Math.PI/2;flower(b,-.49,-.075,.30,.095);flower(b,-.53,-.18,.255,.07);}
 const cap=hats.cap;cap.position.set(0,.47,-.035);part(cap,new T.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),'#58647b',0,0,0,.59,.27,.49);orb(cap,'#515c70',0,.012,.4,.48,.035,.24);orb(cap,'#e5dfca',0,.10,.455,.045,.06,.018);
 const straw=hats.straw;straw.position.set(0,.49,-.055);part(straw,new T.CylinderGeometry(.72,.72,.035,32),'#e8ce97',0,0,0);orb(straw,'#e8ce97',0,.09,-.02,.43,.23,.39);part(straw,new T.CylinderGeometry(.37,.43,.07,32,1,true),p.trim,0,.07,-.02);
 api.batch(head);
 const face=new T.Group();head.add(face);const eyes=[decal(face,-.225,-.06,.278,.285,eyeTexture(p,'normal')),decal(face,.225,-.06,.278,.285,eyeTexture(p,'normal',true))];
 const mouth=decal(face,0,-.285,.18,.14,mouthTexture('normal',p.joy));
 for(const h of Object.values(hats)){api.batch(h);head.add(h);}
 // Skin arms and legs keep genuine articulated pivots. Outfit groups share those pivots.
 for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.18,.66,0);body.add(leg);orb(leg,skin,0,-.13,0,.115,.17,.115);limbs.push(leg);}
 for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.365,1.24,0);arm.rotation.z=side*.08;body.add(arm);orb(arm,skin,side*.03,-.40,.025,.09,.105,.085);orb(arm,skin,side*-.04,-.39,.085,.045,.065,.04);limbs.push(arm);}
 const looks=['reference','casual','outdoor'];
 for(let li=0;li<looks.length;li++){
 const look=looks[li],ref=li===0,casual=li===1,jacket=ref?p.jacket:casual?(p.female?'#dca6b6':'#6f92a9'):'#819573',trim=ref?p.trim:casual?'#f2dfca':'#d2c29c',bottom=ref?p.bottom:casual?'#778ba1':'#706855',skirt=ref&&p.female,shorts=(ref&&p.shorts)||(!ref&&li===2),dress=p.style==='bob'&&ref;
 const torso=new T.Group();body.add(torso);outfits.push(torso);
 orb(torso,'#f4e8d9',0,1.075,0,.31,.345,.245);
 // Fitted open jacket with a visible shirt/hoodie centre and cuffs.
 for(const side of [-1,1]){const panel=orb(torso,jacket,side*.17,1.055,.005,.175,.345,.265);panel.rotation.z=side*.04;box(torso,trim,side*.078,1.06,.261,.025,.51,.027);for(const y of [.89,1.035,1.18])orb(torso,ref&&p.female?'#d4b284':'#bcb4a5',side*.105,y,.28,.014);box(torso,jacket,side*.222,.9,.235,.11,.085,.025);}
 box(torso,trim,0,.75,.018,.60,.055,.43);
 if(ref&&p.female){for(const side of [-1,1]){const collar=part(torso,new T.ConeGeometry(1,1,3), '#f7e5de',side*.11,1.33,.24,.15,.20,.035);collar.rotation.z=side*-.5;const bow=orb(torso,p.style==='bob'?'#c58bb0':'#cf777c',side*.07,1.23,.292,.075,.04,.025);bow.rotation.z=side*-.3;}orb(torso,p.style==='bob'?'#bd7eaa':'#c96771',0,1.23,.31,.035);curve(torso,p.style==='bob'?'#bd7eaa':'#c96771',[[0,1.22,.30],[-.05,1.1,.29],[-.08,1.06,.28]],.018);curve(torso,p.style==='bob'?'#bd7eaa':'#c96771',[[0,1.22,.30],[.045,1.1,.29],[.07,1.07,.28]],.018);}
 if((ref&&p.hood)||!ref){orb(torso,'#e8e1d3',0,1.30,-.13,.31,.13,.21);for(const x of [-.055,.055]){curve(torso,p.shorts&&ref?'#dfc67c':'#c4baaa',[[x,1.31,.25],[x,1.12,.29]],.012);orb(torso,'#ac9c80',x,1.10,.29,.015);}}
 if(skirt){part(torso,new T.CylinderGeometry(.29,.415,.28,12),bottom,0,.65,.015);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const pl=box(torso,p.style==='bob'?'#9d778d':'#61708d',Math.sin(a)*.382,.65,Math.cos(a)*.382+.015,.018,.24,.018);pl.rotation.y=a;}if(dress){for(const y of [.58,.70])for(let i=0;i<12;i++){const a=i*Math.PI/6;orb(torso,'#a1849d',Math.sin(a)*.397,y,Math.cos(a)*.397+.015,.016,.009,.014);}}}
 else orb(torso,bottom,0,.72,0,.29,.17,.225);
 const bag=new T.Group();torso.add(bag);orb(bag,ref?p.bag:li===2?'#8e7e5d':'#ae9e83',0,1.04,-.36,.31,.38,.16);box(bag,ref?p.bag:li===2?'#8e7e5d':'#ae9e83',0,.91,-.51,.36,.21,.07);curve(bag,trim,[[-.10,1.40,-.39],[-.10,1.48,-.4],[.10,1.48,-.4],[.10,1.40,-.39]],.022);for(const side of [-1,1]){curve(torso,ref?p.bag:'#837966',[[side*.23,.80,.20],[side*.28,1.13,.22],[side*.27,1.39,-.06],[side*.23,1.15,-.36]],.028);orb(bag,'#cdb183',side*.12,.91,-.56,.023);}
 for(let side=0;side<2;side++){
 const a=new T.Group();limbs[2+side].add(a);armOutfits[side].push(a);const sleeve=orb(a,jacket,0,-.16,0,.14,.25,.15);sleeve.rotation.z=(side?1:-1)*.1;orb(a,trim,(side?1:-1)*.012,-.34,.012,.13,.055,.135);api.batch(a);
 const leg=new T.Group();limbs[side].add(leg);legOutfits[side].push(leg);const lower=new T.Group();lower.position.y=-.29;leg.add(lower);knees[side].push(lower);orb(lower,skin,0,-.10,0,.108,.18,.108);
 if(!skirt){box(leg,bottom,0,-.115,0,.235,.33,.245);if(!shorts){box(lower,bottom,0,-.085,0,.225,.285,.24);box(lower,trim,0,-.16,.005,.24,.045,.25);}}
 if(skirt||shorts){box(lower,ref&&p.style==='bob'?'#423c4a':'#f5ece3',0,-.13,.01,.19,.17,.21);if(ref&&p.style==='tails')box(lower,'#e1a9b6',0,-.05,.018,.195,.045,.215);}
 const shoe=ref?p.shoe:li===2?'#8a7660':'#c7ad9a';orb(lower,shoe,0,-.26,.075,.145,.13,.235);orb(lower,'#eee5d3',0,-.35,.085,.15,.035,.24);orb(lower,'#f2e6d8',0,-.27,.255,.124,.085,.075);if(!(ref&&p.style==='bob')){for(const y of [-.19,-.225])box(lower,'#f7f0df',0,y,.24,.15,.013,.02);}else{box(lower,'#bba4b5',0,-.22,.25,.15,.027,.02);orb(lower,'#c6a8b6',.08,-.21,.22,.025);}
 lower.removeFromParent();api.batch(lower);api.batch(leg);leg.add(lower);}
 api.batch(torso);
 }
 // Batch the common limbs without mixing wardrobe variants.
 const shadow=api.shadow(0,0,.49,.34);
 root.userData={kind,body,head,limbs,knees,shadow,phase:0,moving:0,name:p.name,model:'smooth-3d',look:'reference',hat:'base',expression:'normal',updateLook};
 function updateLook({look=root.userData.look,hat=root.userData.hat,expression=root.userData.expression}={}){const index=looks.indexOf(look);outfits.forEach((o,i)=>o.visible=i===index);for(const a of [...armOutfits,...legOutfits])a.forEach((o,i)=>o.visible=i===index);Object.entries(hats).forEach(([key,o])=>o.visible=key===hat);for(const [i,eye]of eyes.entries()){eye.material.map=eyeTexture(p,expression==='smile'?'smile':'normal',i===1);eye.material.needsUpdate=true;}mouth.material.map=mouthTexture(expression,p.joy);mouth.material.needsUpdate=true;Object.assign(root.userData,{look,hat,expression});}
let wasClosed=false;root.userData.animateFace=(t)=>{const closed=(t+Object.keys(profiles).indexOf(kind)*937)%4300>4140;if(closed===wasClosed||root.userData.expression==='smile')return;wasClosed=closed;for(const [i,eye]of eyes.entries()){eye.material.map=eyeTexture(p,closed?'smile':'normal',i===1);}};
 updateLook();return root;
}
return {build,profiles};
}
return {make,profiles};
})();
