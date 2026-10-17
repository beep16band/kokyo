// Isolated software-WebGL regression checks; these do not certify physical-device FPS.
const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const path=require('node:path'),assert=require('node:assert/strict');
async function main(){
 const server=spawn('python',['-m','http.server','8783'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});
 await new Promise(r=>setTimeout(r,400));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8783/');
  await page.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;state.settings.reducedMotion=true});
  await page.waitForFunction(()=>Town3D.ready&&Town3D.frameArea===Town3D.area);
  const initial=await page.evaluate(()=>({calls:Town3D.renderer.info.render.calls,triangles:Town3D.renderer.info.render.triangles,geometries:Town3D.renderer.info.memory.geometries}));
  const timing=await page.evaluate(()=>new Promise(resolve=>{const start=performance.now(),deltas=[];let last=start;function tick(now){deltas.push(now-last);last=now;if(now-start<2500)requestAnimationFrame(tick);else{deltas.sort((a,b)=>a-b);resolve({frames:deltas.length,elapsedMs:Math.round(now-start),medianMs:deltas[Math.floor(deltas.length/2)],p95Ms:deltas[Math.floor(deltas.length*.95)]})}}requestAnimationFrame(tick)}));
  if(process.argv.includes('--baseline')){console.log(JSON.stringify({initial,timing,errors},null,2));return;}
  assert(initial.calls<100,'town draw calls must stay below 100');
  const appearance=await page.evaluate(()=>{
   const V=Town3D,target=new THREE.WebGLRenderTarget(256,160),a=new Uint8Array(256*160*4),b=new Uint8Array(a.length);
   town3DDraw(performance.now(),.016);V.renderer.setRenderTarget(target);
   V.renderer.render(V.scene,V.camera);V.renderer.readRenderTargetPixels(target,0,0,256,160,a);
   for(const {batch,meshes} of V.batches){batch.visible=false;meshes.forEach(m=>m.layers.set(0))}
   V.renderer.render(V.scene,V.camera);V.renderer.readRenderTargetPixels(target,0,0,256,160,b);
   for(const {batch,meshes} of V.batches){batch.visible=true;meshes.forEach(m=>m.layers.set(1))}
   V.renderer.setRenderTarget(null);target.dispose();
   let changed=0;for(let i=0;i<a.length;i+=4)if(Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]))>8)changed++;
   return changed/(256*160);
  });
  assert(appearance<.01,'batching changes more than 1% of visible pixels');
  // Moving between districts must release per-world GPU buffers, while retaining shared shapes.
  const cycles=await page.evaluate(()=>{
   const counts=[];let disposed=0;
   Town3D.world.traverse(o=>{if(o.isInstancedMesh)o.addEventListener('dispose',()=>disposed++)});
   for(let i=0;i<12;i++){
    changeArea(i%2?'town':'river',24,20,false);closeChoices();
    town3DDraw(performance.now(),.016);
    counts.push(Town3D.renderer.info.memory.geometries);
   }
   return {counts,disposed};
  });
  assert(cycles.counts.at(-1)<=cycles.counts[1]+2,'GPU geometry count grows after revisiting the same district');
  assert(cycles.disposed>20,'old instance buffers must receive disposal events');
  const menu=await page.evaluate(()=>{openWorldMenu();const before=Town3D.renderer.info.render.frame;town3DDraw(performance.now(),.016);const after=Town3D.renderer.info.render.frame;closeWorldMenu();return before===after});
  assert(menu,'open menus should reuse the last 3D frame');
  await page.evaluate(()=>{save(false);Town3D.renderer.domElement.dispatchEvent(new Event('webglcontextlost',{cancelable:true}))});
  await page.waitForFunction(()=>Town3D.failed&&Town3D.renderer.domElement.hidden);
  assert(await page.evaluate(()=>!!localStorage.getItem('kotoba_shop_v1')),'fallback must retain the save');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passed:7,initial,timing,changedPixelRatio:appearance,geometryCycles:cycles,errors},null,2));
 }finally{if(browser)await browser.close();server.kill()}
}
main().catch(e=>{console.error(e);process.exitCode=1});
