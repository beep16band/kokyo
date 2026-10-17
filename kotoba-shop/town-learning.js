// Additive question rotation. Incorrect/abandoned questions remain available for retry.
// Rebuild the reading matcher with full words before the existing one-character entries.
Object.assign(READINGS,{'文化祭':'ぶんかさい','夏祭り':'なつまつり','灯りまつり':'あかりまつり','商品の紹介':'しょうひんのしょうかい','受付':'うけつけ','土曜日':'どようび','金曜日':'きんようび','日曜日':'にちようび','金曜':'きんよう','土曜':'どよう','点灯':'てんとう','紙袋':'かみぶくろ','箱':'はこ','作品':'さくひん','展示':'てんじ','図書室':'としょしつ','教室':'きょうしつ','提出':'ていしゅつ','期限':'きげん','裏面':'うらめん','記入':'きにゅう','模型':'もけい','出店':'しゅってん','演奏':'えんそう','天候':'てんこう','会場':'かいじょう','開催':'かいさい','晴天':'せいてん','雨天':'うてん','通路':'つうろ','入口':'いりぐち','出口':'でぐち','無料':'むりょう','材料':'ざいりょう','数量':'すうりょう','不在':'ふざい','観察':'かんさつ','事実':'じじつ','根拠':'こんきょ','条件':'じょうけん','午後':'ごご','午前':'ごぜん','東':'ひがし','西':'にし','係':'かかり'});
const townReadingPattern=new RegExp(Object.keys(READINGS).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
const rubyBeforeTownBank=rubyText;
rubyText=function(el,text){
 if(!L.furigana){rubyBeforeTownBank(el,text);return;}
 el.replaceChildren();const s=plainText(text);let last=0;
 for(const m of s.matchAll(townReadingPattern)){el.append(document.createTextNode(s.slice(last,m.index)));const r=document.createElement('ruby'),rt=document.createElement('rt');r.append(document.createTextNode(m[0]));rt.textContent=READINGS[m[0]];r.append(rt);el.append(r);last=m.index+m[0].length;}
 el.append(document.createTextNode(s.slice(last)));
};
if(!townObject(X.studyBank))X.studyBank={version:1};
for(const k of ['rotation','pending','history'])if(!townObject(X.studyBank[k]))X.studyBank[k]={};
function townLearningContext(metric){
 if(metric.startsWith('practice:')&&TOWN_LEARNING_DATA[metric.slice(9)])return metric.slice(9);
 if(metric==='introStudy')return 'intro';if(metric==='preparationStudy')return 'preparation';
 const m=/^study:season-(\d{4})-(\d{1,2})$/.exec(metric);
 if(m&&+m[2]>=1&&+m[2]<=12)return calendarSeason(new Date(+m[1],+m[2]-1,15));
 return 'request';
}
function townLearningPick(context,lvl){
 const pool=TOWN_LEARNING_QUESTIONS.filter(q=>q.context===context&&q.level===lvl),slot=context+'|'+lvl;
 const pending=pool.find(q=>q.id===X.studyBank.pending[slot]);
 const cursor=Number.isSafeInteger(X.studyBank.rotation[slot])&&X.studyBank.rotation[slot]>=0?X.studyBank.rotation[slot]:0;
 return pending||pool[cursor%pool.length];
}
townStudy=function(metric){
 const context=townLearningContext(metric),practice=metric.startsWith('practice:');
 townChooseLevel(()=>{
  const q=townLearningPick(context,L.level),slot=context+'|'+L.level;
  X.studyBank.pending[slot]=q.id;save(false);let completed=false;
  askLearningTask({scene:'board',domain:q.domain,key:'town-bank:'+q.id,bankId:q.id,bankContext:context,
   prompt:'〔'+q.title+'〕\n'+q.prompt,options:[{text:q.good,ok:true},...q.bad.map(text=>({text,ok:false}))],hint:q.hint,solution:q.good+'\n'+q.explanation,
   onComplete:r=>{
    if(completed)return;completed=true;
    const old=townObject(X.studyBank.history[q.id])?X.studyBank.history[q.id]:{};
    X.studyBank.history[q.id]={correct:(Number(old.correct)||0)+(r.guided?0:1),guided:(Number(old.guided)||0)+(r.guided?1:0),lastAt:new Date().toISOString()};
    const pool=TOWN_LEARNING_QUESTIONS.filter(z=>z.context===context&&z.level===q.level);
    X.studyBank.rotation[slot]=(pool.findIndex(z=>z.id===q.id)+1)%pool.length;delete X.studyBank.pending[slot];
    townMetric(metric);
    tell('【ことばの振り返り】\n'+q.explanation+'\n'+(r.guided?'解答例を使って進めました。学習ポイント＋2。':'根拠を確かめられました。学習ポイント＋5。'));
    renderChoices([['もう1問',()=>townStudy(metric)],[practice?'練習の場面へ':'今の物語・目標へ',practice?townLearningMenu:townQuestMenu],['町へ戻る',closeChoices]]);
   }
  });
 });
};
function townLearningMenu(){
 closeWorldMenu();tell('【町のことば練習】好きな場面を選ぼう。練習では物語の達成条件やGは変わりません。');
 renderChoices([...Object.entries(TOWN_LEARNING_DATA).map(([key,data])=>[data.name,()=>townStudy('practice:'+key)]),['教師用レポート',learningReport],['閉じる',closeChoices]]);
}
const categoryBeforeTownBank=learningCategory;
learningCategory=function(){categoryBeforeTownBank();const box=document.getElementById('menuContent');box.insertBefore(menuItem('町のことば練習','あ',townLearningMenu),box.firstElementChild)};
function townLearningRows(){return TOWN_LEARNING_QUESTIONS.filter(q=>X.studyBank.history[q.id]).map(q=>{const h=X.studyBank.history[q.id];return [q.id,q.title,LEVELS[q.level].name,Number(h.correct)||0,Number(h.guided)||0,h.lastAt||'']})}
function townLearningCSV(){const cell=x=>'"'+String(x??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';return '\ufeff'+[['問題ID','場面','難易度','正答で完了','解答例で完了','最終完了日時'],...townLearningRows()].map(row=>row.map(cell).join(',')).join('\r\n')}
function townLearningExport(){const url=URL.createObjectURL(new Blob([townLearningCSV()],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='kotoba_town_questions.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const reportBeforeTownBank=learningReport;
learningReport=function(){reportBeforeTownBank();tableReport('町の場面別問題：完了した問題',['問題ID','場面','難易度','正答で完了','解答例で完了','最終完了日時'],townLearningRows());const note=document.createElement('p');rubyText(note,'問題別の表は完了回数です。再回答やヒントの回数は、上の学習累計で確認できます。');reportBox.append(note);const b=document.createElement('button');b.textContent='町の問題別記録をCSVで書き出す';b.dataset.plain=b.textContent;b.onclick=townLearningExport;choices.append(b)};
const townLearningStyle=document.createElement('style');townLearningStyle.textContent='@media(max-width:600px),(pointer:coarse){body.townLearningFocus #panel{position:fixed;inset:52px 8px 8px;max-height:none;width:auto;margin:0;z-index:95;padding:14px}body.townLearningFocus #dialog{font-size:15px}body.townLearningFocus #choices{display:flex;flex-direction:column}body.townLearningFocus #choices button{width:100%;text-align:left;flex-shrink:0}}';document.head.append(townLearningStyle);
const drawBeforeTownLearning=draw;draw=function(now){document.body.classList.toggle('townLearningFocus',!!learningTask?.bankId&&!menuOpen&&!setupOpen);drawBeforeTownLearning(now)};
