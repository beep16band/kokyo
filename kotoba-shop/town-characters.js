// Original character art. Profiles are appearance data only; resident/save IDs stay unchanged.
const TownCharacters={version:1,actions:['idle','walk','dash','fish','net','tool','joy','surprise'],directions:['down','left','right','up'],reaction:null,farmWater:new WeakMap()};
for(const p of state.farm)if(p)TownCharacters.farmWater.set(p,p.watered||0);
const TOWN_CHARACTER_PROFILES={
 boy:{name:'男の子',shirt:'#fff2ce',accent:'#7fa6b5',hair:'#6d5848',style:'short',hat:'straw',ribbon:'#83b5cf',outfit:'overalls'},
 girl:{name:'女の子',shirt:'#dc9d8e',accent:'#fff2ce',hair:'#6d5848',style:'tails',hat:'straw',ribbon:'#d79cb1',outfit:'dress'},
 akari:{name:'あかり',shirt:'#d6a179',accent:'#dc9d8e',hair:'#826d57',style:'bob',clip:true,outfit:'scarf'},
 mio:{name:'みお',shirt:'#d8a8b5',accent:'#fff2ce',hair:'#6d5848',style:'pony',outfit:'satchel'},
 takumi:{name:'たくみ',shirt:'#82a8b4',accent:'#fff2ce',hair:'#364a46',style:'short',hat:'cap',outfit:'vest'},
 fumi:{name:'ふみ',shirt:'#fff2ce',accent:'#a7bb91',hair:'#826d57',style:'buns',clip:true,outfit:'overalls'},
 haruka:{name:'はるか',shirt:'#fff2ce',accent:'#d7b691',hair:'#6d5848',style:'bob',outfit:'apron'},
 ken:{name:'けん',shirt:'#9ba9c0',accent:'#fff2ce',hair:'#364a46',style:'tuft',outfit:'pouch'},
 sota:{name:'そうた',shirt:'#b0b78b',accent:'#d6a179',hair:'#826d57',style:'short',outfit:'zip'},
 masaru:{name:'まさる',shirt:'#b3a48d',accent:'#a7bb91',hair:'#637c85',style:'part',outfit:'apron'},
 galaxy:{name:'ギャラクシー先生',shirt:'#d2ae76',accent:'#fff2ce',hair:'#364a46',style:'tuft',body:'muscle',outfit:'sport',smile:true},
 sakamoto:{name:'阪本先生',shirt:'#b4a7bc',accent:'#fff2ce',hair:'#6d5848',style:'bun',outfit:'dress',necklace:true},
 sakaguchi:{name:'阪口先生',shirt:'#a99d83',accent:'#fff2ce',hair:'#364a46',style:'part',body:'round',outfit:'cardigan',glasses:true}
};
function townCharacterProfile(kind,color,name){
 const resident=TOWN_DATA.residents.find(r=>r.name===name||(!name&&r.color===color));
 const id=resident?.id||(TOWN_CHARACTER_PROFILES[kind]?kind:null);
 return id&&TOWN_CHARACTER_PROFILES[id]?{id,...TOWN_CHARACTER_PROFILES[id]}:null;
}
function townCharacterPose(now){
 for(const p of state.farm)if(p){const last=TownCharacters.farmWater.get(p),water=p.watered||0;if(last!==undefined&&water>last)TownCharacters.reaction={action:'tool',until:0};TownCharacters.farmWater.set(p,water);}
 if(mini?.action)return mini.phase==='land'?'joy':mini.phase==='bite'?'surprise':'fish';
 if(netSwing)return 'net';
 const r=TownCharacters.reaction;
 if(r&&!menuOpen&&!setupOpen&&!choices.children.length){if(!r.until)r.until=now+1100;if(now<r.until)return r.action;TownCharacters.reaction=null;}
 return walkStep?(dashHeld||state.settings.dashMode?'dash':'walk'):'idle';
}
const character3DBeforeProfiles=town3DCharacter;
town3DCharacter=function(kind,color,name){
 const p=townCharacterProfile(kind,color,name);if(!p)return character3DBeforeProfiles(kind,color);
 const g=new THREE.Group(),skin='#edc5a3',muscle=p.body==='muscle',round=p.body==='round',width=muscle?.46:round?.41:.3;
 const mesh=(parent,type,col,x,y,z,sx,sy,sz)=>town3DMesh(parent,type,col,x,y,z,sx,sy,sz);
 mesh(g,'sphere',p.shirt,0,.83,0,width,.36,.24);
 const leftLeg=new THREE.Group(),rightLeg=new THREE.Group(),shoes=[];
 for(const [i,leg] of [leftLeg,rightLeg].entries()){
  leg.position.set(i===0?-.14:.14,.59,0);g.add(leg);
  mesh(leg,'cylinder',p.outfit==='overalls'?p.accent:'#637c85',0,-.21,0,.095,.4,.1);
  shoes.push(mesh(leg,'sphere','#826d57',0,-.45,.07,.12,.08,.18));
 }
 const leftArm=new THREE.Group(),rightArm=new THREE.Group();
 for(const [i,arm] of [leftArm,rightArm].entries()){
  arm.position.set((i===0?-1:1)*(width+.055),1.04,0);g.add(arm);
  mesh(arm,'sphere',p.shirt,0,-.1,0,muscle?.16:.105,.18,.12);
  mesh(arm,'sphere',skin,0,-.29,0,muscle?.14:.095,.16,.105);
 }
 if(p.outfit==='dress')mesh(g,'cone',p.shirt,0,.62,0,.37,.48,.3);
 if(['overalls','apron'].includes(p.outfit)){
  mesh(g,'box',p.accent,0,.79,.235,.36,.36,.05);
  for(const x of [-.13,.13])mesh(g,'box',p.accent,x,1.02,.19,.055,.28,.05);
  mesh(g,'box',p.outfit==='apron'?'#fff2ce':p.shirt,0,.72,.268,.18,.11,.012);
 }
 if(['cardigan','vest'].includes(p.outfit)){
  mesh(g,'box',p.accent,0,.88,.23,.19,.43,.025);
  for(const y of [.76,.9,1.04])mesh(g,'sphere','#826d57',.055,y,.26,.019,.019,.012);
 }
 if(p.outfit==='scarf'){mesh(g,'box',p.accent,0,1.12,.12,.32,.1,.22);mesh(g,'box',p.accent,.12,.95,.25,.09,.29,.035);}
 if(p.outfit==='zip')mesh(g,'box',p.accent,0,.89,.24,.035,.43,.025);
 if(['satchel','pouch'].includes(p.outfit)){
  const bag=mesh(g,'box','#826d57',.27,.69,.16,.23,.24,.12);bag.rotation.z=-.1;
  const strap=mesh(g,'box',p.accent,0,.95,.25,.04,.47,.025);strap.rotation.z=.55;
 }
 if(p.necklace)mesh(g,'sphere',p.accent,0,1.07,.24,.04,.045,.025);
 const head=new THREE.Group();head.position.y=1.39;g.add(head);
 mesh(head,'sphere',skin,0,0,0,.39,.36,.33);
 mesh(head,'sphere',p.hair,0,.2,-.04,.4,.22,.32);
 if(['bob','tails','bun','pony'].includes(p.style))for(const x of [-.31,.31])mesh(head,'sphere',p.hair,x,-.02,-.13,.12,.29,.16);
 if(p.style==='tails'||p.style==='buns')for(const x of [-.36,.36])mesh(head,'sphere',p.hair,x,p.style==='buns'?.12:-.1,-.16,.16,.17,.16);
 if(p.style==='pony'||p.style==='bun')mesh(head,'sphere',p.hair,.08,p.style==='bun'?.25:0,-.33,.19,p.style==='bun'?.17:.24,.16);
 if(p.style==='tuft')for(const x of [-.17,0,.17])mesh(head,'cone',p.hair,x,.39,-.02,.12,.2,.12);
 if(p.style==='part'){const fringe=mesh(head,'sphere',p.hair,-.12,.17,.22,.24,.09,.1);fringe.rotation.z=-.18;}
 for(const x of [-.13,.13]){
  mesh(head,'sphere','#364a46',x,0,.31,.028,.042,.022);
  mesh(head,'sphere','#e4a79a',x*1.7,-.09,.28,.06,.025,.018);
 }
 mesh(head,'box',p.smile?'#fff2ce':'#b7816b',0,-.14,.318,p.smile?.2:.075,p.smile?.065:.025,.025);
 if(p.smile){for(const x of [-.13,.13]){const brow=mesh(head,'box',p.hair,x,.095,.32,.11,.025,.025);brow.rotation.z=x<0?.18:-.18;}}
 if(p.glasses){for(const x of [-.13,.13]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.09,.013,4,12),town3DMaterial('#364a46'));ring.position.set(x,0,.35);head.add(ring);}mesh(head,'box','#364a46',0,0,.35,.08,.022,.02);}
 if(p.clip){mesh(head,'sphere','#a7bb91',-.29,.18,.23,.09,.04,.035);mesh(head,'sphere','#fff2ce',-.29,.18,.26,.025,.025,.025);}
 if(p.hat==='straw'){
  mesh(head,'cylinder','#e8cd8b',0,.3,0,.53,.055,.44);mesh(head,'sphere','#f0d795',0,.37,-.03,.35,.17,.31);
  mesh(head,'cylinder',p.ribbon,0,.34,-.02,.355,.075,.315);
  for(const side of [-1,1]){const bow=mesh(head,'sphere',p.ribbon,side*.08+.26,.35,.17,.09,.045,.035);bow.rotation.z=side*.4;}
  mesh(head,'box',p.ribbon,.26,.28,.18,.045,.14,.025);
 }else if(p.hat==='cap'){mesh(head,'sphere',p.shirt,0,.3,0,.41,.15,.33);mesh(head,'box',p.shirt,0,.25,.31,.48,.04,.31);}
 const shadow=mesh(g,'cylinder','#8ba582',0,.07,0,.33,.005,.23);
 g.userData={profile:p,leftLeg,rightLeg,leftArm,rightArm,head,shoes,shadow};return g;
};
const animateBeforeProfiles=town3DAnimate;
town3DAnimate=function(actor,x,z,dir,moving,now,mode='idle'){
 const u=actor.userData;if(!u.profile){animateBeforeProfiles(actor,x,z,dir,moving,now,mode);return;}
 const player=actor===Town3D.player||actor.userData.playerAvatar===true,pose=player?townCharacterPose(now):moving?'walk':'idle';
 const duration=player?(dashHeld||state.settings.dashMode?DASH_MS:WALK_MS):NPC_WALK_MS;
 const walk=moving&&!state.settings.reducedMotion?Math.sin(now/duration*Math.PI)*(pose==='dash'?.55:.42):0;
 const jump=pose==='joy'&&!state.settings.reducedMotion?Math.abs(Math.sin(now/170))*.12:0;
 const groundOffset=.45*(Math.cos(walk)-1)+.07*Math.abs(Math.sin(walk));
 actor.position.set(x+.5,jump+groundOffset,z+.5);actor.rotation.y={down:0,up:Math.PI,left:-Math.PI/2,right:Math.PI/2}[dir]||0;
 u.shadow.position.y=.07-actor.position.y;u.leftLeg.rotation.x=walk;u.rightLeg.rotation.x=-walk;
 u.shoes[0].rotation.x=-walk;u.shoes[1].rotation.x=walk;
 u.leftArm.rotation.set(-walk*.8,0,0);u.rightArm.rotation.set(walk*.8,0,0);
 if(pose==='fish'){u.rightArm.rotation.x=-1.1;u.leftArm.rotation.x=-.7;}
 if(pose==='net'){u.rightArm.rotation.x=-1.2+(state.settings.reducedMotion?0:Math.sin(now/90)*.45);u.leftArm.rotation.x=-.2;}
 if(pose==='tool'){u.rightArm.rotation.x=-.8+(state.settings.reducedMotion?0:Math.sin(now/160)*.3);u.leftArm.rotation.x=-.4;}
 if(pose==='joy'){u.leftArm.rotation.z=-1;u.rightArm.rotation.z=1;}
 if(pose==='surprise'){u.leftArm.rotation.x=-.9;u.rightArm.rotation.x=-.9;}
 u.head.rotation.x=pose==='surprise'?-.15:0;u.head.rotation.z=state.settings.reducedMotion?0:Math.sin(now/1600)*.018;
 u.pose=pose;
};
// Shared screen-space hands keep body poses and attached tools in agreement.
function townCharacterHands(p,dir,frame,pose){
 const width=p?.body==='muscle'?38:p?.body==='round'?32:26;
 const stride=['walk','dash'].includes(pose)?[0,pose==='dash'?4:2,0,pose==='dash'?-4:-2][frame%4]:0;
 const offset=[0,3,6,3][frame%4];
 const arms={fish:[42,35],net:[48,30+offset],tool:[48,39+offset],joy:[31,31],surprise:[35,35]}[pose]||[49-stride*.5,49+stride*.5];
 const mirrored=dir==='left'||dir==='up';
 return {left:{x:32-width/2-2,y:arms[mirrored?1:0]},right:{x:32+width/2+2,y:arms[mirrored?0:1]},tool:{x:32+(mirrored?-1:1)*(width/2+2),y:arms[1]}};
}
// Convert the same painted hand into the lightweight field canvas coordinates.
function townCharacterFieldGrip(x,y,dir,pose,now){
 const p=TOWN_CHARACTER_PROFILES[state.avatar.kind]||TOWN_CHARACTER_PROFILES.boy;
 const duration=dashHeld||state.settings.dashMode?DASH_MS:WALK_MS;
 const frame=state.settings.reducedMotion?0:Math.floor(now/(pose==='idle'?450:pose==='joy'?170:duration/2))%4;
 const hand=townCharacterHands(p,dir,frame,pose).tool;
 return {x:x*T-16+hand.x,y:y*T-45+hand.y};
}
function townCharacterStamp(id,dir='down',frame=0,pose='idle',topPadding=0){
 const p=TOWN_CHARACTER_PROFILES[id],back=dir==='up',side=dir==='left'?-1:dir==='right'?1:0;
 return cozyStamp('town-portrait-v2-'+id+'-'+dir+'-'+frame+'-'+pose+'-pad'+topPadding,64,80+topPadding,g=>{
  if(topPadding)g.translate(0,topPadding);
  const skin='#edc5a3',moving=pose==='walk'||pose==='dash',stride=moving?[0,pose==='dash'?4:2,0,pose==='dash'?-4:-2][frame%4]:0;
  const joy=pose==='joy'?[0,-2,-4,-2][frame%4]:0;g.translate(0,joy);
  const muscle=p.body==='muscle',round=p.body==='round',w=muscle?38:round?32:26;
  for(const [i,x] of [24,35].entries()){
   const swing=i===0?stride:-stride,lift=Math.max(0,swing),stepX=side*swing;
   cozyPoly(g,[[x,56],[x+6,56],[x+6+stepX,72-lift],[x+stepX,72-lift]],p.outfit==='overalls'?p.accent:'#637c85');
   cozyOval(g,x+3+side+stepX,74-lift,5,2.5,'#826d57');
  }
  g.save();if(pose==='idle')g.translate(0,[0,-.3,-.5,-.3][frame%4]);
  cozyRound(g,32-w/2,36,w,26,9,cozyGrad(g,0,36,26,p.shirt,p.shirt));
  const raised=['fish','net','tool','surprise','joy'].includes(pose),hands=townCharacterHands(p,dir,frame,pose);
  cozyOval(g,hands.left.x,hands.left.y,muscle?6:4,raised?7:10,skin);cozyOval(g,hands.right.x,hands.right.y,muscle?6:4,raised?7:10,skin);
  if(p.outfit==='dress')cozyPoly(g,[[23,45],[41,45],[47,65],[17,65]],p.shirt);
  if(['overalls','apron'].includes(p.outfit)){
   for(const x of [25,36])cozyRound(g,x,36,3,15,1,p.accent);
   cozyRound(g,24,45,16,p.outfit==='apron'?20:17,2,p.accent);if(!back)cozyRound(g,28,51,8,5,1,p.shirt);
  }
  if(!back){
   if(['cardigan','vest'].includes(p.outfit)){cozyRound(g,28,37,8,23,1,p.accent);for(const y of [43,49,55])cozyOval(g,34,y,1,1,'#826d57');}
   if(p.outfit==='scarf'){cozyRound(g,22,36,20,5,2,p.accent);cozyRound(g,35,39,5,14,1,p.accent);}
   if(p.outfit==='zip')cozyRound(g,31,37,2,23,0,p.accent);
   if(['satchel','pouch'].includes(p.outfit)){cozyPoly(g,[[24,37],[26,37],[42,57],[40,58]],p.accent);cozyRound(g,38,54,9,10,2,'#826d57');}
   if(p.necklace)cozyOval(g,32,39,2,2,p.accent);
  }
  cozyOval(g,32,25,17,16,cozyGrad(g,0,9,32,'#f2d6b4',skin));
  cozyOval(g,32,14,17,8,p.hair);
  if(back)cozyOval(g,32,25,17,14,p.hair);
  if(['bob','tails','bun','pony'].includes(p.style))for(const x of [17,47])cozyOval(g,x,26,4,11,p.hair);
  if(['buns','tails'].includes(p.style))for(const x of [14,50])cozyOval(g,x,p.style==='buns'?17:29,5,6,p.hair);
  if(p.style==='pony'||p.style==='bun')cozyOval(g,32+side*9,p.style==='bun'?10:28,6,p.style==='bun'?5:9,p.hair);
  if(p.style==='tuft')cozyPoly(g,[[19,15],[21,6],[26,11],[31,4],[35,10],[41,6],[44,17]],p.hair);
  if(p.style==='part'&&!back)cozyPoly(g,[[17,16],[29,10],[43,15],[36,18],[30,14],[23,21]],p.hair);
  if(!back){
   const eyes=side===-1?[23,32]:side===1?[32,41]:[25,39];
   for(const x of eyes)cozyOval(g,x,25,1.7,pose==='surprise'?3:2.3,'#364a46');
   if(p.glasses){g.strokeStyle='#364a46';g.lineWidth=1.3;for(const x of eyes){g.beginPath();g.arc(x,25,4.6,0,7);g.stroke()}g.beginPath();g.moveTo(eyes[0]+4.6,25);g.lineTo(eyes[1]-4.6,25);g.stroke();}
   cozyOval(g,21+side*3,31,2.8,1.4,'#e4a79a');cozyOval(g,43+side*3,31,2.8,1.4,'#e4a79a');
   if(p.smile)cozyRound(g,26+side*3,32,13,4,2,'#fff2ce');else cozyOval(g,32+side*3,33,pose==='surprise'?2:2.5,pose==='surprise'?3:1,'#b7816b');
  }
  if(p.clip)cozyOval(g,19,18,4,2,'#a7bb91');
  if(p.hat==='straw'){
   cozyOval(g,32,12,25,5,'#e8cd8b');cozyOval(g,32,8,17,7,'#f0d795');cozyRound(g,16,10,32,4,2,p.ribbon);
   const x=side===-1?18:46;cozyOval(g,x-3,12,4,2,p.ribbon);cozyOval(g,x+3,12,4,2,p.ribbon);cozyRound(g,x,12,2,7,1,p.ribbon);
  }else if(p.hat==='cap'){cozyOval(g,32,12,18,7,p.shirt);cozyRound(g,side<0?9:side>0?32:17,16,23,3,1,p.shirt);}
  g.restore();
 });
}
const character2DBeforeProfiles=character;
character=function(x,y,color,ears=false,kind='human',phase=0,dir='down'){
 const p=townCharacterProfile(kind==='human'?state.avatar.kind:kind,color,kind==='human'?null:undefined);
 if(!p){character2DBeforeProfiles(x,y,color,ears,kind,phase,dir);return;}
 const player=kind==='human',step=player?walkStep:worldNpcState[p.name]?.step;
 const pose=player?townCharacterPose(phase):step?'walk':'idle',dur=player?(dashHeld||state.settings.dashMode?DASH_MS:WALK_MS):NPC_WALK_MS;
 const frameMs=pose==='idle'?450:pose==='joy'?170:dur/2;
 const f=state.settings.reducedMotion?0:Math.floor(phase/frameMs)%4;
 cozyShadow(ctx,x*T+16,y*T+29,12,3.5);ctx.drawImage(townCharacterStamp(p.id,dir,f,pose),x*T-16,y*T-45);
};
for(const key of ['townCook','townModelPart','townQuestReport']){
 const original=window[key];if(typeof original!=='function')continue;
 window[key]=function(...args){const result=original(...args);if(result)TownCharacters.reaction={action:'joy',until:0};return result;};
}
Town3D.area='';
