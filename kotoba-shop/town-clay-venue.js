// Original outdoor reception art and an accessible timing control. No weapon simulation.
function townClayRecords(){
 tell('【クレー射撃場の記録】\n'+['初心者練習','通常練習','町の大会','季節大会'].map(mode=>{const r=X.clayRecords[mode];return mode+'：'+(r?'最高 '+r.best+'/10枚・'+r.plays+'回・'+(r.trophy||'トロフィーなし'):'まだ記録がありません');}).join('\n'));
 renderChoices([['練習・大会へ',clayMenu],['閉じる',closeChoices]]);
}
function townClayStation3D(parent,s){
 const x=s.x+s.w/2,z=s.y+s.h/2,box=(col,a,b,c,w,h,d)=>townInteriorBox(parent,col,a,b,c,w,h,d);
 if(s.kind==='clayRange'){
  for(let a=s.x;a<=s.x+s.w;a+=2){box('#b3946d',a,.62,s.y+.15,.13,1.12,.13);if(a<s.x+s.w)box('#dfd0b0',a+1,.74,s.y+.15,2,.13,.1);}
  for(const dx of [-4.5,0,4.5]){box('#826d57',x+dx,.75,z,.1,1.4,.1);for(const [col,r,depth]of[['#e5c785',.5,.06],['#fff2ce',.31,.08]]){const disc=town3DMesh(parent,'cylinder',col,x+dx,1.7,z+.08,r,depth,r);disc.rotation.x=Math.PI/2;}}
  for(const dx of [-s.w/2,s.w/2]){box('#826d57',x+dx,1.45,z,.08,2.8,.08);box('#d8a8b5',x+dx+.3,2.65,z,.65,.4,.06);}return true;
 }
 if(s.kind==='clayRecords'){
  box('#b3946d',x,.56,z,s.w-.1,1,s.h-.1);box('#dfd0b0',x,1.13,z,s.w,.12,s.h);
  const records=Object.entries(X.clayRecords).filter(([,r])=>r.trophy).slice(0,4);
  records.forEach(([mode,r],i)=>{const a=x-1+i*.65,col=r.trophy==='金'?'#e5c785':r.trophy==='銀'?'#b1baa9':'#c78f78',g=new THREE.Group();g.userData.clayTrophy=mode;parent.add(g);townInteriorBox(g,'#826d57',a,1.25,z,.4,.13,.4);townInteriorBox(g,col,a,1.45,z,.06,.32,.06);town3DMesh(g,'sphere',col,a,1.72,z,.24,.2,.18);});return true;
 }
 if(s.kind==='clayBench'){box('#b3946d',x,.58,z,s.w-.15,.14,1.15);box('#dfd0b0',x,1.05,s.y+.3,s.w-.15,.75,.1);for(const dx of [-1,1])box('#826d57',x+dx,.3,z,.13,.5,.75);return true;}
 return false;
}
function townClayStation2D(s){
 const x=s.x*T,y=s.y*T,w=s.w*T,h=s.h*T;
 if(s.kind==='clayRange'){cozyRound(ctx,x+2,y,w-4,h-2,3,'#a7bb91');for(let a=0;a<w;a+=32)cozyRound(ctx,x+a,y+7,4,22,1,'#b3946d');cozyRound(ctx,x,y+16,w,4,1,'#dfd0b0');for(const a of [w*.2,w*.5,w*.8]){cozyRound(ctx,x+a-2,y+28,4,30,1,'#826d57');cozyOval(ctx,x+a,y+28,15,15,'#e5c785');cozyOval(ctx,x+a,y+28,9,9,'#fff2ce');}}
 if(s.kind==='clayRecords'){Object.values(X.clayRecords).filter(r=>r.trophy).slice(0,4).forEach((r,i)=>{const a=x+12+i*20,col=r.trophy==='金'?'#e5c785':r.trophy==='銀'?'#b1baa9':'#c78f78';cozyOval(ctx,a,y+19,8,8,col);cozyRound(ctx,a-2,y+24,4,15,1,col);cozyRound(ctx,a-7,y+37,14,5,1,'#826d57');});}
 if(s.kind==='clayBench'){cozyRound(ctx,x+3,y+8,w-6,12,2,'#dfd0b0');cozyRound(ctx,x+3,y+26,w-6,15,2,'#b3946d');}
}
function townClayTiming(){const s=TownLife.clay,t=s?.target;if(t&&t.x>250&&t.x<390&&!s.shot.has(t.index))return shootClay(t.x,t.y);const el=document.getElementById('clayFeedback');if(el)el.textContent='中央の光る帯に入ったら押そう。';return false;}
const startClayBeforeVenue=startClay;startClay=function(mode){
 if(TownLife.clay)return;startClayBeforeVenue(mode);if(!TownLife.clay)return;
 document.body.classList.add('townClayPlaying');const box=document.getElementById('menuContent'),button=document.createElement('button');button.id='clayTiming';button.textContent='中央の帯でタップ（Space / Enter）';button.setAttribute('aria-label','中央の帯でタイミングを合わせる');button.onclick=townClayTiming;
 const feedback=document.createElement('p');feedback.id='clayFeedback';feedback.setAttribute('role','status');feedback.textContent='光る的を直接タップしても遊べます。';box.insertBefore(button,box.lastElementChild);box.append(feedback);
};
const shootClayBeforeVenue=shootClay;shootClay=function(x,y){const s=TownLife.clay,t=s?.target,ok=shootClayBeforeVenue(x,y);if(ok){s.hitAt=performance.now();s.hitPoint={x:t.x,y:t.y};const el=document.getElementById('clayFeedback');if(el)el.textContent='成功！ '+s.hits+'枚';}return ok;};
const updateClayBeforeVenue=updateClay;updateClay=function(now){
 updateClayBeforeVenue(now);const s=TownLife.clay,t=s?.target,canvas=document.getElementById('clayCanvas');if(!s||!t||!canvas)return;
 const g=canvas.getContext('2d'),sky=g.createLinearGradient(0,0,0,260);sky.addColorStop(0,'#b8d5d0');sky.addColorStop(1,'#f3dfb7');g.fillStyle=sky;g.fillRect(0,0,640,260);
 for(let i=0;i<5;i++){cozyOval(g,40+i*150,205,120,80,i%2?'#a7bb91':'#8db183');cozyOval(g,60+i*145,38,34,10,'#fff2ce');}
 g.fillStyle='#b7c598';g.fillRect(0,210,640,50);for(let x=0;x<640;x+=40)cozyRound(g,x,206,5,40,1,'#b3946d');cozyRound(g,0,222,640,5,1,'#dfd0b0');
 g.fillStyle='#fff2ce55';g.fillRect(250,12,140,195);g.strokeStyle='#fff2ce';g.lineWidth=2;g.strokeRect(250,12,140,195);
 const hit=s.shot.has(t.index),ready=t.x>250&&t.x<390&&!hit;
 if(!hit){for(let i=1;i<6;i++)cozyOval(g,t.x-i*9,t.y+i*2,Math.max(1,6-i),Math.max(1,6-i),'#fff2ce88');cozyOval(g,t.x,t.y,s.mode==='初心者練習'?28:21,s.mode==='初心者練習'?28:21,ready?'#fff2ce':'#e5c785');cozyOval(g,t.x,t.y,12,12,'#d6a179');}
 if(s.hitPoint&&now-s.hitAt>=0&&now-s.hitAt<450&&!state.settings.reducedMotion){const p=(now-s.hitAt)/450;for(let i=0;i<8;i++){const a=i*Math.PI/4;cozyOval(g,s.hitPoint.x+Math.cos(a)*p*45,s.hitPoint.y+Math.sin(a)*p*45,3*(1-p),3*(1-p),'#fff2ce');}}
 g.font='bold 16px KotobaSans,sans-serif';g.textAlign='center';g.fillStyle='#364a46';g.fillText(ready?'今！':hit?'成功！':'中央の帯で押そう',320,247);
 const button=document.getElementById('clayTiming');if(button){button.dataset.ready=String(ready);}
};
const closeMenuBeforeVenue=closeWorldMenu;closeWorldMenu=function(){closeMenuBeforeVenue();document.body.classList.remove('townClayPlaying');};
const clayVenueStyle=document.createElement('style');clayVenueStyle.textContent='.townClayPlaying #menuContent>button{min-height:48px;width:100%;margin:8px 0;padding:10px;display:block}.townClayPlaying #clayTiming{background:#e5c785}.townClayPlaying #clayTiming[data-ready="true"]{background:#fff2ce;outline:3px solid #a7bb91}#clayFeedback{min-height:1.6em;font-size:14px}@media(max-width:800px),(pointer:coarse){.townClayPlaying #worldMenu{position:fixed;inset:48px 8px 8px;z-index:95}.townClayPlaying #clayCanvas{width:100%!important;height:auto!important}.townClayPlaying #menuContent{display:block}}';document.head.append(clayVenueStyle);
