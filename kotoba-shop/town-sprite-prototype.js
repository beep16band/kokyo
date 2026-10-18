// First-scene prototype: existing 3D town, existing 2D artwork, existing game logic.
// This module is loaded only by sprite-prototype.html, not the production entry point.
const TownSpritePrototype={version:1,enabled:true,area:'town',height:1.94,width:1.552,footY:.07,actors:new Set(),legacy:new Map()};
// Reuse the legacy animal artwork. Warm the idle stamps before the first 3D frame.
for(const n of npcs){if(townCharacterProfile(n.design||'animal',n.color,n.name))continue;
 const row=worldNpcConfig[n.name]?.row||1;
 for(const dir of TownCharacters.directions){character2DBeforeProfiles(0,0,n.color,false,'animal',0,dir);const stamp=cozyCache.get('actor-'+row+'-'+dir+'-0');if(stamp)TownSpritePrototype.legacy.set(n.name+'|'+dir,stamp);}
}
const townCharacterBeforeSpritePrototype=town3DCharacter;
town3DCharacter=function(kind,color,name){
 if(!TownSpritePrototype.enabled||state.scene!=='town'||state.area!==TownSpritePrototype.area)return townCharacterBeforeSpritePrototype(kind,color,name);
 const profile=townCharacterProfile(kind,color,name),canvas=document.createElement('canvas');canvas.width=64;canvas.height=80;
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.12,depthTest:true,depthWrite:true,toneMapped:false});
 const sprite=new THREE.Sprite(material);sprite.center.set(.5,.05);sprite.scale.set(TownSpritePrototype.width,TownSpritePrototype.height,1);
 // Sprite geometry is shared by Three.js; preserve it during the existing world cleanup.
 Town3D.shapes.set('prototype-sprite-geometry',sprite.geometry);
 const group=new THREE.Group();group.add(sprite);town3DMesh(group,'cylinder','#8ba582',0,.005,0,.32,.005,.22);
 group.userData={prototype2D:true,profile,sprite,canvas,texture,material,legacyName:name,frameKey:''};TownSpritePrototype.actors.add(group);return group;
};
const animateBeforeSpritePrototype=town3DAnimate;
town3DAnimate=function(actor,x,z,dir,moving,now,mode='idle'){
 const u=actor.userData;if(!u.prototype2D)return animateBeforeSpritePrototype(actor,x,z,dir,moving,now,mode);
 const player=actor===Town3D.player||u.playerAvatar===true,pose=player?townCharacterPose(now):moving?'walk':'idle';
 const duration=player?(dashHeld||state.settings.dashMode?DASH_MS:WALK_MS):NPC_WALK_MS;
 const frame=state.settings.reducedMotion?0:Math.floor(now/(pose==='idle'?450:pose==='joy'?170:duration/2))%4;
 const key=dir+'|'+pose+'|'+frame;
 if(u.frameKey!==key){const g=u.canvas.getContext('2d');g.clearRect(0,0,64,80);
  const stamp=u.profile?townCharacterStamp(u.profile.id,dir,frame,pose):TownSpritePrototype.legacy.get(u.legacyName+'|'+dir);
  if(stamp){if(u.profile)g.drawImage(stamp,0,0);else g.drawImage(stamp,4,14);}
  u.texture.needsUpdate=true;u.frameKey=key;
 }
 actor.position.set(x+.5,TownSpritePrototype.footY,z+.5);actor.rotation.set(0,0,0);
 u.pose=pose;u.direction=dir;u.frame=frame;
};
const releaseBeforeSpritePrototype=town3DReleaseWorld;
town3DReleaseWorld=function(){for(const actor of TownSpritePrototype.actors){actor.userData.texture.dispose();actor.userData.material.dispose();}TownSpritePrototype.actors.clear();releaseBeforeSpritePrototype();};
function setTownSpritePrototype(enabled){TownSpritePrototype.enabled=!!enabled;Town3D.area='';Town3D.frameArea='';spriteCompare.textContent='キャラ：'+(enabled?'2D':'3D')+'（比較）';}
const spriteNotice=document.createElement('div');spriteNotice.id='spritePrototypeNotice';spriteNotice.textContent='表示試作：3Dの町＋2Dキャラ ／ 本編のセーブとは別です。';
const spriteCompare=document.createElement('button');spriteCompare.id='spriteCompare';spriteCompare.textContent='キャラ：2D（比較）';spriteCompare.onclick=()=>setTownSpritePrototype(!TownSpritePrototype.enabled);spriteNotice.append(spriteCompare);document.body.prepend(spriteNotice);
const spriteStyle=document.createElement('style');spriteStyle.textContent='#spritePrototypeNotice{width:min(1180px,100%);padding:8px 12px;margin:0 0 6px;background:#f3dfb7;color:#364a46;border-radius:12px;font-size:13px;display:flex;align-items:center;justify-content:space-between;gap:8px}#spritePrototypeNotice button{min-height:40px;white-space:nowrap}#worldFrame{width:min(1180px,100%,calc((100vh - 180px)*1.6667))}@media(max-width:800px),(pointer:coarse){#spritePrototypeNotice{font-size:11px;padding:5px}#spritePrototypeNotice button{font-size:11px;min-height:40px;padding:4px}#worldFrame{width:min(1180px,100%,calc((100vh - 210px)*1.3333))}}';document.head.append(spriteStyle);
Town3D.area='';Town3D.frameArea='';
