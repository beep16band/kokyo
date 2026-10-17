// Procedural-art regression checks use synthetic saves and software WebGL only.
const {chromium}=require('playwright'),{spawn}=require('node:child_process');
const path=require('node:path'),assert=require('node:assert/strict');
async function main(){
 const server=spawn('python',['-m','http.server','8785'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});
 await new Promise(r=>setTimeout(r,400));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/town-scenery.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.goto('http://127.0.0.1:8785/');
  const before=await page.evaluate(()=>{
   chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;state.settings.reducedMotion=true;
   return JSON.stringify(Object.entries(maps).map(([key,m])=>[key,m.tiles,[...m.blocked].sort(),m.buildings,m.pois,m.portals]));
  });
  await page.unroute('**/town-scenery.js*');await page.addScriptTag({url:'http://127.0.0.1:8785/town-scenery.js'});
  const after=await page.evaluate(()=>JSON.stringify(Object.entries(maps).map(([key,m])=>[key,m.tiles,[...m.blocked].sort(),m.buildings,m.pois,m.portals])));
  assert.equal(after,before,'art must not change collision, doors or facilities');
  await page.waitForFunction(()=>Town3D.frameArea===Town3D.area&&Town3D.area.startsWith('town|'));
  const scenery=await page.evaluate(()=>{
   town3DDraw(performance.now(),.016);
   const props=[],lamps=[];Town3D.world.traverse(o=>{if(o.userData.sceneryType)props.push(o.userData.sceneryType);if(o.userData.sceneryLantern)lamps.push(o.position.y>2&&o.position.z>o.userData.wallFront)});
   const positions=JSON.stringify(townSceneryFlowers(maps.town));
   const palettes=['春','夏','秋','冬'].map(s=>townSceneryPalette(s).join(','));
   const flowers=townSceneryFlowers(maps.town);
   const safe=flowers.every(p=>{const x=Math.floor(p.x),y=Math.floor(p.z);return maps.town.tiles[y][x]===0&&!maps.town.blocked.has(x+','+y)});
   townSceneryTime3D(false);const day=townSceneryLanternMaterial().emissiveIntensity;
   townSceneryTime3D(true);const evening=townSceneryLanternMaterial().emissiveIntensity;
   return {props,lamps,stable:positions===JSON.stringify(townSceneryFlowers(maps.town)),flowerCount:flowers.length,safe,palettes,day,evening,calls:Town3D.renderer.info.render.calls};
  });
  assert(['well','board','festival'].every(x=>scenery.props.includes(x)));
  assert(scenery.stable&&scenery.safe&&scenery.flowerCount>0&&scenery.flowerCount<=36);
  assert.equal(new Set(scenery.palettes).size,4);assert(scenery.evening>scenery.day);assert(scenery.lamps.length>0&&scenery.lamps.every(Boolean));
  const areas=await page.evaluate(()=>Object.keys(maps));
  for(const key of areas){const result=await page.evaluate(key=>{changeArea(key,24,20,false);closeChoices();town3DDraw(performance.now(),.016);return {ready:!Town3D.failed,calls:Town3D.renderer.info.render.calls}},key);assert(result.ready&&result.calls<100,key+' exceeds render budget')}
  await page.evaluate(()=>{changeArea('town',24,15,false);closeChoices();town3DDraw(performance.now(),.016)});
  await page.screenshot({path:process.env.TOWN_SCENERY_SCREENSHOT||'/tmp/kotoba-scenery-desktop.png'});
  const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});mobile.on('pageerror',e=>errors.push(e.message));
  await mobile.goto('http://127.0.0.1:8785/');await mobile.waitForFunction(()=>typeof TownScenery==='object');
  assert(await mobile.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;return state.settings.force2D&&document.documentElement.scrollWidth<=innerWidth&&townSceneryFlowers(maps.town).length>0}));
  await mobile.screenshot({path:'/tmp/kotoba-scenery-mobile.png'});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:7,scenery,areas:areas.length,errors},null,2));
 }finally{if(browser)await browser.close();server.kill()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
