/* Garden SD / a new sculpted character family, 2026-10-24.
   Original geometry and painted features. Only the rig API is retained. */
'use strict';
window.PlazaHeroModels=(()=>{
const profiles={
 girl:{name:'ひより',hair:'#d18d9e',hairLight:'#e5a6b5',iris:'#ad5076',jacket:'#fff0d5',trim:'#d66e86',bottom:'#455a78',shoe:'#69586c',bag:'#c993aa',female:true,style:'bob'},
 boy:{name:'そら',hair:'#475584',hairLight:'#6678a4',iris:'#526cb0',jacket:'#f1f0e7',trim:'#6e8dae',bottom:'#4d5674',shoe:'#55566b',bag:'#7e91af',female:false,style:'short'},
 tsuki:{name:'つき',hair:'#a6b7ab',hairLight:'#c0cfc2',iris:'#9380b5',jacket:'#f4eee0',trim:'#64617c',bottom:'#5f5d78',shoe:'#777085',bag:'#9292a7',female:true,style:'long'},
 green:{name:'はると',hair:'#e1b279',hairLight:'#f1ca92',iris:'#b87b51',jacket:'#617a98',trim:'#f9efd8',bottom:'#9b8d7d',shoe:'#756655',bag:'#8fa18f',female:false,style:'swept'}
};
function make(T,{compatible=false}={}){
 const textures=new Map(),materials=new Map(),geometryCache=new WeakMap();
 const skin='#ffe4d4',N=compatible?20:32;
 function mat(c){if(!materials.has(c))materials.set(c,new T.MeshBasicMaterial({color:c,vertexColors:true}));return materials.get(c);}
 // Soft baked light is carried by geometry, identical on WebGL and CPU renderers.
 function sculpt(g){if(geometryCache.has(g))return geometryCache.get(g);const a=g.clone();a.computeVertexNormals();const n=a.attributes.normal,c=[],pos=a.attributes.position;for(let i=0;i<n.count;i++){const dot=n.getX(i)*-.32+n.getY(i)*.57+n.getZ(i)*.76;const light=.70+.30*Math.max(0,dot),rim=.045*Math.pow(Math.max(0,n.getY(i)),5);c.push(Math.min(1,light+rim),Math.min(1,light+rim),Math.min(1,light+rim));}a.setAttribute('color',new T.Float32BufferAttribute(c,3));geometryCache.set(g,a);return a;}
 function mesh(p,g,c,x=0,y=0,z=0,sx=1,sy=sx,sz=sx){const m=typeof c==='string'?mat(c):c,o=new T.Mesh(m.vertexColors?sculpt(g):g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o;}
 const ball=new T.SphereGeometry(1,N,compatible?14:22);
 const oval=(p,c,x,y,z,rx,ry=rx,rz=rx)=>mesh(p,ball,c,x,y,z,rx,ry,rz);
 function shape(p,c,rings,segs=N,pleats=0){const v=[],ix=[];for(let j=0;j<rings.length;j++)for(let i=0;i<=segs;i++){const t=i/segs*Math.PI*2,[y,x,z,shift=0]=rings[j],fold=1+pleats*Math.cos(t*12);v.push(Math.sin(t)*x*fold,y,Math.cos(t)*z*fold+shift);if(j&&i){const k=j*(segs+1)+i;ix.push(k,k-1,k-segs-1,k-1,k-segs-2,k-segs-1);}}for(const j of [0,rings.length-1]){const k=v.length/3;v.push(0,rings[j][0],rings[j][3]||0);for(let i=0;i<segs;i++)ix.push(k,j*(segs+1)+i,j*(segs+1)+i+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const m=mat(c).clone();m.side=T.DoubleSide;return mesh(p,g,m);}
 function tube(p,c,points,r=.008){return mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),12,r,6,false),c);}
 // Sculpted leaf volumes, an elliptical section swept down a curved guide.
 // The entire cross-section tapers to a rounded point; no flat ribbon backs.
 function lock(p,c,points,width,depth,twist=0){const path=new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),v=[],ix=[],steps=compatible?10:16,sides=10;
 for(let j=0;j<=steps;j++){const t=j/steps,at=path.getPoint(t),tangent=path.getTangent(t),side=new T.Vector3(1,0,0);side.addScaledVector(tangent,-side.dot(tangent)).normalize();const normal=new T.Vector3().crossVectors(side,tangent).normalize();if(normal.z<0)normal.negate();const fade=Math.max(.003,(.65+.45*Math.sin(t*Math.PI))*(1-t*t)),w=width*fade*.5,d=depth*fade;for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2,px=Math.cos(a)*w,pz=Math.sin(a)*d,cs=Math.cos(twist),sn=Math.sin(twist);const q=at.clone().addScaledVector(side,px*cs-pz*sn).addScaledVector(normal,px*sn+pz*cs);v.push(q.x,q.y,q.z);if(j&&i){const k=j*(sides+1)+i;ix.push(k,k-1,k-sides-1,k-1,k-sides-2,k-sides-1);}}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const material=mat(c).clone();material.side=T.DoubleSide;return mesh(p,g,material);}
 function texture(key,paint){if(!textures.has(key)){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.scale(2,2);paint(g);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.magFilter=t.minFilter=T.LinearFilter;textures.set(key,t);}return textures.get(key);}
 function eye(p,e,right){return texture(p.iris+e+right,g=>{g.lineCap='round';g.lineJoin='round';if(e==='smile'){g.strokeStyle='#554657';g.lineWidth=5;g.beginPath();g.moveTo(15,76);g.bezierCurveTo(36,45,77,42,111,72);g.stroke();return;}
 const flip=right?1:-1;g.translate(64,0);g.scale(flip,1);g.translate(-64,0);
 g.beginPath();g.moveTo(12,46);g.bezierCurveTo(34,23,84,23,110,42);g.bezierCurveTo(113,81,95,108,67,110);g.bezierCurveTo(36,110,19,91,12,46);g.closePath();g.save();g.clip();g.fillStyle='#fff9f9';g.fillRect(0,0,128,128);
 const iris=g.createLinearGradient(0,30,0,112);iris.addColorStop(0,'#493b61');iris.addColorStop(.5,p.iris);iris.addColorStop(1,'#e5c5ce');g.fillStyle=iris;g.beginPath();g.ellipse(65,71,30,40,0,0,Math.PI*2);g.fill();
 g.fillStyle='#4d3d62';g.beginPath();g.ellipse(65,64,12,23,0,0,Math.PI*2);g.fill();g.fillStyle='#fffefb';g.beginPath();g.ellipse(49,46,9,12,-.25,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(83,86,4,5,0,0,Math.PI*2);g.fill();g.restore();
 g.strokeStyle='#554657';g.lineWidth=p.female?6:5;g.beginPath();g.moveTo(11,46);g.bezierCurveTo(36,24,84,23,111,42);g.stroke();if(p.female){g.beginPath();g.moveTo(102,39);g.lineTo(115,31);g.stroke();}
 g.strokeStyle='#b8879c';g.lineWidth=1.8;g.beginPath();g.moveTo(37,103);g.quadraticCurveTo(66,115,88,103);g.stroke();});}
 function mouth(e){return texture('mouth'+e,g=>{g.lineCap='round';if(e==='smile'){g.fillStyle='#b86782';g.beginPath();g.moveTo(27,48);g.quadraticCurveTo(64,62,101,48);g.quadraticCurveTo(94,102,64,102);g.quadraticCurveTo(33,102,27,48);g.fill();g.fillStyle='#f3a8b4';g.beginPath();g.ellipse(64,91,20,9,0,0,Math.PI*2);g.fill();}else if(e==='surprise'){g.fillStyle='#b27688';g.beginPath();g.ellipse(64,65,14,24,0,0,Math.PI*2);g.fill();}else{g.strokeStyle='#af7987';g.lineWidth=9;g.beginPath();g.moveTo(38,62);g.quadraticCurveTo(64,77,90,62);g.stroke();}});}
 // Superelliptic front with a soft cheek/jaw taper; z remains continuous at the ears.
 function facePoint(theta,phi){const y=Math.cos(theta),r=Math.sin(theta),jaw=1-.11*Math.pow(Math.max(0,-y),1.4),x=r*Math.sin(phi)*.65*jaw;return [x,y*.575,Math.cos(phi)*r*.46*(Math.cos(phi)>0?1+.07*(1-y*y):1)];}
 function frontZ(x,y){const yy=y/.575,jaw=1-.11*Math.pow(Math.max(0,-yy),1.4);return .46*Math.sqrt(Math.max(.001,1-yy*yy-(x/(.65*jaw))**2))*(1+.07*(1-yy*yy));}
 function patch(p,x,y,w,h,t){const v=[],uv=[],ix=[],n=10;for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const a=x+(i/n-.5)*w,b=y+(j/n-.5)*h;v.push(a,b,frontZ(a,b)+.008);uv.push(i/n,j/n);if(i<n&&j<n){const k=j*(n+1)+i;ix.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();const o=mesh(p,g,new T.MeshBasicMaterial({map:t,transparent:true,alphaTest:.03,depthWrite:false,side:T.DoubleSide}));o.renderOrder=2;return o;}
 function build(kind,api){const p=profiles[kind];if(!p)throw Error('Unknown character '+kind);const root=new T.Group(),body=new T.Group(),head=new T.Group(),limbs=[],knees=[[],[]],outfits=[],arms=[[],[]],legs=[[],[]];root.add(body);body.add(head);head.position.y=1.62;head.scale.set(.88,1,1.08);
 const faceGeo=new T.SphereGeometry(1,N*1.5,N);{const a=faceGeo.attributes.position;for(let i=0;i<a.count;i++){const y=a.getY(i),theta=Math.acos(Math.max(-1,Math.min(1,y))),phi=Math.atan2(a.getX(i),a.getZ(i));a.setXYZ(i,...facePoint(theta,phi));}faceGeo.computeVertexNormals();}const face=mesh(head,faceGeo,skin);face.userData.part='face-volume';
 const neck=oval(body,skin,0,1.065,-.015,.095,.145,.085);neck.userData.part='neck';
 for(const s of [-1,1]){oval(head,skin,s*.61,-.05,-.025,.068,.09,.06);oval(head,'#eec1ba',s*.647,-.045,.004,.018,.045,.025);}
 // A single continuous cap grows from the crown into the back silhouette.
 const hv=[],hi=[],rows=compatible?18:26,segs=compatible?36:52;const long=p.style==='long',bob=p.style==='bob';
 for(let j=0;j<=rows;j++)for(let i=0;i<=segs;i++){const phi=i/segs*Math.PI*2,gate=Math.max(0,Math.min(1,(.82-Math.cos(phi))/.80)),coverage=gate*gate*(3-2*gate),end=1.25+coverage*(long?1.25:bob?1.12:.85),th=.012+j/rows*end,radius=th>1.4?Math.max(Math.sin(th),.98-(th-1.4)*.12):Math.sin(th);let x=radius*Math.sin(phi)*.683,y=Math.cos(th)*.628,z=radius*Math.cos(phi)*.527-.028;const hem=j/rows;if(hem>.68&&coverage>.4){const q=(hem-.68)/.32;y-=(long?.27:bob?.025:0)*q;z-=.015*q;}hv.push(x,y,z);if(j&&i){const k=j*(segs+1)+i;hi.push(k,k-1,k-segs-1,k-1,k-segs-2,k-segs-1);}}
 const hg=new T.BufferGeometry();hg.setAttribute('position',new T.Float32BufferAttribute(hv,3));hg.setIndex(hi);hg.computeVertexNormals();const hm=mat(p.hair).clone();hm.side=T.DoubleSide;mesh(head,hg,hm);
 // Separate layered forelocks have a convex front, hollow-free backs and flowing tips.
 const bangs=p.style==='short'?[[-.53,-.19,.24],[-.38,-.055,.25],[-.20,.045,.28],[.00,-.07,.29],[.20,.06,.29],[.38,-.03,.27],[.54,-.19,.22]]:p.style==='swept'?[[-.53,-.18,.24],[-.35,-.07,.28],[-.15,.025,.30],[.07,.04,.31],[.28,-.045,.30],[.47,-.15,.27]]:[[-.53,-.19,.22],[-.39,-.02,.23],[-.25,.015,.24],[-.09,-.01,.24],[.07,.01,.24],[.23,-.015,.24],[.39,-.045,.23],[.53,-.17,.22]];
 const hairTint='#'+new T.Color(p.hair).lerp(new T.Color(p.hairLight),.28).getHexString();
 bangs.forEach(([x,end,w],i)=>{const tipx=x+(p.style==='swept'?.09:i%2?.025:-.015);lock(head,i%3===1?hairTint:p.hair,[[x*.35,.57,.17],[x*.71,.34,.475],[x,.12,.50-Math.abs(x)*.16],[tipx,end,.445-Math.abs(x)*.24]],w,.033);});
 for(const s of [-1,1]){lock(head,p.hair,[[s*.47,.38,.18],[s*.63,.03,.22],[s*.61,long?-.64:bob?-.43:-.23,.13],[s*(long?.52:.57),long?-.83:bob?-.48:-.28,.085]],long?.27:.24,.07,s*-.15);}
 // Back locks overlap the cap rather than forming a second helmet seam.
 for(let i=0;i<7;i++){const a=1.37+i/6*(Math.PI*2-2.74),s=Math.sin(a),c=Math.cos(a),end=long?-.78:bob?-.44:-.27;lock(head,i%3===0?hairTint:p.hair,[[s*.42,.47,c*.34-.03],[s*.665,.05,c*.515-.03],[s*.62,end+.12,c*.46-.045],[s*.55,end,c*.41-.055]],long?.30:.28,.035);}
 const eyes=[patch(head,-.242,-.125,.35,.32,eye(p,'normal',false)),patch(head,.242,-.125,.35,.32,eye(p,'normal',true))],mouthMesh=patch(head,0,-.345,.17,.10,mouth('normal'));
 // Small geometry nose, brows and diffuse painted blush sit on the same head volume.
 oval(head,'#ffe6d7',0,-.245,frontZ(0,-.245)-.006,.025,.020,.020);
 for(const s of [-1,1]){tube(head,p.hair,[[s*.15,.083,frontZ(s*.15,.083)+.008],[s*.24,.105,frontZ(s*.24,.105)+.008],[s*.33,.08,frontZ(s*.33,.08)+.008]],.008);const blush=texture('blush',g=>{const gr=g.createRadialGradient(64,64,0,64,64,53);gr.addColorStop(0,'#e99ba366');gr.addColorStop(1,'#e99ba300');g.fillStyle=gr;g.fillRect(0,0,128,128);});patch(head,s*.398,-.275,.14,.075,blush);}
 const hats={base:new T.Group(),none:new T.Group(),cap:new T.Group(),straw:new T.Group()};Object.values(hats).forEach(h=>head.add(h));mesh(hats.cap,new T.SphereGeometry(1,24,12,0,Math.PI*2,0,Math.PI/2),'#7e98b7',0,.47,-.02,.72,.23,.55);oval(hats.cap,'#6e87a4',0,.465,.41,.45,.026,.22);shape(hats.straw,'#e2cc9d',[[.49,.77,.59],[.53,.77,.59],[.56,.48,.41],[.79,.38,.33],[.81,.08,.08]]);shape(hats.straw,p.trim,[[.57,.48,.41],[.62,.46,.40]]);
 for(let i=0;i<2;i++){const l=new T.Group();l.position.set((i?1:-1)*.14,.64,0);body.add(l);limbs.push(l);oval(l,skin,0,-.15,0,.081,.18,.081);}
 for(let i=0;i<2;i++){const a=new T.Group();a.position.set((i?1:-1)*.225,1.02,0);a.rotation.z=(i?1:-1)*.10;body.add(a);limbs.push(a);const hand=oval(a,skin,0,-.300,.014,.064,.070,.062);oval(a,skin,(i?-.047:.047),-.278,.047,.027,.038,.029);}
 const looks=['reference','casual','outdoor'];
 for(let li=0;li<3;li++){const ref=li===0,coat=ref?p.jacket:li===1?'#e5d5ce':'#92ad9b',trim=ref?p.trim:li===1?'#9b7f97':'#f2e2be',bottom=ref?p.bottom:li===1?'#73768d':'#637c77',skirt=p.female&&li!==2,o=new T.Group();body.add(o);outfits.push(o);
 // Compress only the upper garment; the skirt and articulated lower legs keep their shape.
 const upper=new T.Group();upper.position.y=.69-.61*(.47/.63);upper.scale.y=.47/.63;o.add(upper);
 shape(upper,coat,[[.61,.25,.155],[.65,.258,.17],[.91,.213,.157],[1.05,.212,.148],[1.13,.196,.136],[1.20,.155,.108],[1.24,.098,.083]]);
 // Layered collar triangles are gently convex, not a flat painted shirt.
 for(const s of [-1,1]){const c=new T.Group();c.position.set(s*.075,1.17,.145);c.rotation.z=s*-.35;upper.add(c);shape(c,ref?'#fff7e8':trim,[[-.075,.015,.008],[-.012,.073,.017],[.045,.046,.014]],12);}
 tube(upper,trim,[[0,1.105,.177],[0,.65,.179]],.006);
 if(p.female){for(const s of [-1,1]){const b=oval(upper,trim,s*.04,1.095,.188,.047,.026,.016);b.rotation.z=s*-.3;tube(upper,trim,[[s*.01,1.09,.19],[s*.035,1.02,.19],[s*.055,1.01,.19]],.010);}oval(upper,trim,0,1.095,.20,.017);}else for(const y of [.76,.9,1.04])oval(upper,trim,.005,y,.181,.009,.010,.007);
 if(skirt){shape(o,bottom,[[.47,.31,.20],[.50,.323,.208],[.68,.24,.155],[.74,.218,.148]],24,.035);shape(o,bottom,[[.465,.312,.202],[.485,.321,.208]],24,.035);}else shape(o,bottom,[[.63,.245,.15],[.73,.248,.165],[.76,.218,.15]]);
 if(li===2){oval(upper,p.bag,0,.94,-.23,.17,.22,.08);for(const s of [-1,1])tube(upper,p.bag,[[s*.16,.70,.15],[s*.20,1.12,.16],[s*.17,1.21,-.09],[s*.16,.96,-.23]],.014);}
 for(let i=0;i<2;i++){const a=new T.Group();limbs[2+i].add(a);arms[i].push(a);shape(a,coat,[[-.25,.070,.073],[-.225,.079,.079],[-.10,.079,.082],[-.035,.072,.075],[.008,.055,.058],[.035,.028,.031],[.042,.004,.005]]);shape(a,trim,[[-.25,.072,.075],[-.225,.080,.080]]);const l=new T.Group();limbs[i].add(l);legs[i].push(l);const lower=new T.Group();lower.position.y=-.31;l.add(lower);knees[i].push(lower);oval(lower,skin,0,-.10,0,.077,.12,.076);if(!skirt){shape(l,bottom,[[-.28,.099,.103],[-.04,.10,.10],[.04,.096,.096]]);if(li===1)shape(lower,bottom,[[-.20,.088,.09],[-.02,.095,.096],[.02,.095,.095]]);}if(skirt||li!==1)shape(lower,'#fff4e9',[[-.21,.076,.077],[-.12,.076,.077]]);oval(lower,p.shoe,0,-.247,.042,.091,.063,.146);oval(lower,'#e9dfd6',0,-.294,.044,.092,.014,.145);}
 }
 const shadow=api.shadow(0,0,.42,.27);root.add(shadow);
 root.userData={kind,name:p.name,body,head,limbs,knees,shadow,phase:0,model:'garden-sculpt-3d',proportions:'2-head',designRevision:'garden-13',look:'reference',hat:'base',expression:'normal',updateLook};
 function updateLook({look=root.userData.look,hat=root.userData.hat,expression=root.userData.expression}={}){const n=looks.indexOf(look);if(n<0)throw Error('Unknown outfit '+look);outfits.forEach((o,i)=>o.visible=i===n);[...arms,...legs].forEach(a=>a.forEach((o,i)=>o.visible=i===n));Object.entries(hats).forEach(([k,o])=>o.visible=k===hat);eyes.forEach((o,i)=>o.material.map=eye(p,expression==='smile'?'smile':'normal',i===1));mouthMesh.material.map=mouth(expression);Object.assign(root.userData,{look,hat,expression});}
 let shut=false;root.userData.animateFace=t=>{const c=(t+Object.keys(profiles).indexOf(kind)*640)%4700>4580;if(c===shut||root.userData.expression==='smile')return;shut=c;eyes.forEach((o,i)=>o.material.map=eye(p,c?'smile':'normal',i===1));};updateLook();return root;
 }
 return {build,profiles,disposeTextures(){textures.forEach(t=>t.dispose());textures.clear();}};
}
function animate(root,{time=0,moving=false,dash=false,reducedMotion=false,mode='idle',dt=.016}={}){const u=root.userData;if(!u.limbs)return;u.phase+=moving&&!reducedMotion?dt*(dash?13:8):0;const amp=moving&&!reducedMotion?(dash?.57:.37):0;for(let i=0;i<2;i++){const w=Math.sin(u.phase+i*Math.PI);u.limbs[i].rotation.x=w*amp;u.limbs[2+i].rotation.set(-w*amp*.65,0,(i?1:-1)*.10);u.knees[i].forEach(k=>k.rotation.x=Math.max(0,-w)*amp*.85);}u.body.position.y=moving&&!reducedMotion?Math.abs(Math.sin(u.phase))*.023:0;u.body.rotation.x=dash&&moving?.04:0;u.head.rotation.z=reducedMotion?0:Math.sin(time*.0013)*.009;u.animateFace(time);if(mode==='fish'||mode==='tool'){u.limbs[3].rotation.x=-1.05;u.limbs[2].rotation.x=-.6;}if(mode==='joy'){u.limbs[2].rotation.z=.7;u.limbs[3].rotation.z=-.7;}}
return {make,profiles,animate};
})();
