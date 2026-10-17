/* Original procedural low-poly artwork. World coordinates and collisions remain in world.js.
 * Three.js is vendored locally. Failed/lost WebGL falls back to the existing Canvas renderer. */
const Town3D = { ready: false, failed: false, area: '', shapes: new Map(), materials: new Map(), actors: new Map(), labels: [], target: null };
state.avatar = state.avatar && ['boy','girl'].includes(state.avatar.kind) ? state.avatar : { kind: 'boy', selected: false };
function selectAvatar(kind) {
  if (!['boy','girl'].includes(kind)) return;
  state.avatar = { kind, selected: true }; Town3D.area = ''; save(false);
  tell((kind === 'boy' ? '青いリボンの男の子' : 'ピンクのリボンの女の子') + 'で暮らします。設定からいつでも変えられます。');
  renderChoices([['町へ',closeChoices]]);
}
function avatarMenu() { stopWorldInput(); tell('主人公を選ぼう。所持金・持ち物・進行はそのままです。'); renderChoices([['男の子：麦わら帽子・青いリボン・オーバーオール',()=>selectAvatar('boy')],['女の子：麦わら帽子・ピンクのリボン・コーラルの服',()=>selectAvatar('girl')],['戻る',closeChoices]]); }
function town3DMaterial(color) { if(!Town3D.materials.has(color)) Town3D.materials.set(color,new THREE.MeshStandardMaterial({color,roughness:1,flatShading:true})); return Town3D.materials.get(color); }
function town3DShape(type) { if(!Town3D.shapes.has(type)) Town3D.shapes.set(type,type==='sphere'?new THREE.SphereGeometry(1,10,7):type==='cone'?new THREE.ConeGeometry(1,1,5):type==='cylinder'?new THREE.CylinderGeometry(1,1,1,12):new THREE.BoxGeometry(1,1,1)); return Town3D.shapes.get(type); }
function town3DMesh(parent,type,color,x,y,z,sx,sy,sz) { const o=new THREE.Mesh(town3DShape(type),town3DMaterial(color)); o.position.set(x,y,z);o.scale.set(sx,sy,sz);parent.add(o);return o; }
function town3DCharacter(kind='boy',color='#79a4ae') {
  const group=new THREE.Group(), human=['boy','girl','galaxy','sakamoto','sakaguchi'].includes(kind), girl=kind==='girl'||kind==='sakamoto',teacher=kind==='galaxy',round=kind==='sakaguchi';
  const skin=human?'#edc5a3':color, shirt=teacher?'#e1b66b':round?'#a99d83':kind==='sakamoto'?'#b8afca':color;
  town3DMesh(group,'sphere',shirt,0,.73,0,teacher?.46:round?.42:.32,.42,.25);
  const leftLeg=town3DMesh(group,'cylinder','#637c85',-.15,.27,0,.105,.48,.11),rightLeg=town3DMesh(group,'cylinder','#637c85',.15,.27,0,.105,.48,.11);
  const shoes=[-.15,.15].map(x=>town3DMesh(group,'sphere','#826d57',x,.08,.08,.13,.09,.19));
  const leftArm=town3DMesh(group,'sphere',skin,teacher?-.48:-.36,.76,0,teacher?.16:.1,.3,.11),rightArm=town3DMesh(group,'sphere',skin,teacher?.48:.36,.76,0,teacher?.16:.1,.3,.11);
  const head=new THREE.Group();head.position.y=1.33;group.add(head);
  town3DMesh(head,'sphere',skin,0,0,0,.4,.37,.34);
  town3DMesh(head,'sphere',human?'#6d5848':'#b3a188',0,.2,-.04,.4,.22,.31);
  if(girl){for(const x of [-.3,.3])town3DMesh(head,'sphere','#6d5848',x,-.02,-.12,.13,.31,.17);}
  for(const x of [-.135,.135]){
    town3DMesh(head,'sphere','#364a46',x,0,.312,.026,.041,.021);
    town3DMesh(head,'sphere','#e4a79a',x*1.65,-.095,.29,.058,.026,.018);
  }
  town3DMesh(head,'sphere',teacher?'#fff4db':'#b7816b',0,-.15,.325,teacher?.16:.065,.026,.015);
  if(round){for(const x of [-.14,.14]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.092,.012,4,14),town3DMaterial('#5b6460'));ring.position.set(x,0,.35);head.add(ring);}town3DMesh(head,'box','#5b6460',0,0,.352,.09,.018,.016);}
  if(kind==='boy'||kind==='girl'){
    town3DMesh(head,'cylinder','#e8cd8b',0,.29,0,.55,.06,.46);town3DMesh(head,'sphere','#f0d795',0,.36,-.03,.36,.17,.32);
    town3DMesh(head,'cylinder',kind==='girl'?'#d79cb1':'#83b5cf',0,.33,-.02,.37,.08,.33);
    for(const x of [-.12,.12])town3DMesh(group,'box',kind==='girl'?'#f0c9bb':'#c7d9cc',x,.95,.23,.065,.25,.025);
    town3DMesh(group,'box',kind==='girl'?'#dba69d':'#779eaf',0,.77,.25,.34,.25,.04);
  } else if(!human){for(const x of [-.3,.3])town3DMesh(head,'sphere',skin,x,.28,0,.13,.2,.13);}
  const shadow=town3DMesh(group,'cylinder','#8ba582',0,.065,0,.34,.006,.24);
  group.userData={leftLeg,rightLeg,leftArm,rightArm,head,shoes,shadow}; return group;
}
function town3DBuilding(b,parent) {
  const group=new THREE.Group();group.position.set(b.x,0,b.y);parent.add(group);const w=b.w,h=b.h,blue=b.color==='blue';
  town3DMesh(group,'box','#dfd0b0',w/2,.12,h/2,w,.24,h);
  town3DMesh(group,'box',b.type==='school'?'#eee6cc':'#f3dfb7',w/2,1.45,h/2,w-.14,2.7,h-.14);
  for(const sign of [-1,1]){const roof=town3DMesh(group,'box',blue?'#82aaa6':'#c78f78',w/2,3.06,h/2+sign*h/4,w+.5,.2,h*.61);roof.rotation.x=sign*.42;}
  for(const xx of [.8,w-.8]){town3DMesh(group,'box','#a2c6c3',xx,1.5,h+.018,.75,.85,.045);town3DMesh(group,'box','#fff2ce',xx,1.5,h+.05,.045,.85,.05);town3DMesh(group,'box','#fff2ce',xx,1.5,h+.05,.75,.045,.05);town3DMesh(group,'box','#bf9973',xx,.95,h+.12,.95,.22,.3);for(const dx of [-.22,0,.22])town3DMesh(group,'sphere','#e9b1a0',xx+dx,1.14,h+.12,.13,.12,.13);}
  const doorX=Math.floor(w/2)+.5;town3DMesh(group,'box','#ae987a',doorX,.95,h+.03,.86,1.9,.06);town3DMesh(group,'box',blue?'#6c9690':'#ba8c69',doorX,.94,h+.07,.68,1.7,.05);town3DMesh(group,'sphere','#eed394',doorX+.24,.9,h+.13,.045,.045,.025);
  if(['ownShop','kuan','cafe','fishShop','hobby'].includes(b.type)){for(let i=0;i<6;i++)town3DMesh(group,'box',i%2?'#fff1ca':blue?'#89b3a5':'#d7a189',doorX-.85+i*.34,2.05,h+.3,.34,.16,.7);}
  Town3D.labels.push({text:b.name,x:b.x+w/2,y:3.8,z:b.y+h/2});
}
function town3DInstances(type,color,transforms,parent) {
  if(!transforms.length)return;
  const inst=new THREE.InstancedMesh(town3DShape(type),town3DMaterial(color),transforms.length),o=new THREE.Object3D();
  transforms.forEach((t,i)=>{o.position.set(t[0],t[1],t[2]);o.scale.set(t[3],t[4],t[5]);o.updateMatrix();inst.setMatrixAt(i,o.matrix)});parent.add(inst);return inst;
}
// Keep the original object hierarchy for animation, but draw repeated shapes together.
function town3DBatch(root,dynamic=false) {
  const groups=new Map(),shared=new Set(Town3D.shapes.values());root.updateMatrixWorld(true);
  root.traverse(mesh=>{
    if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.visible||!shared.has(mesh.geometry))return;
    const key=mesh.geometry.uuid+'|'+mesh.material.uuid;
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);
  });
  const batches=[];
  for(const meshes of groups.values()){
    if(meshes.length<2)continue;
    const first=meshes[0],batch=new THREE.InstancedMesh(first.geometry,first.material,meshes.length);
    meshes.forEach((mesh,i)=>{batch.setMatrixAt(i,mesh.matrixWorld);mesh.layers.set(1)});
    if(dynamic){batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);batch.frustumCulled=false;}
    else batch.computeBoundingSphere();
    root.add(batch);batches.push({batch,meshes});
  }
  return dynamic?batches:[];
}
function town3DReleaseWorld() {
  const V=Town3D;if(!V.world)return;
  const shared=new Set(V.shapes.values()),unique=new Set();
  V.world.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!shared.has(o.geometry))unique.add(o.geometry)});
  unique.forEach(g=>g.dispose());V.scene.remove(V.world);
}
function town3DRebuild() {
  const V=Town3D,m=maps[state.area];town3DReleaseWorld();
  V.world=new THREE.Group();V.scene.add(V.world);V.labels=[];V.actors.clear();
  const groups=Array.from({length:7},()=>[]),seasonName=season();
  const colors=[seasonName==='冬'?'#dde4d2':seasonName==='秋'?'#bac58a':seasonName==='夏'?'#90b47f':'#aac68a','#e6cfa8','#e2ddc0','#83bfca','#a78960','#c9a675','#b1baa9'];
  for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const id=m.tiles[y][x];groups[id].push([x+.5,id===3?-.1:0,y+.5,1,.12,1]);}
  groups.forEach((tr,i)=>town3DInstances('box',colors[i],tr,V.world));
  V.ripples=town3DInstances('cylinder','#b9d9d2',groups[3].filter((_,i)=>i%4===0).map(t=>[t[0],.005,t[2],.17,.01,.04]),V.world);
  const trunks=[],leaves=[],fruit=[],rocks=[];
  for(const t of m.trees){trunks.push([t.x+.5,.65,t.y+.5,.16,1.3,.16]);for(const [dx,dy,dz,r]of[[-.3,1.75,.05,.7],[.3,1.8,.05,.7],[0,2.2,0,.65]])leaves.push([t.x+.5+dx,dy,t.y+.5+dz,r,r*.86,r]);if(t.tile===18)fruit.push([t.x+.75,1.85,t.y+1,.12,.13,.12]);}
  town3DInstances('cylinder','#a98766',trunks,V.world);V.leaves=town3DInstances('sphere',seasonName==='冬'?'#c7d4b9':seasonName==='秋'?'#c9b47b':'#8db183',leaves,V.world);town3DInstances('sphere','#e5b09a',fruit,V.world);
  town3DInstances('cylinder','#91ac7d',m.trees.map(t=>[t.x+.65,.065,t.y+.7,.75,.01,.5]),V.world);
  for(const r of m.rocks)rocks.push([r.x+.5,.22,r.y+.5,.45,.35,.36]);town3DInstances('sphere','#a8b2a3',rocks,V.world);
  for(const b of m.buildings)town3DBuilding(b,V.world);
  for(const f of m.fences||[]){town3DMesh(V.world,'box','#d2b28b',f.x+.5,.55,f.y+.5,f.vertical?.12:1,.12,f.vertical?1:.12);town3DMesh(V.world,'box','#ead1a1',f.x+.5,.35,f.y+.5,.13,.8,.13);}
  for(const p of m.pois){if(p.type==='discover'&&state.explore.found[p.id])continue;
    if(['fish','lakeFish'].includes(p.type))town3DMesh(V.world,'cylinder','#eeddb0',p.x+.5,.15,p.y+.5,.32,.2,.32);
    else if(p.type==='flowers'){for(let i=0;i<5;i++)town3DMesh(V.world,'sphere',i%2?'#edb3ae':'#f1dfab',p.x+.2+i*.16,.22,p.y+.4+(i%2)*.25,.12,.12,.12);}
    else if(p.type==='discover')town3DMesh(V.world,'box','#ffedba',p.x+.5,.3,p.y+.5,.45,.22,.35);
    else{town3DMesh(V.world,'box','#b3946d',p.x+.5,.45,p.y+.5,.12,.9,.12);town3DMesh(V.world,'box','#eddbb5',p.x+.5,.95,p.y+.5,.75,.5,.14);}
    if(!['discover','flowers'].includes(p.type))V.labels.push({text:p.name,x:p.x+.5,y:1.7,z:p.y+.5,near:true});
  }
  const player=town3DCharacter(state.avatar.kind,state.avatar.kind==='girl'?'#dc9d8e':'#7fa6b5');V.world.add(player);V.player=player;
  for(const n of npcs){if(worldNpcConfig[n.name]?.area!==state.area)continue;const k=n.design||'animal',actor=town3DCharacter(k,n.color);V.world.add(actor);V.actors.set(n.name,actor);}
  V.bugs=[];for(let i=0;i<8;i++){const group=new THREE.Group();town3DMesh(group,'sphere','#c99a75',0,0,0,.1,.13,.12);for(const x of [-.1,.1])town3DMesh(group,'sphere','#f0dba0',x,0,0,.15,.04,.15);V.world.add(group);V.bugs.push(group);}
  V.tool=new THREE.Group();town3DMesh(V.tool,'cylinder','#a68a68',0,.5,0,.025,1,.025);const ring=new THREE.Mesh(new THREE.TorusGeometry(.25,.025,4,16),town3DMaterial('#eee4c7'));ring.position.y=1;V.tool.add(ring);V.world.add(V.tool);
  V.bobber=town3DMesh(V.world,'sphere','#ebad8b',0,0,0,.08,.08,.08);
  V.crops=[];if(state.area==='farm')for(let i=0;i<FARM_PLOTS.length;i++){const p=FARM_PLOTS[i];town3DMesh(V.world,'box','#aa8b64',p.x+.5,.1,p.y+.5,.9,.1,.9);const plant=town3DMesh(V.world,'sphere','#7f9e63',p.x+.5,.35,p.y+.5,.25,.3,.25);V.crops.push(plant);}
  if(state.area==='mountain'||state.area==='cave')for(let i=0;i<4;i++)town3DMesh(V.world,'cone',i%2?'#a1ae99':'#b8c0a9',9+i*10,1.5,-2,5,6,4);
  if(state.area==='town'){const decorations=Object.keys(state.expansion?.preparations||{}),colors={cooking:'#d7a98b',flowers:'#e6b0c5',model:'#9fbcc8',language:'#ddc284',sports:'#98b089',shopping:'#b7a5c2'};decorations.forEach((key,i)=>{const x=20+i*1.5,z=18;town3DMesh(V.world,'cylinder','#b49c75',x,.8,z,.035,1.6,.035);town3DMesh(V.world,key==='flowers'?'sphere':'box',colors[key],x+.18,1.4,z,key==='model'?.55:.42,key==='language'?.6:.3,key==='flowers'?.24:.04);});}
  V.batches=town3DBatch(V.world,true);
  V.area=state.area+'|'+seasonName+'|'+state.avatar.kind;V.target=null;
}
function town3DAnimate(actor,x,z,dir,moving,now,mode='idle') {
  actor.position.set(x+.5,0,z+.5);actor.rotation.y={down:0,up:Math.PI,left:-Math.PI/2,right:Math.PI/2}[dir]||0;
  const u=actor.userData,t=state.settings.reducedMotion?0:now/(dashHeld||state.settings.dashMode?75:110),walk=moving?Math.sin(t)*.55:0;
  u.leftLeg.rotation.x=walk;u.rightLeg.rotation.x=-walk;u.leftArm.rotation.x=-walk*.7;u.rightArm.rotation.x=walk*.7;
  u.shoes[0].position.z=.08+walk*.2;u.shoes[1].position.z=.08-walk*.2;u.shoes[0].position.y=.08+Math.max(0,walk)*.1;u.shoes[1].position.y=.08+Math.max(0,-walk)*.1;
  u.head.rotation.x=mode==='surprise'?-.12:0;
  if(mode==='fish'||mode==='tool'){u.rightArm.rotation.x=-1.1;u.leftArm.rotation.x=-.65;}
  if(mode==='joy'){u.leftArm.rotation.z=.8;u.rightArm.rotation.z=-.8;actor.position.y=state.settings.reducedMotion?0:Math.abs(Math.sin(now/150))*.15;}
  else{u.leftArm.rotation.z=0;u.rightArm.rotation.z=0;}
  if(mode==='surprise'){u.leftArm.rotation.x=-.8;u.rightArm.rotation.x=-.8;}
  u.head.rotation.z=state.settings.reducedMotion?0:Math.sin(now/1500)*.025;
}
function town3DDraw(now,dt) {
  const V=Town3D;if(V.failed||!V.ready)return false;
  if(V.area!==state.area+'|'+season()+'|'+state.avatar.kind)town3DRebuild();
  V.renderer.domElement.hidden=false;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);
  const m=maps[state.area],tx=Math.max(9,Math.min(m.w-9,visualX+.5)),tz=Math.max(6,Math.min(m.h-6,visualY+.5));
  if(!V.target)V.target=new THREE.Vector3(tx,0,tz);else V.target.lerp(new THREE.Vector3(tx,0,tz),state.settings.reducedMotion?1:1-Math.exp(-dt*8));
  V.camera.position.set(V.target.x,19,V.target.z+15);V.camera.lookAt(V.target.x,0,V.target.z);
  const evening=timePhase()==='夕方';V.scene.background.set(evening?'#e7cfb2':'#dfebdd');V.sun.color.set(evening?'#ffdbac':'#fff3d6');
  town3DAnimate(V.player,visualX,visualY,facing,!!walkStep,now,mini?.action?(mini.phase==='land'?'joy':mini.phase==='bite'?'surprise':'fish'):netSwing?'tool':'idle');
  for(let i=0;i<(V.crops||[]).length;i++){const plant=V.crops[i],p=state.farm[i];plant.visible=!!p;if(p){const size=plotReady(p)?.34:.18;plant.scale.set(size,size*1.25,size);}}
  for(const n of npcs){const actor=V.actors.get(n.name);if(!actor)continue;town3DAnimate(actor,n.vx,n.vy,n.face,!!worldNpcState[n.name]?.step,now);}
  if(V.leaves)V.leaves.position.x=state.settings.reducedMotion?0:Math.sin(now/3000)*.025;if(V.ripples)V.ripples.position.y=state.settings.reducedMotion?0:Math.sin(now/1100)*.012;
  for(let i=0;i<V.bugs.length;i++){const bug=fieldWorld.bugs[i],obj=V.bugs[i];obj.visible=!!bug;if(bug){obj.position.set(bug.x+.5,.5+(state.settings.reducedMotion?0:Math.sin(now/150+bug.phase)*.08),bug.y+.5);obj.rotation.y=state.settings.reducedMotion?0:now/700;}}
  V.tool.visible=!!netSwing||!!mini?.action;
  if(V.tool.visible){const a={right:Math.PI/2,left:-Math.PI/2,up:Math.PI,down:0}[facing];V.tool.position.set(visualX+.5+Math.sin(a)*.35,1,visualY+.5+Math.cos(a)*.35);V.tool.rotation.set(.8,a,netSwing?Math.sin((now-netSwing.start)/100)*.6:0);}
  V.bobber.visible=!!mini?.action;if(V.bobber.visible)V.bobber.position.set(mini.target.x+.5,mini.phase==='bite'?-.05:.1,mini.target.y+.5);
  if(V.width!==c.width||V.height!==c.height){V.width=c.width;V.height=c.height;V.renderer.setSize(c.width,c.height,false);const h=innerWidth<500?15:18,w=h*c.width/c.height;Object.assign(V.camera,{left:-w/2,right:w/2,top:h/2,bottom:-h/2});V.camera.updateProjectionMatrix();}
  if(!(V.frameArea===V.area&&(menuOpen||setupOpen||choices.children.length))){
    V.world.updateMatrixWorld(true);
    for(const {batch,meshes} of V.batches){meshes.forEach((mesh,i)=>{
      // Hidden plants/bugs/tools retain their animation hierarchy; hide the corresponding instance too.
      let visible=true;for(let p=mesh.parent;p&&p!==V.world;p=p.parent)if(!p.visible)visible=false;
      if(visible&&mesh.visible)batch.setMatrixAt(i,mesh.matrixWorld);else batch.setMatrixAt(i,V.hiddenMatrix);
    });batch.instanceMatrix.needsUpdate=true;}
    V.renderer.render(V.scene,V.camera);V.frameArea=V.area;
  }
  ctx.save();ctx.font='bold 12px KotobaSans,sans-serif';ctx.textAlign='center';
  const labels=[...V.labels,...npcs.filter(n=>V.actors.has(n.name)).map(n=>({text:n.name,x:n.vx+.5,y:2.1,z:n.vy+.5,near:true}))];
  for(const l of labels){if(l.near&&Math.hypot(l.x-visualX,l.z-visualY)>5)continue;const p=new THREE.Vector3(l.x,l.y,l.z).project(V.camera);if(Math.abs(p.x)>1||Math.abs(p.y)>1)continue;const x=(p.x+1)*c.width/2,y=(1-p.y)*c.height/2;ctx.lineWidth=3;ctx.strokeStyle='#fff3d5';ctx.strokeText(l.text,x,y);ctx.fillStyle='#546b58';ctx.fillText(l.text,x,y);}
  ctx.restore();return true;
}
function initTown3D() {
  try {
    if(typeof THREE==='undefined')throw Error('3D library unavailable');
    const V=Town3D;V.hiddenMatrix=new THREE.Matrix4().makeScale(0,0,0);V.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});V.renderer.setPixelRatio(1);V.renderer.outputColorSpace=THREE.SRGBColorSpace;V.renderer.setClearColor('#e3ebd7');
    const el=V.renderer.domElement;el.id='town3D';el.setAttribute('aria-hidden','true');c.before(el);
    V.scene=new THREE.Scene();V.scene.background=new THREE.Color('#e3ebd7');V.camera=new THREE.OrthographicCamera(-15,15,9,-9,.1,100);
    V.scene.add(new THREE.HemisphereLight('#fff9e1','#9aa890',1.7));V.sun=new THREE.DirectionalLight('#fff1d3',1.6);V.sun.position.set(-12,25,12);V.scene.add(V.sun);
    el.addEventListener('webglcontextlost',e=>{e.preventDefault();V.failed=true;el.hidden=true;c.style.background='#a5c985';});V.ready=true;
  }catch(e){Town3D.failed=true;Town3D.reason=e.message;}
}
const town3DStyle=document.createElement('style');town3DStyle.textContent='#town3D{position:absolute;top:0;left:0;width:100%;height:auto!important;max-height:none;aspect-ratio:5/3;border:0;border-radius:0;box-shadow:none;pointer-events:none;z-index:0}canvas#game{position:relative;z-index:1;background:transparent!important}#worldHud{z-index:4}@media(max-width:800px),(pointer:coarse){#town3D{aspect-ratio:4/3}}';document.head.append(town3DStyle);
// Touch-first devices start in the proven lightweight renderer. 3D remains selectable.
if(typeof state.settings.force2D!=='boolean'&&matchMedia('(pointer:coarse)').matches)state.settings.force2D=true;
if(!state.settings.force2D)initTown3D();else Town3D.failed=true;
const drawOutdoorBefore3D=drawOutdoor;drawOutdoor=function(now,dt){if(!town3DDraw(now,dt))drawOutdoorBefore3D(now,dt)};
const drawBefore3D=draw;draw=function(now){if(Town3D.renderer)Town3D.renderer.domElement.hidden=state.scene!=='town'||Town3D.failed;drawBefore3D(now)};
// WASD translates to the existing direction path, including key-up and touch behavior.
const townWASD={w:'ArrowUp',a:'ArrowLeft',s:'ArrowDown',d:'ArrowRight'};
window.addEventListener('keydown',e=>{const key=townWASD[e.key.toLowerCase()];if(!key||e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,textarea,select,[contenteditable="true"]')||setupOpen||menuOpen||editorOpen||choices.children.length||mini)return;e.preventDefault();e.stopImmediatePropagation();dashHeld=e.shiftKey;if(!walkHeld.has(key)){walkHeld.add(key);if(!walkStep)attemptStep(...movesWorld[key])}},true);
window.addEventListener('keyup',e=>{if(townWASD[e.key.toLowerCase()])walkHeld.delete(townWASD[e.key.toLowerCase()])},true);
const settingsBefore3D=settingsCategory;settingsCategory=function(){settingsBefore3D();const box=document.getElementById('menuContent');box.insertBefore(menuItem('主人公を選ぶ','♧',avatarMenu),box.lastElementChild);box.insertBefore(menuItem('描画：'+(state.settings.force2D?'2D':'3D優先'),'◇',()=>{state.settings.force2D=!state.settings.force2D;save(false);location.reload()}),box.lastElementChild);};
if(state.settings.force2D){Town3D.failed=true;if(Town3D.renderer)Town3D.renderer.domElement.hidden=true;}
// Matching lightweight character artwork for touch devices and WebGL recovery.
const characterBeforeTownAvatars=character;
character=function(x,y,color,ears=false,kind='human',phase=0,dir='down'){
  const resident=kind==='human'?null:TOWN_DATA.residents.find(r=>r.color===color);
  if(kind!=='human'&&!resident){characterBeforeTownAvatars(x,y,color,ears,kind,phase,dir);return;}
  const design=resident?.design||state.avatar.kind,id=resident?.id||'player',step=resident?worldNpcState[resident.name]?.step:walkStep;
  const f=step&&!state.settings.reducedMotion?Math.floor(phase/90)%4:0,back=dir==='up',side=dir==='left'?-2:dir==='right'?2:0;
  const art=cozyStamp('town-avatar-'+id+'-'+design+'-'+dir+'-'+f,64,76,g=>{
    const muscle=design==='galaxy',round=design==='sakaguchi',girl=design==='girl',humanSkin='#edc8a8';
    const shirt=resident?.color||(girl?'#dca191':'#83aebd');
    const stride=[0,2,0,-2][f];
    cozyRound(g,23,55,7,13+stride,3,'#77949c');cozyRound(g,34,55,7,13-stride,3,'#77949c');
    cozyOval(g,26,69+stride,5,2.5,'#8d775c');cozyOval(g,38,69-stride,5,2.5,'#8d775c');
    cozyRound(g,muscle?12:round?16:19,34,muscle?40:round?33:26,27,10,cozyGrad(g,0,34,27,shirt,'#8ba69c'));
    cozyOval(g,muscle?11:18,47,muscle?7:4,10,humanSkin);cozyOval(g,muscle?53:46,47,muscle?7:4,10,humanSkin);
    if(design==='boy'||girl){for(const xx of [25,37])cozyRound(g,xx,35,3,13,1,'#eee3c0');cozyRound(g,25,44,15,14,2,shirt);}
    cozyOval(g,32,25,18,17,cozyGrad(g,0,8,34,'#f2d6b4',humanSkin));
    cozyOval(g,32,13,18,8,'#79634f');if(back)cozyOval(g,32,24,17,13,'#79634f');
    if(girl||design==='sakamoto'){cozyOval(g,17,24,4,12,'#79634f');cozyOval(g,47,24,4,12,'#79634f');}
    if(design==='boy'||girl){cozyOval(g,32,11,25,5,'#e1c78c');cozyOval(g,32,6,17,8,'#edd69b');cozyRound(g,16,9,32,4,2,girl?'#d6a0b3':'#8ab7ce');}
    if(!back){for(const xx of [25+side,39+side])cozyOval(g,xx,24,1.8,2.4,'#47574e');
      if(round){g.strokeStyle='#646b62';g.lineWidth=1.3;for(const xx of [25+side,39+side]){g.beginPath();g.arc(xx,24,5,0,7);g.stroke();}g.beginPath();g.moveTo(30+side,24);g.lineTo(34+side,24);g.stroke();}
      cozyOval(g,21+side,31,3,1.5,'#dda79688');cozyOval(g,43+side,31,3,1.5,'#dda79688');
      cozyRound(g,muscle?25:30,33,muscle?14:5,muscle?5:2,2,muscle?'#fff4d3':'#b0846a');}
  });
  cozyShadow(ctx,x*T+16,y*T+29,12,3.5);ctx.drawImage(art,x*T-16,y*T-42);
};
