/* Independent practice and teacher-assisted recovery; original bank is read-only. */
(function(root){'use strict';
function recover(data,Engine,code,{name='主人公',heroAsset='hero_pipoya_student'}={}){
 const normalized=String(code).normalize('NFKC').trim().toUpperCase(),m=/^KT1-(P0|C[1-8](?:V|E)?)-L(\d{1,2})-G(\d{1,5})-P(\d{1,2})$/.exec(normalized);
 if(!m)throw Error('コード形式は KT1-C3-L6-G500-P5 です。');const cp=data.recovery.checkpoints.find(c=>c.id===m[1]);if(!cp)throw Error('対応していない進行地点です。');const level=Number(m[2]),gold=Number(m[3]),potions=Number(m[4]);if(level<1||level>20)throw Error('Lvは1～20で指定してください。');
 const e=new Engine(data,{enemyAI:false}),s=e.fresh(),completed=cp.id.endsWith('E')?cp.chapter:cp.chapter-1;
 for(let c=0;c<=completed;c++)Object.assign(s.flags,data.recovery.completedFlags[c]);
 if(cp.chapter>0)Object.assign(s.flags,{prologueComplete:true,aoiLeft:true,notebookBorrowed:true,renJoined:cp.id!=='C1',renSeparated:false,phase:'anomaly',['chapter'+cp.chapter+'Started']:true});
 if(cp.id==='C1V')Object.assign(s.flags,{renJoined:true,bakroFreed:true,stoneGateRead:true,villageVisited:true,'event:meet_ren':true,'event:bakro_freed':true});
 if(cp.id.endsWith('E'))s.flags['chapter'+cp.chapter+'Complete']=true;if(cp.id==='C8E')s.flags.renSeparated=true;
 Object.assign(s,{map:cp.map,x:cp.x,y:cp.y,dir:'up',chapter:cp.chapter,name:String(name).trim().slice(0,12)||'主人公',heroAsset,level,exp:0,maxHP:e.growth(level).hp,hp:e.growth(level).hp,gold,inventory:{I001:potions},checkpoint:{map:cp.map,x:cp.x,y:cp.y,dir:'up'}});
 s.unlocks.chapters=Array.from({length:cp.chapter+1},(_,i)=>i);if(cp.chapter>0)s.inventory.I_NOTE=1;
 if(cp.chapter>0&&cp.id!=='C1'){const weapon=level>=14?'W010':level>=12?'W009':level>=10?'W007':level>=8?'W005':level>=6?'W004':level>=4?'W003':level>=2?'W002':'W001';const armor=level>=14?'A008':level>=12?'A007':level>=10?'A006':level>=8?'A004':level>=6?'A003':level>=4?'A002':'A001';s.ownedEquipment=[weapon,armor];s.equipment={weapon,armor,accessory:null};}
 if(cp.chapter===0)s.flags={phase:'lesson'};
 // Mark prior story encounters cleared so returning does not duplicate boss rewards.
 for(const map of Object.values(data.maps))for(const encounter of map.enemies)if(!map.afterStory&&!encounter.respawn&&map.chapter<=completed)s.defeated[encounter.id]=true;
 if(cp.id==='C1V')s.defeated.bakro=true;
 if(!e.canStand(s.map,s.x,s.y,s.flags)){const choices=[];const map=data.maps[s.map];for(let y=1;y<map.height-1;y++)for(let x=1;x<map.width-1;x++)if(e.canStand(s.map,x,y,s.flags)&&!map.portals.some(p=>p.x===x&&p.y===y))choices.push({x,y,d:Math.abs(x-s.x)+Math.abs(y-s.y)});choices.sort((a,b)=>a.d-b.d);if(!choices.length)throw Error('復帰地点がありません');s.x=choices[0].x;s.y=choices[0].y;s.checkpoint.x=s.x;s.checkpoint.y=s.y;}
 s.balanceRevision=data.balance?.revision||0;e.state=s;e.refreshStats(true);return e.validate(s);
}
function createTitleShortcut({onOpen,now=()=>Date.now()}){
 const sequence=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyN'];let index=0,last=0;
 return {accept(event,atTitle){
  if(!atTitle||event.ctrlKey||event.metaKey||event.altKey||event.isComposing){index=0;return false;}
  if(event.repeat)return index>0;
  const t=now();if(t-last>10000)index=0;last=t;
  if(event.code===sequence[index]){index++;if(index===sequence.length){index=0;onOpen();}return true;}
  index=event.code===sequence[0]?1:0;return index>0;
 },reset(){index=0;}};
}
function orderQuestions(pool,engine,order='random',random=Math.random){
 const shuffle=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;};
 if(order==='registered')return pool.slice();
 if(order==='priority'){const tiers=new Map();for(const q of pool){const tier=engine.questionPriority(q);if(!tiers.has(tier))tiers.set(tier,[]);tiers.get(tier).push(q);}return [...tiers].sort((a,b)=>a[0]-b[0]).flatMap(([,list])=>shuffle(list));}
 return shuffle(pool.slice());
}
function create({data,Engine,onRestore,onClose,name,hero}){
 const $=id=>document.getElementById(id),panel=$('studentPanel'),content=$('studentContent');let mode=null,quiz=null,pending=null;const settings={search:''};
 function open(kind){mode=kind;panel.classList.remove('hidden');content.replaceChildren();$('studentTitle').textContent=kind==='practice'?'コトバ練習室':'救済コードで再開';}
 function close(){mode=null;pending=null;panel.classList.add('hidden');content.replaceChildren();onClose();}
 function paragraph(text){const p=document.createElement('p');p.textContent=text;content.append(p);return p;}
 function button(text,id,fn){const b=document.createElement('button');b.textContent=text;b.id=id;b.onclick=fn;content.append(b);return b;}
 function label(text,node){const l=document.createElement('label');l.textContent=text+' ';l.append(node);content.append(l);return node;}
 function rescue(){open('recovery');paragraph('先生にもらったコードを入力すると、指定した章・Lv・G・やくそう数から再開できます。図鑑・宝箱・問題履歴は復元しません。正確な記録はJSONファイルを読み込んでください。');const input=document.createElement('input');input.id='recoveryCode';input.placeholder='KT1-C3-L6-G500-P5';input.maxLength=100;input.autocomplete='off';label('救済コード',input);const summary=paragraph('コードを入力して「内容を確認」を押してください。');summary.id='recoverySummary';const apply=button('この内容で再開','recoveryApply',()=>{if(!pending)return;onRestore(pending);close();});apply.disabled=true;
  button('内容を確認','recoveryPreview',()=>{try{pending=recover(data,Engine,input.value,{name:name(),heroAsset:hero()});const cp=data.recovery.checkpoints.find(c=>c.map===pending.map&&c.chapter===pending.chapter);summary.textContent=(cp?.label||data.maps[pending.map].name)+' ／ Lv '+pending.level+' ／ G '+pending.gold+' ／ やくそう '+pending.inventory.I001+'個 ／ HP全回復。装備はLvに合う基本装備。';apply.disabled=false;}catch(e){pending=null;summary.textContent=e.message;apply.disabled=true;}});input.addEventListener('input',()=>{pending=null;apply.disabled=true;summary.textContent='変更したコードを、もう一度確認してください。'});
  input.focus();
 }
 function teacher(){open('teacher');$('studentTitle').textContent='先生用：救済コードを作る';paragraph('再開地点・Lv・G・やくそう数を指定し、生徒へコードを渡してください。生徒の通常画面には生成欄を表示しません。');const select=document.createElement('select');select.id='recoveryCheckpoint';for(const cp of data.recovery.checkpoints){const option=document.createElement('option');option.value=cp.id;option.textContent=cp.label;select.append(option);}label('再開地点',select);const fields={};for(const [id,text,value,max]of [['recoveryLevel','Lv',6,20],['recoveryGold','G',500,99999],['recoveryPotions','やくそう',5,99]]){const input=document.createElement('input');input.type='number';input.id=id;input.value=value;input.min=id==='recoveryLevel'?1:0;input.max=max;input.step=1;label(text,input);fields[id]=input;}
  const output=document.createElement('input');output.id='teacherRecoveryCode';output.readOnly=true;label('発行するコード',output);const help=paragraph('内容を確認してから発行してください。');help.id='teacherRecoveryStatus';
  button('コードを作る','recoveryGenerate',()=>{try{const values=['recoveryLevel','recoveryGold','recoveryPotions'].map(id=>Number(fields[id].value));if(values.some((v,i)=>fields[Object.keys(fields)[i]].value.trim()===''||!Number.isInteger(v)))throw Error('整数で入力してください。');const [lv,g,p]=values;if(lv<1||lv>20||g<0||g>99999||p<0||p>99)throw Error('Lv1～20・G0～99999・やくそう0～99で指定してください。');const code='KT1-'+select.value+'-L'+lv+'-G'+g+'-P'+p;recover(data,Engine,code);output.value=code;help.textContent='コードを選択しました。コピーして生徒に渡してください。';output.focus();output.select();}catch(e){output.value='';help.textContent=e.message;}});select.focus();
 }
 function practice(){
  open('practice');quiz=null;const engine=new Engine(data),pool=engine.questionPool();
  paragraph('時間制限なし。確認済みの出題対象は'+pool.length+'問です。範囲・分野・順番を選んで練習できます。ランダム出題では、一周するまで同じ問題は出ません。冒険のLv・G・記録は変わりません。');
  const selectors={};
  for(const [id,text,values]of [
   ['practiceScope','出題する問題',[['all','すべて（確認済み）'],['scope','テスト範囲のみ'],['original','従来の問題（確認済みのみ）']]],
   ['practiceCategory','分野',['すべて',...new Set(pool.map(q=>q.category))].map(v=>[v,v])],
   ['practiceOrder','出題順',[['random','ランダム'],['priority','テスト範囲優先（同じ優先度内はランダム）'],['registered','登録順']]]
  ]){const node=document.createElement('select');node.id=id;for(const [value,text]of values){const option=document.createElement('option');option.value=value;option.textContent=text;node.append(option);}node.value=settings[id]||values[0][0];label(text,node);selectors[id]=node;node.onchange=()=>{remember();renderList();};}
  const search=document.createElement('input');search.id='practiceSearch';search.type='search';search.placeholder='語句・問題文・問題IDで検索';search.value=settings.search;label('問題を探す',search);
  function remember(){for(const [id,node]of Object.entries(selectors))settings[id]=node.value;settings.search=search.value;}
  function selected(){remember();return pool.filter(q=>(settings.practiceCategory==='すべて'||q.category===settings.practiceCategory)&&(settings.practiceScope==='scope'?engine.questionPriority(q)<2:settings.practiceScope==='original'?data.questions.some(o=>o.id===q.id):true)&&(!settings.search.trim()||[q.id,q.prompt,q.word||''].join(' ').normalize('NFKC').toLowerCase().includes(settings.search.trim().normalize('NFKC').toLowerCase())));}
  search.oninput=()=>renderList();
  const count=paragraph('');count.id='practiceCount';count.setAttribute('aria-live','polite');
  button('練習を始める','practiceBegin',()=>{const list=selected();if(!list.length){count.textContent='条件に合う問題がありません。条件を変えてください。';return;}startQuiz(orderQuestions(list,engine,settings.practiceOrder));});
  button('問題一覧を表示','practiceList',()=>{listing=true;renderList();});
  const host=document.createElement('div');host.id='practiceListContent';content.append(host);let listing=false;
  function renderList(page=0){const list=selected();count.textContent='選択中：'+list.length+'問';host.replaceChildren();if(!listing)return;
   const heading=document.createElement('h3');heading.textContent='問題一覧';host.append(heading);
   const help=document.createElement('p');help.textContent='登録順に表示しています。「答え・解説」を開くと正解と説明を確認できます。';host.append(help);
   const pageSize=30,last=Math.max(0,Math.ceil(list.length/pageSize)-1);page=Math.max(0,Math.min(page,last));
   for(const q of list.slice(page*pageSize,(page+1)*pageSize)){
    const article=document.createElement('article');article.className='practice-item';article.dataset.questionId=q.id;
    const title=document.createElement('h4');title.textContent=q.id+' ／ '+q.category+'　'+q.prompt;article.append(title);
    const choices=document.createElement('ol');for(const text of q.choices){const li=document.createElement('li');li.textContent=text;choices.append(li);}if(q.answerFormat!=='text')article.append(choices);
    const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='答え・解説';details.append(summary);
    const p=document.createElement('p');p.textContent='答え：'+q.choices[q.answer]+(q.fullAnswer?'（'+q.fullAnswer+'）':'');details.append(p);
    for(const [label,key]of [['意味','meaning'],['解説','explanation'],['用例','example']])if(q[key]){const p=document.createElement('p');p.textContent=label+'：'+q[key];details.append(p);}article.append(details);
    const one=document.createElement('button');one.textContent='この問題を練習';one.onclick=()=>startQuiz([q]);article.append(one);host.append(article);
   }
   if(!list.length){const p=document.createElement('p');p.textContent='条件に合う問題がありません。';host.append(p);}
   const nav=document.createElement('div');nav.className='practice-pagination';
   for(const [text,offset]of [['前のページ',-1],['次のページ',1]]){const b=document.createElement('button');b.textContent=text;b.disabled=offset<0?page===0:page===last;b.onclick=()=>{renderList(page+offset);headingFocus();};nav.append(b);}
   const number=document.createElement('span');number.textContent=(page+1)+' / '+(last+1)+'ページ（全'+list.length+'問）';nav.append(number);host.append(nav);
  }
  function headingFocus(){const h=host.querySelector('h3');if(h){h.tabIndex=-1;h.focus();}}
  function startQuiz(list){quiz={list,index:0,correct:0,answered:0,phase:'question'};question();}
  renderList();selectors.practiceScope.focus();
 }
 function question(){content.replaceChildren();quiz.phase='question';const q=quiz.list[quiz.index];paragraph(q.category+' ／ '+(quiz.index+1)+' / '+quiz.list.length+'問　正解 '+quiz.correct);const prompt=document.createElement('h3');prompt.id='practicePrompt';prompt.textContent=q.prompt;content.append(prompt);if(q.answerFormat==='text'){KotobaCore.createAnswerForm(document,content,{inputId:'practiceText',submitId:'practiceSubmit',onAnswer:value=>answer(KotobaCore.judgeText(q,value)?q.answer:-1)});}else{q.choices.forEach((text,i)=>{const b=button(text,'practiceAnswer'+i,()=>answer(i));b.dataset.answerIndex=i;});$('practiceAnswer0').focus();}button('範囲・問題一覧に戻る','practiceBack',practice);}
 function answer(i){if(!quiz||quiz.phase!=='question')return;quiz.phase='feedback';quiz.answered++;const q=quiz.list[quiz.index],ok=i===q.answer;if(ok)quiz.correct++;content.replaceChildren();const result=document.createElement('h3');result.id='practiceResult';result.textContent=ok?'正解！':'もう一度、言葉を確かめよう。';content.append(result);paragraph('答え：'+q.choices[q.answer]+(q.fullAnswer?'（'+q.fullAnswer+'）':''));for(const [label,key] of [['意味','meaning'],['解説','explanation'],['用例','example']])if(q[key])paragraph(label+'：'+q[key]);button('次の問題へ','practiceNext',()=>{quiz.index++;if(quiz.index<quiz.list.length)question();else{quiz.phase='done';content.replaceChildren();paragraph('練習終了。'+quiz.answered+'問中 '+quiz.correct+'問正解。');button('分野を選び直す','practiceRestart',practice).focus();}}).focus();button('範囲・問題一覧に戻る','practiceBack',practice);}
 $('studentClose').onclick=close;$('practiceStart').onclick=practice;$('recoveryStart').onclick=rescue;
 return {close,practice,rescue,teacher,get active(){return !!mode},get mode(){return mode},get quiz(){return quiz}};
}
const api={recover,create,createTitleShortcut,orderQuestions};if(typeof module!=='undefined')module.exports=api;else root.KotobaStudentTools=api;
})(globalThis);
