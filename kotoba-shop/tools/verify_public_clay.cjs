// Public-site smoke test. Saves results locally; never updates GitHub or game source.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');

(async()=>{
 const url=process.env.KOTOBA_PUBLIC_URL||'https://beep16band.github.io/kokyo/kotoba-shop/?v=30-clay10';
 const output=path.resolve(process.env.KOTOBA_AUDIT_OUTPUT||'public-clay-audit');
 await fs.mkdir(output,{recursive:true});
 let executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
 let extraArgs=[];
 if(!executablePath){
  const pack=require(process.env.KOTOBA_CHROMIUM_PACKAGE||'@sparticuz/chromium');
  const c=pack.default||pack;
  executablePath=await c.executablePath();extraArgs=c.args;
 }
 const proxy=process.env.HTTPS_PROXY||process.env.HTTP_PROXY;
 const browser=await chromium.launch({executablePath,headless:true,args:[...extraArgs,'--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'],...(proxy?{proxy:{server:proxy}}:{})});
 const report={url,startedAt:new Date().toISOString(),checks:[],pageErrors:[],consoleErrors:[],responses:[],environment:{executablePath}};
 const check=async(name,fn)=>{try{const details=await fn();report.checks.push({name,pass:true,details});console.log('PASS '+name)}catch(e){report.checks.push({name,pass:false,error:e.message});console.log('FAIL '+name+': '+e.message)}await fs.writeFile(path.join(output,'result.json'),JSON.stringify(report,null,2)+'\n')};
 const observe=p=>{p.setDefaultTimeout(15000);p.on('pageerror',e=>report.pageErrors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.consoleErrors.push(m.text())});p.on('response',r=>{if(r.status()>=400)report.responses.push({url:r.url(),status:r.status()})})};
 const init=async p=>{const r=await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.equal(r.status(),200);await p.waitForFunction(()=>typeof townClayTiming==='function');await p.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false});};
 try{
  const p=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:1200,height:900}});observe(p);
  await init(p);
  await check('public entry and tested script blob',async()=>{assert.equal(await p.locator('script[src*="town-clay-venue.js"]').getAttribute('src'),'./town-clay-venue.js?v=30-clay10');const r=await p.request.get(new URL('./town-clay-venue.js?v=30-clay10',url).href);assert.equal(r.status(),200);const b=await r.body(),sha=crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');assert.equal(sha,'e45ad0731cfca97bb578a033bd1269b5c45a3ad4');return {sha}});
  await check('actual hillside door enters active 3D venue',async()=>{await p.evaluate(()=>{const b=maps.hill.buildings.find(b=>b.type==='clay');changeArea('hill',b.door.x,b.door.y+1,false);closeChoices();attemptStep(0,-1)});await p.waitForFunction(()=>TownInterior.active&&state.facilityVisit?.id==='clay'&&TownInterior.key===townInteriorSignature(),null,{timeout:15000});const r=await p.evaluate(()=>({webgl:Town3D.ready&&!Town3D.failed,teacher:TownInterior.customer.userData.profile.id,calls:Town3D.renderer.info.render.calls,coins:state.coins}));assert(r.webgl);assert.equal(r.teacher,'galaxy');assert(r.calls<100);assert.equal(r.coins,500);await p.screenshot({path:path.join(output,'desktop-venue.png')});return r});
  await check('reception modes and real Space hit',async()=>{await p.evaluate(()=>{closeChoices();state.x=10;state.y=7;visualX=10;visualY=7;facing='up';action()});await p.locator('#choices button').filter({hasText:'クレー射撃場'}).click();const labels=await p.locator('#choices button').allTextContents();for(const t of ['初心者練習','通常練習'])assert(labels.some(s=>s.includes(t)));await p.locator('#choices button').filter({hasText:'初心者練習'}).click();await p.waitForFunction(()=>{const s=TownLife.clay,t=s?.target;return t&&t.x>270&&t.x<310&&!s.shot.has(t.index)},null,{timeout:10000});await p.keyboard.press('Space');await p.waitForFunction(()=>TownLife.clay?.hits===1);await p.screenshot({path:path.join(output,'desktop-hit.png')});return {hits:await p.evaluate(()=>TownLife.clay.hits)}});
  await check('cancel preserves money and records and restores controls',async()=>{const before=await p.evaluate(()=>JSON.stringify([state.coins,X.clayRecords]));await p.locator('#menuContent button').filter({hasText:'やめる'}).click();assert.equal(await p.evaluate(()=>JSON.stringify([state.coins,X.clayRecords])),before);assert(await p.evaluate(()=>!TownLife.clay&&!busy&&!document.body.classList.contains('townClayPlaying')));await p.evaluate(()=>closeChoices());});
  await check('3D indoor save reload and real exit',async()=>{await p.evaluate(()=>{state.x=10;state.y=9;visualX=10;visualY=9;closeChoices();save(false)});await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>TownInterior.active&&state.facilityVisit?.id==='clay');assert(await p.evaluate(()=>state.coins===500&&state.y===9));await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>state.scene==='town');assert(await p.evaluate(()=>state.area==='hill'&&!state.facilityVisit));});
  const m=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:390,height:844},isMobile:true,hasTouch:true});observe(m);await init(m);
  await check('390px actual touch movement and mobile 2D fallback',async()=>{await m.evaluate(()=>{townFacilityEnter('clay');closeChoices();busy=false});await m.locator('#movePad [data-key="ArrowUp"]').tap();await m.waitForFunction(()=>state.y===8&&!walkStep);assert(await m.evaluate(()=>state.settings.force2D&&!TownInterior.active&&document.documentElement.scrollWidth<=innerWidth));return {width:390}});
  await check('390px real tap hits and cancel button fits viewport',async()=>{await m.evaluate(()=>{clayMenu()});await m.locator('#choices button').filter({hasText:'初心者練習'}).tap();await m.waitForFunction(()=>{const s=TownLife.clay,t=s?.target;return t&&t.x>270&&t.x<310&&!s.shot.has(t.index)},null,{timeout:10000});await m.locator('#clayTiming').tap();await m.waitForFunction(()=>TownLife.clay?.hits===1);for(const b of [m.locator('#clayTiming'),m.locator('#menuContent button').filter({hasText:'やめる'})]){const r=await b.boundingBox();assert(r&&r.x>=0&&r.y>=0&&r.x+r.width<=391&&r.y+r.height<=844)}assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await m.screenshot({path:path.join(output,'mobile-hit.png')});await m.locator('#menuContent button').filter({hasText:'やめる'}).tap();assert(await m.evaluate(()=>state.coins===500&&!TownLife.clay&&!busy));});
  await check('390px save reload stays in facility',async()=>{await m.evaluate(()=>{closeChoices();save(false)});await m.reload({waitUntil:'domcontentloaded'});await m.waitForFunction(()=>typeof townClayTiming==='function'&&state.facilityVisit?.id==='clay');assert(await m.evaluate(()=>state.scene==='facility'&&state.y===8&&state.coins===500&&state.settings.force2D&&!TownInterior.active));});
  await check('runtime and asset errors',()=>{assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.consoleErrors,[]);assert.deepEqual(report.responses,[])});
 }finally{
  report.finishedAt=new Date().toISOString();report.passed=report.checks.filter(x=>x.pass).length;report.total=report.checks.length;await fs.writeFile(path.join(output,'result.json'),JSON.stringify(report,null,2)+'\n');await browser.close();console.log(JSON.stringify(report,null,2));if(report.checks.some(x=>!x.pass))process.exitCode=1;
 }
})().catch(e=>{console.error(e);process.exitCode=1});
