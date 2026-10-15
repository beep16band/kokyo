import{normalProgress}from './core.mjs?v=3';
import{ArrivalController,readArrival,writeArrival,hiddenStoryStarted}from './arrival-state.mjs?v=2';
export const ARRIVAL_SCHEMA={storyKey:'heian-portal-v44',gameKey:'heian-portal-games-v50',gameLengths:[60,30,86,30,60,24]};
export function playArrival({document:doc=document,window:win=window,quiet=false,onFinish=()=>{}}={}){
 const overlay=doc.createElement('div');overlay.id='secretSignal81';overlay.dataset.phase='signal';overlay.className=quiet?'quiet-arrival':'';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');overlay.tabIndex=-1;
 const note=doc.createElement('span');note.className='arrival-sr';note.textContent='クリア記録を保存しました。物語が続きます。';const canvas=doc.createElement('canvas');canvas.width=128;canvas.height=72;canvas.setAttribute('aria-hidden','true');const scan=doc.createElement('i');scan.className='arrival-scan';const veil=doc.createElement('i');veil.className='arrival-veil';overlay.append(canvas,scan,veil,note);doc.body.append(overlay);doc.documentElement.classList.add('secret-break81');doc.documentElement.classList.remove('secret-resume81');overlay.focus({preventScroll:true});
 for(const a of doc.querySelectorAll('audio,video'))a.pause();
 let noise=null,blackout=null,finish=null,ended=false;const ctx=quiet?null:canvas.getContext('2d');
 if(ctx){const frame=ctx.createImageData(128,72);const paint=()=>{for(let i=0;i<frame.data.length;i+=4){const v=Math.random()*160|0;frame.data[i]=frame.data[i+1]=frame.data[i+2]=v;frame.data[i+3]=255}ctx.putImageData(frame,0,0)};paint();noise=win.setInterval(paint,125)}
 const darken=()=>{overlay.dataset.phase='blackout';doc.documentElement.classList.remove('secret-break81');if(noise!==null)win.clearInterval(noise)};
 blackout=win.setTimeout(darken,quiet?30:1000);finish=win.setTimeout(()=>{if(ended)return;ended=true;darken();onFinish()},quiet?950:2500);
 return {overlay,cleanup(){ended=true;if(noise!==null)win.clearInterval(noise);win.clearTimeout(blackout);win.clearTimeout(finish);doc.documentElement.classList.remove('secret-break81');overlay.remove()}};
}
export function installArrival(){
 let local,session;try{local=window.localStorage}catch{}try{session=window.sessionStorage}catch{}const gate=document.getElementById('secretEnding80');
 const unlocked=()=>normalProgress(local,ARRIVAL_SCHEMA).unlocked;
 let motion;const controller=new ArrivalController({unlocked,marker:()=>readArrival(local,session),started:()=>hiddenStoryStarted(local),ready:()=>!document.hidden&&(!document.getElementById('portalOpening66')||document.getElementById('portalOpening66').hidden),write:s=>writeArrival(s,local,session),present:done=>{let quiet=window.matchMedia('(prefers-reduced-motion: reduce)').matches;try{quiet=quiet||JSON.parse(local?.getItem(ARRIVAL_SCHEMA.storyKey)||'{}').settings?.effects===false}catch{}motion=playArrival({quiet,onFinish:done})},navigate:()=>window.location.assign(new URL('secret-vn/?arrival=normal-clear',window.location.href).href)});
 let queued=false;const check=()=>{queued=false;if(gate)gate.hidden=!unlocked();controller.check();if(controller.phase==='idle'&&readArrival(local,session)?.status!=='pending')document.documentElement.classList.remove('secret-resume81')};const enqueue=()=>{if(queued)return;queued=true;queueMicrotask(check)};
 for(const name of['storage','focus'])window.addEventListener(name,enqueue);for(const name of['click','visibilitychange','portal-progress81','portal-opening-ended81'])document.addEventListener(name,enqueue);window.addEventListener('pageshow',e=>{if(e.persisted){motion?.cleanup();motion=null;controller.reset()}enqueue()});enqueue();return controller;
}
