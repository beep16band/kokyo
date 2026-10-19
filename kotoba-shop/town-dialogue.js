// Presentation only: keep complete dialogue/ruby text available to game logic.
const TownDialogue={typing:false,units:[],shown:0,frame:0,speaker:null,origin:null};
const dialoguePanel=document.getElementById('panel');
const dialogueHead=document.createElement('div');dialogueHead.className='dialogueHead';
const dialogueName=document.createElement('span');dialogueName.id='dialogueName';
const dialogueLeaf=document.createElement('span');dialogueLeaf.className='dialogueLeaf';dialogueLeaf.textContent='❀';dialogueLeaf.setAttribute('aria-hidden','true');
dialogueHead.append(dialogueName,dialogueLeaf);dialoguePanel.insertBefore(dialogueHead,dialog);
const dialogueReveal=document.createElement('button');dialogueReveal.id='dialogueReveal';dialogueReveal.type='button';dialogueReveal.textContent='全文をみる ▾';dialogueReveal.hidden=true;dialog.after(dialogueReveal);
const dialogueStatus=document.createElement('span');dialogueStatus.className='dialogueSr';dialogueStatus.setAttribute('role','status');dialoguePanel.append(dialogueStatus);
function dialogueDirection(x,y,fallback='down'){const dx=state.x-x,dy=state.y-y;return dx||dy?(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up')):fallback;}
function dialogueIndoorSpeaker(){return state.scene==='facility'?townFacilityRoom()?.teacher:state.scene==='shop'?orders[state.ordersDone]?.customer:null;}
function faceDialogueSpeaker(name){
 if(name===dialogueIndoorSpeaker()){TownDialogue.speaker=name;TownDialogue.origin=[state.scene,state.area,state.x,state.y];return;}
 const n=npcs.find(n=>n.name===name&&worldNpcConfig[n.name]?.area===state.area);
 if(!n||state.scene!=='town'||Math.abs(n.x-state.x)+Math.abs(n.y-state.y)>4)return;
 const p=worldNpcState[name];if(p){p.step=null;p.vx=p.x;p.vy=p.y;n.x=n.vx=p.x;n.y=n.vy=p.y;}
 n.face=dialogueDirection(n.x,n.y,n.face);
 n.waitUntil=performance.now()+1200;TownDialogue.speaker=name;TownDialogue.origin=[state.scene,state.area,state.x,state.y];
}
function finishDialogueTyping(){
 const d=TownDialogue;cancelAnimationFrame(d.frame);for(const el of d.units)el.style.visibility='';d.shown=d.units.length;d.typing=false;dialogueReveal.hidden=true;dialog.removeAttribute('aria-busy');dialogueStatus.textContent=dialog.dataset.plain||'';
 clearTimeout(quietTimer);quietTimer=setTimeout(()=>{if(!choices.children.length&&!mini&&!editorOpen)dialoguePanel.classList.add('quiet')},6500);
}
function presentDialogue(){
 const d=TownDialogue;cancelAnimationFrame(d.frame);d.typing=false;d.units=[];d.shown=0;dialogueReveal.hidden=true;dialog.removeAttribute('aria-busy');
 const text=dialog.dataset.plain||dialog.textContent,match=text.match(/(?:^|[\n\s】])([^「」【】\n\s]{1,24})「/),name=match?.[1];
 dialogueName.textContent=name||'おしらせ';dialoguePanel.classList.toggle('hasSpeaker',!!name);if(typeof townDockDialogue==='function')townDockDialogue(!!name);
 d.speaker=null;d.origin=null;if(name)faceDialogueSpeaker(name);
 dialog.setAttribute('aria-live','off');dialog.setAttribute('aria-label',text);dialogueStatus.textContent='';
 // System instructions and learning worksheets remain immediately readable.
 if(!name||state.settings.reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches){dialogueStatus.textContent=text;return;}
 const fragment=document.createDocumentFragment();
 for(const node of [...dialog.childNodes]){
  if(node.nodeType===Node.TEXT_NODE){const chars=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('ja',{granularity:'grapheme'}).segment(node.textContent)].map(x=>x.segment):Array.from(node.textContent);for(const ch of chars){const el=document.createElement('span');el.textContent=ch;el.style.visibility='hidden';d.units.push(el);fragment.append(el);}}
  else{node.style.visibility='hidden';d.units.push(node);fragment.append(node);}
 }
 dialog.replaceChildren(fragment);if(!d.units.length)return;
 clearTimeout(quietTimer);d.typing=true;dialog.setAttribute('aria-busy','true');dialogueReveal.hidden=false;const started=performance.now();
 function tick(now){if(!d.typing)return;const count=Math.min(d.units.length,1+Math.floor((now-started)/30));while(d.shown<count)d.units[d.shown++].style.visibility='';if(d.shown===d.units.length)finishDialogueTyping();else d.frame=requestAnimationFrame(tick);}
 d.frame=requestAnimationFrame(tick);
}
const tellBeforeDialogue=tell;tell=function(text){tellBeforeDialogue(text);presentDialogue();};
const refreshRubyBeforeDialogue=refreshRuby;refreshRuby=function(){refreshRubyBeforeDialogue();presentDialogue();};
const actionBeforeDialogue=action;action=function(){
 if(TownDialogue.typing&&!setupOpen&&!menuOpen&&!mini){finishDialogueTyping();return;}
 if(!setupOpen&&!menuOpen&&!editorOpen&&!walkStep&&!mini&&!choices.children.length&&state.scene==='town'){
  const [dx,dy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[facing];const n=npcs.find(n=>n.x===state.x+dx&&n.y===state.y+dy&&worldNpcConfig[n.name]?.area===state.area);if(n){stopWorldInput();faceDialogueSpeaker(n.name);}
 }
 return actionBeforeDialogue();
};
const updateNpcsBeforeDialogue=updateWorldNpcs;updateWorldNpcs=function(now){
 const d=TownDialogue,o=d.origin;
 if(d.speaker&&o&&!dialoguePanel.classList.contains('quiet')&&state.scene===o[0]&&state.area===o[1]&&state.x===o[2]&&state.y===o[3]&&!walkStep)faceDialogueSpeaker(d.speaker);
 else {d.speaker=null;d.origin=null;}
 updateNpcsBeforeDialogue(now);
};
dialogueReveal.onclick=finishDialogueTyping;dialog.addEventListener('click',()=>{if(TownDialogue.typing)finishDialogueTyping();});
// Navigation calls this before activating a choice, so Space first reveals the line.
TownDialogue.consumeKey=function(e){if(!TownDialogue.typing||setupOpen||menuOpen||editorOpen||mini||TownLife.clay||e.isComposing||e.ctrlKey||e.altKey||e.metaKey||e.target.matches('input,textarea,select,[contenteditable="true"]'))return false;if(![' ','Enter','e','E'].includes(e.key))return false;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)finishDialogueTyping();return true;};

// Both lightweight canvas and 3D billboards use the same indoor speaking direction.
const characterBeforeDialogue=character;character=function(x,y,color,ears=false,kind='human',phase=0,dir='down'){
 const spot=state.scene==='facility'?townFacilityRoom()?.spot:state.scene==='shop'?shopCustomer:null;
 if(kind!=='human'&&spot&&x===spot.x&&y===spot.y&&TownDialogue.speaker===dialogueIndoorSpeaker())dir=dialogueDirection(x,y,dir);
 return characterBeforeDialogue(x,y,color,ears,kind,phase,dir);
};
const animateBeforeDialogue=town3DAnimate;town3DAnimate=function(actor,x,z,dir,moving,now,mode='idle'){
 if(actor===TownInterior.customer&&TownDialogue.speaker===dialogueIndoorSpeaker()){dir=dialogueDirection(x,z,dir);if(actor.userData.direction!==dir)TownInterior.frame='';}
 return animateBeforeDialogue(actor,x,z,dir,moving,now,mode);
};
