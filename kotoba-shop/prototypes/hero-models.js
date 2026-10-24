/* Original SD character models, rebuilt 2026-10-24 from the new visual direction.
   Volumetric heads, sheet-like solid hair, tailored clothing, articulated limbs.
   No imported game assets, character sprites, or camera-facing character planes. */
'use strict';
window.PlazaHeroModels=(()=>{
const profiles={
 girl:{name:'ひより',hair:'#b78792',hairLight:'#c598a1',iris:'#a36983',jacket:'#f1e3dc',trim:'#91a8b9',bottom:'#60728d',shoe:'#626b81',bag:'#9aacbf',female:true,style:'bob'},
 boy:{name:'そら',hair:'#8495b1',hairLight:'#9aa9c0',iris:'#637caa',jacket:'#d3b681',trim:'#eee9da',bottom:'#52657d',shoe:'#59667b',bag:'#849aab',female:false,style:'short'},
 tsuki:{name:'つき',hair:'#9b91b5',hairLight:'#b2a8c8',iris:'#8474ac',jacket:'#e8e5f0',trim:'#aabbd0',bottom:'#7f8eaf',shoe:'#71718b',bag:'#a59fba',female:true,style:'long'},
 green:{name:'はると',hair:'#ae927d',hairLight:'#c1a58e',iris:'#8e805f',jacket:'#a6bda9',trim:'#ebe5d6',bottom:'#647274',shoe:'#667673',bag:'#92a39a',female:false,style:'swept'}
};
function make(T,{compatible=false}={}){
const skin='#ffe5da',textures=new Map(),materials=new Map(),shaded=new WeakMap();
const sphere=new T.SphereGeometry(1,compatible?16:24,compatible?10:16);
function mat(color){if(!materials.has(color))materials.set(color,new T.MeshBasicMaterial({color,vertexColors:true}));return materials.get(color);}
function darker(color,n=.83){return '#'+new T.Color(color).multiplyScalar(n).getHexString();}
function mesh(parent,geo,color,x=0,y=0,z=0,sx=1,sy=sx,sz=sx){const material=typeof color==='string'?mat(color):color;if(material.vertexColors){if(!shaded.has(geo)){const g=geo.clone();if(!g.attributes.normal)g.computeVertexNormals();const n=g.attributes.normal,colors=[];for(let i=0;i<n.count;i++){const d=n.getX(i)*-.25+n.getY(i)*.60+n.getZ(i)*.75,shade=d<.15?.78:d<.62?.89:1;colors.push(shade,shade,shade);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));shaded.set(geo,g);}geo=shaded.get(geo);}const o=new T.Mesh(geo,material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o;}
const oval=(p,c,x,y,z,rx,ry=rx,rz=rx)=>mesh(p,sphere,c,x,y,z,rx,ry,rz);
// A continuous, rounded ring loft; used for garments and skin, not primitive boxes.
function loft(p,color,rings,{segments=compatible?16:24,pleats=0,front=0}={}){
 const vertices=[],uv=[],indices=[];
 for(let j=0;j<rings.length;j++){const [y,rx,rz]=rings[j];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,fold=1+pleats*(i%2?-.5:.5);vertices.push(Math.sin(a)*rx*fold,y,Math.cos(a)*rz*fold+front);uv.push(i/segments,j/(rings.length-1));if(j&&i){const k=j*(segments+1)+i;indices.push(k,k-1,k-segments-1,k-1,k-segments-2,k-segments-1);}}}
 for(const j of [0,rings.length-1]){const [y]=rings[j],center=vertices.length/3;vertices.push(0,y,front);uv.push(.5,.5);for(let i=0;i<segments;i++){const a=j*(segments+1)+i;indices.push(center,a,a+1);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const m=mat(color).clone();m.side=T.DoubleSide;return mesh(p,g,m);
}
function line(p,color,points,r=.008){return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),compatible?8:16,r,5,false),color);}
// Closed sculpted hair ribbons: broad faces, restrained curved ridges, soft tips.
function strand(p,color,points,width){const path=new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),v=[],ix=[],steps=compatible?8:14,cols=6;
 for(let side=0;side<2;side++)for(let i=0;i<=steps;i++){const t=i/steps,c=path.getPoint(t),w=width*(.98-.84*t*t*t);for(let j=0;j<=cols;j++){const u=j/cols*2-1;v.push(c.x+u*w*.5,c.y+.012*(1-u*u),c.z+(side?-.047:.018*(1-u*u)));}}
 const stride=cols+1,layer=(steps+1)*stride;
 for(let i=0;i<steps;i++)for(let j=0;j<cols;j++){const k=i*stride+j;ix.push(k,k+stride,k+1,k+1,k+stride,k+stride+1);const b=k+layer;ix.push(b,b+1,b+stride,b+1,b+stride+1,b+stride);}
 for(let i=0;i<steps;i++)for(const j of [0,cols]){const a=i*stride+j,b=(i+1)*stride+j;ix.push(a,a+layer,b,b,b+layer,a+layer);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const material=mat(color).clone();material.side=T.DoubleSide;return mesh(p,g,material);
}
function texture(key,paint){if(!textures.has(key)){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const g=canvas.getContext('2d');g.scale(2,2);paint(g);const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.magFilter=t.minFilter=T.LinearFilter;textures.set(key,t);}return textures.get(key);}
function eye(p,expression,right){return texture('eye-'+p.iris+'-'+expression+'-'+right,g=>{
 g.clearRect(0,0,128,128);g.lineCap='round';g.lineJoin='round';
 if(expression==='smile'){g.strokeStyle='#565267';g.lineWidth=6;g.beginPath();g.moveTo(22,76);g.quadraticCurveTo(63,29,105,76);g.stroke();return;}
 // Soft horizontal upper lash. No black lower eye ring and no oversized pupil.
 g.beginPath();g.moveTo(16,48);g.bezierCurveTo(37,22,88,23,111,45);g.bezierCurveTo(110,94,94,109,65,109);g.bezierCurveTo(36,109,19,92,16,48);g.closePath();g.save();g.clip();g.fillStyle='#fff9f9';g.fillRect(0,0,128,128);
 const gradient=g.createLinearGradient(0,31,0,110);gradient.addColorStop(0,'#514d69');gradient.addColorStop(.45,p.iris);gradient.addColorStop(1,'#d1bbcf');g.fillStyle=gradient;g.beginPath();g.ellipse(65,69,30,40,0,0,Math.PI*2);g.fill();
 g.fillStyle='#484258';g.beginPath();g.ellipse(65,58,13,24,0,0,Math.PI*2);g.fill();
 g.fillStyle='#fffdfb';g.beginPath();g.ellipse(51,47,9,11,-.2,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(82,88,4,5,0,0,Math.PI*2);g.fill();g.restore();
 g.strokeStyle='#575061';g.lineWidth=6;g.beginPath();g.moveTo(14,49);g.bezierCurveTo(38,22,87,23,112,45);g.stroke();
 // One short outer lash only, softened rather than spiky.
 if(p.female){g.lineWidth=4;g.beginPath();if(right){g.moveTo(108,42);g.lineTo(116,35);}else{g.moveTo(19,42);g.lineTo(11,35);}g.stroke();}
 });}
function mouth(expression){return texture('mouth-'+expression,g=>{g.clearRect(0,0,128,128);g.lineCap='round';if(expression==='surprise'){g.fillStyle='#b67f8f';g.beginPath();g.ellipse(64,69,15,23,0,0,Math.PI*2);g.fill();}else if(expression==='smile'){g.fillStyle='#bd8391';g.beginPath();g.moveTo(31,52);g.quadraticCurveTo(64,63,97,52);g.quadraticCurveTo(88,97,64,97);g.quadraticCurveTo(39,97,31,52);g.fill();g.fillStyle='#efb5ba';g.beginPath();g.ellipse(64,88,18,7,0,0,Math.PI*2);g.fill();}else{g.strokeStyle='#a06b7e';g.lineWidth=10;g.beginPath();g.moveTo(35,64);g.quadraticCurveTo(64,83,93,64);g.stroke();}});}
function faceZ(x,y){return .445*Math.pow(Math.max(0,1-(x/.64)**2-(y/.57)**2),.34);}
function decal(p,x,y,w,h,t){const v=[],uv=[],ix=[],n=compatible?8:12;
 for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const a=x+(i/n-.5)*w,b=y+(j/n-.5)*h;v.push(a,b,faceZ(a,b)+.009);uv.push(i/n,j/n);if(j<n&&i<n){const k=j*(n+1)+i;ix.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();const m=new T.MeshBasicMaterial({map:t,transparent:true,alphaTest:.05,depthWrite:false,side:T.DoubleSide});const o=mesh(p,g,m);o.renderOrder=2;return o;
}
function build(kind,api){const p=profiles[kind];if(!p)throw Error('Unknown original character '+kind);
 const root=new T.Group(),body=new T.Group(),head=new T.Group(),limbs=[],knees=[[],[]],outfits=[],armOutfits=[[],[]],legOutfits=[[],[]];root.add(body);body.add(head);head.position.y=1.70;
 // Cheeks and lower jaw form one facial volume with a flatter anime-style front.
 const faceGeo=new T.SphereGeometry(1,compatible?24:36,compatible?16:24);{const a=faceGeo.attributes.position;for(let i=0;i<a.count;i++){const y=a.getY(i),x=a.getX(i),z=a.getZ(i),jaw=1-.10*Math.max(0,-y);a.setXYZ(i,x*.64*jaw,y*.57,z>=0?faceZ(x*.64,y*.57):z*.445);}faceGeo.computeVertexNormals();}
 const face=mesh(head,faceGeo,skin);face.userData.part='face-volume';
 for(const s of [-1,1]){oval(head,skin,s*.623,-.065,-.025,.057,.083,.054);}
 const neck=oval(body,skin,0,1.15,0,.105,.145,.095);neck.userData.part='neck';
 // Seam-free upper scalp plus continuous back/side shell. No cylindrical locks.
 const capGeo=new T.SphereGeometry(1,compatible?24:36,compatible?10:16,0,Math.PI*2,0,1.37);{const a=capGeo.attributes.position;for(let i=0;i<a.count;i++)if(a.getZ(i)>0)a.setZ(i,Math.pow(Math.max(0,1-a.getX(i)**2-a.getY(i)**2),.34));capGeo.computeVertexNormals();}mesh(head,capGeo,p.hair,0,.022,-.025,.666,.609,.50);
 const backColor=p.hair,end=p.style==='long'?-.80:p.style==='bob'?-.47:-.29,v=[],ix=[],rings=[[.40,.523,.383],[.16,.65,.476],[-.05,.67,.47],[-.28,.64,.42],[end,.57,.34]],segs=compatible?18:30;
 for(let j=0;j<rings.length;j++)for(let i=0;i<=segs;i++){const a=1.07+i/segs*(Math.PI*2-2.14),[y,rx,rz]=rings[j];v.push(Math.sin(a)*rx,y+(j===rings.length-1?.018*Math.cos(i*1.8):0),Math.cos(a)*rz-.025);if(j&&i){const k=j*(segs+1)+i;ix.push(k,k-1,k-segs-1,k-1,k-segs-2,k-segs-1);}}
 const backGeo=new T.BufferGeometry();backGeo.setAttribute('position',new T.Float32BufferAttribute(v,3));backGeo.setIndex(ix);backGeo.computeVertexNormals();const bm=mat(backColor).clone();bm.side=T.DoubleSide;mesh(head,backGeo,bm);
 // Larger, coherent fringe panels with tiny differences of length and direction.
 const fringe=p.style==='short'?[[-.51,-.075,.25],[-.31,.025,.31],[-.07,-.02,.33],[.18,.06,.32],[.46,-.10,.27]]:p.style==='swept'?[[-.51,-.08,.26],[-.28,.055,.34],[.00,.075,.34],[.25,.015,.32],[.49,-.11,.25]]:[[-.53,-.13,.24],[-.33,.05,.32],[-.07,.025,.34],[.19,.04,.33],[.48,-.12,.27]];
 for(let i=0;i<fringe.length;i++){const [x,y,w]=fringe[i];strand(head,i===1||i===3?p.hairLight:p.hair,[[x*.48,.55,.175],[x*.82,.34,.465],[x,y,.438-Math.abs(x)*.11]],w);}
 for(const s of [-1,1]){const endY=p.style==='long'?-.79:p.style==='bob'?-.45:-.25;strand(head,p.hair,[[s*.46,.30,.21],[s*.64,-.08,.25],[s*.58,endY,.15]],.19);}
 // Small original enamel bar, not a flower or a franchise-specific accessory.
 if(kind==='girl'){const clip=oval(head,'#a5c6cd',-.535,.14,.36,.075,.019,.014);clip.rotation.z=-.15;}
 if(kind==='tsuki'){for(const y of [.12,.055]){const clip=oval(head,'#dac7a5',.55,y,.32,.052,.012,.014);clip.rotation.z=.16;}}
 const eyes=[decal(head,-.238,-.115,.33,.31,eye(p,'normal',false)),decal(head,.238,-.115,.33,.31,eye(p,'normal',true))],mouthMesh=decal(head,0,-.325,.15,.09,mouth('normal'));
 // Blush belongs to the facial surface, never a floating cheek sphere.
 for(const s of [-1,1]){const t=texture('blush',g=>{const gr=g.createRadialGradient(64,64,0,64,64,46);gr.addColorStop(0,'#eeb2bd65');gr.addColorStop(1,'#eeb2bd00');g.fillStyle=gr;g.fillRect(0,0,128,128);});decal(head,s*.405,-.25,.13,.058,t);}
 const hats={base:new T.Group(),none:new T.Group(),cap:new T.Group(),straw:new T.Group()};
 const cap=hats.cap;cap.position.set(0,.50,-.025);mesh(cap,new T.SphereGeometry(1,24,10,0,Math.PI*2,0,Math.PI/2),'#8b9fb8',0,0,0,.69,.19,.51);oval(cap,'#768da8',0,-.012,.40,.45,.025,.21);
 const straw=hats.straw;straw.position.set(0,.54,-.025);loft(straw,'#dccba4',[[0,.75,.57],[.035,.75,.57],[.055,.48,.40],[.25,.36,.32],[.29,.08,.08]]);loft(straw,p.trim,[[.06,.48,.40],[.11,.46,.39]]);
 for(const h of Object.values(hats))head.add(h);
 for(const s of [-1,1]){const leg=new T.Group();leg.position.set(s*.145,.56,0);body.add(leg);limbs.push(leg);oval(leg,skin,0,-.105,0,.078,.135,.079);}
 for(const s of [-1,1]){const arm=new T.Group();arm.position.set(s*.287,1.12,0);arm.rotation.z=s*.12;body.add(arm);limbs.push(arm);oval(arm,skin,0,-.335,.007,.068,.078,.062);}
 const looks=['reference','casual','outdoor'];
 for(let li=0;li<looks.length;li++){
 const ref=li===0,coat=ref?p.jacket:li===1?(p.female?'#d6ddea':'#b5c9cc'):'#bec5a5',trim=ref?p.trim:li===1?'#faf0df':'#e5d7b9',bottom=ref?p.bottom:li===1?'#8899b0':'#87967f',skirt=p.female&&li!==2,torso=new T.Group();body.add(torso);outfits.push(torso);
 loft(torso,coat,[[.62,.262,.163],[.69,.268,.18],[.98,.233,.17],[1.14,.244,.162],[1.235,.125,.10]],{});
 // A quiet placket, tiny collar and small ribbon, with no wide shiny fittings.
 loft(torso,trim,[[1.205,.13,.105],[1.247,.106,.086]]);
 line(torso,trim,[[0,1.205,.169],[0,.666,.184]],.010);
 for(const s of [-1,1]){const panel=mesh(torso,new T.ConeGeometry(1,1,3),'#fff4ed',s*.079,1.17,.169,.085,.11,.013);panel.rotation.z=s*-.45;}
 if(p.female){for(const s of [-1,1]){const bow=oval(torso,trim,s*.041,1.095,.184,.048,.023,.012);bow.rotation.z=s*-.23;}oval(torso,trim,0,1.095,.195,.018);}
 else{for(const y of [.76,.90,1.04])oval(torso,trim,0,y,.185,.009,.010,.006);}
 if(skirt){loft(torso,bottom,[[.40,.32,.205],[.43,.322,.208],[.61,.234,.158],[.66,.223,.155]],{segments:24,pleats:.07});loft(torso,darker(bottom,.93),[[.40,.322,.208],[.421,.321,.208]],{segments:24,pleats:.07});}
 else loft(torso,bottom,[[.55,.25,.166],[.66,.247,.166],[.69,.20,.15]]);
 if(li===2){const bag=new T.Group();torso.add(bag);oval(bag,p.bag,0,.93,-.225,.20,.245,.082);line(bag,darker(p.bag,.86),[[-.08,1.15,-.24],[-.08,1.23,-.24],[.08,1.23,-.24],[.08,1.15,-.24]],.012);for(const s of [-1,1])line(torso,p.bag,[[s*.17,.69,.14],[s*.20,1.10,.16],[s*.19,1.22,-.06],[s*.16,.98,-.25]],.015);}
 for(let side=0;side<2;side++){
 const sleeve=new T.Group();limbs[2+side].add(sleeve);armOutfits[side].push(sleeve);loft(sleeve,coat,[[-.285,.073,.075],[-.255,.085,.083],[-.08,.094,.096],[.015,.079,.079]]);loft(sleeve,trim,[[-.28,.075,.077],[-.254,.086,.084]]);
 const legLook=new T.Group();limbs[side].add(legLook);legOutfits[side].push(legLook);const lower=new T.Group();lower.position.y=-.23;legLook.add(lower);knees[side].push(lower);oval(lower,skin,0,-.09,0,.074,.12,.075);
 if(!skirt){loft(legLook,bottom,[[-.20,.10,.103],[-.04,.10,.10],[.03,.095,.095]]);if(li===1)loft(lower,bottom,[[-.19,.087,.089],[-.03,.093,.095],[.02,.096,.097]]);}
 if(skirt||li!==1)loft(lower,'#fff3eb',[[-.205,.074,.077],[-.115,.074,.077]]);
 const shoe=ref?p.shoe:li===1?'#8e93a3':'#8b9983';oval(lower,shoe,0,-.245,.045,.093,.063,.155);oval(lower,'#efe8e0',0,-.292,.043,.094,.017,.151);line(lower,'#e8e7e4',[[-.05,-.205,.12],[.05,-.205,.12]],.006);
 }
 }
 const shadow=api.shadow(0,0,.42,.27);root.add(shadow);
 root.userData={kind,name:p.name,body,head,limbs,knees,shadow,phase:0,model:'original-sd-3d',proportions:'2-head',designRevision:'sd-reset-10',look:'reference',hat:'base',expression:'normal',updateLook};
 function updateLook({look=root.userData.look,hat=root.userData.hat,expression=root.userData.expression}={}){const n=looks.indexOf(look);if(n<0)throw Error('Unknown outfit '+look);outfits.forEach((o,i)=>o.visible=i===n);for(const a of [...armOutfits,...legOutfits])a.forEach((o,i)=>o.visible=i===n);Object.entries(hats).forEach(([id,h])=>h.visible=id===hat);eyes.forEach((e,i)=>{e.material.map=eye(p,expression==='smile'?'smile':'normal',i===1);e.material.needsUpdate=true;});mouthMesh.material.map=mouth(expression);Object.assign(root.userData,{look,hat,expression});}
 let wasClosed=false;root.userData.animateFace=t=>{const closed=(t+Object.keys(profiles).indexOf(kind)*730)%4800>4650;if(closed===wasClosed||root.userData.expression==='smile')return;wasClosed=closed;eyes.forEach((e,i)=>e.material.map=eye(p,closed?'smile':'normal',i===1));};
 updateLook();return root;
}
return {build,profiles,disposeTextures(){textures.forEach(t=>t.dispose());textures.clear();}};
}
function animate(root,{time=0,moving=false,dash=false,reducedMotion=false,mode='idle',dt=.016}={}){
 const u=root.userData;if(!u.limbs)return;u.phase+=moving&&!reducedMotion?dt*(dash?13:8):0;const amp=moving&&!reducedMotion?(dash?.58:.38):0;
 for(let i=0;i<2;i++){const wave=Math.sin(u.phase+i*Math.PI);u.limbs[i].rotation.x=wave*amp;u.limbs[2+i].rotation.set(-wave*amp*.7,0,(i?1:-1)*.12);u.knees[i].forEach(k=>k.rotation.x=Math.max(0,-wave)*amp*.8);}
 u.body.position.y=moving&&!reducedMotion?Math.abs(Math.sin(u.phase))*.025:0;u.body.rotation.x=dash&&moving?.035:0;u.head.rotation.z=reducedMotion?0:Math.sin(time*.0014)*.012;u.animateFace(time);
 if(mode==='fish'||mode==='tool'){u.limbs[3].rotation.x=-1.05;u.limbs[2].rotation.x=-.6;}if(mode==='joy'){u.limbs[2].rotation.z=.7;u.limbs[3].rotation.z=-.7;}
}
return {make,profiles,animate};
})();
