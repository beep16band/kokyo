// Chapter five: independent visual state; no save data or unlock changes.
export function visual5(step,data){
 const scene=data.scenes.find(s=>s.scene_id===step.sceneId),n=step.line??-1,id=scene.scene_id;let bg=scene.background_ids[0],ids=['akane','minato'],recovered=false;
 if(id==='C05-S01'&&n>=3||['C05-S02','C05-S03','C05-S04'].includes(id)){ids=['saigyo'];recovered=id==='C05-S04';bg=recovered?'BG31':'BG30'}
 if(id==='C05-S05'&&n>=3||['C05-S06','C05-S07'].includes(id)){ids=['teika'];recovered=id==='C05-S07';bg=recovered?'BG33':'BG32'}
 return {scene,bg,ids,recovered,memory:false};
}
export function emotion5(id,scene,n){
 if(id==='saigyo')return scene==='C05-S04'?(n>=3?'smile':'normal'):'hollow';
 if(id==='teika')return scene==='C05-S07'?(n>=7?'smile':'normal'):'hollow';
 if(id==='kotoha')return 'sealed';
 if(id==='akane'){
  if(scene==='C05-S09')return n>=27?'surprise':n>=22?'smile':n===13?'resolve':n>=4&&n<=12?'fear':'sad';
  if(scene==='C05-S08')return n>=6?'sad':'surprise';
  if(scene==='C05-S07')return n>=8?'smile':'surprise';
  if(scene==='C05-S01')return n>=3?'surprise':'fear';
 }
 if(id==='minato'){
  if(scene==='C05-S09')return n>=26?'surprise':n>=22?'smile':n>=7?'resolve':'fear';
  if(scene==='C05-S08')return n>=7?'resolve':'sad';
  if(scene==='C05-S07')return n>=11?'smile':'resolve';
 }
 return null;
}
export function direction5(step){
 const id=step.sceneId,n=step.line??-1,reveal=id==='C05-S09'&&n===19;
 return {stream:id==='C05-S04',shore:id==='C05-S07',ink:id==='C05-S08'||id==='C05-S09'&&n<21,reverse:id==='C05-S09'&&n>=16&&n<=19,restored:id==='C05-S09'&&n>=21,reveal,audio:id==='C05-S09'?(n<16?'heartbeat':n<19?'rising':'restored'):'normal'};
}
export function paintDirection5(host,step){
 const v=direction5(step);host.className='chapter-effects c05-effects';host.dataset.stream=String(v.stream);host.dataset.shore=String(v.shore);host.dataset.ink=String(v.ink);host.dataset.reverse=String(v.reverse);host.dataset.restored=String(v.restored);return v;
}
// The reveal is tied to the current scene position, never a persisted global surname flag.
export class NameReveal5{
 constructor(host,{sound=()=>{},busy=()=>{},clock=globalThis}={}){this.host=host;this.sound=sound;this.busy=busy;this.clock=clock;this.timers=[];this.pending=null;this.locked=false}
 cancel(finish=false){for(const t of this.timers)this.clock.clearTimeout(t);this.timers=[];this.host.hidden=true;this.host.dataset.phase='';this.locked=false;this.busy(false);if(finish)this.ready();this.pending=null}
 ready(){const fn=this.pending;this.pending=null;fn?.()}
 present(step,effects,onReady){this.cancel();const v=direction5(step);this.sound(v.audio);if(!v.reveal||!effects){onReady();return}
  this.pending=onReady;this.locked=true;this.busy(true);this.host.hidden=false;this.host.dataset.phase='silence';this.sound('silence');
  this.timers.push(this.clock.setTimeout(()=>{this.host.dataset.phase='name';this.sound('reveal');this.ready()},1600));
  this.timers.push(this.clock.setTimeout(()=>{this.host.hidden=true;this.host.dataset.phase='';this.locked=false;this.busy(false);this.sound('restored')},4800));
 }
}
