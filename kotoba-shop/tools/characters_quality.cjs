// Synthetic-save artwork and animation gates. EXPORT_TOWN_CHARACTERS=1 exports original atlases.
const {chromium}=require('playwright'),{spawn}=require('node:child_process');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
async function main(){
 const root=path.resolve(__dirname,'..'),server=spawn('python',['-m','http.server','8786'],{cwd:root,stdio:'ignore'});
 await new Promise(r=>setTimeout(r,400));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8786/');await page.waitForFunction(()=>typeof TownCharacters==='object');
  const result=await page.evaluate(()=>{
   chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;state.settings.reducedMotion=true;
   town3DDraw(performance.now(),.016);
   const profiles=Object.keys(TOWN_CHARACTER_PROFILES),images=profiles.map(id=>townCharacterStamp(id).toDataURL());
   const directions=TownCharacters.directions.map(dir=>townCharacterStamp('boy',dir).toDataURL());
   const actions=TownCharacters.actions.map(pose=>townCharacterStamp('girl','down',1,pose).toDataURL());
   const actor=Town3D.player;town3DAnimate(actor,10,10,'down',false,0);
   actor.updateMatrixWorld(true);const soles=actor.userData.shoes.map(shoe=>new THREE.Box3().setFromObject(shoe).min.y);
   const rotation=[];for(const dir of TownCharacters.directions){town3DAnimate(actor,10,10,dir,false,0);rotation.push(actor.rotation.y)}
   const attached=actor.userData.shoes[0].parent===actor.userData.leftLeg&&actor.userData.shoes[1].parent===actor.userData.rightLeg;
   state.settings.reducedMotion=false;const walkingSoles=[];for(const t of [40,90,140,190]){town3DAnimate(actor,10,10,'down',true,t);actor.updateMatrixWorld(true);walkingSoles.push(Math.min(...actor.userData.shoes.map(shoe=>new THREE.Box3().setFromObject(shoe).min.y)))}state.settings.reducedMotion=true;
   const before=state.coins;townChange('carrot',1);townChange('salt',1);const cooked=townCook('soup');closeChoices();town3DAnimate(actor,10,10,'down',false,1000);const joy=actor.userData.pose==='joy';TownCharacters.reaction=null;
   const distinct=profiles.length===new Set(images).size;
   return {profiles,distinct,directionsDistinct:new Set(directions).size,actionVariants:new Set(actions).size,soles,walkingSoles,attached,rotation,joy:cooked&&joy,noCoinChange:before===state.coins,oldNpc:npcs.some(n=>n.name==='モク'),calls:Town3D.renderer.info.render.calls,teachers:['galaxy','sakamoto','sakaguchi'].map(id=>({id,smile:!!TOWN_CHARACTER_PROFILES[id].smile,glasses:!!TOWN_CHARACTER_PROFILES[id].glasses,outfit:TOWN_CHARACTER_PROFILES[id].outfit}))};
  });
  assert.equal(result.profiles.length,13);assert(result.distinct&&result.oldNpc);
  assert.equal(result.directionsDistinct,4);assert.equal(result.actionVariants,8);
  assert(result.attached&&result.soles.every(y=>Math.abs(y-.06)<.01));
  assert(result.walkingSoles.every(y=>Math.abs(y-.06)<.01));
  assert.deepEqual(result.rotation,[0,-Math.PI/2,Math.PI/2,Math.PI]);
  assert(result.joy&&result.noCoinChange);assert(result.teachers[0].smile&&result.teachers[2].glasses&&result.teachers[2].outfit==='cardigan');
  assert(await page.evaluate(()=>{TownCharacters.reaction=null;closeChoices();changeArea('river',26,20,false);closeChoices();busy=false;if(!startFishing())return false;town3DDraw(performance.now(),.016);const fishing=Town3D.fishingLine.visible&&!Town3D.netRing.visible;stopMini();town3DDraw(performance.now(),.016);const ended=!Town3D.fishingLine.visible;state.farm[0]={kind:'carrot',watered:0};townCharacterPose(2000);state.farm[0].watered=1;const watering=townCharacterPose(2100)==='tool';TownCharacters.reaction=null;return fishing&&ended&&watering}));
  const areaCalls=[];for(const key of await page.evaluate(()=>Object.keys(maps))){const calls=await page.evaluate(key=>{changeArea(key,24,20,false);closeChoices();town3DDraw(performance.now(),.016);return Town3D.renderer.info.render.calls},key);areaCalls.push([key,calls]);assert(calls<100,key+' exceeds rendering budget')}
  if(process.env.EXPORT_TOWN_CHARACTERS==='1'){
   const folder=path.join(root,'assets','characters');await fs.mkdir(folder,{recursive:true});
   for(const id of result.profiles){const png=await page.evaluate(id=>{const sheet=document.createElement('canvas');sheet.width=1024;sheet.height=640;const g=sheet.getContext('2d');TownCharacters.actions.forEach((pose,row)=>TownCharacters.directions.forEach((dir,d)=>{for(let f=0;f<4;f++)g.drawImage(townCharacterStamp(id,dir,f,pose),(d*4+f)*64,row*80)}));return sheet.toDataURL('image/png').split(',')[1]},id);await fs.writeFile(path.join(folder,id+'.png'),Buffer.from(png,'base64'));}
   const manifest=await page.evaluate(()=>({version:1,license:'Original artwork for kotoba-shop',cell:{width:64,height:80},sheet:{columns:16,rows:8},directions:TownCharacters.directions,actions:TownCharacters.actions,framesPerDirection:4,characters:Object.entries(TOWN_CHARACTER_PROFILES).map(([id,p])=>({id,name:p.name,file:id+'.png'}))}));await fs.writeFile(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  }
  await page.evaluate(()=>{changeArea('town',24,15,false);closeChoices();TownCharacters.reaction=null;town3DDraw(performance.now(),.016);updateWorldHud()});await page.screenshot({path:'/tmp/kotoba-characters-desktop.png'});
  const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto('http://127.0.0.1:8786/');await mobile.waitForFunction(()=>typeof TownCharacters==='object');
  assert(await mobile.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;return state.settings.force2D&&document.documentElement.scrollWidth<=innerWidth&&townCharacterProfile('animal',TOWN_DATA.residents[0].color).id==='akari'}));
  await mobile.screenshot({path:'/tmp/kotoba-characters-mobile.png'});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:8,result,areaCalls,errors},null,2));
 }finally{if(browser)await browser.close();server.kill()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
