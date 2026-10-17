// Scripted 30-minute itinerary, NOT a measurement of a human player's catch rate.
// Acquisition is supplied as a fixture; buying, inventory transfers and sales use game code.
const {chromium}=require('playwright'),{spawn}=require('node:child_process');
const path=require('node:path'),assert=require('node:assert/strict');
async function main(){
 const server=spawn('python',['-m','http.server','8784'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});
 await new Promise(r=>setTimeout(r,400));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox']});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /^webgl|experimental-webgl/.test(t)?null:get.call(this,t,...a)}});
  await page.goto('http://127.0.0.1:8784/');
  const result=await page.evaluate(()=>{
   chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;
   const start=state.coins,clock=Date.now;let elapsed=0;const epoch=clock();
   Date.now=()=>epoch+elapsed*1000;
   try{
    // 2-minute slots include travel, conversations and failed attempts, by assumption.
    for(let i=0;i<6;i++){elapsed+=120;recordCreature('medaka')}
    for(let i=0;i<4;i++){elapsed+=120;recordCreature('ladybug')}
    elapsed+=120;townGather('forest');elapsed+=120;townGather('beach');
    elapsed+=120;townBuy('carrot');townBuy('salt');townCook('soup');
    enter('shop',10,9);closeChoices();
    for(let i=0;i<3;i++)townListItem('medaka',TOWN_DATA.prices.medaka.shop);
    townListItem('soup',TOWN_DATA.prices.soup.shop);
    for(let i=0;i<3;i++)townDirectSell('medaka');
    for(let i=0;i<4;i++)townDirectSell('ladybug');
    townDirectSell('herb');townDirectSell('shell');
    elapsed=1800;for(const l of [...X.listings])townMakeSale(l.id);
    save(false);
    return {minutes:elapsed/60,initialG:start,finalG:state.coins,netG:state.coins-start,grossG:state.coins-start+40,ingredientsG:40,unsold:X.listings.length,remaining:['medaka','ladybug','soup','herb','shell'].map(townCount)};
   }finally{Date.now=clock}
  });
  assert.equal(result.netG,430);assert.equal(result.unsold,0);assert(result.remaining.every(n=>n===0));
  await page.reload();assert.equal(await page.evaluate(()=>state.coins),result.finalG);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:4,scenario:result,errors},null,2));
 }finally{if(browser)await browser.close();server.kill()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
