// Two walkable facilities. Existing purchase, learning and friendship handlers stay authoritative.
const TOWN_FACILITY_ROOMS={
 kuan:{name:'よろづ処久庵',teacher:'阪本先生',spot:{x:10,y:4},stations:[
  {x:3,y:2,w:2,h:2,kind:'shelf',name:'種',keys:['carrotSeed','tomatoSeed','potatoSeed','cabbageSeed','cornSeed','pumpkinSeed']},
  {x:7,y:2,w:2,h:2,kind:'shelf',name:'道具',keys:['rod','net']},
  {x:12,y:2,w:2,h:2,kind:'shelf',name:'食材',keys:['carrot','tomato','potato','cabbage','corn','pumpkin','flour','salt']},
  {x:16,y:2,w:2,h:2,kind:'shelf',name:'家具',keys:['chair','table']},
  {x:8,y:5,w:4,h:1,kind:'counter',name:'阪本先生・買い物',use:()=>townTalk('阪本先生')}
 ]},
 school:{name:'山口中学校・ことばの教室',teacher:'阪口先生',spot:{x:10,y:3},stations:[
  {x:7,y:1,w:6,h:1,kind:'board',name:'依頼文の学習',use:()=>townStudy('requestStudy')},
  {x:2,y:2,w:2,h:2,kind:'books',name:'ことばの本棚',use:()=>townLearningMenu()},
  {x:15,y:2,w:3,h:2,kind:'books',name:'学習の記録',use:()=>learningReport()},
  {x:8,y:4,w:4,h:1,kind:'counter',name:'阪口先生',use:()=>townTalk('阪口先生')},
  ...[6,8].flatMap((y,row)=>[4,8,13].map((x,col)=>({x,y,w:2,h:2,kind:'desk',name:['紹介の練習','依頼の練習','案内の練習'][col],use:()=>townStudy('practice:'+['intro','request','preparation'][col])})))
 ]}
};
function townFacilityRoom(){return state.scene==='facility'?TOWN_FACILITY_ROOMS[state.facilityVisit?.id]:null;}
function townFacilityBlocks(room){return [...room.stations,{...room.spot,w:1,h:1}];}
function townFacilityFree(room,x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=1&&x<=18&&y>=2&&y<=10&&!townFacilityBlocks(room).some(r=>within(r,x,y));}
function townFacilityOutside(id){const f=TOWN_DATA.facilities.find(f=>f.id===id);return {area:f.area,x:f.x+Math.floor(f.w/2),y:f.y+f.h};}
function townFacilityEnter(id,resume=null){
 const room=TOWN_FACILITY_ROOMS[id];if(!room)return false;
 const outside=state.scene==='town'?{area:state.area,x:state.x,y:state.y}:townFacilityOutside(id);
 stopWorldInput();walkStep=null;busy=false;state.returnOutdoor=outside;
 state.scene='facility';state.venue=id;state.facilityVisit={version:1,id,x:resume?.x??10,y:resume?.y??9,facing:resume?.facing||'up'};
 const v=state.facilityVisit;[state.x,state.y]=townFacilityFree(room,v.x,v.y)&&!(v.x===10&&v.y===10)?[v.x,v.y]:[10,9];visualX=state.x;visualY=state.y;
 facing=['up','down','left','right'].includes(v.facing)?v.facing:'up';closeChoices();camera.ready=false;areaFade=performance.now()+250;
 tell(room.name+'です。棚・机・先生の前で決定すると利用できます。出口は下中央です。');updateWorldHud();save(false);return true;
}
// Serialize a legacy-recognized outdoor scene, with an optional visit marker.
// Older versions can therefore load money/items/progress and resume outside the facility.
function townFacilityWithOutdoor(fn){
 const room=townFacilityRoom();if(!room)return fn();
 const original={scene:state.scene,x:state.x,y:state.y,venue:state.venue};
 const back=state.returnOutdoor||townFacilityOutside(state.facilityVisit.id);
 state.facilityVisit={version:1,id:state.facilityVisit.id,x:state.x,y:state.y,facing,outside:{...back}};
 state.scene='town';state.x=back.x;state.y=back.y;state.venue=null;
 try{return fn()}finally{Object.assign(state,original)}
}
const saveBeforeFacilities=save;save=function(...args){return townFacilityWithOutdoor(()=>saveBeforeFacilities(...args));};
const exportBeforeFacilities=exportSave;exportSave=function(){return townFacilityWithOutdoor(()=>exportBeforeFacilities());};
const changeAreaBeforeFacilities=changeArea;changeArea=function(...args){delete state.facilityVisit;return changeAreaBeforeFacilities(...args);};
const enterBeforeFacilities=enter;enter=function(...args){delete state.facilityVisit;return enterBeforeFacilities(...args);};
const buildingBeforeFacilities=openWorldBuilding;openWorldBuilding=function(b){if(TOWN_FACILITY_ROOMS[b.type])return townFacilityEnter(b.type);return buildingBeforeFacilities(b);};
const passableBeforeFacilities=passable;passable=function(x,y){const r=townFacilityRoom();return r?townFacilityFree(r,x,y):passableBeforeFacilities(x,y);};
const obstaclesBeforeFacilities=obstacles;obstacles=function(scene){const r=townFacilityRoom();return scene==='facility'&&r?townFacilityBlocks(r):obstaclesBeforeFacilities(scene);};
function townFacilityTarget(){const r=townFacilityRoom();if(!r)return null;const [dx,dy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[facing];return r.stations.find(s=>within(s,state.x+dx,state.y+dy))||((state.x+dx===r.spot.x&&state.y+dy===r.spot.y)?{name:r.teacher,use:()=>townTalk(r.teacher)}:null);}
function townFacilityShelf(s){
 if(!X.metrics.starter){townTalk('阪本先生');return;}
 tell('阪本先生「'+s.name+'はこちらです。必要な分からどうぞ。」 所持金 '+state.coins+'G');
 renderChoices([...s.keys.map(k=>[TOWN_DATA.prices[k].name+' '+TOWN_DATA.prices[k].buy+'G',()=>{if(townBuy(k))townMessage(TOWN_DATA.prices[k].name+'を買いました。',()=>townFacilityShelf(s));}]),['すべての商品',kuanMenu],['閉じる',closeChoices]]);
}
const actionBeforeFacilities=action;action=function(){
 const room=townFacilityRoom();if(!room)return actionBeforeFacilities();
 if(setupOpen||menuOpen||editorOpen||walkStep||mini||choices.children.length)return;
 const s=townFacilityTarget();if(s){stopWorldInput();if(s.use)s.use();else townFacilityShelf(s);return;}
 tell('棚・机・先生の隣で、その方向を向いて決定してください。出口は下中央です。');
 renderChoices([['施設の案内',townFacilityGuide],['閉じる',closeChoices]]);
};
function townFacilityGuide(){const r=townFacilityRoom();if(!r)return;tell(r.name+'：'+r.stations.map(s=>s.name).filter((s,i,a)=>a.indexOf(s)===i).join('／'));renderChoices([['先生と話す',()=>townTalk(r.teacher)],[state.facilityVisit.id==='kuan'?'すべての商品':'町のことば練習',state.facilityVisit.id==='kuan'?kuanMenu:townLearningMenu],['走る：'+(state.settings.dashMode?'ON':'OFF'),()=>{state.settings.dashMode=!state.settings.dashMode;save(false);townFacilityGuide();}],['町へ出る',()=>enter('town')],['閉じる',closeChoices]]);}
const hudBeforeFacilities=updateWorldHud;updateWorldHud=function(){hudBeforeFacilities();const r=townFacilityRoom();if(!r)return;document.getElementById('areaName').textContent=r.name;const label=townFacilityTarget()?'調べる・話す':'調べる';for(const id of ['action','contextAction']){const b=document.getElementById(id);rubyText(b,label);b.setAttribute('aria-label',label);b.dataset.worldLabel=label;}};
function townFacilityBuild3D(parent){
 const I=TownInterior,r=townFacilityRoom(),school=state.facilityVisit.id==='school',wood='#b3946d',dark='#826d57';
 const box=(col,x,y,z,w,h,d)=>townInteriorBox(parent,col,x,y,z,w,h,d);
 for(const s of r.stations){const x=s.x+s.w/2,z=s.y+s.h/2;
  if(s.kind==='board'){box(wood,x,1.66,z,s.w-.1,1.65,.16);box('#6e947e',x,1.66,z+.1,s.w-.35,1.4,.05);for(let i=0;i<5;i++)box('#fff2ce',x-1.6+i*.8,1.7,z+.14,.45,.025,.02);box(wood,x,.84,z+.14,s.w,.08,.24);}
  else if(s.kind==='counter'){box(wood,x,.51,z,s.w-.12,.9,s.h-.12);box('#dfd0b0',x,1.03,z,s.w,.12,s.h);if(school)box('#82a8b4',x-.7,1.13,z,.7,.08,.45);else{box(dark,x-.8,1.22,z,.62,.25,.46);box('#83bfca',x-.8,1.43,z-.05,.45,.28,.1);}}
  else if(s.kind==='desk'){for(const a of [-.65,.65])for(const b of [-.28,.28])box(dark,x+a,.42,s.y+.5+b,.07,.72,.07);box(wood,x,.84,s.y+.5,1.8,.12,.9);box('#fff2ce',x, .92,s.y+.5,.65,.025,.5);const chair=townInteriorFurniture(parent,'chair',s.x+.5,s.y+1,0);chair.scale.set(.8,.8,.8);}
  else{box(dark,x,.98,s.y+.1,s.w-.1,1.82,.12);for(const a of [-s.w/2+.07,s.w/2-.07])box(wood,x+a,.98,z,.12,1.82,s.h-.1);for(const y of [.18,.87,1.6])box(wood,x,y,z,s.w-.1,.09,s.h-.1);
   for(let n=0;n<8;n++){const xx=s.x+.28+(n%4)*(s.w-.5)/3,yy=n<4?.42:1.13,zz=s.y+s.h-.15,col=['#82a8b4','#d8a8b5','#a7bb91','#e5c785'][n%4];if(s.name==='家具'){if(n%4>1)continue;const g=townInteriorFurniture(parent,n%2?'table':'chair',s.x+.12+(n%2)*.95,s.y+s.h-.65);g.scale.set(.38,.38,.38);g.position.y=n<4?.23:.92;}else if(s.kind==='books'||s.name==='種')box(col,xx,yy,zz,.22,.4,.19);else town3DMesh(parent,s.name==='道具'?'cylinder':'sphere',col,xx,yy,zz,.16,s.name==='道具'?.3:.15,.15);}
  }
  if(s.kind!=='desk'||s.y===8)I.labels.push({text:()=>s.name,x,y:s.kind==='board'?2.3:s.kind==='desk'?1.2:1.95,z:s.y+s.h+.1});
 }
 const n=TOWN_DATA.residents.find(n=>n.name===r.teacher);I.customer=town3DCharacter(n.design,n.color,n.name);I.customer.userData.indoorSpot=r.spot;parent.add(I.customer);
 I.labels.push({text:()=>r.teacher,x:r.spot.x+.5,y:2.15,z:r.spot.y+.5});
}
function townFacilityDraw2D(now){
 const r=townFacilityRoom();if(!r)return;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#e3dbc9';ctx.fillRect(0,0,c.width,c.height);
 const hudHeight=(document.getElementById('worldHud').getBoundingClientRect().height+8)*c.width/c.getBoundingClientRect().width;
 const scale=Math.min(c.width/640,(c.height-hudHeight)/384);ctx.save();ctx.translate((c.width-640*scale)/2,hudHeight+(c.height-hudHeight-384*scale)/2);ctx.scale(scale,scale);
 for(let y=1;y<=10;y++)for(let x=1;x<=18;x++){ctx.fillStyle=(x+y)%2?'#e5d3af':'#dfcba4';ctx.fillRect(x*T,y*T,T-1,T-1);}
 cozyRound(ctx,20,24,600,35,4,state.facilityVisit.id==='school'?'#a7bb91':'#f3dfb7');
 const objects=r.stations.map(s=>({z:s.y+s.h,draw:()=>{const x=s.x*T,y=s.y*T,w=s.w*T,h=s.h*T;cozyRound(ctx,x+2,y,w-4,h-2,3,s.kind==='board'?'#6e947e':s.kind==='desk'?'#dfd0b0':'#b3946d');if(['shelf','books'].includes(s.kind)){for(let i=0;i<8;i++)cozyRound(ctx,x+7+(i%4)*(w-15)/4,y+8+Math.floor(i/4)*26,8,17,2,['#82a8b4','#d8a8b5','#a7bb91','#e5c785'][i%4]);}if(s.kind==='desk'){cozyRound(ctx,x+21,y+5,20,12,2,'#fff2ce');cozyRound(ctx,x+23,y+36,18,23,3,'#b3946d');}if(s.kind!=='desk'||s.y===8)label(s.name,x+w/2,y-5,'#fff2ce');}}));
 const n=TOWN_DATA.residents.find(n=>n.name===r.teacher);objects.push({z:r.spot.y+1,draw:()=>{character(r.spot.x,r.spot.y,n.color,false,'animal',now,'down');label(r.teacher,r.spot.x*T+16,r.spot.y*T-20,'#fff2ce');}});objects.push({z:visualY+1.01,draw:()=>character(visualX,visualY,'#477db0',false,'human',now,facing)});objects.sort((a,b)=>a.z-b.z).forEach(o=>o.draw());cozyRound(ctx,10*T,10*T,32,28,3,'#c99aab');label('出口 ↓',10*T+16,10*T-5,'#fff2ce');ctx.restore();
}
const drawBeforeFacilities=draw;draw=function(now=performance.now()){drawBeforeFacilities(now);if(townFacilityRoom()&&!TownInterior.active)townFacilityDraw2D(now);};
// Initialization before this file may autosave an outdoor scene. The marker is kept intact.
const facilityResume=state.facilityVisit;
function townFacilityResumeMatches(v){try{const raw=JSON.parse(townBootRaw),p=raw.worldPosition,b=v.outside;return raw.scene==='town'&&p&&b&&p.area===b.area&&p.x===b.x&&p.y===b.y;}catch{return false;}}
if(state.scene==='town'&&facilityResume?.version===1&&Object.hasOwn(TOWN_FACILITY_ROOMS,facilityResume.id)&&townFacilityResumeMatches(facilityResume))townFacilityEnter(facilityResume.id,facilityResume);
else if(state.scene!=='facility')delete state.facilityVisit;
