// Read-only guidance for the island's two goals. Existing saves and economy stay intact.
function islandNextGoal(){
 const donations=islandDonationCount();
 if(IS.festival)return {title:'フェスティバルのあとも島で暮らそう',text:'島の発展と博物館の展示を続けよう。',place:'museum'};
 if(!IS.projects.pier){const p=ISLAND_DATA.projects.pier;return {title:'観光船の桟橋を作ろう',text:'島の案内所で '+p.cost+'G・木材'+p.wood+'個。現在 '+state.coins+'G・木材'+townCount('wood')+'個。\n資金が足りなければ案内所の仕事（1日1回・400Gと木材2個）。木は久庵でオノを買って集められます。',place:'islandOffice'};}
 if(IS.visitors.total<5)return {title:'紹介を発信し、テントか家で休もう',text:'案内所で島の紹介を発信すると、翌朝の観光客が増えます。観光客5人でレシピの相談が解放。現在のべ'+IS.visitors.total+'人。',place:'islandOffice'};
 if(!IS.housing.tier)return {title:'テントから、自分の家へ',text:'家は'+ISLAND_DATA.prices.house+'G。案内所で建築を相談しよう。島の仕事・お店・採集品の販売で資金をためられます。',place:'islandOffice'};
 if(!IS.housing.kitchen)return {title:'家にキッチンを付けよう',text:'キッチンは'+ISLAND_DATA.prices.kitchen+'G。カフェのはるかにレシピを教わり、自分の家で料理します。',place:'islandOffice'};
 if(!IS.exhibit)return {title:'博物館で自分の企画展示を作ろう',text:'5種類を寄贈すると企画展示を作れます。現在'+donations+'種類。虫・魚・海の幸・化石・美術品を学芸員しおりへ。',place:'museum'};
 if(!islandFestivalReady())return {title:'島フェスティバルの準備を進めよう',text:'発展60・観光客のべ30人・寄贈10種類（化石と美術品を含む）・舞台・自分の企画展示が開催条件です。',place:'islandOffice'};
 return {title:ISLAND_DATA.festival+'を開催しよう',text:'条件がそろいました！ 案内所で受付をしよう。博物館には自分の展示も並びます。',place:'islandOffice'};
}
function islandRoadmap(){
 const goal=islandNextGoal(),p=ISLAND_DATA.projects;
 tell('【島づくりの道順】\n目標① 島の発展　目標② 観光客を増やすこと。\n発展 '+islandScore()+'/100 ／今日の観光客 '+IS.visitors.today+'人 ／のべ '+IS.visitors.total+'人\n\n次の目標：'+goal.title+'\n'+goal.text+'\n\n完成した施設 '+Object.keys(p).filter(k=>IS.projects[k]).length+'/'+Object.keys(p).length+' ／博物館 '+islandDonationCount()+'種類\n最終目標：'+ISLAND_DATA.festival+'と、自分の博物館展示。');
 renderChoices([['次の目標の場所に★',()=>townPlaceMark(goal.place)],['8つの暮らし・解放状況',islandLifeChecklist],['フェスティバルの条件',islandFestivalMenu],['閉じる',closeChoices]]);
}
function islandLifeChecklist(){
 const until=(6-(state.day-1)%7+7)%7,owned=IS.wardrobe.owned.includes('wetsuit'),suit=owned?(islandHasSuit()?'着用中':'購入済み・着替えて海へ'):(islandScore()<15?'発展15で入荷':'服屋に入荷中');
 const count=t=>Object.entries(CREATURES).filter(([k,v])=>v.type===t&&state.creatureCatalog[k]).length;
 tell('【8つの島の暮らし】\n① '+islandWeekday()+'曜日 '+islandClock()+'／赤カブ市：'+(until?'日曜まであと'+until+'日':'今日は購入できる日')+'（広場・1個'+ISLAND_DATA.prices.redTurnip+'G）\n② 海の探索：'+suit+'／スーツ'+ISLAND_DATA.prices.suit+'G。着て海へ入り、水面の影で潜る。\n③ 図鑑：虫'+count('bug')+'・魚'+count('fish')+'・海の幸'+count('sea')+'種類を発見。虫の売却は森のむぎへ。\n④ 島民は動物の姿。先生たちの特徴もそのまま。\n⑤ 今の服：'+ISLAND_DATA.outfits[IS.wardrobe.equipped].name+'／服屋で購入、テント・家でも着替え。\n⑥ 住まい：'+(IS.housing.tier?'家・'+IS.housing.tier+'部屋':'テント')+'。最初の家'+ISLAND_DATA.prices.house+'G。改装・増築は案内所で相談。\n⑦ 果実・野菜・魚を食べられる。料理：'+(IS.housing.kitchen?'キッチンあり':'家にキッチンを付けてから')+'／レシピ'+IS.recipes.length+'種。観光客5人でカフェのレシピ相談。\n⑧ 博物館：'+islandDonationCount()+'種類を寄贈。虫・魚・海の幸・鑑定済み化石・美術品をしおりへ。');
 renderChoices([['日曜の赤カブ市に★',()=>{closeWorldMenu();setMiniMapGoal('town',28,24,'日曜の赤カブ市');tell('広場の赤カブ市に★をつけました。日曜日に店の隣で決定しよう。');renderChoices([]);}],['服屋に★',()=>townPlaceMark('clothes')],['虫の専門家に★',()=>townPlaceMark('bugExpert')],['博物館に★',()=>townPlaceMark('museum')],['久庵・オノの店に★',()=>townPlaceMark('kuan')],['テント・家に★',()=>townPlaceMark('home')],['虫・魚・海の幸の図鑑',()=>islandCatalog('bug')],['食べものを食べる',islandFoodMenu],['島づくりの道順へ',islandRoadmap],['閉じる',closeChoices]]);
}
function islandDevelopmentDetails(){
 const projects=Object.entries(ISLAND_DATA.projects).map(([key,p])=>({key,...p,done:!!IS.projects[key]}));
 const facilities=projects.reduce((n,p)=>n+(p.done?p.score:0),0),home=IS.housing.tier*5,kitchen=IS.housing.kitchen?5:0,museum=Math.min(30,islandDonationCount()*3),exhibit=IS.exhibit?7:0;
 return {projects,facilities,home,kitchen,museum,exhibit,raw:facilities+home+kitchen+museum+exhibit};
}
function islandDevelopmentMenu(back=islandJournal){
 stopWorldInput();
 const d=islandDevelopmentDetails(),score=islandScore();
 tell('【発展度の内訳】\n今の発展度 '+score+'/100\n\n施設の整備：'+d.facilities+'点\n'+d.projects.map(p=>(p.done?'完成':'まだ')+'：'+p.name+' '+(p.done?p.score:0)+'点（完成で'+p.score+'点）').join('\n')+'\n\n家と増築：'+d.home+'点（家・1部屋につき5点）\nキッチン：'+d.kitchen+'点（設置で5点）\n博物館への寄贈：'+d.museum+'点（1種類3点・最大30点）\n自分の企画展示：'+d.exhibit+'点（作成で7点）\n'+(d.raw>100?'合計'+d.raw+'点。表示の上限は100点です。\n':'')+'\n次に整えられるものを見てみよう。');
 renderChoices([['次に整えるもの',()=>islandDevelopmentCandidates(back)],['戻る',back],['閉じる',closeChoices]]);
}
function islandDevelopmentCandidates(back=islandJournal){
 const d=islandDevelopmentDetails(),pending=d.projects.filter(p=>!p.done);
 const lines=pending.map(p=>p.name+'：+'+p.score+'点\n必要 '+p.cost+'G・木材'+p.wood+'個'+(p.carrot?'・にんじん'+p.carrot+'個':'')+'／'+(state.coins>=p.cost&&townCount('wood')>=p.wood&&(!p.carrot||townCount('carrot')>=p.carrot)?'材料とお金がそろっています':'お金・材料を集めよう'));
 if(IS.housing.tier<4)lines.push((IS.housing.tier?'家の増築':'最初の家')+'：+5点。案内所で費用を確認しよう。');
 if(!IS.housing.kitchen)lines.push('キッチン：+5点。'+ISLAND_DATA.prices.kitchen+'G。'+(IS.housing.tier?'案内所で相談しよう。':'まず家を建てよう。'));
 if(d.museum<30)lines.push('まだ寄贈していない種類：1種類につき+3点（あと'+(10-islandDonationCount())+'種類で30点）。博物館へ持っていこう。');
 if(!IS.exhibit)lines.push('自分の企画展示：+7点。'+(islandDonationCount()>=5?'博物館で作れます。':'まず5種類を寄贈しよう。'));
 tell('【次に整えるもの】\n'+(islandScore()>=100?'発展度は100に達しました。これからも好きな整備や展示を楽しもう。\n\n':'')+(lines.length?lines.join('\n\n'):'すべての整備が完成しました！')+'\n\n場所に★をつけて向かおう。整備の受付は現地で行います。');
 renderChoices([['案内所に★',()=>townPlaceMark('islandOffice')],['博物館に★',()=>townPlaceMark('museum')],['内訳へ戻る',()=>islandDevelopmentMenu(back)],['閉じる',closeChoices]]);
}
const officeBeforeDevelopmentGuide=islandOfficeMenu;
islandOfficeMenu=function(){officeBeforeDevelopmentGuide();if(!islandPlace('islandOffice'))return;const b=document.createElement('button');b.textContent='発展度の内訳・次の整備';b.onclick=()=>islandDevelopmentMenu(islandOfficeMenu);choices.prepend(b);};
const journalBeforeIslandGuide=islandJournal;
islandJournal=function(){journalBeforeIslandGuide();for(const [label,fn]of [['8つの暮らし・解放状況',islandLifeChecklist],['島づくりの道順',islandRoadmap],['発展度の内訳・次の整備',()=>islandDevelopmentMenu(islandJournal)]]){const b=document.createElement('button');b.textContent=label;b.onclick=fn;choices.prepend(b);}};
townLifeMenu=islandJournal;townQuestMenu=islandJournal;
