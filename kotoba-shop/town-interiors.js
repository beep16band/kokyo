// Cutaway interiors read the existing rectangles, inventory and furniture arrays.
// The legacy loop/input/editor still runs; only the final indoor picture is replaced.
const TownInterior={active:false,failed:false,key:'',root:null,labels:[],furniture:new Map(),products:[],builds:0};
function townInteriorRelease(){
 const I=TownInterior;if(!I.root)return;
 const shared=new Set(Town3D.shapes.values()),unique=new Set();
 I.root.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!shared.has(o.geometry))unique.add(o.geometry)});
 unique.forEach(g=>g.dispose());I.scene.remove(I.root);I.root=null;I.key='';I.frame='';I.furniture.clear();I.products=[];I.batches=[];I.player=null;I.customer=null;I.labels=[];
}
function townInteriorSignature(){return JSON.stringify([state.scene,state.avatar.kind,state.scene==='home'?[state.wallpaper,state.flooring,X.room,state.furniturePlaced.map(f=>[f.kind,f.x,f.y,f.rotation||0]),!!X.model.displayed,Object.values(X.clayRecords).map(r=>r.trophy||'')]:state.scene==='facility'?[state.facilityVisit.id,state.facilityVisit.id==='hobby'?X.model.parts.join(','):state.facilityVisit.id==='clay'?JSON.stringify(X.clayRecords):'']:[orders[state.ordersDone]?.customer||'モク']])}
function townInteriorBox(g,col,x,y,z,w,h,d){return town3DMesh(g,'box',col,x,y,z,w,h,d)}
function townInteriorFurniture(parent,kind,x,z,rotation=0){
 const g=new THREE.Group();g.position.set(x+.5,0,z+.5);g.rotation.y=rotation*Math.PI/2;g.userData.furnitureKind=kind;parent.add(g);
 const box=(col,a,b,c,w,h,d)=>townInteriorBox(g,col,a,b,c,w,h,d),wood='#b3946d',dark='#826d57';
 town3DMesh(g,'cylinder','#b3a48d',0,.069,0,.44,.005,.38);
 if(kind==='chair'){
  for(const a of [-.28,.28])for(const c of [-.25,.25])box(dark,a,.3,c,.07,.46,.07);
  box(wood,0,.54,0,.76,.12,.7);box(wood,0,.91,-.3,.74,.62,.09);
  for(const a of [-.22,0,.22])box('#dfd0b0',a,.93,-.245,.04,.35,.02);
 }else if(kind==='plant'){
  town3DMesh(g,'cylinder','#c78f78',0,.28,0,.25,.4,.25);town3DMesh(g,'cylinder','#dfd0b0',0,.49,0,.27,.06,.27);
  box('#7d9d6a',0,.7,0,.035,.42,.035);
  for(const [a,b,c]of[[-.16,.76,0],[.15,.88,.07],[0,1.05,-.08]])town3DMesh(g,'sphere','#8db183',a,b,c,.23,.19,.16);
 }else if(kind==='rug'){
  box('#c99aab',0,.09,0,.92,.035,.92);box('#e3c7aa',0,.112,0,.74,.012,.74);box('#d8a8b5',0,.122,0,.57,.008,.57);
 }else if(kind==='lamp'){
  town3DMesh(g,'cylinder',dark,0,.12,0,.24,.12,.24);town3DMesh(g,'cylinder',dark,0,.62,0,.035,.95,.035);
  const shade=town3DMesh(g,'cone','#ffe3a0',0,1.19,0,.31,.39,.31);shade.material=townSceneryLanternMaterial();
 }else if(kind==='table'){
  for(const a of [-.23,.23])for(const c of [-.23,.23])box(dark,a,.37,c,.065,.6,.065);
  town3DMesh(g,'cylinder',wood,0,.73,0,.45,.12,.45);town3DMesh(g,'cylinder','#dfd0b0',0,.797,0,.41,.012,.41);
 }else if(kind==='bookshelf'){
  box(dark,0,.81,-.2,.9,1.5,.12);for(const a of [-.42,.42])box(wood,a,.81,0,.08,1.5,.58);
  for(const y of [.12,.65,1.2,1.55])box(wood,0,y,0,.9,.07,.58);
  for(const y of [.37,.94])for(let n=0;n<5;n++)box(['#82a8b4','#d8a8b5','#e5c785'][n%3],-.3+n*.15,y,.12,.1,.38,.3);
 }else if(kind==='cushion')town3DMesh(g,'sphere','#b4a7bc',0,.24,0,.42,.18,.4);
 else if(kind==='clock'){
  box(wood,0,.25,0,.65,.36,.35);const face=town3DMesh(g,'cylinder','#fff2ce',0,.7,.04,.31,.06,.31);face.rotation.x=Math.PI/2;
  box(dark,0,.78,.085,.025,.18,.025);box(dark,.08,.7,.085,.18,.025,.025);
 }
 return g;
}
function townInteriorWindows(parent){
 for(const x of [4,16]){
  townInteriorBox(parent,'#b3946d',x,1.8,.67,2.8,1.8,.12);
  townInteriorBox(parent,'#a2c6c3',x,1.8,.75,2.5,1.52,.06);
  townInteriorBox(parent,'#fff2ce',x,1.8,.8,.08,1.55,.025);townInteriorBox(parent,'#fff2ce',x,1.8,.8,2.5,.08,.025);
  for(const dx of [-1.4,1.4])townInteriorBox(parent,'#e3c7aa',x+dx,1.78,.83,.18,1.93,.09);
 }
}
function townInteriorHome(parent){
 const I=TownInterior,b=homeBed,cx=b.x+b.w/2,cz=b.y+b.h/2;
 townInteriorBox(parent,'#b3946d',cx,.39,cz,b.w-.12,.65,b.h-.12);
 townInteriorBox(parent,'#fff2ce',cx,.77,cz,b.w-.22,.14,b.h-.22);
 townInteriorBox(parent,'#82a8b4',cx,.87,cz+.45,b.w-.24,.1,b.h-1.15);
 townInteriorBox(parent,'#826d57',cx,.87,b.y+.1,b.w-.1,1.6,.13);
 for(const dx of [-.95,.95])town3DMesh(parent,'sphere','#fff2ce',cx+dx,.94,b.y+.64,.8,.14,.42);
 homeFurniture.forEach((r,i)=>{
  const x=r.x+r.w/2,z=r.y+r.h/2;
  townInteriorBox(parent,'#b3946d',x,.72,z,r.w-.12,1.3,r.h-.12);
  townInteriorBox(parent,'#dfd0b0',x,1.4,z,r.w, .1,r.h);
  if(i===0){for(const y of [.42,.93]){townInteriorBox(parent,'#dfd0b0',x,y,r.y+r.h-.025,r.w-.35,.35,.035);town3DMesh(parent,'sphere','#826d57',x,y,r.y+r.h+.02,.06,.045,.035);}}
  else for(let n=0;n<5;n++)townInteriorBox(parent,['#82a8b4','#d8a8b5','#e5c785'][n%3],r.x+.3+n*.34,1.61,z,.2,.33,.6);
 });
 if(X.model.displayed){const r=homeFurniture[0],x=r.x+r.w/2,z=r.y+r.h/2;
  const model=new THREE.Group();model.position.set(x,1.46,z);model.userData.displayModel=true;parent.add(model);
  townInteriorBox(model,'#82a8b4',0,.16,0,1.05,.25,.52);townInteriorBox(model,'#e5c785',0,.45,0,.62,.38,.48);
  for(const a of [-.35,.35])for(const c of [-.25,.25])town3DMesh(model,'sphere','#826d57',a,.06,c,.11,.11,.06);
 }
 const trophies=Object.values(X.clayRecords).filter(r=>r.trophy).slice(0,4),r=homeFurniture[1];
 trophies.forEach((record,i)=>{const x=r.x+.3+i*.43,z=r.y+.5,col=record.trophy==='金'?'#e5c785':record.trophy==='銀'?'#b1baa9':'#c78f78',g=new THREE.Group();g.position.set(x,1.46,z);g.userData.displayTrophy=true;parent.add(g);townInteriorBox(g,'#826d57',0,.06,0,.3,.1,.3);townInteriorBox(g,col,0,.25,0,.05,.3,.05);town3DMesh(g,'sphere',col,0,.45,0,.18,.17,.14);});
 state.furniturePlaced.forEach((f,i)=>I.furniture.set(i,townInteriorFurniture(parent,f.kind,f.x,f.y,f.rotation||0)));
 I.labels.push({text:()=> 'ベッド・休む',x:cx,y:1.65,z:b.y+1});
}
function townInteriorShelfCount(index){return index<3?state.shelfStock[['bread','juice','apple'][index]]||0:(state.shelfStock.tea||0)+(state.shelfStock.cookie||0)+(state.shelfStock.jam||0)+X.listings.filter(l=>!l.sold).length}
function townInteriorShop(parent){
 const I=TownInterior;
 shopShelves.forEach((r,i)=>{
  const x=r.x+r.w/2,z=r.y+r.h/2;
  townInteriorBox(parent,'#826d57',x,1.05,r.y+.1,r.w-.1,1.95,.12);
  for(const dx of [-r.w/2+.08,r.w/2-.08])townInteriorBox(parent,'#b3946d',x+dx,1.05,z,.12,1.95,r.h-.1);
  for(const y of [.18,.88,1.56])townInteriorBox(parent,'#b3946d',x,y,z,r.w-.1,.09,r.h-.1);
  for(let n=0;n<8;n++){
   const col=i===0?'#e5c785':i===1?'#83bfca':i===2?'#e9b1a0':'#a7bb91';
   const mesh=town3DMesh(parent,i===1?'cylinder':'sphere',col,r.x+.28+(n%4)*.47,n<4?.43:1.13,r.y+r.h-.15,i===1?.12:.19,i===1?.34:.14,i===1?.12:.16);
   I.products.push({mesh,shelf:i,slot:n});
  }
  I.labels.push({text:()=> (i<3?goods[['bread','juice','apple'][i]].name:'暮らしの品')+' '+(townInteriorShelfCount(i)>0?townInteriorShelfCount(i)+'個':'売切'),x,y:1.85,z:r.y+r.h+.1});
 });
 const r=shopCounter,x=r.x+r.w/2,z=r.y+r.h/2;
 townInteriorBox(parent,'#b3946d',x,.52,z,r.w-.08,.9,r.h-.08);townInteriorBox(parent,'#dfd0b0',x,1.03,z,r.w,.12,r.h);
 townInteriorBox(parent,'#826d57',x-.8,1.22,z,.62,.25,.46);townInteriorBox(parent,'#83bfca',x-.8,1.43,z-.05,.45,.28,.1);
 const name=orders[state.ordersDone]?.customer||'モク',n=npcs.find(n=>n.name===name);
 I.customer=town3DCharacter(n?.design||'animal',n?.color||'#9d684c',name);parent.add(I.customer);
 I.labels.push({text:()=> (orders[state.ordersDone]?.customer||'受付')+'・レジ',x:shopCustomer.x+.5,y:2.1,z:shopCustomer.y+.5});
}
function townInteriorBuild(){
 const I=TownInterior;townInteriorRelease();
 if(!I.scene){I.scene=new THREE.Scene();I.scene.background=new THREE.Color('#e3dbc9');I.scene.add(new THREE.HemisphereLight('#fff9e1','#a99d83',1.8));I.sun=new THREE.DirectionalLight('#fff1d3',1.45);I.sun.position.set(-5,14,12);I.scene.add(I.sun);I.camera=new THREE.OrthographicCamera(-12,12,7.2,-7.2,.1,80);I.camera.position.set(10,17,21);I.camera.lookAt(10,.55,6);I.camera.updateMatrixWorld(true);}
 I.root=new THREE.Group();I.scene.add(I.root);I.labels=[];I.furniture.clear();I.products=[];I.customer=null;
 const clay=state.scene==='facility'&&state.facilityVisit.id==='clay';
 const floor=clay?'#a7bb91':state.scene==='home'?FLOORS[state.flooring].color:'#d9c5a2',wall=state.scene==='home'&&state.wallpaper!=='cream'?WALLPAPERS[state.wallpaper].color:state.scene==='facility'&&state.facilityVisit.id==='school'?'#d8e3ce':'#f3dfb7';
 const tones=[floor,'#'+new THREE.Color(floor).offsetHSL(0,0,.025).getHexString()],boards=[[],[]];
 for(let y=1;y<=10;y++)for(let x=1;x<=18;x++)boards[(x+y)%2].push([x+.5,.02,y+.5,.98,.08,.98]);
 boards.forEach((tr,i)=>town3DInstances('box',tones[i],tr,I.root));
 if(!clay)townInteriorBox(I.root,wall,10,1.35,.5,19,2.7,.2);
 for(const x of [.5,19.5])townInteriorBox(I.root,wall,x,.45,6,.2,.8,11.2);
 townInteriorBox(I.root,'#b3946d',10,.2,.65,19,.24,.12);
 townInteriorBox(I.root,'#826d57',10,.04,11.2,19.2,.16,.28);
 if(!clay)townInteriorWindows(I.root);
 townInteriorBox(I.root,'#c99aab',10.5,.08,10.5,.92,.04,.75);
 if(state.scene==='home')townInteriorHome(I.root);else if(state.scene==='facility')townFacilityBuild3D(I.root);else townInteriorShop(I.root);
 I.player=town3DCharacter(state.avatar.kind,state.avatar.kind==='girl'?'#dc9d8e':'#7fa6b5');I.player.userData.playerAvatar=true;I.root.add(I.player);
 I.labels.push({text:()=> '出口 ↓',x:10.5,y:.25,z:10.7});
 I.batches=town3DBatch(I.root,true);I.key=townInteriorSignature();I.frame='';I.builds++;
}
function townInteriorDraw(now){
 const I=TownInterior,V=Town3D;if(I.failed||V.failed||!V.ready||editorOpen||!['home','shop','facility'].includes(state.scene))return false;
 try{
  const signature=townInteriorSignature();if(signature!==I.key)townInteriorBuild();
  const aspect=c.width/c.height,h=Math.max(14.4,21/aspect),w=h*aspect;
  if(I.width!==c.width||I.height!==c.height){Object.assign(I.camera,{left:-w/2,right:w/2,top:h/2,bottom:-h/2});I.camera.updateProjectionMatrix();I.width=c.width;I.height=c.height;I.frame='';}
  if(!I.size)I.size=new THREE.Vector2();V.renderer.getSize(I.size);if(I.size.x!==c.width||I.size.y!==c.height)V.renderer.setSize(c.width,c.height,false);V.renderer.domElement.hidden=false;
  const evening=timePhase()==='夕方';I.scene.background.set(evening?'#d8c6b1':'#e3dbc9');I.sun.color.set(evening?'#ffdbac':'#fff1d3');townSceneryTime3D(evening);
  town3DAnimate(I.player,visualX,visualY,facing,!!walkStep,now);
  if(I.customer){const p=I.customer.userData.indoorSpot||shopCustomer;town3DAnimate(I.customer,p.x,p.y,'down',false,now);}
  for(const p of I.products)p.mesh.visible=p.slot<Math.min(8,townInteriorShelfCount(p.shelf));
  const stamp=signature+'|'+timePhase()+'|'+c.width+'x'+c.height+'|'+(state.scene==='shop'?JSON.stringify([state.shelfStock,X.listings.length,state.ordersDone]):'');
  if(I.frame!==stamp||!(menuOpen||setupOpen||choices.children.length)){
   I.root.updateMatrixWorld(true);for(const {batch,meshes}of I.batches){meshes.forEach((mesh,i)=>{let visible=mesh.visible;for(let p=mesh.parent;p&&p!==I.root;p=p.parent)if(!p.visible)visible=false;batch.setMatrixAt(i,visible?mesh.matrixWorld:V.hiddenMatrix)});batch.instanceMatrix.needsUpdate=true;}
   V.renderer.render(I.scene,I.camera);I.frame=stamp;V.frameArea=null;
  }
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.save();ctx.font='bold 12px KotobaSans,sans-serif';ctx.textAlign='center';
  for(const l of I.labels){const p=new THREE.Vector3(l.x,l.y,l.z).project(I.camera),x=(p.x+1)*c.width/2,y=(1-p.y)*c.height/2;ctx.lineWidth=3;ctx.strokeStyle='#fff2ce';ctx.strokeText(l.text(),x,y);ctx.fillStyle='#5c6751';ctx.fillText(l.text(),x,y);}
  ctx.restore();I.active=true;return true;
 }catch(e){I.failed=true;I.reason=e.message;I.active=false;V.renderer.domElement.hidden=true;return false;}
}
const drawBeforeTownInterior=draw;
draw=function(now=performance.now()){
 drawBeforeTownInterior(now);TownInterior.active=false;
 if(!townInteriorDraw(now)&&state.scene==='town'&&TownInterior.root)townInteriorRelease();
};
