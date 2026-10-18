// Reveal only a fully initialized UI with decoded current artwork. Never clear saves.
(function(){
 const root=document.documentElement,splash=document.getElementById('townBootSplash');
 let initialized=false;const before=draw;draw=function(now=performance.now()){if(root.classList.contains('townBooting')&&!initialized){lastFrame=now;worldLastTime=now;worldAutosave=now;requestAnimationFrame(draw);return;}before(now);};
 const timer=setTimeout(()=>{const note=document.getElementById('townBootNote'),retry=document.getElementById('townBootRetry');if(note)note.textContent='読み込みに時間がかかっています。';if(retry)retry.hidden=false;},20000);
 document.getElementById('townBootRetry').onclick=()=>location.reload();
 Promise.all(Object.values(TownAtlas.entries).map(e=>e.image.decode())).then(()=>document.fonts.ready).then(()=>{
  if(TownAtlas.errors.length||TownAtlas.loaded!==13)throw new Error('Current artwork is unavailable');
  initialized=true;requestAnimationFrame(()=>requestAnimationFrame(()=>{clearTimeout(timer);TownTitle.startedAt=performance.now();root.classList.remove('townBooting');splash.remove();}));
 }).catch(()=>{clearTimeout(timer);document.getElementById('townBootNote').textContent='画像を読み込めませんでした。もう一度お試しください。';document.getElementById('townBootRetry').hidden=false;});
})();
