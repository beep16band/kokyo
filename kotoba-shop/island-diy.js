// Outdoor furniture is stored separately from purchased indoor furniture.
const ISLAND_DIY={chair:{name:'木のいす',wood:3},table:{name:'木のテーブル',wood:5},plant:{name:'植木鉢',wood:2}};
if(!IS.diy||typeof IS.diy!=='object'||Array.isArray(IS.diy))IS.diy={};
for(const kind of Object.keys(ISLAND_DIY))IS.diy[kind]=Math.max(0,Math.min(999,Math.floor(Number(IS.diy[kind])||0)));
if(!Array.isArray(IS.outdoor))IS.outdoor=[];
IS.outdoor=IS.outdoor.filter(f=>f&&ISLAND_DIY[f.kind]&&maps[f.area]&&Number.isInteger(f.x)&&Number.isInteger(f.y)&&f.x>1&&f.x<MAP_W-2&&f.y>1&&f.y<MAP_H-2).slice(0,60).map(f=>({...f,rotation:((Math.floor(Number(f.rotation)||0)%4)+4)%4}));
const floorBeforeOutdoorDIY=mapFloorFree;
function islandOutdoorAt(area,x,y){return IS.outdoor.find(f=>f.area===area&&f.x===x&&f.y===y);}
mapFloorFree=function(area,x,y){return floorBeforeOutdoorDIY(area,x,y)&&!islandOutdoorAt(area,x,y);};
function islandDIYChanged(){IslandRuntime.revision++;Town3D.area='';Town3D.frameArea='';save(false);}
function islandCraft(kind){const r=ISLAND_DIY[kind];if(!r||state.scene!=='town'&&!islandPlace('islandOffice')||IS.diy[kind]>=999||townCount('wood')<r.wood)return false;townChange('wood',-r.wood);IS.diy[kind]++;islandDIYChanged();return true;}
function islandOutdoorTarget(){const [dx,dy]={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[facing]||[0,1];return {area:state.area,x:state.x+dx,y:state.y+dy};}
function islandOutdoorValid(p){
 const m=maps[p.area];
 if(state.scene!=='town'||p.area!==state.area||!m||p.x<2||p.y<2||p.x>=m.w-2||p.y>=m.h-2||m.tiles[p.y]?.[p.x]!==0||!mapFloorFree(p.area,p.x,p.y))return false;
 // Keep doors, landmarks, arrival points and NPC destinations clear.
 if(m.pois.some(q=>Math.abs(q.x-p.x)<=2&&Math.abs(q.y-p.y)<=2)||m.buildings.some(b=>p.x>=b.x-1&&p.x<=b.x+b.w&&p.y>=b.y-1&&p.y<=b.y+b.h+2))return false;
 if(Math.abs(AREAS[p.area].spawn[0]-p.x)<=1&&Math.abs(AREAS[p.area].spawn[1]-p.y)<=1)return false;
 if(Object.values(worldNpcConfig).some(n=>n.area===p.area&&Object.values(n.spots).some(q=>Math.abs(q[0]-p.x)<=1&&Math.abs(q[1]-p.y)<=1)))return false;
 if(!outdoorFree(p.x,p.y))return false;
 // A placement may not remove access to any previously reachable free tile.
 const reach=block=>{const seen=new Set(),queue=[[state.x,state.y]];for(let i=0;i<queue.length;i++){const [x,y]=queue[i],key=x+','+y;if(seen.has(key)||block&&x===p.x&&y===p.y||!mapFloorFree(p.area,x,y))continue;seen.add(key);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([x+dx,y+dy]);}return seen;};
 const before=reach(false),after=reach(true);return after.size===before.size-(before.has(p.x+','+p.y)?1:0);
}
function islandOutdoorPlace(kind){const p=islandOutdoorTarget();if(!ISLAND_DIY[kind]||!IS.diy[kind]||IS.outdoor.length>=60||!islandOutdoorValid(p))return false;IS.diy[kind]--;IS.outdoor.push({...p,kind,rotation:0});islandDIYChanged();return true;}
function islandOutdoorCollect(){const p=islandOutdoorTarget(),f=islandOutdoorAt(p.area,p.x,p.y);if(state.scene!=='town'||!f||IS.diy[f.kind]>=999)return false;IS.outdoor.splice(IS.outdoor.indexOf(f),1);IS.diy[f.kind]++;islandDIYChanged();return true;}
function islandOutdoorRotate(){const p=islandOutdoorTarget(),f=islandOutdoorAt(p.area,p.x,p.y);if(state.scene!=='town'||!f)return false;f.rotation=(f.rotation+1)%4;islandDIYChanged();return true;}
function islandDIYMenu(){
 stopWorldInput();tell('【屋外の家具・DIY】\n① 木材で作る → ② 屋外で置きたい場所を向く → ③ 持っている家具を選んで置く。\n木材 '+townCount('wood')+'個／屋外の配置 '+IS.outdoor.length+'/60個\n道や入口をあけ、草地に置こう。向かいの家具は回転・回収できます。回収した家具はまた置けます。');
 renderChoices([...Object.entries(ISLAND_DIY).map(([k,r])=>['作る：'+r.name+'（木材'+r.wood+'個）',()=>islandMessage(islandCraft(k)?r.name+'を作りました。':'屋外か案内所で、必要な木材を用意しよう。持ち物は各999個まで。',islandDIYMenu)]),...Object.entries(ISLAND_DIY).filter(([k])=>IS.diy[k]>0).map(([k,r])=>['置く：'+r.name+'（'+IS.diy[k]+'個）',()=>islandMessage(islandOutdoorPlace(k)?'向いている場所に置き、保存しました。':'ここには置けません。屋外の空いている草地を向こう。入口・道・人の行き先はあけよう。配置は60個まで。',islandDIYMenu)]),['向かいの家具を回転',()=>islandMessage(islandOutdoorRotate()?'向きを変え、保存しました。':'屋外の家具のとなりで、家具を向こう。',islandDIYMenu)],['向かいの家具を回収',()=>islandMessage(islandOutdoorCollect()?'持ち物に戻し、保存しました。':'屋外の家具のとなりで、家具を向こう。持ち物は各999個まで。',islandDIYMenu)],['閉じる',closeChoices]]);
}
const journalBeforeDIY=islandJournal;
islandJournal=function(){journalBeforeDIY();const b=document.createElement('button');b.textContent='屋外の家具・DIY';b.onclick=islandDIYMenu;choices.prepend(b);};
townLifeMenu=islandJournal;townQuestMenu=islandJournal;
const officeBeforeDIY=islandOfficeMenu;
islandOfficeMenu=function(){officeBeforeDIY();if(!islandPlace('islandOffice'))return;const b=document.createElement('button');b.textContent='屋外の家具・DIY';b.onclick=islandDIYMenu;choices.prepend(b);};
const actionBeforeDIY=action;
action=function(){if(state.scene==='town'&&!setupOpen&&!menuOpen&&!editorOpen&&!walkStep&&!mini&&!choices.children.length&&!busy){const p=islandOutdoorTarget();if(islandOutdoorAt(p.area,p.x,p.y)){islandDIYMenu();return;}}return actionBeforeDIY();};
const sceneBeforeDIY=town3DDraw;
town3DDraw=function(now,dt){const ok=sceneBeforeDIY(now,dt);if(ok&&Town3D.world&&!Town3D.world.userData.outdoorDIY){Town3D.world.userData.outdoorDIY=true;for(const f of IS.outdoor)if(f.area===state.area)townInteriorFurniture(Town3D.world,f.kind,f.x,f.y,f.rotation);}return ok;};
const drawBeforeDIY=draw;
draw=function(now=performance.now()){drawBeforeDIY(now);if(state.scene!=='town'||Town3D.ready&&!Town3D.failed&&!state.settings.force2D)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.translate(-Math.round(camera.x),-Math.round(camera.y));for(const f of IS.outdoor)if(f.area===state.area){ctx.save();ctx.translate((f.x+.5)*T,(f.y+.5)*T);ctx.rotate(f.rotation*Math.PI/2);drawFurnitureChip({...f,x:-.5,y:-.5});ctx.restore();}ctx.restore();};
