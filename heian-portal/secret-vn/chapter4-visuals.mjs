// Chapter four only. Earlier chapters keep their visual and save behavior.
export function visual4(step,data){
 const s=data.scenes.find(s=>s.scene_id===step.sceneId),n=step.line??-1;let bg=s.background_ids[0],ids=['akane','minato'],recovered=false,memory=false;
 if(['C04-S02','C04-S03','C04-S04'].includes(s.scene_id)){
  ids=['narihira'];recovered=s.scene_id==='C04-S04'&&n>=11;
  if(s.scene_id==='C04-S04')bg=n>=13?'BG25':'BG24';
 }else if(s.scene_id==='C04-S05'){
  memory=n<=6;ids=memory?['kotoha-child','mahiro-child']:['akane','minato'];bg=memory?'BG26':'BG25';
 }else if(['C04-S06','C04-S07'].includes(s.scene_id)){
  ids=['hitomaro'];recovered=s.scene_id==='C04-S07'&&n>=4;bg=recovered?'BG28':'BG27';
 }else if(s.scene_id==='C04-S08'){
  memory=n<=7;ids=memory?['kotoha','mahiro']:['akane','minato'];bg=memory?'BG17':'BG25';
 }
 return {scene:s,bg,ids,recovered,memory};
}
export function emotion4(id,scene,n){
 const acting={
 akane:{'C04-S01':{1:'surprise',4:'resolve'},'C04-S02':{2:'resolve',5:'resolve'},'C04-S04':{1:'surprise',5:'surprise',10:'resolve',15:'smile',21:'fear'},'C04-S05':{7:'sad'},'C04-S06':{3:'resolve'},'C04-S07':{1:'resolve',5:'surprise'},'C04-S09':{4:'surprise',8:'resolve'}},
 minato:{'C04-S01':{3:'resolve'},'C04-S04':{2:'surprise',8:'surprise',13:'resolve',18:'surprise',22:'resolve'},'C04-S05':{8:'sad'},'C04-S06':{2:'resolve'},'C04-S07':{2:'resolve'},'C04-S09':{2:'surprise',5:'fear'}}};
 if(acting[id]?.[scene]?.[n])return acting[id][scene][n];
 if(id==='mahiro'&&scene==='C04-S08'&&n===3)return 'sad';

 if(id==='narihira')return scene==='C04-S04'&&n>=11?(n>=14&&n<=17?'smile':'normal'):'hollow';
 if(id==='hitomaro')return scene==='C04-S07'&&n>=4?'smile':'hollow';
 if(id==='kotoha'&&scene==='C04-S08')return n>=6?'fear':n===2?'sad':'confused';
 return null;
}
export function character4(speaker,step){
 if(step.sceneId==='C04-S05'&&step.line<=6){if(speaker==='ことは')return 'kotoha-child';if(speaker==='真尋')return 'mahiro-child'}return null;
}
export function direction4(step,data,answers={}){
 const n=step.line??-1,id=step.sceneId;
 const solved=data.scenes.find(s=>s.scene_id==='C04-S03').quiz_ids.filter(id=>answers[id]).length;
 // A replayed scene keeps the same progression. A solved quiz may display all four restored patches.
 const count=id==='C04-S03'?solved:0;
 const radius=id==='C04-S04'?(n>=13?155:n>=3?42:7):0;
 const cue=data.scenes.find(s=>s.scene_id===id).shot_cues?.filter(c=>n>c.after_line_index).at(-1);
 return {leafCount:count,radius,riverScene:['C04-S01','C04-S02','C04-S03','C04-S04'].includes(id),riverRecovery:id==='C04-S04',mirror:id==='C04-S04'&&n>=20,nightField:['C04-S06','C04-S07'].includes(id),dawn:id==='C04-S07'&&n>=4,forbidden:id==='C04-S08'&&n>=5&&n<=7,cue:cue?.effect||''};
}
export function paintDirection4(host,step,data,answers,base){
 const v=direction4(step,data,answers);const phase=[v.leafCount,v.radius,v.mirror,v.forbidden,v.nightField,v.dawn].join('|');host.dataset.cue=v.cue;if(host.dataset.paintKey===phase)return v;host.dataset.paintKey=phase;host.replaceChildren();host.className='chapter-effects';
 if(v.leafCount||v.radius){const color=document.createElement('div');color.className='river-color';color.style.backgroundImage=`url("${base+data.manifest.backgrounds.BG25.file}")`;
  const masks=v.radius?[`radial-gradient(circle at 49% 65%,#000 0 ${v.radius}%,transparent ${v.radius+.8}%)`]:Array.from({length:v.leafCount},(_,i)=>{const [x,y]=[[23,25],[77,33],[35,48],[66,58]][i];return `radial-gradient(ellipse 13% 15% at ${x}% ${y}%,#000 30%,transparent 100%)`});color.style.maskImage=masks.join(',');color.style.webkitMaskImage=masks.join(',');host.append(color);
 }
 if(v.mirror||v.forbidden){const ink=document.createElement('div');ink.className='ink-mirror';host.append(ink)}
 if(v.riverRecovery&&step.line<13){const ripple=document.createElement('div');ripple.className='river-ripple';host.append(ripple)}
 host.dataset.direction=v.nightField?(v.dawn?'dawn':'night'):'';
 return v;
}
