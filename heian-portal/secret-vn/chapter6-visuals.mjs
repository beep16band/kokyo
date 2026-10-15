// Chapter six only; source dialogue determines time, entrances and recoveries.
export function visual6(step,data){
 const scene=data.scenes.find(s=>s.scene_id===step.sceneId),n=step.line??-1,id=scene.scene_id;let bg=scene.background_ids[0],ids=['akane','minato'],recovered=false,memory=false;
 if(['C06-S02','C06-S03','C06-S04'].includes(id)){ids=['shikishi'];recovered=id==='C06-S04';bg=recovered?'BG36R':'BG36'}
 if(['C06-S05','C06-S06','C06-S07'].includes(id)){ids=['yakamochi'];recovered=id==='C06-S07';bg=recovered?'BG37R':'BG37'}
 if(id==='C06-S08'){ids=['kotoha','akane','minato'];bg='BG38'}
 if(id==='C06-S09'){memory=n<36;bg=memory?(n>=24?'BG39':'BG38'):'BG38';ids=memory?(n>=14?['kotoha','mahiro']:['kotoha']):['kotoha','akane','minato']}
 if(id==='C06-S10'){ids=['kotoha','akane','minato'];bg=n>=7?'BG35':'BG38'}
 return {scene,bg,ids,recovered,memory};
}
export function emotion6(id,scene,n){
 if(id==='shikishi')return scene==='C06-S04'?(n>=3?'smile':'normal'):'hollow';
 if(id==='yakamochi')return scene==='C06-S07'?(n>=4?'smile':'normal'):'hollow';
 if(id==='kotoha'){
  if(scene==='C06-S08')return n>=10?'sad':n>=4?'confused':'sad';
  if(scene==='C06-S09')return n>=36?'sad':n>=32?'sad':n>=30?'fear':n>=24?'sad':n>=11?'fear':n>=5?'confused':'sad';
  if(scene==='C06-S10')return n>=4?'resolve':'sad';
 }
 if(id==='mahiro')return scene==='C06-S09'?(n>=33?'smile':n>=32?'sad':'resolve'):'normal';
 if(id==='akane'){
  if(scene==='C06-S08')return n===1?'smile':n>=10?'sad':'surprise';
  if(scene==='C06-S09')return n>=39?'fear':'sad';
  if(scene==='C06-S10')return n>=3?'resolve':'sad';
  if(scene==='C06-S01')return 'fear';
  if(scene==='C06-S07')return n>=4?'smile':'resolve';
 }
 if(id==='minato'){
  if(scene==='C06-S08')return n>=5?'resolve':'surprise';
  if(scene==='C06-S09')return 'sad';
  if(scene==='C06-S10')return 'resolve';
  if(scene==='C06-S01')return 'resolve';
  if(scene==='C06-S07')return n>=4?'smile':'resolve';
 }
 return null;
}
export function direction6(step){
 const id=step.sceneId,n=step.line??-1,memory=id==='C06-S09'&&n<36;
 return {snow:['C06-S05','C06-S06','C06-S07'].includes(id),snowRecovered:id==='C06-S07',identity:id==='C06-S08'&&n>=4,memory,ink:memory&&n>=11&&n<30,seal:memory&&n>=30,door:id==='C06-S10'&&n>=7,time:id==='C06-S09'?(memory?'千年前の記録':'封印の書庫・現在'):['C06-S08','C06-S10'].includes(id)?'封印の書庫・現在':''};
}
export function paintDirection6(host,step){
 const v=direction6(step),key=JSON.stringify(v);if(host.dataset.paintKey===key)return v;host.dataset.paintKey=key;host.className='chapter-effects c06-effects';host.replaceChildren();
 for(const k of ['snow','snowRecovered','identity','memory','ink','seal','door'])host.dataset[k]=String(v[k]);
 if(v.snow){const snow=document.createElement('div');snow.className='snow-field';for(let i=0;i<18;i++){const f=document.createElement('i');f.style.setProperty('--x',`${(i*37+11)%100}%`);f.style.setProperty('--delay',`${-(i*1.7)%12}s`);f.style.setProperty('--duration',`${12+i%5}s`);snow.append(f)}host.append(snow)}
 if(v.seal){const ring=document.createElement('div');ring.className='memory-seal';host.append(ring)}
 if(v.time){const label=document.createElement('span');label.className='memory-time';label.textContent=v.time;host.append(label)}
 return v;
}
