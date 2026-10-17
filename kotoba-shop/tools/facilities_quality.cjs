const {chromium}=require('playwright'),{spawn}=require('node:child_process');
const path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..'),server=spawn('python',['-m','http.server','8789'],{cwd:root,stdio:'ignore'});await new Promise(r=>setTimeout(r,400));let browser;const results=[],errors=[];let exported;
 const check=async(name,fn)=>{try{await fn();results.push({name,pass:true})}catch(e){results.push({name,pass:false,error:e.message.slice(0,500)})}};
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await browser.newPage({viewport:{width:1200,height:900}});p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8789/');await p.waitForFunction(()=>typeof TOWN_FACILITY_ROOMS==='object');
  await p.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;state.settings.reducedMotion=true});
  await check('real door: walk into Kuan, return point and existing inventory unchanged',async()=>{
   assert(await p.evaluate(()=>{const b=maps.town.buildings.find(b=>b.type==='kuan');changeArea('town',b.door.x,b.door.y+1,false);closeChoices();const before=JSON.stringify([state.coins,X.bag,state.furnitureOwned,X.story]);attemptStep(0,-1);return state.scene==='facility'&&state.facilityVisit.id==='kuan'&&state.returnOutdoor.x===b.door.x&&state.returnOutdoor.y===b.door.y+1&&before===JSON.stringify([state.coins,X.bag,state.furnitureOwned,X.story]);}));await p.waitForFunction(()=>TownInterior.active&&TownInterior.products.length===0);assert(await p.evaluate(()=>TownInterior.customer.userData.profile.id==='sakamoto'&&Town3D.renderer.info.render.calls<100));
  });
  await check('both layouts: every station and exit reachable; all furniture rectangles block',async()=>{
   const r=await p.evaluate(()=>Object.entries(TOWN_FACILITY_ROOMS).every(([id,room])=>{const q=[[10,9]],seen=new Set(['10,9']);for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=a+','+b;if(townFacilityFree(room,a,b)&&!seen.has(k)){seen.add(k);q.push([a,b]);}}}return seen.has('10,10')&&room.stations.every(s=>q.some(([x,y])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>within(s,x+dx,y+dy))))&&townFacilityBlocks(room).every(s=>!townFacilityFree(room,s.x,s.y));}));assert(r);
  });
  await check('Kuan: starter once and real shelf purchase deducts exactly 20G',async()=>{
   assert(await p.evaluate(()=>{townTalk('阪本先生');closeChoices();const items=JSON.stringify(X.bag);townTalk('阪本先生');closeChoices();const once=items===JSON.stringify(X.bag),before=state.coins,count=townCount('carrotSeed');state.x=3;state.y=4;visualX=3;visualY=4;facing='up';action();choices.firstElementChild.click();return once&&state.coins===before-20&&townCount('carrotSeed')===count+1&&state.scene==='facility';}));
  });
  await check('Kuan: furniture uses original ownership and insufficient funds cannot spend',async()=>{
   assert(await p.evaluate(()=>{closeChoices();state.x=16;state.y=4;visualX=16;visualY=4;facing='up';const n=state.furnitureOwned.length,g=state.coins;action();choices.firstElementChild.click();const ok=state.furnitureOwned.length===n+1&&state.coins===g-200;closeChoices();const left=state.coins;const denied=!townBuy('table',99)&&state.coins===left;closeChoices();return ok&&denied;}));
   await p.evaluate(()=>{document.getElementById('panel').classList.add('quiet');townInteriorDraw(performance.now())});await p.screenshot({path:'/tmp/kotoba-facility-kuan.png'});
  });
  await check('keyboard walk/dash, shelf collision and the actual door exit',async()=>{
   assert(await p.evaluate(()=>{closeChoices();state.x=3;state.y=4;visualX=3;visualY=4;return !attemptStep(0,-1)}));
   await p.evaluate(()=>{state.x=10;state.y=8;visualX=10;visualY=8});await p.keyboard.press('Shift+ArrowDown');await p.waitForFunction(()=>state.y===9&&!walkStep);assert(await p.evaluate(()=>state.scene==='facility'));
   await p.keyboard.press('ArrowDown');await p.waitForFunction(()=>state.scene==='town');assert(await p.evaluate(()=>!state.facilityVisit&&state.x===state.returnOutdoor.x&&state.y===state.returnOutdoor.y));
  });
  await check('school door: correct male teacher, desk collision and a real lesson',async()=>{
   assert(await p.evaluate(()=>{const b=maps.town.buildings.find(b=>b.type==='school');changeArea('town',b.door.x,b.door.y+1,false);closeChoices();attemptStep(0,-1);state.x=10;state.y=5;visualX=10;visualY=5;facing='up';action();return state.scene==='facility'&&dialog.dataset.plain.includes('阪口先生')&&choices.firstElementChild.dataset.plain.includes('依頼文');}));await p.waitForFunction(()=>TownInterior.customer?.userData.profile?.id==='sakaguchi');
   await p.evaluate(()=>{choices.firstElementChild.click();choices.children[0].click()});await p.waitForFunction(()=>learningTask?.bankContext==='request');
   assert(await p.evaluate(()=>{const g=state.coins;guideLearningTask(learningTask);choices.firstElementChild.click();return state.coins===g&&X.metrics.requestStudy===1&&X.learningPoints===2&&state.scene==='facility';}));
  });
  await check('school: all three levels at a practice desk; no extra story reward',async()=>{
   const r=await p.evaluate(()=>{closeChoices();const g=state.coins,metric=X.metrics.requestStudy,story=JSON.stringify(X.story),ids=[];for(let i=0;i<3;i++){state.x=4;state.y=5;visualX=4;visualY=5;facing='down';action();choices.children[i].click();ids.push(learningTask.bankId);guideLearningTask(learningTask);choices.firstElementChild.click();closeChoices();}return {ok:g===state.coins&&metric===X.metrics.requestStudy&&story===JSON.stringify(X.story),ids};});assert(r.ok);assert.equal(new Set(r.ids).size,3);
  });
  await check('school: bookcase and teacher report retain practice/history actions',async()=>{
   assert(await p.evaluate(()=>{state.x=15;state.y=4;visualX=15;visualY=4;facing='up';action();const shown=!reportBox.hidden&&!![...choices.children].find(b=>b.dataset.plain?.includes('町の問題別記録'));closeChoices();reportBox.hidden=true;state.x=4;state.y=3;visualX=4;visualY=3;facing='left';action();const practice=[...choices.children].some(b=>b.dataset.plain?.includes('商品の紹介'));closeChoices();return shown&&practice;}));
  });
  await check('save: outdoor-compatible envelope and valid interior position reload',async()=>{
   const r=await p.evaluate(()=>{state.x=10;state.y=7;visualX=10;visualY=7;facing='left';save(false);const raw=JSON.parse(localStorage.getItem('kotoba_shop_v1'));return {valid:raw.scene==='town'&&validImportedPosition(raw)&&raw.facilityVisit.id==='school'&&raw.facilityVisit.x===10&&raw.facilityVisit.y===7,live:state.scene==='facility',coins:state.coins};});assert(r.valid&&r.live);
   await p.reload();await p.waitForFunction(()=>state.scene==='facility'&&TownInterior.active);assert(await p.evaluate(g=>state.facilityVisit.id==='school'&&state.x===10&&state.y===7&&facing==='left'&&state.coins===g,r.coins));
   await p.evaluate(()=>{document.getElementById('panel').classList.add('quiet')});await p.screenshot({path:'/tmp/kotoba-facility-school.png'});
  });
  await check('JSON export: valid import format, visit retained, live room untouched',async()=>{
   const waiting=p.waitForEvent('download');await p.evaluate(()=>exportSave());const d=await waiting;exported=JSON.parse(await fs.readFile(await d.path(),'utf8'));
   assert.equal(exported.state.scene,'town');assert.equal(exported.state.facilityVisit.id,'school');assert(await p.evaluate(s=>validImportedPosition(s)&&state.scene==='facility'&&state.x===10&&state.y===7,exported.state));
  });
  await check('actual JSON import: exported indoor visit restores through the existing file UI',async()=>{
   const imported=await browser.newPage();imported.on('pageerror',e=>errors.push(e.message));await imported.goto('http://127.0.0.1:8789/');await imported.waitForFunction(()=>typeof TOWN_FACILITY_ROOMS==='object');await imported.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();importSave()});
   const chooser=imported.waitForEvent('filechooser');await imported.locator('#choices button').first().click();await (await chooser).setFiles({name:'facility-save.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
   await imported.waitForFunction(()=>choices.firstElementChild?.dataset.plain==='このデータで再開');await imported.locator('#choices button').first().click();await imported.waitForFunction(()=>typeof TOWN_FACILITY_ROOMS==='object'&&state.scene==='facility'&&TownInterior.active);assert(await imported.evaluate(s=>state.x===s.facilityVisit.x&&state.y===s.facilityVisit.y&&state.coins===s.coins&&JSON.stringify(X.studyBank.history)===JSON.stringify(s.expansion.studyBank.history),exported.state));await imported.close();
  });
  await check('previous version compatibility: marker ignored, money/items/history preserved outside',async()=>{
   const old=await browser.newPage();old.on('pageerror',e=>errors.push(e.message));await old.route('**/town-facilities.js*',r=>r.fulfill({body:'',contentType:'application/javascript'}));await old.addInitScript(s=>localStorage.setItem('kotoba_shop_v1',JSON.stringify(s)),exported.state);await old.goto('http://127.0.0.1:8789/');await old.waitForFunction(()=>typeof TownInterior==='object');
   assert(await old.evaluate(s=>state.scene==='town'&&state.coins===s.coins&&JSON.stringify(X.bag)===JSON.stringify(s.expansion.bag)&&JSON.stringify(X.studyBank.history)===JSON.stringify(s.expansion.studyBank.history),exported.state));await old.close();
  });
  await check('invalid marker: safe spawn without resetting inventory; leaving clears visit',async()=>{
   const bad=await browser.newPage();bad.on('pageerror',e=>errors.push(e.message));const s=structuredClone(exported.state);s.facilityVisit.x=10;s.facilityVisit.y=3;await bad.addInitScript(s=>localStorage.setItem('kotoba_shop_v1',JSON.stringify(s)),s);await bad.goto('http://127.0.0.1:8789/');await bad.waitForFunction(()=>typeof TOWN_FACILITY_ROOMS==='object');assert(await bad.evaluate(g=>state.scene==='facility'&&state.x===10&&state.y===9&&state.coins===g,s.coins));await bad.close();
   assert(await p.evaluate(()=>{changeArea('forest',24,20,false);return !state.facilityVisit&&state.scene==='town';}));await p.reload();await p.waitForFunction(()=>typeof TOWN_FACILITY_ROOMS==='object');assert(await p.evaluate(()=>state.scene==='town'&&state.area==='forest'&&!state.facilityVisit));
   const stale=await browser.newPage();stale.on('pageerror',e=>errors.push(e.message));const t=structuredClone(exported.state);t.worldPosition.x++;t.x=t.worldPosition.x;await stale.addInitScript(s=>localStorage.setItem('kotoba_shop_v1',JSON.stringify(s)),t);await stale.goto('http://127.0.0.1:8789/');await stale.waitForFunction(()=>typeof TOWN_FACILITY_ROOMS==='object');assert(await stale.evaluate(g=>state.scene==='town'&&!state.facilityVisit&&state.coins===g,t.coins));await stale.close();
  });
  await check('revisits and WebGL loss: stable buffers, 2D room controls retained',async()=>{
   const r=await p.evaluate(()=>{const counts=[];for(let i=0;i<8;i++){townFacilityEnter(i%2?'school':'kuan');townInteriorDraw(performance.now());counts.push(Town3D.renderer.info.memory.geometries);enter('town');townInteriorRelease();}townFacilityEnter('school');townInteriorDraw(performance.now());Town3D.renderer.domElement.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));return counts;});assert(Math.max(...r)-Math.min(...r)<=2);await p.waitForFunction(()=>Town3D.failed&&!TownInterior.active);assert(await p.evaluate(()=>!passable(8,4)&&passable(10,9)));await p.screenshot({path:'/tmp/kotoba-facility-fallback.png'});
  });
  await check('390px touch: 2D room, real movement/action and full-screen learning',async()=>{
   const m=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});m.on('pageerror',e=>errors.push(e.message));await m.goto('http://127.0.0.1:8789/');await m.waitForFunction(()=>typeof TOWN_FACILITY_ROOMS==='object');await m.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';townFacilityEnter('school');closeChoices();busy=false});await m.locator('#movePad [data-key="ArrowUp"]').tap();await m.waitForFunction(()=>state.y===8&&!walkStep);
   await m.evaluate(()=>{state.x=4;state.y=5;visualX=4;visualY=5;facing='down'});await m.locator('#action').tap();await m.locator('#choices button').nth(1).tap();await m.waitForFunction(()=>learningTask?.bankContext==='intro'&&document.body.classList.contains('townLearningFocus'));assert(await m.evaluate(()=>state.settings.force2D&&!TownInterior.active&&document.documentElement.scrollWidth<=innerWidth));await m.screenshot({path:'/tmp/kotoba-facility-mobile.png'});await m.close();
  });
  await check('offline facility: no HTTP dependencies',async()=>{
   const o=await browser.newPage(),requests=[];o.on('pageerror',e=>errors.push(e.message));o.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});await o.goto('file://'+path.join(root,'offline.html'));await o.waitForFunction(()=>typeof TOWN_FACILITY_ROOMS==='object');await o.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';townFacilityEnter('kuan')});await o.waitForFunction(()=>TownInterior.active);assert.deepEqual(requests,[]);await o.close();
  });
  await check('runtime errors',()=>assert.deepEqual(errors,[]));
  console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,results,errors},null,2));if(results.some(r=>!r.pass))process.exitCode=1;
 }finally{if(browser)await browser.close();server.kill()}
})().catch(e=>{console.error(e);process.exitCode=1});
