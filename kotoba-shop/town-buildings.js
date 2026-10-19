// Distinct, original code-native facades; all walls stay inside the collision footprint.
const TownBuildingStyles={ownShop:{roof:'#6d9d84',sign:'#e4d5a0',icon:'shop'},kuan:{roof:'#bb6f61',sign:'#edd49f',icon:'basket'},cafe:{roof:'#b67d93',sign:'#f4d6d0',icon:'cup'},fishShop:{roof:'#5d9cac',sign:'#c0e0dd',icon:'fish'},hobby:{roof:'#778fb3',sign:'#d5d9ee',icon:'model'},bakery:{roof:'#c08c56',sign:'#f1d7a0',icon:'bread'},seeds:{roof:'#7d9b60',sign:'#dae7b5',icon:'leaf'},furniture:{roof:'#8c7c66',sign:'#dfd2bd',icon:'chair'},goods:{roof:'#8a8f93',sign:'#e1dbcb',icon:'shop'}};
function townSchool3D(b,parent){
 const g=new THREE.Group();g.position.set(b.x,0,b.y);g.userData={buildingType:'school',floors:3};parent.add(g);const w=b.w,h=b.h;
 const box=(col,x,y,z,a,c,d)=>town3DMesh(g,'box',col,x,y,z,a,c,d);
 box('#d3c6ac',w/2,.12,h/2,w,.24,h);box('#eee9d9',w/2,3.25,h/2,w-.12,6.3,h-.12);
 for(let floor=0;floor<3;floor++){
  const y=1.2+floor*2.1;box('#b6c6c0',w/2,y-1,h-.09,w-.12,.14,.09);
  for(const x of [.85,2.1,3.9,5.15].filter(x=>x<w-.3)){if(floor===0&&Math.abs(x-(b.door.x-b.x+.5))<.8)continue;box('#7eafbe',x,y,h-.07,.84,1.07,.035);box('#fff8e2',x,y,h-.035,.045,1.07,.035);box('#fff8e2',x,y,h-.035,.84,.045,.035);}
  for(const z of [1.1,2.6,4.1].filter(z=>z<h-.3))box('#7eafbe',w-.065,y,z,.035,1.02,.84);
 }
 box('#6e8f91',w/2,6.52,h/2,w+.14,.25,h+.14);box('#b5c7c4',w/2,6.75,h/2,w-.1,.2,h-.1);
 const dx=b.door.x-b.x+.5;box('#7b9996',dx,.98,h-.065,.88,1.9,.055);box('#c6e1df',dx,1.2,h-.025,.68,1.13,.025);box('#fff8e2',dx,1.2,h-.005,.04,1.13,.02);
 const clock=town3DMesh(g,'cylinder','#fff7d9',dx,5.95,h-.015,.37,.045,.37);clock.rotation.x=Math.PI/2;box('#556d70',dx,6.07,h+.015,.035,.23,.025);box('#556d70',dx+.1,5.95,h+.015,.2,.035,.025);
 Town3D.labels.push({text:b.name,x:b.x+w/2,y:7.3,z:b.y+h/2});
}
function townShopDetails3D(b,g){
 const p=TownBuildingStyles[b.type];if(!p)return;g.userData={buildingType:b.type,floors:1,shopIcon:p.icon};
 // Give each shop its own roof color without mutating shared materials.
 for(const m of g.children)if(m.isMesh&&m.position.y>2.9&&m.position.y<3.3)m.material=town3DMaterial(p.roof);
 const x=b.w/2,y=2.6,z=b.h-.03;town3DMesh(g,'box',p.sign,x,y,z,1.3,.6,.06);
 const box=(col,dx,dy,w,h)=>town3DMesh(g,'box',col,x+dx,y+dy,z+.045,w,h,.045);
 if(p.icon==='cup'){box('#fff8e2',0,0,.45,.32);const ring=new THREE.Mesh(new THREE.TorusGeometry(.12,.03,5,12),town3DMaterial('#fff8e2'));ring.position.set(x+.28,y,z+.07);g.add(ring);}
 else if(p.icon==='fish'){town3DMesh(g,'sphere','#5f94a4',x,y,z+.06,.3,.12,.06);const tail=town3DMesh(g,'cone','#5f94a4',x-.32,y,z+.06,.13,.22,.05);tail.rotation.z=Math.PI/2;}
 else if(p.icon==='model'){box('#6d88ac',0,-.02,.65,.22);box('#e7bf79',.05,.14,.32,.17);for(const dx of [-.2,.2])town3DMesh(g,'sphere','#6b6865',x+dx,y-.15,z+.07,.07,.07,.035);}
 else if(p.icon==='chair'){box('#997e65',0,-.06,.45,.07);box('#997e65',0,.14,.45,.28);for(const dx of [-.17,.17])box('#997e65',dx,-.18,.05,.25);}
 else if(p.icon==='bread')town3DMesh(g,'sphere','#c39155',x,y,z+.07,.36,.18,.07);
 else if(p.icon==='leaf'){const leaf=town3DMesh(g,'sphere','#829b60',x,y,z+.07,.24,.14,.05);leaf.rotation.z=.5;}
 else{box('#a78960',0,-.07,.6,.25);for(const dx of [-.2,0,.2])town3DMesh(g,'sphere',p.icon==='basket'?'#a1b77c':'#ddae83',x+dx,y+.12,z+.07,.1,.1,.06);}
}
const building2DBeforeUnique=drawWorldBuilding;drawWorldBuilding=function(b){
 if(b.type!=='school'){
  building2DBeforeUnique(b);const style=TownBuildingStyles[b.type];if(style){const x=(b.x+b.w/2)*T,y=(b.y+b.h)*T-54;cozyRound(ctx,x-31,y,62,17,5,style.sign);ctx.save();ctx.font='bold 10px KotobaSans,sans-serif';ctx.textAlign='center';ctx.fillStyle='#4f6658';ctx.fillText(({cup:'カフェ',fish:'魚屋',model:'模型',basket:'久庵',bread:'パン',leaf:'種',chair:'家具',shop:'お店'})[style.icon],x,y+12);ctx.restore();}return;
 }
 const x=b.x*T,y=(b.y+b.h)*T,w=b.w*T,top=y-177;
 cozyRound(ctx,x+2,top,w-4,177,3,'#ebe6d7');cozyRound(ctx,x-3,top-8,w+6,10,2,'#6e8f91');
 for(let floor=0;floor<3;floor++){const yy=top+17+floor*51;for(let col=0;col<5;col++){cozyRound(ctx,x+10+col*(w-20)/5,yy,(w-35)/5,31,1,'#84b0bb');cozyRound(ctx,x+21+col*(w-20)/5,yy,2,31,0,'#fff7df');}cozyRound(ctx,x+2,yy+37,w-4,5,0,'#b9c9c4');}
 const door=b.door.x*T;cozyRound(ctx,door+2,y-44,28,44,2,'#769993');cozyRound(ctx,door+7,y-38,18,23,1,'#c2dfdd');
 ctx.save();ctx.font='bold 12px KotobaSans,sans-serif';ctx.textAlign='center';ctx.fillStyle='#4f6658';ctx.fillText('山口中学校',x+w/2,top-15);ctx.restore();
};
Town3D.area='';Town3D.frameArea='';
