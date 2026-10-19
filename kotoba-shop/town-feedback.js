// Improvements requested in 改善①: shared spatial rules and clear, physical activities.
const TownStaff={rooms:{'阪本先生':'kuan','阪口先生':'school','ギャラクシー先生':'clay'}};
for(const[name,room]of Object.entries(TownStaff.rooms)){
 worldNpcConfig[name].area='inside:'+room;const n=npcs.find(n=>n.name===name),p=worldNpcState[name];
 if(n)Object.assign(n,{x:-100,y:-100,vx:-100,vy:-100});if(p)Object.assign(p,{step:null,nextAt:Infinity});
}
const visitBeforeStaff=townVisitNPC;townVisitNPC=function(name){const room=TownStaff.rooms[name];if(room)return townPlaceMark(room);return visitBeforeStaff(name);};
residentGuideMenu=function(){tell('【町の人のいる場所】\n先生は、それぞれの建物の中にいます。場所に★をつけて、会いに行こう。');renderChoices([...TOWN_DATA.residents.map(r=>{const room=TownStaff.rooms[r.name],place=room?TownPlaces[room].name:AREAS[worldNpcConfig[r.name].area].name;return [r.name+'：'+place,()=>townVisitNPC(r.name)];}),['戻る',townLifeMenu],['閉じる',closeChoices]]);};
const talkBeforeStaff=townTalk;townTalk=function(name){
 const room=TownStaff.rooms[name];if(room&&!townPlaceRequire(townInRoom(room),room))return false;
 const result=talkBeforeStaff(name);if(room){const allowed={'kuan':['久庵で買い物','またね'],'school':['依頼文を読む国語','またね'],'clay':['クレー射撃場','またね']}[room];for(const b of [...choices.children])if(!allowed.includes(b.dataset.plain||b.textContent))b.remove();}
 return result;
};
// Wall footprints and a narrow body-clearance strip are solid, including beside windows.
// The front-door corridor remains open; only moving north into the door enters a building.
const floorBeforeClearance=mapFloorFree;mapFloorFree=function(area,x,y){
 const m=maps[area];if(!m)return false;
 for(const b of m.buildings){if(x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)return false;
  if(x>=b.x-1&&x<=b.x+b.w&&y>=b.y-1&&y<=b.y+b.h&&!(x===b.door.x&&y===b.door.y+1))return false;
 }
 return floorBeforeClearance(area,x,y);
};
const passableBeforeThreshold=passable;passable=function(x,y){if(state.scene!=='town'&&y===10&&x!==10)return false;return passableBeforeThreshold(x,y);};
if(state.scene==='town'&&!mapFloorFree(state.area,state.x,state.y)){[state.x,state.y]=safeSpawn(state.area,state.x,state.y);visualX=state.x;visualY=state.y;}
// A net stays on a stable hand pose and sweeps continuously; the hoop faces the camera.
const toolPoseBeforeFeedback=town3DActorToolPose;town3DActorToolPose=function(V,now){
 toolPoseBeforeFeedback(V,now);if(!V.tool?.visible)return;
 const forward=new THREE.Vector3(...({right:[1,0,0],left:[-1,0,0],up:[0,0,-1],down:[0,0,1]}[facing]));
 if(netSwing){const p=Math.max(0,Math.min(1,(now-netSwing.start)/620)),sweep=state.settings.reducedMotion?0:(p-.5)*1.4;forward.applyAxisAngle(new THREE.Vector3(0,1,0),sweep);forward.multiplyScalar(.95);forward.y=state.settings.reducedMotion?.6:.7-Math.sin(p*Math.PI)*.35;}
 else if(mini?.action){forward.set(mini.target.x+.5-V.tool.position.x,0,mini.target.y+.5-V.tool.position.z).normalize().multiplyScalar(.8);forward.y=.9;}
 V.tool.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),forward.normalize());
 if(V.netRing)V.netRing.quaternion.copy(V.tool.quaternion).invert().multiply(V.camera.quaternion);
 V.tool.updateMatrixWorld(true);
};
// Notifications are UI beneath the field, not a sheet lying on a road.
const noticeDock=document.createElement('section');noticeDock.id='noticeDock';noticeDock.setAttribute('aria-label','案内');frame.after(noticeDock);
function townDockDialogue(spoken){const p=document.getElementById('panel');if(spoken){if(p.parentElement!==frame)frame.append(p);}else if(p.parentElement!==noticeDock)noticeDock.append(p);noticeDock.hidden=spoken||p.classList.contains('quiet');}
new MutationObserver(()=>{noticeDock.hidden=document.getElementById('panel').parentElement!==noticeDock||document.getElementById('panel').classList.contains('quiet');}).observe(document.getElementById('panel'),{attributes:true,attributeFilter:['class']});
new ResizeObserver(()=>noticeDock.style.width=frame.getBoundingClientRect().width+'px').observe(frame);
const dockStyle=document.createElement('style');dockStyle.textContent=`#noticeDock{box-sizing:border-box;margin:8px 0;max-width:100%}#noticeDock[hidden]{display:none}#noticeDock #panel{box-sizing:border-box;position:relative;left:auto;right:auto;bottom:auto;width:100%;max-width:none;max-height:48vh;margin:0;padding:14px 18px;background:#fffaf0;color:#564d47;border:2px solid #efcbd2;border-radius:20px;box-shadow:0 3px 10px #45684d18;overflow:auto}#noticeDock #panel.quiet{display:none}#noticeDock .dialogueHead{display:none}#noticeDock #dialog{color:#564d47;font-size:15px;line-height:2;margin:0 0 9px}#noticeDock #choices{gap:7px}#noticeDock #choices button{background:#edf3e5;color:#48654f;border:1px solid #c2d2b5;border-radius:14px;margin:0}#noticeDock #dialogueReveal{display:none}@media(max-width:800px){#noticeDock #panel{padding:11px 13px}#noticeDock #dialog{font-size:14px}#noticeDock #choices button{font-size:13px}body.townLearningFocus #noticeDock #panel{position:relative;inset:auto;max-height:65vh}}`;document.head.append(dockStyle);townDockDialogue(false);
Town3D.area='';Town3D.frameArea='';

// A cast cannot pass through a tree, rock or building to reach water behind it.
waterTarget=function(){if(state.scene!=='town'||!['river','lake'].includes(state.area))return null;let best=null;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const x=state.x+dx,y=state.y+dy,d=Math.hypot(dx,dy);if(maps[state.area].tiles[y]?.[x]!==3||d>2.75||best&&d>=best.d)continue;let clear=true;const steps=Math.ceil(d*5);for(let i=1;i<steps;i++){const a=Math.floor(state.x+.5+dx*i/steps),b=Math.floor(state.y+.5+dy*i/steps);if(a===x&&b===y)continue;if(maps[state.area].blocked.has(a+','+b)){clear=false;break;}}if(clear)best={x,y,d};}return best;};
const fishingStatus=document.createElement('p');fishingStatus.id='fishingStatus';fishingStatus.setAttribute('role','status');fishingStatus.hidden=true;frame.after(fishingStatus);
function townFishingStatus(){const m=mini?.action?mini:null;fishingStatus.hidden=!m;if(!m)return;const text={cast:'竿をふっています。',wait:'ウキを見て待とう。沈んだらSpace！',bite:'今！ Space！',land:CREATURES[m.key].name+'を釣り上げた！',miss:'魚が逃げた。もう一度やってみよう。'}[m.phase];if(fishingStatus.textContent!==text)fishingStatus.textContent=text;fishingStatus.dataset.phase=m.phase;}
const fishingStatusStyle=document.createElement('style');fishingStatusStyle.textContent='#fishingStatus{display:block;box-sizing:border-box;width:min(720px,96%);margin:8px 0;padding:10px 18px;border:2px solid #aec9b4;border-radius:16px;background:#fff7de;color:#436355;text-align:center;font-size:16px;font-weight:bold}#fishingStatus[hidden]{display:none}#fishingStatus[data-phase=bite]{background:#ffe0be;border-color:#ca8565;color:#8d4931}';document.head.append(fishingStatusStyle);
const townBugMaterials=new Map();
function townBugMaterial(key){
 if(townBugMaterials.has(key))return townBugMaterials.get(key);
 const canvas=document.createElement('canvas');canvas.width=96;canvas.height=80;const g=canvas.getContext('2d');g.translate(48,40);g.lineWidth=3;g.strokeStyle='#32433c';
 g.fillStyle='#fff8dbbb';g.beginPath();g.ellipse(0,3,42,29,0,0,Math.PI*2);g.fill();
 if(['butterfly','moth'].includes(key)){for(const side of [-1,1]){g.fillStyle=key==='moth'?'#bb8fc3':'#edbd59';g.beginPath();g.ellipse(side*18,-4,19,23,side*.3,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#fff2c7';g.beginPath();g.ellipse(side*19,-7,9,12,0,0,Math.PI*2);g.fill();}g.fillStyle='#4a514a';g.fillRect(-4,-22,8,48);}
 else if(key==='dragonfly'){g.fillStyle='#b7f0e5';for(const yy of [-10,7]){g.beginPath();g.ellipse(0,yy,37,9,-.12,0,Math.PI*2);g.fill();g.stroke();}g.fillStyle='#c47742';g.fillRect(-4,-24,8,53);}
 else{for(const side of [-1,1])for(const yy of [-9,4,17]){g.beginPath();g.moveTo(side*12,yy);g.lineTo(side*27,yy+7);g.stroke();}g.fillStyle=key==='beetle'?'#865331':'#ec6247';g.beginPath();g.ellipse(0,5,20,24,0,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#323e37';g.beginPath();g.ellipse(0,-19,12,9,0,0,Math.PI*2);g.fill();g.fillRect(-1,-15,3,42);if(key==='beetle'){g.fillRect(-3,-34,6,19);g.fillRect(-11,-34,22,4);}else for(const[x,y]of[[-11,-2],[10,3],[-9,15],[10,18]]){g.beginPath();g.arc(x,y,4,0,Math.PI*2);g.fill();}}
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});townBugMaterials.set(key,mat);return mat;
}
function townBugAppearance3D(V){for(let i=0;i<V.bugs.length;i++){const group=V.bugs[i],bug=fieldWorld.bugs[i];if(!bug)continue;let sprite=group.userData.bugSprite;if(!sprite){for(const mesh of group.children)mesh.visible=false;sprite=new THREE.Sprite(townBugMaterial(bug.key));sprite.scale.set(.55,.46,1);sprite.renderOrder=12;group.add(sprite);group.userData.bugSprite=sprite;}sprite.material=townBugMaterial(bug.key);}}
