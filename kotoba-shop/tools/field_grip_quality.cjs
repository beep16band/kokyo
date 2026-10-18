const {chromium}=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const offline=process.env.KOTOBA_FIELD_OFFLINE==='1',root=path.resolve(__dirname,'..'),out=path.resolve(offline?'field-grip-offline-audit':'field-grip-audit'),checks=[],errors=[];
 await fs.mkdir(out,{recursive:true});
 const server=spawn('python3',['-m','http.server',offline?'8812':'8811','--bind','127.0.0.1'],{cwd:root,stdio:'ignore'});
 let browser;
 const record=async(name,fn)=>{try{checks.push({name,pass:true,details:await fn()});console.log('PASS '+name);}catch(e){checks.push({name,pass:false,error:e.message});throw e;}finally{await fs.writeFile(path.join(out,'result.json'),JSON.stringify({checks,errors},null,2));}};
 try{
  browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const p=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  p.on('pageerror',e=>errors.push(e.message));
  const requests=[];if(offline){p.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});await p.route(/^https?:/,route=>route.abort());}
  await p.goto(offline?'file://'+path.join(root,'offline.html'):'http://127.0.0.1:8811/index.html');
  await p.evaluate(()=>{chooseLearningLevel('normal');tutorial.status='skipped';closeChoices();busy=false;changeArea('river',26,20,false);closeChoices();});
  await p.waitForFunction(()=>typeof TownAtlas!=='undefined'&&TownAtlas.loaded===13);
  await record('touch device uses lightweight 2D without horizontal overflow',async()=>assert(await p.evaluate(()=>state.settings.force2D&&document.documentElement.scrollWidth<=innerWidth)));
  await record('painted hand and actual net rod and fishing line agree in all directions',async()=>{
   const result=await p.evaluate(()=>{
    const original={};let paths=[],current=[];
    for(const name of ['beginPath','moveTo','lineTo','quadraticCurveTo','stroke'])original[name]=ctx[name];
    ctx.beginPath=function(...a){current=[];return original.beginPath.apply(this,a);};
    for(const name of ['moveTo','lineTo','quadraticCurveTo'])ctx[name]=function(...a){current.push([name,...a]);return original[name].apply(this,a);};
    ctx.stroke=function(...a){paths.push({color:this.strokeStyle,path:current.slice()});return original.stroke.apply(this,a);};
    let cases=0;
    const check=(ok,label)=>{if(!ok)throw Error(label);};
    try{
     for(const avatar of ['boy','girl'])for(const dir of ['down','left','right','up'])for(const reduced of [false,true])for(let frame=0;frame<4;frame++){
      state.avatar.kind=avatar;state.settings.reducedMotion=reduced;facing=dir;
      const now=frame*WALK_MS/2+1,left=dir==='left'||dir==='up',x=26*T+(left?1:31),f=reduced?0:frame,offset=[0,3,6,3][f];
      paths=[];mini=null;netSwing={x:26,y:20,face:dir,start:now-100,checked:true};drawOutdoor(now,.016);
      const net=paths.find(p=>p.color==='#be915b'),netHand=townCharacterFieldGrip(26,20,dir,'net',now);
      check(net?.path[0][1]===netHand.x&&net.path[0][2]===netHand.y,'net grip '+avatar+dir+frame);
      const body=townCharacterStamp(avatar,dir,f,'net'),skin=body.getContext('2d').getImageData(Math.round(netHand.x-26*T+16),Math.round(netHand.y-20*T+45),1,1).data;
      check(skin[3]>0,'grip on painted hand');if(reduced){const angle={right:0,down:Math.PI/2,left:Math.PI,up:-Math.PI/2}[dir];check(Math.abs(net.path[1][1]-netHand.x-Math.cos(angle)*43)<1e-8&&Math.abs(net.path[1][2]-netHand.y-Math.sin(angle)*43)<1e-8,'reduced motion holds net angle');}cases++;
      for(const phase of ['cast','wait','bite','land']){
       netSwing=null;mini={type:'fish',action:true,key:'medaka',phase,phaseAt:now-200,origin:{x:26,y:20},target:{x:27,y:20}};
       paths=[];drawOutdoor(now,.016);
       const rod=paths.find(p=>p.color==='#9d7147'),line=paths.find(p=>p.color==='#f9e9c7'),rodHand=townCharacterFieldGrip(26,20,dir,phase==='bite'?'surprise':'fish',now);
       if(phase==='land'){check(!rod&&!line,'no abandoned rod at landing');}
       else{
        check(rod?.path[0][1]===rodHand.x&&rod.path[0][2]===rodHand.y,'rod grip '+dir+phase);
        check(rod.path[1][1]===rodHand.x+(left?-19:19)&&rod.path[1][2]===rodHand.y-40,'rod direction');
        check(line?.path[0][1]===rod.path[1][1]&&line.path[0][2]===rod.path[1][2],'line starts at rod tip');
       }
       cases++;
      }
     }
    }finally{Object.assign(ctx,original);mini=null;netSwing=null;busy=false;state.settings.reducedMotion=false;state.avatar.kind='boy';}
    return {cases,note:'Controlled drawing states; does not force catches or change inventory.'};
   });
   assert.equal(result.cases,320);return result;
  });
  await record('real F key fishing in 2D catches one fish and returns control',async()=>{
   await p.evaluate(()=>{closeChoices();changeArea('river',26,20,false);closeChoices();busy=false;facing='right';});
   const before=await p.evaluate(()=>Object.values(state.creatureBag).reduce((a,b)=>a+b,0));
   await p.keyboard.press('f');await p.waitForFunction(()=>mini?.action&&mini.phase==='bite');
   await p.keyboard.press('Space');await p.waitForFunction(()=>mini?.phase==='land');
   assert.equal(await p.evaluate(()=>Object.values(state.creatureBag).reduce((a,b)=>a+b,0)),before+1);
   await p.waitForFunction(()=>!mini&&!busy);await p.screenshot({path:path.join(out,'touch-2d.png')});
  });
  await record('real net input finishes and reduced motion holds the swing direction',async()=>{
   await p.evaluate(()=>{state.settings.reducedMotion=true;closeChoices();});
   await p.keyboard.press('b');await p.waitForFunction(()=>!!netSwing);await p.waitForFunction(()=>!netSwing&&!busy);
   assert(await p.evaluate(()=>state.settings.force2D));
  });
  await record('no runtime exceptions or offline network requests',()=>{assert.deepEqual(errors,[]);if(offline)assert.deepEqual(requests,[]);});
 }finally{
  if(browser)await browser.close();server.kill();
  const report={passed:checks.filter(x=>x.pass).length,total:checks.length,checks,errors};
  await fs.writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));if(checks.some(x=>!x.pass))process.exitCode=1;
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
