// Isolated integration checks. No real student saves or device-FPS claims.
const {chromium}=require('playwright'),{spawn}=require('node:child_process');
const path=require('node:path'),assert=require('node:assert/strict');
async function main(){
 const root=path.resolve(__dirname,'..'),server=spawn('python',['-m','http.server','8788'],{cwd:root,stdio:'ignore'});
 await new Promise(r=>setTimeout(r,400));let browser;const results=[],errors=[];
 async function check(name,fn){try{await fn();results.push({name,pass:true})}catch(e){results.push({name,pass:false,error:e.message.slice(0,350)})}}
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1200,height:900}});page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8788/');await page.waitForFunction(()=>typeof TownInterior==='object');
  await page.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;state.settings.reducedMotion=true;enter('home',10,9);closeChoices();document.getElementById('panel').classList.add('quiet')});
  await check('3D home: all eight furniture kinds, unchanged collision rectangles and money',async()=>{
   const result=await page.evaluate(()=>{const kinds=Object.keys(FURNITURE);state.furniturePlaced=kinds.map((kind,i)=>({kind,x:[3,4,5,6,7,13,14,15][i],y:6,rotation:0}));X.rooms[X.room]=state.furniturePlaced;const before=JSON.stringify(obstacles('home')),coins=state.coins;townInteriorDraw(performance.now());return {active:TownInterior.active,unchanged:before===JSON.stringify(obstacles('home')),sameMoney:coins===state.coins,kinds:[...TownInterior.furniture.values()].map(o=>o.userData.furnitureKind),calls:Town3D.renderer.info.render.calls}});
   assert(result.active&&result.unchanged&&result.sameMoney);assert.equal(new Set(result.kinds).size,8);assert(result.calls<100);
  });
  await check('movement: furniture blocks steps; keyboard walk and avatar positions agree',async()=>{
   assert(await page.evaluate(()=>{closeChoices();busy=false;enter('home',3,7);closeChoices();const blocked=!attemptStep(0,-1);enter('home',2,7);closeChoices();return blocked&&state.x===2}));
   await page.keyboard.press('d');await page.waitForFunction(()=>state.x===3&&state.y===7);await page.waitForFunction(()=>Math.abs(TownInterior.player.position.x-3.5)<.001);
  });
  await check('rotation: the same saved tile rotates by 90 degrees',async()=>{
   assert(await page.evaluate(()=>{const before=JSON.stringify([state.furniturePlaced[0].x,state.furniturePlaced[0].y]);townRotate(0);townInteriorDraw(performance.now());return before===JSON.stringify([state.furniturePlaced[0].x,state.furniturePlaced[0].y])&&TownInterior.furniture.get(0).rotation.y===Math.PI/2}));
  });
  await check('editor: 2D editing, commit and cancel preserve their original behavior',async()=>{
   await page.evaluate(()=>{state.furnitureOwned=['chair'];openFurnitureEditor()});await page.waitForFunction(()=>editorOpen&&!TownInterior.active&&Town3D.renderer.domElement.hidden);
   await page.evaluate(()=>{document.querySelector('#editTools button').click();document.getElementById('editGrid').children[8*20+9].click();document.getElementById('editDone').click()});
   await page.waitForFunction(()=>!editorOpen&&TownInterior.active&&TownInterior.furniture.size===9);
   const saved=await page.evaluate(()=>JSON.stringify(state.furniturePlaced));
   await page.evaluate(()=>{openFurnitureEditor();document.getElementById('editGrid').children[6*20+3].click();document.getElementById('editGrid').children[8*20+4].click();document.getElementById('editCancel').click()});
   assert.equal(await page.evaluate(()=>JSON.stringify(state.furniturePlaced)),saved);await page.waitForFunction(()=>TownInterior.active);
  });
  await check('house: themes, second room, model and trophies use saved data',async()=>{
   assert(await page.evaluate(()=>{state.wallpaper='mint';state.flooring='white';state.coins=10000;townHomeUpgrade();townRoom(1);closeChoices();townInteriorDraw(performance.now());const empty=TownInterior.furniture.size===0;townRoom(0);closeChoices();X.model={parts:[0,1,2],displayed:true};X.clayRecords['初心者練習']={best:8,plays:1,trophy:'金'};townInteriorDraw(performance.now());let models=0,trophies=0;TownInterior.root.traverse(o=>{if(o.userData.displayModel)models++;if(o.userData.displayTrophy)trophies++});return empty&&TownInterior.furniture.size===9&&state.wallpaper==='mint'&&state.flooring==='white'&&state.coins===7000&&models===1&&trophies===1}));
   await page.evaluate(()=>{closeChoices();document.getElementById('panel').classList.add('quiet');updateWorldHud()});await page.screenshot({path:'/tmp/kotoba-interior-home.png'});
  });
  await check('shop: displayed stock, priced sales and legacy customer orders agree',async()=>{
   assert(await page.evaluate(()=>{enter('shop',10,7);closeChoices();state.shelfStock.bread=3;state.shelfStock.juice=2;state.shelfStock.apple=0;townChange('medaka',1);townListItem('medaka',50);townInteriorDraw(performance.now());const visible=[0,1,2,3].map(i=>TownInterior.products.filter(p=>p.shelf===i&&p.mesh.visible).length),id=X.listings.at(-1).id,before=state.coins;const sale=townMakeSale(id,Date.now()+100000);const twice=townMakeSale(id,Date.now()+100000);closeChoices();townInteriorDraw(performance.now());return visible.join(',')==='3,2,0,1'&&sale&&!twice&&state.coins===before+50&&townInteriorShelfCount(3)===0}));
   assert(await page.evaluate(()=>{closeChoices();for(const k of Object.keys(goods))state.shelfStock[k]=10;const o=orders[state.ordersDone],before=state.coins,index=state.ordersDone;shopTask(o);choices.firstElementChild.click();while(learningTask){guideLearningTask(learningTask);choices.firstElementChild.click();}closeChoices();townInteriorDraw(performance.now());return state.ordersDone===index+1&&state.coins===before+o.price&&o.items.every(z=>state.shelfStock[z.item]===10-z.qty)}));
   await page.evaluate(()=>{document.getElementById('panel').classList.add('quiet');updateWorldHud()});await page.screenshot({path:'/tmp/kotoba-interior-shop.png'});
  });
  await check('save/load: money, rooms, rotation, stock and displays survive',async()=>{
   const before=await page.evaluate(()=>{save(false);return JSON.stringify([state.coins,state.furniturePlaced,X.rooms,X.room,state.shelfStock,X.model,X.clayRecords])});
   await page.reload();await page.waitForFunction(()=>typeof TownInterior==='object'&&TownInterior.active);assert.equal(await page.evaluate(()=>JSON.stringify([state.coins,state.furniturePlaced,X.rooms,X.room,state.shelfStock,X.model,X.clayRecords])),before);
  });
  await check('menus: renderer reuses the indoor frame without resizing every tick',async()=>{
   assert(await page.evaluate(()=>{openWorldMenu();townInteriorDraw(performance.now());const frame=Town3D.renderer.info.render.frame;townInteriorDraw(performance.now());const same=frame===Town3D.renderer.info.render.frame;closeWorldMenu();return same}));
  });
  await check('handoff: return outdoors with a dialog; repeated visits release buffers',async()=>{
   const result=await page.evaluate(()=>{let disposed=0;TownInterior.root.traverse(o=>{if(o.isInstancedMesh)o.addEventListener('dispose',()=>disposed++)});const sizes=[];for(let i=0;i<8;i++){changeArea('town',24,15,false);renderChoices([['閉じる',closeChoices]]);town3DDraw(performance.now(),.016);const owner=Town3D.frameArea===Town3D.area;if(!owner)throw Error('outdoor cached interior frame');townInteriorRelease();closeChoices();enter('home',10,9);closeChoices();townInteriorDraw(performance.now());sizes.push(Town3D.renderer.info.memory.geometries)}return {disposed,sizes}});
   assert(result.disposed>10);assert(result.sizes.at(-1)<=result.sizes[0]+2);
  });
  await check('WebGL loss: existing 2D controls and saved progress remain available',async()=>{
   await page.evaluate(()=>Town3D.renderer.domElement.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await page.waitForFunction(()=>Town3D.failed&&!TownInterior.active&&Town3D.renderer.domElement.hidden);assert(await page.evaluate(()=>!!localStorage.getItem('kotoba_shop_v1')&&passable(2,7)));
  });
  await check('touch: default 2D, no overflow and directional controls still work',async()=>{
   const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:8788/');await mobile.waitForFunction(()=>typeof TownInterior==='object');await mobile.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';enter('home',10,9);closeChoices();busy=false});await mobile.locator('#movePad [data-key="ArrowLeft"]').tap();await mobile.waitForFunction(()=>state.x===9&&state.y===9);assert(await mobile.evaluate(()=>state.settings.force2D&&!TownInterior.active&&document.documentElement.scrollWidth<=innerWidth));await mobile.close();
  });
  await check('offline: inline interior starts without HTTP requests',async()=>{
   const p=await browser.newPage(),requests=[];p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+path.join(root,'offline.html'));await p.waitForFunction(()=>typeof TownInterior==='object');await p.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';enter('home',10,9);closeChoices()});await p.waitForFunction(()=>TownInterior.active);assert.deepEqual(requests,[]);await p.close();
  });
  await check('runtime errors',async()=>assert.deepEqual(errors,[]));
  console.log(JSON.stringify({passed:results.filter(r=>r.pass).length,total:results.length,results,errors},null,2));if(results.some(r=>!r.pass))process.exitCode=1;
 }finally{if(browser)await browser.close();server.kill()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
