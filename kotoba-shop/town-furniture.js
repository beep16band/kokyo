// Home furnishing uses the existing inventory and the same safe-path validator.
(function(){
 const panel=document.getElementById('editorPanel');panel.querySelector('h2').textContent='おへやの もようがえ';panel.querySelector('p').textContent='① 家具をえらぶ → ② 場所をおす → ③ 保存する';
 const step=document.createElement('p');step.id='editStep';step.setAttribute('aria-live','polite');panel.querySelector('p').after(step);
 const grid=document.getElementById('editGrid'),scroll=document.createElement('div');scroll.id='editGridScroll';scroll.tabIndex=0;scroll.setAttribute('aria-label','お部屋の配置図。横にスクロールできます');grid.before(scroll);scroll.append(grid);
 const legend=document.createElement('p');legend.className='editLegend';legend.textContent='みどりの＋：置ける場所。図は指で左右に動かせます。置いた家具を押すと、移動・しまうができます。出口とベッドへの道はあけてね。';scroll.after(legend);
 document.getElementById('editDone').textContent='これで保存';document.getElementById('editCancel').textContent='やめる（保存しない）';
 openFurnitureEditor=function(){
  if(state.scene!=='home'){tell('家具は自分のおうちの中で置けます。');renderChoices([['おうちの場所に★をつける',()=>townPlaceMark('home')],['閉じる',closeChoices]]);return;}
  stopWorldInput();closeWorldMenu();renderChoices([]);editorOpen=true;editDraft=structuredClone(state.furniturePlaced);editOwned=[...state.furnitureOwned];editSelected=editOwned.length?{type:'owned',i:0}:null;editHistory=[];
  document.getElementById('editor').classList.add('open');document.getElementById('editStatus').textContent='';drawEditor();document.querySelector('#editTools button')?.focus();
 };
 drawEditor=function(){
  const tools=document.getElementById('editTools'),status=document.getElementById('editStatus'),selected=editSelected&&(editSelected.type==='owned'?editOwned[editSelected.i]:editDraft[editSelected.i]?.kind);tools.replaceChildren();grid.replaceChildren();
  step.textContent=selected?'② '+FURNITURE[selected].name+'：みどりの「＋」を押すと置けます。':'① 下の家具を選ぼう。置いた家具も選べます。';
  const help=document.createElement('strong');help.textContent='持っている家具（'+editOwned.length+'こ）';tools.append(help);
  editOwned.forEach((kind,i)=>{const b=document.createElement('button');b.textContent=FURNITURE[kind].name;b.dataset.owned=i;b.className=editSelected?.type==='owned'&&editSelected.i===i?'active':'';b.setAttribute('aria-pressed',String(b.className==='active'));b.onclick=()=>{editSelected={type:'owned',i};status.textContent='';drawEditor();};tools.append(b);});
  if(!editOwned.length){const n=document.createElement('span');n.textContent=editDraft.length?'全部お部屋に置いています。':'まだ家具がありません。家具屋で買うと、ここに出ます。';tools.append(n);}
  for(let y=2;y<=9;y++)for(let x=2;x<=17;x++){
   const b=document.createElement('button'),fi=editDraft.findIndex(f=>f.x===x&&f.y===y),bed=within(homeBed,x,y),fixed=bed||homeFurniture.some(r=>within(r,x,y)),person=x===state.x&&y===state.y,ignore=editSelected?.type==='placed'?editSelected.i:-1,valid=!!selected&&editValid(x,y,ignore),blocked=fixed||person||(x===10&&y>=8);
   b.dataset.x=x;b.dataset.y=y;b.className=fi>=0?'used':fixed?'fixed':blocked?'wall':valid?'available':'';if(editSelected?.type==='placed'&&editSelected.i===fi&&fi>=0)b.className+=' selected';
   b.textContent=fi>=0?({chair:'いす',plant:'植物',rug:'ラグ',lamp:'灯り',table:'机',bookshelf:'本棚',cushion:'座布',clock:'時計'}[editDraft[fi].kind]):bed?'ベッド':fixed?'棚':person?'自分':x===10&&y>=8?'出口':valid?'＋':'・';
   b.setAttribute('aria-label',(x+1)+'列'+(y+1)+'行 '+(fi>=0?FURNITURE[editDraft[fi].kind].name:bed?'ベッド':fixed?'固定の棚':person?'自分':blocked?'出口の通り道':valid?'ここに置く':'空きマス'));
   b.onclick=()=>{if(fi>=0){editSelected={type:'placed',i:fi};status.textContent='置き直す場所を押すか、「しまう」を押そう。';drawEditor();return;}if(!editSelected){status.textContent='先に上の家具を選ぼう。';return;}if(!editValid(x,y,editSelected.type==='placed'?editSelected.i:-1)){status.textContent='ここには置けません。みどりの「＋」を選ぼう。';return;}
    editSnapshot();if(editSelected.type==='owned'){const kind=editOwned.splice(editSelected.i,1)[0];editDraft.push({kind,x,y});}else{editDraft[editSelected.i].x=x;editDraft[editSelected.i].y=y;}editSelected=null;status.textContent='置けました！ ③「これで保存」を押すと、お部屋に反映されます。';drawEditor();};grid.append(b);
  }
  if(editSelected?.type==='placed'){const b=document.createElement('button');b.textContent='選んだ家具をしまう';b.onclick=()=>{editSnapshot();const f=editDraft.splice(editSelected.i,1)[0];editOwned.push(f.kind);editSelected=null;status.textContent='持ち物に戻しました。「これで保存」で決定しよう。';drawEditor();};tools.append(b);}
  document.getElementById('editUndo').disabled=!editHistory.length;
 };
 const closeBeforeRooms=closeFurnitureEditor;closeFurnitureEditor=function(commit){if(commit&&roomConnected(editDraft))X.rooms[X.room]=editDraft;return closeBeforeRooms(commit);};
})();
