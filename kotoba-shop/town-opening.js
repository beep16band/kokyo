/* Original 3D arrival cinematic. The player controls the reading pace; no external assets. */
'use strict';
window.TownOpening=(()=>{
 const api={version:1,active:false};
 function script(name,island){return[
  {scene:'sky',silent:true,auto:2600},
  {scene:'sky',who:name,text:'……空が、こんなに広かったなんて。'},
  {scene:'sky',who:name,text:'都会の学校では、うまく息ができなかった。\n少しだけ、あの場所から離れたかった。'},
  {scene:'boat',who:name,text:'だれもいない島なら、自分の速さで暮らせる。\nそう思って、この船に乗った。'},
  {scene:'boat',who:'船長',text:'風が気持ちいいだろう。\nもうすぐ、島が見えてくるよ。'},
  {scene:'approach',who:name,text:'海の向こうに、小さな緑が見えてきた。',travel:8000},
  {scene:'dock',who:'船長',text:island+'へ、ようこそ。\n足元に気をつけて、ゆっくり降りてね。',travel:4200},
  {scene:'welcome',who:name,text:'……えっ。\n動物が、話してる？'},
  {scene:'welcome',who:'あかり',text:'ようこそ！ 私はあかり。\nあなたが、今日来るって聞いていた人だね。'},
  {scene:'welcome',who:name,text:'だれもいない島だと思って来たんだけど……。'},
  {scene:'welcome',who:'あかり',text:'ふふ。静かな島だけど、私たちは暮らしてるよ。\nまずは、ここでゆっくりしていってね。'},
  {scene:'welcome',who:'みお',text:'わたしはみお。\n困ったときは、声をかけてね！'},
  {scene:'welcome',who:'あかり',text:'私たち、この島をもっと元気にしたいの。\n島のよさを知って、遊びに来る人を増やしたくて。'},
  {scene:'welcome',who:'あかり',text:'いつか「'+island+'フェスティバル」を開くのが夢。\nあなたの見つけた宝物も、博物館にかざれたらすてきだね。'},
  {scene:'welcome',who:name,text:'少しずつなら……手伝えるかもしれない。\nここで、自分の居場所を見つけてみたい。'},
  {scene:'welcome',who:'あかり',text:'ありがとう！ あなたのテントは用意してあるよ。\nいっしょに、この島の暮らしを始めよう。',last:true}
 ];}
 function createScene(T,kind){
  const scene=new T.Scene();scene.background=new T.Color('#91d0ed');const camera=new T.PerspectiveCamera(43,1,.1,160),boat=new T.Group(),island=new T.Group(),clouds=new T.Group();scene.add(boat,island,clouds);
  const materials=new Map(),geos={sphere:new T.SphereGeometry(1,16,10),cloud:new T.SphereGeometry(1,10,6),box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,16),cone:new T.ConeGeometry(1,1,12)};
  function shade(g){const n=g.attributes.normal,c=[];for(let i=0;i<n.count;i++){const w=.80+.18*Math.max(0,n.getX(i)*-.4+n.getY(i)*.8+n.getZ(i)*.4);c.push(w,w,w);}g.setAttribute('color',new T.Float32BufferAttribute(c,3));return g;}Object.values(geos).forEach(shade);
  function mat(c){if(!materials.has(c))materials.set(c,new T.MeshBasicMaterial({color:c,vertexColors:true}));return materials.get(c);}
  function mesh(p,type,c,x,y,z,sx,sy=sx,sz=sx){const o=new T.Mesh(geos[type],mat(c));o.position.set(x,y,z);o.scale.set(sx,sy,sz);p.add(o);return o;}
  const ball=(p,c,x,y,z,a,b=a,d=a)=>mesh(p,'sphere',c,x,y,z,a,b,d),box=(p,c,x,y,z,a,b,d)=>mesh(p,'box',c,x,y,z,a,b,d);
  const sea=new T.Mesh(new T.PlaneGeometry(180,180,40,40),new T.MeshBasicMaterial({color:'#65b8cb'})),waves=[];sea.rotation.x=-Math.PI/2;sea.position.set(0,-.41,-28);scene.add(sea);
  for(let i=0;i<30;i++){const w=ball(scene,i%2?'#83ccd5':'#a3dbe0',((i*17)%37)-18,-.38,-((i*11)%60)+12,1.3,.012,.12);waves.push(w);}
  for(let i=0;i<9;i++){const cloud=new T.Group();cloud.position.set((i%3-1)*10+(i%2)*3,6+(i%3)*1.2,-10-Math.floor(i/3)*14);for(let j=0;j<4;j++)mesh(cloud,'cloud','#f8fcf7',(j-1.5)*.8,Math.sin(j)*.22,0,1.1,.36,.5);clouds.add(cloud);}
  // Eight-sided, tapered launch hull, rather than a rectangle resting on water.
  const outline=[[-.7,-2.6],[.7,-2.6],[1.15,-1.7],[1.15,1.9],[.75,2.5],[-.75,2.5],[-1.15,1.9],[-1.15,-1.7]],v=[],ix=[];
  for(const [level,scale] of [[-.32,.73],[.43,1]])for(const [x,z]of outline)v.push(x*scale,level,z*scale);
  for(let i=0;i<8;i++){const j=(i+1)%8;ix.push(i,j,i+8,j,j+8,i+8);}const hullGeo=new T.BufferGeometry();hullGeo.setAttribute('position',new T.Float32BufferAttribute(v,3));hullGeo.setIndex(ix);hullGeo.computeVertexNormals();const hull=new T.Mesh(shade(hullGeo),new T.MeshBasicMaterial({color:'#557e98',vertexColors:true,side:T.DoubleSide}));boat.add(hull);
  const deckShape=new T.Shape();outline.forEach(([x,z],i)=>i?deckShape.lineTo(x,-z):deckShape.moveTo(x,-z));deckShape.closePath();const deck=new T.Mesh(shade(new T.ShapeGeometry(deckShape)),mat('#e9d6ab'));deck.rotation.x=-Math.PI/2;deck.position.y=.44;boat.add(deck);
  for(const s of [-1,1]){for(const z of [-1.8,-.6,.6,1.8])mesh(boat,'cylinder','#fff1d3',s*1.04,.76,z,.035,.58,.035);box(boat,'#fff1d3',s*1.04,1.04,0,.06,.06,3.7);box(boat,'#d2b987',s*1.04,.49,0,.06,.09,3.8);}
  box(boat,'#e9dfc7',.52,.74,1.6,.85,.58,.65);box(boat,'#668f9d',.52,1.05,1.55,.90,.08,.73);mesh(boat,'cylinder','#ddc9a1',-.78,1.78,1.7,.035,2.6,.035);const flag=new T.Mesh(new T.PlaneGeometry(.62,.35),new T.MeshBasicMaterial({color:'#e59c8c',side:T.DoubleSide}));flag.position.set(-.46,2.8,1.7);boat.add(flag);
  const ring=new T.Mesh(new T.TorusGeometry(.27,.075,8,24),mat('#fff3d8'));ring.rotation.y=Math.PI/2;ring.position.set(1.15,.33,.5);boat.add(ring);
  const factory=PlazaHeroModels.make(T,{compatible:true}),hero=factory.build(kind,{batch(){},shadow(){return new T.Group();}});hero.position.set(-.20,.44,-.78);boat.add(hero);
  // Original animal islanders in the same warm palette as their established game species.
  function animal(species,fur,coat){const g=new T.Group(),head=new T.Group();head.position.y=1.25;g.add(head);ball(g,coat,0,.69,0,.30,.36,.21);for(const s of [-1,1]){ball(g,fur,s*.32,.72,0,.085,.25,.09);ball(g,'#746d68',s*.13,.10,.02,.11,.11,.15);mesh(g,'cylinder','#7c8990',s*.13,.31,0,.075,.32,.075);}ball(head,fur,0,0,0,.43,.38,.34);ball(head,'#f2e4cd',0,-.13,.28,.24,.13,.09);for(const s of [-1,1]){if(species==='rabbit'){ball(head,fur,s*.22,.41,0,.095,.31,.09);ball(head,'#dfb1b2',s*.22,.44,.075,.036,.20,.025);}else if(species==='wolf'){mesh(head,'cone',fur,s*.28,.35,0,.13,.30,.12);}else{ball(head,fur,s*.35,.25,0,.13,.12,.08);mesh(head,'cylinder','#b3916c',s*.23,.47,-.05,.025,.33,.025);const branch=mesh(head,'cylinder','#b3916c',s*.30,.52,-.05,.018,.19,.018);branch.rotation.z=-s*.65;}ball(head,'#4b5358',s*.145,.02,.323,.033,.048,.023);ball(head,'#fff8e7',s*.145-.012,.035,.343,.010,.013,.008);}ball(head,'#78675d',0,-.09,.37,.035,.024,.024);g.scale.setScalar(.84);return g;}
  const captain=animal('wolf','#8fa5ad','#d4e7e7');captain.position.set(.50,.44,1.18);captain.rotation.y=Math.PI;boat.add(captain);
  const akari=animal('deer','#c79a72','#dfb28e'),mio=animal('rabbit','#f0dbd4','#9bbdaf');scene.add(akari,mio);akari.position.set(1.15,.60,-7.25);mio.position.set(2.1,.60,-8.4);akari.rotation.y=-.6;mio.rotation.y=-.5;
  mesh(island,'cylinder','#e4d5a8',0,-.06,0,9.6,.42,6.7);mesh(island,'cylinder','#a9c68a',0,.21,-.1,8.9,.35,6);mesh(island,'cone','#92b489',-3,1.4,-2.7,3.6,2.5,3.1);mesh(island,'cone','#a2bd91',1.8,1.1,-3.5,3,2,2.6);
  for(const [x,z,h]of [[-5,-1,1.8],[-6,1,1.7],[-3,2,2.1],[4,-2,1.8],[6,.8,2],[3,2,1.6],[.4,-3,1.9]]){mesh(island,'cylinder','#a88b68',x,.9,z,.15,1.5,.15);ball(island,'#77a67d',x,h,z,.8,.85,.7);ball(island,'#8bb583',x-.35,h+.18,z-.12,.55,.65,.55);}
  box(island,'#eee0bc',2.3,.95,-.1,2.1,1.3,1.8);const roof=mesh(island,'cone','#c99279',2.3,1.95,-.1,1.7,1,1.5);roof.rotation.y=Math.PI/4;box(island,'#9eb5af',2.3,.85,.82,.55,1.1,.06);box(island,'#cde3da',1.65,1.08,.82,.42,.42,.07);
  box(island,'#d8c69b',0,.42,3,2.4,.05,5);for(let i=0;i<14;i++)box(island,'#ceb88e',0,.56,5.4+i*.42,2.3,.13,.36);for(const x of [-1.2,1.2])for(const z of [5.4,7.5,10.8]){mesh(island,'cylinder','#987b5c',x,.38,z,.12,1,.12);ball(island,'#e4cba4',x,.94,z,.17,.08,.17);}
  // Welcome platform joins the existing simple pier without granting the tourism upgrade.
  box(island,'#d5bf96',1,.56,7.9,4.4,.13,3);box(island,'#e9d9b6',-2.7,.7,4.5,1.35,.9,1.7);const tent=mesh(island,'cone','#e0b690',-2.7,1.35,4.5,1.1,1.3,1);tent.rotation.y=Math.PI/4;
  boat.position.z=3;island.position.z=-44;
  return{scene,camera,boat,island,sea,hero,akari,mio,captain,clouds,waves,factory,dispose(){const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.isMesh){gs.add(o.geometry);for(const m of(Array.isArray(o.material)?o.material:[o.material]))ms.add(m);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());factory.disposeTextures();}};
 }
 function play({kind='girl',name='ハル',island='こもれび島',reducedMotion=false,onFinish=()=>{}}={}){
  if(api.active)return;api.active=true;const T=window.THREE,lines=script(name,island),root=document.createElement('section');root.id='townOpening';root.setAttribute('tabindex','-1');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','島へ向かう物語');
  root.innerHTML='<canvas id="openingCanvas" aria-label="青空、船旅、島と港の3D映像"></canvas><div id="openingFade"></div><header id="openingTop"><span id="openingChapter">序章 ─ 風の向こうの島</span><button id="openingSkip" type="button">オープニングをとばす</button></header><div id="openingPlace"></div><section id="openingPanel"><h2 id="openingSpeaker"></h2><p id="openingText"></p><p id="openingGoals" hidden>島を育てる ・ 観光客をふやす</p><div id="openingBottom"><span id="openingHint">タップ・Enterで、次のことばへ</span><button id="openingNext" type="button">次へ ▷</button></div></section><p id="openingAnnounce" class="openingSr" aria-live="polite"></p><output id="openingDiagnostics" class="openingSr"></output>';
  document.body.append(root);document.body.classList.add('townOpeningActive');const inert=[...document.body.children].filter(n=>n!==root).map(n=>[n,n.inert]);inert.forEach(([n])=>n.inert=true);const $=id=>root.querySelector('#'+id);let canvas=$('openingCanvas'),renderer,world,software=false,step=0,start=performance.now(),last=0,raf=0,done=false,typed=false,errors=[],lastShot='',revealed=false,pausedAt=null;
  function cpu(){renderer?.dispose();const fresh=canvas.cloneNode();canvas.replaceWith(fresh);canvas=fresh;renderer=new PlazaSoftware3D({canvas});software=true;resize();}
  function resize(){if(!renderer)return;const w=root.clientWidth||innerWidth,h=root.clientHeight||innerHeight;if(software){const rw=Math.min(480,w),rh=Math.max(180,Math.round(rw*h/w));renderer.setSize(rw,rh);}else renderer.setSize(w,h,false);if(world){world.camera.aspect=w/h;world.camera.updateProjectionMatrix();}}
  try{world=createScene(T,kind);try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));resize();canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!done)cpu();});}catch{cpu();}}catch(e){errors.push(String(e.message||e));$('openingChapter').textContent='物語の映像を読み込めませんでした';}
  function diagnostics(progress=0){$('openingDiagnostics').textContent=JSON.stringify({version:1,kind,step,scene:lines[step].scene,renderer:software?'software-3d':'webgl',progress:Number(progress.toFixed(2)),triangles:renderer?.info?.render?.triangles||0,errors});}
  function show(){const l=lines[step];start=performance.now();revealed=false;typed=false;root.dataset.scene=l.scene;root.dataset.step=String(step);$('openingPanel').hidden=!!l.silent;$('openingSpeaker').textContent=l.who||'';$('openingText').textContent='';$('openingAnnounce').textContent=l.who?l.who+'。'+l.text:'';$('openingGoals').hidden=!l.last;$('openingPlace').textContent=l.scene==='approach'?island:l.scene==='dock'?'小さな港':'';$('openingNext').textContent=l.last?'島の暮らしを始める':l.travel?'島へ向かっています…':'次へ ▷';$('openingNext').disabled=!!l.travel;diagnostics();}
  function finish(skipped=false){if(done)return;done=true;api.active=false;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);window.removeEventListener('keydown',key,true);renderer?.dispose();world?.dispose();inert.forEach(([n,v])=>n.inert=v);root.remove();document.body.classList.remove('townOpeningActive');onFinish({skipped});}
  function advance(){const l=lines[step];if(l.travel&&performance.now()-start<l.travel&&!reducedMotion)return;if(!typed&&!l.silent){revealed=true;typed=true;$('openingText').textContent=l.text;return;}if(step===lines.length-1){finish();return;}step++;show();}
  function key(e){if(!api.active||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Tab'){e.preventDefault();e.stopImmediatePropagation();const next=$('openingNext'),skip=$('openingSkip');(document.activeElement===skip&&!next.disabled&&!$('openingPanel').hidden?next:skip).focus();return;}if(['Enter',' ','ArrowRight'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat){if(e.key!=='ArrowRight'&&document.activeElement===$('openingSkip'))finish(true);else advance();}}else if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(true);}else e.stopImmediatePropagation();}
  $('openingNext').onclick=advance;$('openingSkip').onclick=()=>finish(true);window.addEventListener('keydown',key,true);window.addEventListener('resize',resize);show();root.focus();
  const mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
  function frame(now){if(done)return;const l=lines[step];if(document.hidden){if(pausedAt===null)pausedAt=now;raf=requestAnimationFrame(frame);return;}if(pausedAt!==null){start+=now-pausedAt;pausedAt=null;}const elapsed=Math.max(0,now-start),progress=l.travel?(reducedMotion?1:Math.min(1,elapsed/l.travel)):1;
   if(l.auto&&elapsed>=l.auto){step++;show();raf=requestAnimationFrame(frame);return;}
   if(!l.silent){const chars=revealed||reducedMotion?l.text.length:Math.floor(elapsed/32);$('openingText').textContent=l.text.slice(0,chars);typed=chars>=l.text.length;if(l.travel&&progress===1){$('openingNext').disabled=false;$('openingNext').textContent=l.scene==='approach'?'港へ進む ▷':'船を降りる ▷';}}
   if(world&&renderer&&now-last>(software?80:24)){last=now;const w=world,shot=l.scene,sky=shot==='sky',welcome=shot==='welcome',aim=(x,y,z)=>{const target=new T.Vector3(x,y,z);if(w.camera.aspect<.9)w.camera.position.sub(target).multiplyScalar(Math.min(2.1,.95/w.camera.aspect)).add(target);w.camera.lookAt(target);};w.sea.visible=!sky;for(const wave of w.waves)wave.visible=!sky;w.boat.visible=!sky;w.island.visible=!sky;w.akari.visible=w.mio.visible=welcome;w.clouds.visible=true;
    if(welcome){if(w.hero.parent!==w.scene)w.scene.attach(w.hero);w.hero.position.set(-.15,.625,-6.7);w.hero.rotation.y=Math.PI*.72;w.island.position.z=-15;w.boat.position.set(-1.5,0,-2.2);w.camera.position.set(5,3.8,-.1);aim(.4,1.1,-7.3);}
    else{if(w.hero.parent!==w.boat)w.boat.attach(w.hero);w.hero.position.set(-.2,.44,-.78);w.hero.rotation.y=shot==='boat'?.25:Math.PI;w.boat.position.x=0;
     if(sky){w.camera.position.set(0,2,6);aim(0,7,-12);}
     else if(shot==='boat'){w.island.position.z=-55;w.boat.position.z=3;w.camera.position.set(4.7,3.8,9.8);aim(0,1.1,2.5);}
     else if(shot==='approach'){const t=smooth(progress);w.island.position.z=mix(-55,-15,t);w.boat.position.z=3;w.camera.position.set(mix(4.7,4.4,t),mix(3.8,4.8,t),mix(9.8,5.8,t));aim(0,1,mix(2.5,-9,t));}
     else{const t=smooth(progress);w.island.position.z=-15;w.boat.position.z=mix(3,-2.2,t);w.camera.position.set(mix(4.4,5.5,t),mix(4.8,4.1,t),mix(5.8,2.4,t));aim(0,1,mix(-9,-5,t));}
    }
    w.boat.position.y=reducedMotion||sky||welcome?0:Math.sin(now*.0017)*.035;w.boat.rotation.z=reducedMotion||sky||welcome?0:Math.sin(now*.0012)*.012;
    PlazaHeroModels.animate(w.hero,{time:now,reducedMotion:true});for(let i=0;i<w.waves.length;i++)if(!reducedMotion)w.waves[i].position.x+=Math.sin(now*.0004+i)*.002;
    try{renderer.render(w.scene,w.camera);}catch(e){if(!software){errors.push('WebGL表示から互換3Dへ切替');cpu();}else if(!errors.includes(e.message))errors.push(e.message);}diagnostics(progress);lastShot=shot;
   }raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);api.finish=finish;return{root,advance,finish};
 }
 api.script=script;api.createScene=createScene;api.play=play;return api;
})();
// Keep the cinematic isolated from saved progress and freeze gameplay while it is open.
if(typeof IS!=='undefined'){
 TownOpening.begin=function(){if(TownOpening.active||TownOpening.pending)return;TownOpening.pending=true;const replay=!!IS.introduced,priorSuspend=suspendSave,priorSetup=setupOpen,at=performance.now();setupOpen=true;suspendSave=true;IslandRuntime.introOpen=true;stopWorldInput();closeChoices();
  function ready(){if(document.documentElement.classList.contains('townBooting')){requestAnimationFrame(ready);return;}TownOpening.pending=false;TownOpening.play({kind:state.avatar.hero||state.avatar.kind,name:state.name,island:IS.name,reducedMotion:!!state.settings.reducedMotion||matchMedia('(prefers-reduced-motion:reduce)').matches,onFinish(){stopWorldInput();sessionStart+=performance.now()-at;IslandRuntime.last=performance.now();IslandRuntime.introOpen=false;suspendSave=priorSuspend;setupOpen=priorSetup;if(!replay){IS.introduced=true;tutorial.status='skipped';setupOpen=false;save(false);if(!L.selected)levelChooser();else{document.getElementById('learningSetup')?.remove();islandMessage('新しい暮らしはテントから。島の手帳で「島の発展」と「観光客」を確かめよう。');}}else document.getElementById('game')?.focus();}});}
  ready();
 };
 const drawBeforeArrival=draw;draw=function(now=performance.now()){if(TownOpening.active||TownOpening.pending){lastFrame=now;worldLastTime=now;worldAutosave=now;IslandRuntime.last=now;requestAnimationFrame(draw);return;}drawBeforeArrival(now);};
 islandIntro=()=>TownOpening.begin();
}
