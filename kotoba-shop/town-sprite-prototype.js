// First-scene prototype: existing 3D town, existing 2D artwork, existing game logic.
// This module is loaded only by sprite-prototype.html, not the production entry point.
const TownSpritePrototype={version:2,enabled:true,area:'town',height:2.037,width:1.552,topPadding:4,footY:.07,actors:new Set()};
// Render existing animal artwork with explicit frames; do not draw into the game
// canvas or borrow/mutate the live NPC step while warming a texture.
function townSpriteLegacyStamp(name,dir,frame,moving){
 const row=worldNpcConfig[name]?.row||1,fr=moving?frame%8:0,step=moving;
 return cozyStamp('sprite-legacy-'+row+'-'+dir+'-'+fr+'-'+Number(moving),56,68,g=>{const walk=step?Math.sin(fr/8*Math.PI*2):0,bob=step?Math.abs(walk)*1:0;const fur=['#f1cfab','#b98a64','#f3e3cc','#b3b59a','#dba36e','#b4cad0','#dec499'][row],shirt=['#6f9da4','#b67e68','#c99caa','#7f9a87','#839eae','#c5a172','#a19ab9'][row],back=dir==='up',side=dir==='left'?-1:dir==='right'?1:0;g.translate(0,-bob);cozyOval(g,21,59+walk*2,5,3,'#766654');cozyOval(g,34,59-walk*2,5,3,'#766654');cozyRound(g,18,41,8,16+walk*2,4,'#71837c');cozyRound(g,29,41,8,16-walk*2,4,'#71837c');cozyRound(g,15,30,26,21,10,cozyGrad(g,15,30,23,shirt,'#688981'));cozyOval(g,13+walk,41,4,7,fur);cozyOval(g,42-walk,41,4,7,fur);cozyPoly(g,[[20,31],[28,36],[35,31]],'#f6ebd2');cozyOval(g,28,43,1.3,1.3,'#f3d59a');if(row===2){cozyOval(g,18,10,4,12,fur);cozyOval(g,37,10,4,12,fur);cozyOval(g,18,9,1.5,8,'#dbb6ad');cozyOval(g,37,9,1.5,8,'#dbb6ad')}else if(row===4||row===6){cozyPoly(g,[[11,18],[13,3],[25,16]],fur);cozyPoly(g,[[31,15],[43,3],[46,19]],fur);cozyPoly(g,[[15,15],[15,8],[21,16]],'#ba8d74')}else if(row>0){cozyOval(g,14,15,6,6,fur);cozyOval(g,42,15,6,6,fur);cozyOval(g,14,15,3,3,'#cfae8a');cozyOval(g,42,15,3,3,'#cfae8a')}cozyOval(g,28,24,18,16,cozyGrad(g,0,8,32,fur,row===0?'#e9b990':fur));if(row===0){cozyOval(g,27,13,17,9,'#75634f');cozyOval(g,12,23,4,8,'#75634f');cozyPoly(g,[[11,18],[18,8],[35,8],[44,21],[33,16],[30,23],[23,16],[19,22]],'#75634f');cozyOval(g,24,10,9,2,'#927b5d');if(back)cozyOval(g,28,23,17,14,'#75634f')}if(!back){if(row>0)cozyOval(g,28+side*3,29,11,7,row===3?'#e5e3c7':'#f5e5c8');if(row===3){cozyOval(g,20,23,7,7,'#f3ecd4');cozyOval(g,36,23,7,7,'#f3ecd4')}const blink=false;for(const xx of (side===-1?[19,29]:side===1?[27,37]:[20,36])){cozyOval(g,xx,24,1.8,blink?.6:2.5,'#4e564c');if(!blink)cozyOval(g,xx-.4,23.2,.55,.7,'#fff5dd')}cozyOval(g,16+side*2,29,3,1.6,'#dfaa9788');cozyOval(g,40+side*2,29,3,1.6,'#dfaa9788');cozyOval(g,28+side*3,30,row===3?2.5:1.5,1.2,row===3?'#c3a065':'#946b59');g.strokeStyle='#956e5a';g.lineWidth=.8;g.beginPath();g.arc(28+side*3,32,2,0,Math.PI);g.stroke()}});
}
function townSpriteMotionFrame(actor,x,z,moving,pose,now){
 const u=actor.userData,previous=u.lastGround;
 if(previous&&moving){const distance=Math.hypot(x-previous.x,z-previous.z);if(distance<1.5)u.stride=(u.stride||0)+distance;}
 u.lastGround={x,z};
 if(state.settings.reducedMotion)return 0;
 if(moving)return Math.floor((u.stride||0)*2+1e-6)%4;
 return Math.floor(now/(pose==='idle'?450:170))%4;
}
function townSpriteHand(actor,dir,pose,frame){
 const p=actor.userData.profile,bodyWidth=p?.body==='muscle'?38:p?.body==='round'?32:26;
 const offset=[0,3,6,3][frame%4],y={fish:35,net:30+offset,tool:39+offset,surprise:35,joy:31}[pose]??49;
 return {x:32+bodyWidth/2+2,y:y+TownSpritePrototype.topPadding};
}
function town3DActorToolPose(V,now){
 if(!V.player?.userData.prototype2D||!V.tool.visible)return;
 const u=V.player.userData,hand=townSpriteHand(V.player,u.direction,u.pose,u.frame);
 const right=new THREE.Vector3(1,0,0).applyQuaternion(V.camera.quaternion),up=new THREE.Vector3(0,1,0).applyQuaternion(V.camera.quaternion);
 const towardCamera=new THREE.Vector3(0,0,1).applyQuaternion(V.camera.quaternion);
 V.tool.position.copy(V.player.position).addScaledVector(right,(hand.x/64-.5)*TownSpritePrototype.width).addScaledVector(up,(1-u.sprite.center.y-hand.y/u.canvas.height)*TownSpritePrototype.height).addScaledVector(towardCamera,.015);
 // Reduced motion keeps the net pose and its grip still, while catching rules run normally.
 if(state.settings.reducedMotion)V.tool.rotation.z=0;
 V.tool.updateMatrixWorld(true);u.toolHand={...hand,world:V.tool.position.toArray()};
}
function townSpriteWateringCan(g,hand){
 g.save();g.strokeStyle='#729b9d';g.lineWidth=2;g.beginPath();g.arc(hand.x+1,hand.y+3,4,Math.PI,Math.PI*2);g.stroke();
 cozyRound(g,hand.x-4,hand.y+3,13,10,3,'#83b5cf');cozyPoly(g,[[hand.x+7,hand.y+6],[61,hand.y],[63,hand.y+2],[hand.x+8,hand.y+10]],'#83b5cf');
 cozyOval(g,61,hand.y+1,2,1.5,'#fff2ce');g.restore();
}
const townCharacterBeforeSpritePrototype=town3DCharacter;
town3DCharacter=function(kind,color,name){
 if(!TownSpritePrototype.enabled||state.scene!=='town'||state.area!==TownSpritePrototype.area)return townCharacterBeforeSpritePrototype(kind,color,name);
 const profile=townCharacterProfile(kind,color,name),canvas=document.createElement('canvas');canvas.width=64;canvas.height=84;
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
 const material=new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.12,depthTest:true,depthWrite:true,toneMapped:false});
 const sprite=new THREE.Sprite(material);sprite.center.set(.5,4/84);sprite.scale.set(TownSpritePrototype.width,TownSpritePrototype.height,1);
 // Sprite geometry is shared by Three.js; preserve it during the existing world cleanup.
 Town3D.shapes.set('prototype-sprite-geometry',sprite.geometry);
 const group=new THREE.Group();group.add(sprite);town3DMesh(group,'cylinder','#8ba582',0,.005,0,.32,.005,.22);
 group.userData={prototype2D:true,profile,sprite,canvas,texture,material,legacyName:name,frameKey:''};TownSpritePrototype.actors.add(group);return group;
};
const animateBeforeSpritePrototype=town3DAnimate;
town3DAnimate=function(actor,x,z,dir,moving,now,mode='idle'){
 const u=actor.userData;if(!u.prototype2D)return animateBeforeSpritePrototype(actor,x,z,dir,moving,now,mode);
 const player=actor===Town3D.player||u.playerAvatar===true,pose=player?townCharacterPose(now):moving?'walk':'idle';
 const frame=townSpriteMotionFrame(actor,x,z,moving,pose,now);
 const legacyFrame=state.settings.reducedMotion?0:Math.floor((u.stride||0)*4+1e-6)%8;
 const key=dir+'|'+pose+'|'+(u.profile?frame:legacyFrame);
 if(u.frameKey!==key){const g=u.canvas.getContext('2d');g.clearRect(0,0,64,84);
  const stamp=u.profile?townCharacterStamp(u.profile.id,dir,frame,pose,TownSpritePrototype.topPadding):townSpriteLegacyStamp(u.legacyName,dir,legacyFrame,moving&&!state.settings.reducedMotion);
  if(stamp){if(u.profile)g.drawImage(stamp,0,0);else g.drawImage(stamp,4,18);}
  if(player&&pose==='tool')townSpriteWateringCan(g,townSpriteHand(actor,dir,pose,frame));
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
