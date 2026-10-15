const poets=['nukata','komachi','tsurayuki','okura','inamaro','jito','azuma','narihira','hitomaro','saigyo','teika','shikishi','yakamochi'];
export function visual7(step,data){
 const scene=data.scenes.find(s=>s.scene_id===step.sceneId),n=step.line??-1,id=scene.scene_id;let bg='BG40',ids=['lord'],recovered=false,memory=false,cg=false;
 if(['C07-S02','C07-S04'].includes(id)){bg='BG00';ids=['kotoha','akane','minato'];memory=true}
 if(['C07-S03','C07-S05'].includes(id))ids=['akane','minato'];
 if(id==='C07-S06'){bg='BG41';ids=n>=1&&n<=13?[poets[n-1]]:n===14?['kotoha']:['akane','minato'];recovered=true}
 if(id==='C07-S07'){bg='BG42';ids=n>=26?['kotoha','akane','minato']:['mahiro','kotoha'];recovered=true}
 if(id==='C07-S08'){bg=n>=6?'BG42':'BG41';ids=n>=6?['kotoha','akane','minato']:['lord'];recovered=n>=6}
 if(['C07-S09','C07-S10'].includes(id)){bg='BG43';ids=['kotoha','akane','minato'];recovered=true}
 if(id==='C07-S09'&&n>=17){bg='BG43H';ids=[];cg=true}
 if(id==='C07-S11'){const minato=[4,6,8].includes(n);bg=minato?'BG45':'BG44';ids=[minato?'minato':'akane'];recovered=true}
 if(id==='C07-S12'){bg=step.kind==='end'?'BG43':n>=2&&n<=8?'BG46':'BG44';ids=step.kind==='end'||n>=2&&n<=8?[]:['akane'];recovered=true}
 return {scene,bg,ids,recovered,memory,cg};
}
export function emotion7(id,scene,n){
 if(poets.includes(id))return 'smile';if(id==='lord')return 'normal';
 if(id==='mahiro')return n>=11?'smile':'resolve';
 if(id==='kotoha'){if(scene==='C07-S12')return 'smile';if(scene==='C07-S07')return 'sad';if(scene==='C07-S09')return n>=17?'sad':n>=13?'smile':n>=10?'sad':'resolve';if(scene==='C07-S10')return 'smile';return 'resolve'}
 if(id==='akane'){if(['C07-S09','C07-S10'].includes(scene))return 'sad';if(scene==='C07-S04')return n>=4?'resolve':'fear';if(['C07-S11','C07-S12'].includes(scene))return n>=10?'smile':'surprise';return 'resolve'}
 if(id==='minato')return ['C07-S09','C07-S10'].includes(scene)?'sad':scene==='C07-S11'?'smile':'resolve';return 'normal';
}
export function direction7(step){const id=step.sceneId,n=step.line??-1;return {ending:step.kind==='end',letter:id==='C07-S12'&&n>=5&&n<=8,returned:['C07-S11','C07-S12'].includes(id),dawn:['C07-S09','C07-S10'].includes(id),chorus:id==='C07-S06',dissolve:id==='C07-S08'&&n>=6,threshold:id==='C07-S10'&&n>=8};}
export function paintDirection7(host,step){const v=direction7(step),key=JSON.stringify(v);if(host.dataset.paintKey===key)return v;host.dataset.paintKey=key;host.className='chapter-effects c07-effects';host.replaceChildren();for(const[k,val]of Object.entries(v))host.dataset[k]=String(val);
 if(v.ending){const e=document.createElement('div');e.className='ending-title';const small=document.createElement('small');small.textContent='TRUE ENDING';const name=document.createElement('strong');name.textContent='千年の約束';const foot=document.createElement('span');foot.textContent='言葉は、いつか誰かに届きます。';e.append(small,name,foot);host.append(e)}
 return v;
}
