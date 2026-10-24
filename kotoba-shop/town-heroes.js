/* Display adapter. Existing kind, progress, money and save keys remain valid. */
TownSprites.enabled=false;
const TownHeroes={version:20,names:{girl:'ひより',boy:'そら',tsuki:'つき',green:'はると'}};
state.avatar.hero=Object.hasOwn(TownHeroes.names,state.avatar.hero)?state.avatar.hero:state.avatar.kind;
const characterBeforeMeshHeroes=town3DCharacter,animateBeforeMeshHeroes=town3DAnimate;
town3DCharacter=function(kind,color,name){
 if(!name&&['boy','girl'].includes(kind)){
  if(['girl','tsuki'].includes(state.avatar.hero)!==(kind==='girl'))state.avatar.hero=kind;
  const factory=PlazaHeroModels.make(THREE,{compatible:!!Town3D.renderer?.isSoftwareRenderer});
  const model=factory.build(state.avatar.hero,{batch(){},shadow(){const g=new THREE.Mesh(new THREE.CircleGeometry(.38,20),new THREE.MeshBasicMaterial({color:'#819c76',transparent:true,opacity:.23,depthWrite:false}));g.rotation.x=-Math.PI/2;g.position.y=.015;return g;}});
  // Retain the game's collision footprint and approximate previous character height.
  model.userData.releaseHero=()=>factory.disposeTextures();model.scale.setScalar(.82);model.userData.meshHero=true;model.userData.originalColors=new Map();
  model.traverse(o=>{if(o.isMesh){o.userData.noBatch=true;const hex=o.material?.color?.getHexString();if(hex)model.userData.originalColors.set(o,hex);}});return model;
 }
 // All islanders keep their established species and defining teacher features.
 return townAnimalMesh(kind,color,name);
};
function townHeroWardrobe(actor){const u=actor.userData,key=IS.wardrobe.equipped;if(u.wardrobe===key)return;u.wardrobe=key;u.updateLook({look:'reference'});const p=PlazaHeroModels.profiles[u.kind],outfit=ISLAND_DATA.outfits[key]||ISLAND_DATA.outfits.starter,map={[p.jacket.slice(1)]:outfit.coat,[p.trim.slice(1)]:outfit.trim,[p.bottom.slice(1)]:outfit.legs};
 for(const [mesh,original]of u.originalColors){if(!mesh.material?.color)continue;const color=key==='starter'?'#'+original:map[original]||'#'+original;if(!mesh.userData.heroMaterial){mesh.material=mesh.material.clone();mesh.userData.heroMaterial=true;}mesh.material.color.set(color);}
}
town3DAnimate=function(actor,x,z,dir,moving,now,mode='idle'){
 const u=actor.userData;if(u.animalKind){actor.position.set(x+.5,0,z+.5);actor.rotation.y={down:0,up:Math.PI,left:-Math.PI/2,right:Math.PI/2}[dir]||0;const swing=moving&&!state.settings.reducedMotion?Math.sin(now/140)*.4:0;u.leftLeg.rotation.x=swing;u.rightLeg.rotation.x=-swing;u.leftArm.rotation.x=-swing*.7;u.rightArm.rotation.x=swing*.7;return;}if(!u.meshHero){animateBeforeMeshHeroes(actor,x,z,dir,moving,now,mode);return;}
 const previous=u.previousTime??now,dt=Math.min(.15,Math.max(0,(now-previous)/1000));u.previousTime=now;actor.position.set(x+.5,.09,z+.5);const prev=u.lastPosition;let angle={down:0,up:Math.PI,left:-Math.PI/2,right:Math.PI/2}[dir]||0;
 if(moving&&prev&&Math.hypot(x-prev.x,z-prev.z)>.00001)angle=Math.atan2(x-prev.x,z-prev.z);u.lastPosition={x,z};const difference=Math.atan2(Math.sin(angle-actor.rotation.y),Math.cos(angle-actor.rotation.y));actor.rotation.y+=difference*Math.min(1,dt*14);
 if(actor===Town3D.player||u.playerAvatar){const el=Town3D.renderer?.domElement;if(el){el.dataset.hero=u.name;el.dataset.display=Town3D.renderer.isSoftwareRenderer?'compatible-3d':'webgl';el.dataset.position=JSON.stringify([+x.toFixed(3),+z.toFixed(3)]);el.dataset.look=IS.wardrobe.equipped;}}
 PlazaHeroModels.animate(actor,{time:now,dt,moving,dash:!!(dashHeld||state.settings.dashMode),reducedMotion:state.settings.reducedMotion,mode});townHeroWardrobe(actor);
};
const avatarBeforeMeshHeroes=selectAvatar;
selectAvatar=function(kind){if(!Object.hasOwn(TownHeroes.names,kind))return;const base=['girl','tsuki'].includes(kind)?'girl':'boy';state.avatar={...state.avatar,kind:base,hero:kind,selected:true};Town3D.area='';TownInterior.key='';save(false);renderChoices([['町へ',closeChoices]]);tell(TownHeroes.names[kind]+'で暮らします。持ち物や島の進行はそのままです。');};
avatarMenu=function(){stopWorldInput();tell('主人公を選ぼう。見た目はいつでも変更できます。');renderChoices([...Object.entries(TownHeroes.names).map(([id,name])=>[name,()=>selectAvatar(id)]),['戻る',closeChoices]]);};
function townAnimalMesh(kind,color,name){
 const row=TOWN_DATA.residents.find(r=>r.name===name||r.id===kind),id=row?.id||name||kind,a=ISLAND_DATA.animals[id]||islandLegacyAnimals[id]||{kind:'dog',fur:color||'#c4ad8c',ears:'#dfc5a6'},p=TOWN_CHARACTER_PROFILES[id]||{shirt:color||'#89a4a0',accent:'#efd59c'},g=new THREE.Group(),head=new THREE.Group();head.position.y=1.35;g.add(head);
 const mesh=(parent,type,col,x,y,z,sx,sy,sz)=>town3DMesh(parent,type,col,x,y,z,sx,sy,sz),orb=(parent,col,x,y,z,sx,sy=sx,sz=sx)=>mesh(parent,'sphere',col,x,y,z,sx,sy,sz);
 orb(g,p.shirt,0,.75,0,a.muscle?.45:.33,.39,.25);mesh(g,'box',p.accent||'#f5e8d0',0,.82,.23,.24,.28,.035);
 const legs=[],arms=[],shoes=[];for(const s of [-1,1]){const leg=new THREE.Group();leg.position.set(s*.15,.53,0);g.add(leg);mesh(leg,'cylinder','#667a76',0,-.2,0,.10,.38,.10);legs.push(leg);shoes.push(orb(leg,'#75644e',0,-.42,.06,.14,.09,.19));const arm=new THREE.Group();arm.position.set(s*(a.muscle?.46:.35),1,0);g.add(arm);orb(arm,a.fur,0,-.19,0,a.muscle?.16:.11,.27,.12);arms.push(arm);}
 orb(head,a.fur,0,0,0,.44,.40,.35);if(a.kind==='sheep')for(let i=0;i<11;i++){const t=i/11*Math.PI*2;orb(head,a.fur,Math.sin(t)*.38,Math.cos(t)*.34,-.07,.14);}
 if(a.kind==='hedgehog')for(let i=0;i<9;i++){const t=i/9*Math.PI*2;const spike=mesh(head,'cone','#786c5c',Math.sin(t)*.38,Math.cos(t)*.34,-.14,.12,.30,.12);spike.rotation.z=-t;}
 if(a.kind==='deer')for(const side of [-1,1]){mesh(head,'cylinder','#9c8763',side*.24,.46,-.03,.025,.38,.025);const branch=mesh(head,'cylinder','#9c8763',side*.31,.50,-.03,.025,.19,.025);branch.rotation.z=-side*.8;}
 for(const s of [-1,1]){if(a.kind==='rabbit'){orb(head,a.fur,s*.24,.41,0,.10,.32,.10);orb(head,a.ears,s*.24,.43,.09,.04,.21,.02);}else if(['cat','fox','wolf'].includes(a.kind)){mesh(head,'cone',a.fur,s*.30,.33,0,.15,.31,.13);mesh(head,'cone',a.ears,s*.30,.34,.09,.07,.19,.025);}else if(a.kind==='dog'){orb(head,a.ears,s*.4,-.015,-.02,.12,.28,.12);}else if(!['owl','penguin'].includes(a.kind)){orb(head,a.fur,s*.34,.27,0,.13,.13,.10);orb(head,a.ears,s*.34,.28,.085,.07,.07,.025);}
 if(a.kind==='owl')orb(head,'#f3e8ce',s*.18,.02,.29,.20,.24,.09);if(['panda','tanuki'].includes(a.kind))orb(head,'#6d6358',s*.17,0,.30,.13,.11,.04);
 orb(head,'#34483d',s*.16,.015,.337,.035,.055,.023);orb(head,'#fff9e8',s*.16-.012,.035,.357,.012,.015,.007);
 if(a.glasses){const ring=new THREE.Mesh(new THREE.TorusGeometry(.10,.013,6,20),town3DMaterial('#536864'));ring.position.set(s*.16,.015,.375);head.add(ring);}
 }
 if(a.glasses)mesh(head,'box','#536864',0,.015,.37,.12,.02,.02);
 if(['owl','penguin'].includes(a.kind))mesh(head,'cone','#d4a35e',0,-.12,.39,.055,.10,.065).rotation.z=Math.PI;else{orb(head,'#efe0c3',0,-.15,.32,.23,.13,.08);orb(head,'#705c52',0,-.11,.41,.045,.03,.025);}
 if(a.smile){orb(head,'#72594c',0,-.20,.4,.16,.065,.025);mesh(head,'box','#fff8e7',0,-.18,.425,.25,.045,.01);}if(a.elegant){orb(g,'#edd596',0,1.08,.27,.035);}
 if(['fox','squirrel','tanuki','beaver'].includes(a.kind))orb(g,a.fur,.29,.55,-.27,.17,.31,.17);
 const shadow=mesh(g,'cylinder','#8ba582',0,.03,0,.34,.006,.24);g.userData={leftLeg:legs[0],rightLeg:legs[1],leftArm:arms[0],rightArm:arms[1],head,shoes,shadow,animalKind:a.kind};return g;
}
Town3D.area='';TownInterior.key='';

function townReleaseHeroTextures(root){if(root)root.traverse(o=>o.userData.releaseHero?.());}
const releaseBeforeMeshHeroes=town3DReleaseWorld;town3DReleaseWorld=function(){townReleaseHeroTextures(Town3D.world);releaseBeforeMeshHeroes();};
const interiorReleaseBeforeMeshHeroes=townInteriorRelease;townInteriorRelease=function(){townReleaseHeroTextures(TownInterior.root);interiorReleaseBeforeMeshHeroes();};

// UI-only portraits are rendered from these same original 3D models.
const TownHeroPortraits=Object.fromEntries(['girl','boy','tsuki','green'].map(kind=>{const image=new Image();image.src='./prototypes/portraits/'+kind+'.png?v=20-compact-body';return [kind,image];}));
