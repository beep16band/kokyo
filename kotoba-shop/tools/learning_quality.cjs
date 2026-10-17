// Original-question integration gates. Uses an isolated synthetic save, never student data.
const {chromium}=require('playwright'),{spawn}=require('node:child_process');
const path=require('node:path'),assert=require('node:assert/strict');
async function main(){
 const server=spawn('python',['-m','http.server','8787'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});
 await new Promise(r=>setTimeout(r,400));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const lightweight=()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /^webgl|experimental-webgl/.test(t)?null:get.call(this,t,...a)}};
  await page.addInitScript(lightweight);await page.goto('http://127.0.0.1:8787/');await page.waitForFunction(()=>typeof TOWN_LEARNING_QUESTIONS==='object');
  const bank=await page.evaluate(()=>({count:TOWN_LEARNING_QUESTIONS.length,ids:new Set(TOWN_LEARNING_QUESTIONS.map(q=>q.id)).size,valid:TOWN_LEARNING_QUESTIONS.every(q=>q.prompt&&q.good&&q.bad.length===2&&new Set([q.good,...q.bad]).size===3&&q.hint&&q.explanation&&DOMAINS.includes(q.domain)),levels:Object.keys(LEVELS)}));
  assert.equal(bank.count,42);assert.equal(bank.ids,42);assert(bank.valid);assert.deepEqual(bank.levels,['easy','normal','hard']);
  const journey=await page.evaluate(()=>{
   chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;
   const coins=state.coins,stock=JSON.stringify(state.stock),done=[];let hintOnce=true,retry=true,noDouble=true;
   for(const context of Object.keys(TOWN_LEARNING_DATA))for(const [li,lvl] of ['easy','normal','hard'].entries())for(let i=0;i<2;i++){
    townStudy('practice:'+context);if(choices.children.length!==4)throw Error('level chooser');choices.children[li].click();
    const t=learningTask,q=TOWN_LEARNING_QUESTIONS.find(z=>z.id===t.bankId);if(q.context!==context||q.level!==lvl)throw Error('context/level mismatch');
    answerLearningTask(t,false,q.bad[0]);retry=retry&&learningTask===t&&!t.settled;
    const count=L.events.filter(e=>e.result==='hint').length;
    [...choices.children].find(b=>b.dataset.plain==='ヒント').click();[...choices.children].find(b=>b.dataset.plain==='ヒント').click();
    hintOnce=hintOnce&&L.events.filter(e=>e.result==='hint').length===count+1;
    if(i===0)answerLearningTask(t,true,q.good);else{guideLearningTask(t);choices.firstElementChild.click();}
    const points=X.learningPoints,metric=X.metrics['practice:'+context];answerLearningTask(t,true,q.good);t.onComplete({guided:false});
    noDouble=noDouble&&points===X.learningPoints&&metric===X.metrics['practice:'+context];done.push(q.id);
   }
   return {done,unique:new Set(done).size,retry,hintOnce,noDouble,points:X.learningPoints,coins:state.coins,initial:coins,sameStock:stock===JSON.stringify(state.stock),storyUntouched:!X.metrics.introStudy&&!X.metrics.requestStudy&&!X.metrics.preparationStudy&&!X.metrics.festival,history:Object.keys(X.studyBank.history).length,correct:townLearningRows().reduce((n,r)=>n+r[3],0),guided:townLearningRows().reduce((n,r)=>n+r[4],0)};
  });
  assert.equal(journey.unique,42);assert(journey.retry&&journey.hintOnce&&journey.noDouble);assert.equal(journey.points,147);assert.equal(journey.coins,journey.initial);assert(journey.sameStock&&journey.storyUntouched);assert.equal(journey.history,42);assert.equal(journey.correct,21);assert.equal(journey.guided,21);
  const pending=await page.evaluate(()=>{townStudy('introStudy');choices.children[1].click();const id=learningTask.bankId;closeChoices();save(false);return id});
  await page.reload();await page.waitForFunction(()=>typeof TOWN_LEARNING_QUESTIONS==='object');
  const resumed=await page.evaluate(()=>{townStudy('introStudy');choices.children[1].click();const t=learningTask,id=t.bankId;guideLearningTask(t);choices.firstElementChild.click();townStudy('introStudy');choices.children[1].click();const next=learningTask.bankId;closeChoices();return {id,next,metric:X.metrics.introStudy,coins:state.coins,history:Object.keys(X.studyBank.history).length}});
  assert.equal(resumed.id,pending);assert.notEqual(resumed.next,pending);assert.equal(resumed.metric,1);assert.equal(resumed.coins,500);assert.equal(resumed.history,42);
  assert.deepEqual(await page.evaluate(()=>[1,4,7,10].map(m=>townLearningContext('study:season-2026-'+m))),['winter','spring','summer','autumn']);
  assert(await page.evaluate(()=>{closeChoices();learningCategory();const b=document.querySelector('#menuContent button[aria-label="町のことば練習"]');b.click();return [...choices.children].some(b=>b.dataset.plain==='商品の紹介')}));
  assert(await page.evaluate(()=>{learningReport();const csv=townLearningCSV();const captions=[...reportBox.querySelectorAll('caption')].map(c=>{const copy=c.cloneNode(true);copy.querySelectorAll('rt').forEach(r=>r.remove());return copy.textContent});const el=document.createElement('div');L.furigana=true;rubyText(el,'土曜日の受付で点灯');const readings=[...el.querySelectorAll('rt')].map(n=>n.textContent);return captions.includes('町の場面別問題：完了した問題')&&csv.includes('"問題ID"')&&csv.includes('"intro-normal-1"')&&L.events.some(e=>e.task==='town-bank:intro-normal-1')&&['どようび','うけつけ','てんとう'].every(s=>readings.includes(s))}));
  const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.addInitScript(lightweight);await mobile.goto('http://127.0.0.1:8787/');await mobile.waitForFunction(()=>typeof TOWN_LEARNING_QUESTIONS==='object');
  assert(await mobile.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();townStudy('preparationStudy');choices.children[2].click();return document.documentElement.scrollWidth<=innerWidth&&learningTask.bankContext==='preparation'&&getComputedStyle(document.getElementById('panel')).overflowY==='auto'}));
  await mobile.waitForFunction(()=>document.body.classList.contains('townLearningFocus'));
  assert(await mobile.evaluate(()=>{const r=document.getElementById('panel').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.height>500}));
  await mobile.screenshot({path:'/tmp/kotoba-learning-mobile.png'});await mobile.evaluate(()=>closeChoices());await mobile.waitForFunction(()=>!document.body.classList.contains('townLearningFocus'));assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:10,bank,journey,resumed,errors},null,2));
 }finally{if(browser)await browser.close();server.kill()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
