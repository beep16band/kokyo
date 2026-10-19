// Physical activities belong to their buildings. The journal only explains goals and places.
const TownPlaces={
 school:{name:'山口中学校',room:'school'},kuan:{name:'よろづ処久庵',room:'kuan'},cafe:{name:'こもれびカフェ',room:'cafe'},
 hobby:{name:'ホビープラモデル屋',room:'hobby'},fishShop:{name:'せせらぎ魚屋',room:'fishShop'},
 clay:{name:'クレー射撃場',room:'clay'},home:{name:'自分の家',building:'ownHome'},
 shop:{name:'自分のお店',building:'ownShop'},farm:{name:'みのり農園',area:'farm',x:12,y:18},
 farmOffice:{name:'農園の道具小屋',building:'farmOffice'},seeds:{name:'種のおみせ',building:'seeds'},
 furniture:{name:'家具屋',building:'furniture'},goods:{name:'雑貨と道具',building:'goods'}
};
function townPlaceDestination(key){
 const p=TownPlaces[key];if(!p)return null;
 if(p.room){const f=TOWN_DATA.facilities.find(f=>f.id===p.room),b=maps[f.area].buildings.find(b=>b.type===p.room);return {area:f.area,x:b?.door.x??f.x+Math.floor(f.w/2),y:(b?.door.y??f.y+f.h-1)+1,name:p.name};}
 if(p.building)for(const[area,m]of Object.entries(maps)){const b=m.buildings.find(b=>b.type===p.building);if(b)return {area,x:b.door.x,y:b.door.y+1,name:p.name};}
 return {area:p.area,x:p.x,y:p.y,name:p.name};
}
function townPlaceMark(key){const d=townPlaceDestination(key);if(!d)return;closeWorldMenu();setMiniMapGoal(d.area,d.x,d.y,d.name);tell(d.name+'の場所に★をつけました。'+AREAS[d.area].name+'へ道を歩き、★の場所を調べよう。建物は入口へ進もう。');}
function townPlaceGuide(key){const d=townPlaceDestination(key);if(!d)return false;closeWorldMenu();tell('ここではできません。'+d.name+'（'+AREAS[d.area].name+'）でできます。場所を確かめて、歩いて行こう。');renderChoices([['地図に★をつける',()=>townPlaceMark(key)],['閉じる',closeChoices]]);return false;}
function townNearBuilding(types){if(state.scene!=='town')return false;return maps[state.area].buildings.some(b=>types.includes(b.type)&&Math.abs(state.x-b.door.x)+Math.abs(state.y-b.door.y)<=1);}
function townInRoom(id){return state.scene==='facility'&&state.facilityVisit?.id===id;}
function townPlaceRequire(test,key){return test||townPlaceGuide(key);}
townLifeMenu=function(){stopWorldInput();tell('【物語・まちの案内】\n今の目標や、行きたい場所を確かめよう。買い物や料理、模型、射撃は、それぞれの建物でできます。');renderChoices([['今の物語・目標',townQuestMenu],['建物の場所',facilityGuide],['町の人の場所',residentGuideMenu],['閉じる',closeChoices]]);};
facilityGuide=function(){tell('【建物の場所】\n行きたい場所を選ぶと、地図に★がつきます。道を歩いて入口へ行こう。');renderChoices([...['shop','home','school','kuan','cafe','hobby','fishShop','clay','farm','farmOffice','seeds','furniture'].map(key=>{const d=townPlaceDestination(key);return [d.name+'：'+AREAS[d.area].name,()=>townPlaceMark(key)];}),['戻る',townLifeMenu],['閉じる',closeChoices]]);};
townVisitNPC=function(name){const r=TOWN_DATA.residents.find(r=>r.name===name);if(!r)return;const area=worldNpcConfig[name].area,p=worldNpcState[name];closeWorldMenu();setMiniMapGoal(area,p.x,p.y,name);tell(name+'の場所に★をつけました。'+AREAS[area].name+'で、となりまで歩いて話しかけよう。');};
residentGuideMenu=function(){tell('【町の人のいる場所】\n会いたい人の場所に★をつけます。となりで相手を向き、決定で話そう。');renderChoices([...TOWN_DATA.residents.map(r=>[r.name+'：'+AREAS[worldNpcConfig[r.name].area].name,()=>townVisitNPC(r.name)]),['戻る',townLifeMenu],['閉じる',closeChoices]]);};
// Check both UI entry and the transaction, including callbacks opened before moving away.
const kuanMenuBeforePlaces=kuanMenu;kuanMenu=function(){if(!townPlaceRequire(townInRoom('kuan'),'kuan'))return;return kuanMenuBeforePlaces();};
const buyBeforePlaces=townBuy;townBuy=function(...args){if(!townPlaceRequire(townInRoom('kuan'),'kuan'))return false;return buyBeforePlaces(...args);};
const cookingBeforePlaces=cookingMenu;cookingMenu=function(){if(!townPlaceRequire(townInRoom('cafe'),'cafe'))return;return cookingBeforePlaces();};
const cookBeforePlaces=townCook;townCook=function(...args){if(!townPlaceRequire(townInRoom('cafe'),'cafe'))return false;return cookBeforePlaces(...args);};
const clayMenuBeforePlaces=clayMenu;clayMenu=function(){if(!townPlaceRequire(townInRoom('clay'),'clay'))return;return clayMenuBeforePlaces();};
const startClayBeforePlaces=startClay;startClay=function(...args){if(!townPlaceRequire(townInRoom('clay'),'clay'))return;return startClayBeforePlaces(...args);};
const sellMenuBeforePlaces=townSellMenu;townSellMenu=function(){if(!townPlaceRequire(townInRoom('fishShop'),'fishShop'))return;return sellMenuBeforePlaces();};
const sellBeforePlaces=townDirectSell;townDirectSell=function(...args){if(!townPlaceRequire(townInRoom('fishShop'),'fishShop'))return false;return sellBeforePlaces(...args);};
const modelBeforePlaces=modelMenu;modelMenu=function(){
 if(state.scene==='home'){
  tell('【家の模型展示】\n'+(X.model.parts.length===3?'完成した模型を家に飾れます。':'模型はホビープラモデル屋の作業台で作ろう。'));
  renderChoices([...(X.model.parts.length===3?[['完成模型を家に飾る',()=>{if(!townPlaceRequire(state.scene==='home','home'))return;if(!X.model.displayed){X.model.displayed=true;townMetric('displayModel');}townMessage('模型を家に飾りました。',homeLifeMenu);}]]:[]),['模型屋の場所',()=>townPlaceMark('hobby')],['戻る',homeLifeMenu]]);return;
 }
 if(!townPlaceRequire(townInRoom('hobby'),'hobby'))return;return modelBeforePlaces();
};
const partBeforePlaces=townModelPart;townModelPart=function(...args){if(!townPlaceRequire(townInRoom('hobby'),'hobby'))return false;return partBeforePlaces(...args);};
const homeBeforePlaces=homeLifeMenu;homeLifeMenu=function(){if(!townPlaceRequire(state.scene==='home','home'))return;return homeBeforePlaces();};
const homeUpgradeBeforePlaces=townHomeUpgrade;townHomeUpgrade=function(){if(!townPlaceRequire(state.scene==='home','home'))return false;return homeUpgradeBeforePlaces();};
const farmBeforePlaces=farmView;farmView=function(){if(!townPlaceRequire(state.scene==='town'&&state.area==='farm','farm'))return;return farmBeforePlaces();};
const farmExpandBeforePlaces=townFarmExpand;townFarmExpand=function(){if(!townPlaceRequire(townNearBuilding(['farmOffice']),'farmOffice'))return false;return farmExpandBeforePlaces();};
const farmBuyBeforePlaces=farmBuy;farmBuy=function(){if(!townPlaceRequire(townNearBuilding(['seeds','farmOffice'])||townInRoom('kuan'),'seeds'))return;return farmBuyBeforePlaces();};
const farmSellBeforePlaces=farmSell;farmSell=function(){if(!townPlaceRequire(townInRoom('fishShop'),'fishShop'))return;return farmSellBeforePlaces();};
const farmPlotBeforePlaces=farmPlot;farmPlot=function(i){if(!townPlaceRequire(state.scene==='town'&&state.area==='farm','farm'))return;const p=FARM_PLOTS[i];if(!p||Math.abs(state.x-p.x)+Math.abs(state.y-p.y)!==1){farmPlots();return;}return farmPlotBeforePlaces(i);};
farmPlots=function(){tell('畑のとなりまで歩いて、畑のほうを向いて決定しよう。種まき・水やり・収穫ができます。');renderChoices([['畑の場所に★をつける',()=>townPlaceMark('farm')],['閉じる',closeChoices]]);};
const furnitureBeforePlaces=furnitureMenu;furnitureMenu=function(){
 if(state.scene==='home'){
  tell('【家の家具】\n持っている家具を置いたり、しまったりできます。新しい家具は家具屋で買おう。');
  renderChoices([['部屋の模様替え',openFurnitureEditor],['壁紙を選ぶ',()=>openDecorMenu('wall')],['床を選ぶ',()=>openDecorMenu('floor')],['家具屋の場所',()=>townPlaceMark('furniture')],['戻る',homeLifeMenu]]);return;
 }
 if(!townPlaceRequire(townNearBuilding(['furniture','goods'])||townInRoom('kuan'),'furniture'))return;return furnitureBeforePlaces();
};
const upgradeBeforePlaces=upgradeMenu;upgradeMenu=function(){if(!townPlaceRequire(state.scene==='shop'||townNearBuilding(['goods']),'shop'))return;return upgradeBeforePlaces();};
