// 9地区。物理データ（道路・水・建物・木・出入口）と描画を共用する。
const AREAS={
 forest:{name:'こもれびの森',grid:[0,0],kind:'forest',desc:'木漏れ日の小道。虫と、かくれた手紙を探そう。',spawn:[24,20]},
 hill:{name:'花咲く丘',grid:[1,0],kind:'hill',desc:'季節の花と見晴らし台。風の言葉を見つけよう。',spawn:[24,20]},
 ruins:{name:'古い遺跡',grid:[2,0],kind:'ruins',desc:'石碑に残ることば。探索は自由、謎は好きなときに。',spawn:[24,20]},
 market:{name:'商店通り',grid:[0,1],kind:'market',desc:'家具屋・種屋・パン屋・雑貨屋が並ぶ通り。',spawn:[24,20]},
 town:{name:'こもれびタウン',grid:[1,1],kind:'town',desc:'お店と自宅、みんなが集まる広場。',spawn:[24,15]},
 homes:{name:'ひだまり住宅街',grid:[2,1],kind:'homes',desc:'庭のある家並み。ナギとソラの話を聞こう。',spawn:[24,20]},
 farm:{name:'みのり農園',grid:[0,2],kind:'farm',desc:'6つの畑と農園の道具小屋。種から育てよう。',spawn:[24,20]},
 river:{name:'せせらぎ川',grid:[1,2],kind:'river',desc:'二つの橋と釣り場。水辺の案内を読み比べよう。',spawn:[24,20]},
 lake:{name:'あかね湖畔',grid:[2,2],kind:'lake',desc:'夕暮れの桟橋。湖だけの魚に出会えるかも。',spawn:[24,20]}
};
const MAP_W=48,MAP_H=32;const maps={};
const areaKeyAt=(gx,gy)=>Object.keys(AREAS).find(k=>AREAS[k].grid[0]===gx&&AREAS[k].grid[1]===gy);
function buildArea(key){const a=AREAS[key],m={key,w:MAP_W,h:MAP_H,tiles:Array.from({length:MAP_H},()=>Array(MAP_W).fill(0)),trees:[],rocks:[],fences:[],buildings:[],pois:[],portals:[],blocked:new Set()};
 const put=(x,y,t)=>{if(x>=0&&y>=0&&x<MAP_W&&y<MAP_H)m.tiles[y][x]=t};
 const rect=(x,y,w,h,t)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,t)};
 const path=(x1,y1,x2,y2,width=2,t=1)=>{const xstep=x2>x1?1:-1,ystep=y2>y1?1:-1;for(let x=x1;x!==x2+xstep;x+=xstep){for(let yy=y1;yy<y1+width;yy++)for(let xx=x;xx<x+width;xx++)if(m.tiles[yy]?.[xx]!==3)put(xx,yy,t)};for(let y=y1;y!==y2+ystep;y+=ystep){for(let yy=y;yy<y+width;yy++)for(let xx=x2;xx<x2+width;xx++)if(m.tiles[yy]?.[xx]!==3)put(xx,yy,t)}};
 // 中央の幹線と、地区を一周する寄り道の輪。
 rect(0,15,48,3,key==='town'?2:1);rect(23,0,3,32,key==='town'?2:1);
 path(10,12,36,12,2);path(36,12,36,25,2);path(36,25,10,25,2);path(10,25,10,12,2);
 const [gx,gy]=a.grid;for(const [dx,dy,edge,x,y,tx,ty] of [[-1,0,'left',0,16,46,16],[1,0,'right',47,16,1,16],[0,-1,'up',24,0,24,30],[0,1,'down',24,31,24,1]]){const to=areaKeyAt(gx+dx,gy+dy);if(to)m.portals.push({edge,to,x,y,tx,ty})}
 const building=(x,y,w,h,name,type,color='red')=>{m.buildings.push({x,y,w,h,name,type,color,door:{x:x+Math.floor(w/2),y:y+h-1}});path(x+Math.floor(w/2),y+h,24,16,2)};
 const poi=(x,y,type,name,extra={})=>{m.pois.push({x,y,type,name,...extra});path(24,16,x,y+1,1)};
 if(key==='town'){rect(19,12,12,11,2);building(10,7,6,5,'こもれびストア','ownShop');building(30,7,6,5,'ハルのおうち','ownHome','blue');poi(20,13,'board','広場の掲示板');poi(29,20,'festival','季節の集い');poi(22,22,'sign','町の道しるべ',{text:'西は商店通り、東は住宅街。北は花咲く丘、南はせせらぎ川。道はぐるりとつながっています。'});poi(27,13,'well','広場の井戸');}
 if(key==='market'){building(6,6,5,5,'家具屋','furniture');building(20,5,5,5,'種のおみせ','seeds','blue');building(35,6,5,5,'パン屋','bakery');building(34,21,5,5,'雑貨と道具','goods','blue');poi(14,21,'sign','商店通りの案内',{text:'家具は家具屋、作物の種は種屋へ。お店の商品の仕入れは、こもれびストアの中でできます。'});}
 if(key==='homes'){building(7,6,5,5,'ナギの家','nagiHome','blue');building(33,6,5,5,'ソラの家','soraHome');building(7,22,5,5,'ミミの庭','mimiGarden');poi(35,24,'request','庭のポスト');}
 if(key==='hill'){path(24,16,36,5,2);poi(36,5,'view','見晴らし台');poi(12,10,'flowers','丘の花畑');poi(33,24,'sign','花の案内',{text:'花の色は桃色・黄色・青色。畑では、好きな色の花を植えられます。季節が変わっても花は育ちます。'});}
 if(key==='forest'){path(10,12,6,6,1);path(6,6,14,6,1);poi(8,6,'cache','木のうろ',{id:'forest-letter',text:'落ち葉の下に、小さな手紙。「遠回りの道にも、出会いがある。」'});poi(34,23,'bugs','虫たちの切り株');poi(14,21,'sign','森の道しるべ',{text:'東の丘へ行く道と、南の商店通りへ行く道があります。細い道にも、歩いて行けます。'});}
 if(key==='farm'){building(31,7,5,5,'農園の道具小屋','farmOffice','blue');rect(13,9,8,8,4);poi(12,18,'farm','畑のお手入れ');poi(33,23,'farmRequest','農園からの依頼');}
 if(key==='river'){rect(29,0,5,32,3);rect(28,15,7,3,5);rect(28,25,7,2,5);path(24,20,26,20,2);poi(26,20,'fish','川の釣り場');poi(13,10,'sign','川の観察メモ',{text:'橋の上は歩けます。釣り場の前で決定すると、川にすむ魚を探せます。東の橋を渡ると湖畔です。'});}
 if(key==='lake'){rect(28,5,17,22,3);rect(27,17,9,3,5);path(24,3,46,3,1);path(46,3,46,28,1);path(46,28,24,28,1);path(24,20,26,20,2);poi(27,20,'lakeFish','湖の桟橋');poi(18,8,'view','夕暮れのベンチ');poi(14,24,'sign','湖の案内',{text:'この湖では、川とは違う魚にも出会えます。西はせせらぎ川、北は住宅街です。'});}
 if(key==='ruins'){rect(26,5,10,8,6);path(24,16,30,12,2,2);poi(30,12,'riddle','ことばの石碑');poi(15,23,'cache','古い石の箱',{id:'ruins-journal',text:'古い日記。「道に迷ったら、書かれたことばを読み直す。」'});poi(36,23,'riddle','つなぐ石碑',{second:true});}
 // 地区ごとに、読み物と収集物の寄り道を用意。
 const coords={town:[15,25],market:[5,18],homes:[40,26],hill:[39,8],forest:[14,7],farm:[9,23],river:[38,25],lake:[45,28],ruins:[12,10]};const [cx,cy]=coords[key];poi(cx,cy,'discover','小さな発見',{id:key+'-memory',text:a.name+'で、風景のしおりを見つけました。'});
 for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
  if(x===0||y===0||x===MAP_W-1||y===MAP_H-1){const opening=m.portals.some(p=>p.edge==='left'&&x===0&&Math.abs(y-16)<=1||p.edge==='right'&&x===47&&Math.abs(y-16)<=1||p.edge==='up'&&y===0&&Math.abs(x-24)<=1||p.edge==='down'&&y===31&&Math.abs(x-24)<=1);if(!opening)m.blocked.add(x+','+y)}
  const n=(x*73856093^y*19349663^key.length*83492791)>>>0;
  if(m.tiles[y][x]===0){const near=m.pois.some(p=>Math.abs(p.x-x)+Math.abs(p.y-y)<=2)||m.buildings.some(b=>x>=b.x-2&&x<=b.x+b.w+1&&y>=b.y-2&&y<=b.y+b.h+2);const roadNear=[[-1,0],[1,0],[0,-1],[0,1]].some(([dx,dy])=>m.tiles[y+dy]?.[x+dx]===1||m.tiles[y+dy]?.[x+dx]===2);if(!near&&!roadNear&&n%(key==='forest'?5:15)===0&&x>1&&y>1&&x<46&&y<30){m.trees.push({x,y,tile:[5,16,18][n%3]});m.blocked.add(x+','+y)}else if(n%41===0&&!near&&!roadNear){m.rocks.push({x,y});m.blocked.add(x+','+y)}}
 }
 if(key==='farm'){for(let x=12;x<=21;x++)if(x!==18){m.fences.push({x,y:8});m.fences.push({x,y:17})}for(let y=9;y<17;y++)if(y!==14){m.fences.push({x:12,y,vertical:true});m.fences.push({x:21,y,vertical:true})}}
 if(key==='homes')for(let x=7;x<=17;x++)if(x!==12)m.fences.push({x,y:19});
 for(const f of m.fences)m.blocked.add(f.x+','+f.y);
 if(key==='ruins')for(const x of [29,31])for(const y of [8,9])m.blocked.add(x+','+y);
 for(const b of m.buildings)for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)m.blocked.add(x+','+y);
 for(const p of m.pois){m.blocked.delete(p.x+','+p.y);for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]])m.blocked.delete((p.x+dx)+','+(p.y+dy))}
 if(key==='town')rect(19,13,12,10,2);
 for(const p of m.pois)if(p.type!=='discover')m.blocked.add(p.x+','+p.y);
 // 水面と橋を同じ地形データで判定する。
 return m;
}
for(const key in AREAS)maps[key]=buildArea(key);
function mapFloorFree(area,x,y){const m=maps[area];if(!m||x<0||y<0||x>=m.w||y>=m.h)return false;return !m.blocked.has(x+','+y)&&m.tiles[y][x]!==3}
