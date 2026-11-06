/* Food and travel state. Existing version-1 save envelopes are retained. */
const FoodLife = (function makeFoodLife(){
  const region={hiraizumi:'平泉・一関',coast:'松島・宮城沿岸',obanazawa:'尾花沢',dewa:'出羽三山',hokuriku:'北陸'};
  const all=Object.keys(region);
  // Recovery, price and storage are game settings, in points, mon, grams and hours.
  const table=[
    ['onigiri','握り飯',25,0,1,6,120,9,all,'携帯食','米を握った携帯食。暑い日は早めに。'],
    ['hoshii','干飯',15,0,0,5,55,168,all,'乾燥','炊いた米を乾かした携帯食。日持ちする。'],
    ['roast-miso','焼き味噌',10,0,1,4,28,72,['hiraizumi','dewa','hokuriku'],'焼く','味噌を火で焼いて香ばしくしたもの。'],
    ['ume','梅干し',5,0,2,3,15,240,all,'塩漬け','塩気と酸味の強い梅。少量で持ち運べる。'],
    ['persimmon','干し柿',10,0,12,8,40,144,all,'乾燥','秋に干しておいた柿。初夏には貯蔵品として扱う。'],
    ['sobagaki','そばがき',35,3,4,12,185,12,['obanazawa','dewa'],'湯で練る','そば粉を熱湯で練る。尾花沢での提供は地域を意識した創作。'],
    ['dengaku','豆腐田楽',30,14,3,16,150,8,['hiraizumi','dewa'],'火で焼く','豆腐に味噌を塗り、火で焼く。'],
    ['millet','雑穀飯',30,0,1,7,150,10,['hiraizumi','dewa'],'炊く','粟や稗などを米に混ぜた主食。'],
    ['barley','麦飯',30,0,1,8,145,10,['hiraizumi','obanazawa','hokuriku'],'炊く','麦を混ぜて炊いた飯。'],
    ['wild-soup','山菜汁',20,12,3,10,230,6,['hiraizumi','dewa'],'火で煮る','山菜を味噌仕立ての汁にした一椀。'],
    ['pickles','漬物',10,0,2,5,45,58,['hiraizumi','obanazawa','dewa'],'塩漬け','野菜の塩漬け。主食のお供に。'],
    ['grilled-fish','焼き魚',35,10,4,17,150,7,['hiraizumi','coast','hokuriku'],'火で焼く','内陸の平泉編では川魚を使う。'],
    ['dried-fish','干物',20,2,2,10,70,96,['coast','hokuriku'],'干して焼く','魚を干して保存する。ゲーム内では焼いてある。'],
    ['salt-fish','塩魚',25,4,2,13,105,120,['coast','hokuriku'],'塩蔵して焼く','塩で保存した魚。ゲーム内では火を通してある。'],
    ['clam-soup','貝の汁物',25,10,3,16,230,5,['coast'],'煮る','沿岸でとれる貝の汁物。特定の名産や旬は断定しない。'],
    ['firm-tofu','堅豆腐',25,5,2,14,140,18,['hokuriku'],'圧搾する','水分をよく抜いた豆腐。後世に伝わる郷土食を参考にした候補。'],
    ['daikon','大根の煮物',20,8,3,9,145,10,['hiraizumi','hokuriku'],'煮る','大根をやわらかく煮含めた鉢。'],
    ['porridge','粥',20,14,3,8,220,7,all,'火で煮る','米を水で煮た粥。少ない米でも一椀になる。'],
    ['shojin','精進料理',45,16,12,30,350,6,['dewa'],'宿坊で提供','山菜や豆などを組み合わせた膳。献立は創作。'],
    ['inn-tray','旅籠の膳',60,30,22,40,520,6,['hiraizumi','hokuriku'],'旅籠で提供','飯、汁、焼き物をそろえた、このゲームの旅籠の献立。']
  ];
  const food=Object.fromEntries(table.map(([id,name,hunger,health,spirit,price,weight,hours,where,prep,desc],index)=>
    [id,{name,hunger,health,spirit,price,weight,hours,where,prep,desc,index}]));
  const raw={rice:['米',4,65,200,1],water:['水',1,200,30,14],greens:['山菜',4,50,12,9],miso:['味噌',3,24,180,2],
    tofu:['豆腐',5,90,8,15],fish:['川魚',8,110,6,13],wood:['薪',3,140,Infinity,-1]};
  const items={...food};
  for(const [id,[name,price,weight,hours,index]] of Object.entries(raw)){
    items[id]={name,price,weight,hours,index,ingredient:true,prep:id==='wood'?'燃料':'調理材料',
      desc:id==='wood'?'火を使う料理に一束必要。':'沢辺の炊事場で料理に使う。'};
  }
  const recipes={
    porridge:[25,'rice','water','wood'],'wild-soup':[28,'greens','water','miso','wood'],
    dengaku:[22,'tofu','miso','wood'],'grilled-fish':[20,'fish','wood'],'roast-miso':[14,'miso','wood']
  };
  const venues={
    teahouse:{name:'木陰の茶屋',x:274,y:1076,shop:['onigiri','hoshii','roast-miso','ume','persimmon','pickles',...Object.keys(raw)],menu:['millet','barley','porridge','wild-soup']},
    hearth:{name:'沢辺の炊事場',x:760,y:774,fire:true},
    inn:{name:'峠の旅籠',x:1570,y:310,shop:['hoshii','onigiri','ume','pickles','wood'],menu:['dengaku','grilled-fish','daikon','inn-tray'],lodging:24}
  };
  const cap=n=>Math.max(0,Math.min(100,n));
  const isNumber=(n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
  const ratio=l=>l.age/(items[l.id].hours*60);
  const quality=l=>ratio(l)>=1?'腐敗':ratio(l)>=.8?'傷みかけ':'新鮮';
  const add=(b,id,qty)=>{
    const lot=b.lots.find(l=>l.id===id&&l.age===0&&!l.wrapped&&l.qty+qty<=99);
    if(lot)lot.qty+=qty;
    else b.lots.push({id,qty,key:b.next++,age:0,wrapped:false,warned:false});
  };
  function hydrate(s){
    if(s.provisions)return s.provisions;
    const b=s.provisions={v:1,next:1,lots:[],agedAt:s.minute,sora:85,spirit:75,bond:0,illUntil:0,lastTalk:-3000,seen:{}};
    const qty=Math.max(0,Math.min(99,Math.floor(s.rice||0)));
    if(qty)add(b,'onigiri',qty);
    s.rice=0;
    return b;
  }
  function valid(s){
    if(!s?.provisions)return true;
    const b=s.provisions;
    return b.v===1&&isNumber(b.agedAt,0,s.minute)&&isNumber(b.sora,0,100)&&isNumber(b.spirit,0,100)&&isNumber(b.bond,-5,5)&&
      isNumber(b.illUntil,0,s.minute+1440)&&isNumber(b.lastTalk,-3000,s.minute)&&b.seen&&typeof b.seen==='object'&&!Array.isArray(b.seen)&&
      Object.entries(b.seen).every(([id,t])=>/^(?:[0-9]|1[0-4])$/.test(id)&&isNumber(t,0,s.minute))&&
      Number.isSafeInteger(b.next)&&b.next>0&&b.next<1e9&&Array.isArray(b.lots)&&b.lots.length<=100&&
      new Set(b.lots.map(l=>l?.key)).size===b.lots.length&&b.lots.every(l=>l&&Object.hasOwn(items,l.id)&&
      Number.isSafeInteger(l.key)&&isNumber(l.key,1,b.next-1)&&Number.isInteger(l.qty)&&isNumber(l.qty,1,99)&&isNumber(l.age,0,1e9)&&
      typeof l.wrapped==='boolean'&&typeof l.warned==='boolean');
  }
  function temperature(s,t=s.minute){
    const h=t/60%24;
    return (h<6||h>=19?18:h<10?22:27)+(s.weather==='雨'?-2:s.weather==='曇り'?-1:0);
  }
  function tick(s,notify=()=>{}){
    const b=hydrate(s),dt=s.minute-b.agedAt;
    if(dt<=0)return;
    const warmth=1+(temperature(s,(s.minute+b.agedAt)/2)-20)*.045;
    const humidity=s.weather==='雨'?1.28:s.weather==='曇り'?1.08:1;
    const warning=new Set();
    for(const l of b.lots){
      if(!Number.isFinite(items[l.id].hours))continue;
      l.age=Math.min(1e9,l.age+dt*warmth*humidity*(l.wrapped?.65:1));
      if(!l.warned&&ratio(l)>=.65){
        l.warned=true;
        warning.add(items[l.id].name);
      }
    }
    b.agedAt=s.minute;
    if(warning.size)notify([...warning].join('・')+'の保存状態を確認しましょう');
  }
  function advance(s,minutes,notify){
    const b=hydrate(s);
    s.minute+=minutes;
    b.sora=cap(b.sora-minutes*.032);
    tick(s,notify);
  }
  function remove(b,l,qty){
    l.qty-=qty;
    if(!l.qty)b.lots.splice(b.lots.indexOf(l),1);
  }
  function buy(s,venue,id,n,notify){
    const b=hydrate(s);
    if(!venues[venue]?.shop?.includes(id)||![1,2].includes(n))return {error:'この品はここでは買えません。'};
    if(b.lots.length>=100)return {error:'荷物がいっぱいです。'};
    const it=items[id],cost=it.price*n;
    if(s.coins<cost)return {error:'所持金が足りません。'};
    s.coins-=cost;
    advance(s,2,notify);
    add(b,id,n);
    return {message:it.name+' ×'+n+'を荷物に入れました。'};
  }
  function cook(s,id,atFire,notify){
    const b=hydrate(s);
    if(!atFire||!Object.hasOwn(recipes,id))return {error:'沢辺の炊事場で火を使えます。'};
    if(b.lots.length>=100)return {error:'荷物がいっぱいです。'};
    const [time,...ingredients]=recipes[id];
    const lots=ingredients.map(id=>b.lots.filter(l=>l.id===id&&quality(l)==='新鮮').sort((a,b)=>b.age-a.age)[0]);
    if(lots.some(l=>!l))return {error:'新鮮な材料か薪が足りません。'};
    for(const l of lots)remove(b,l,1);
    advance(s,time,notify);
    add(b,id,1);
    return {message:food[id].name+'ができました。'+time+'分経過。',cooked:id};
  }
  const B='芭蕉',S='曾良';
  const chats=[
    [c=>c.condition==='腐敗',[[S,'先生、それはもう食べない方が……。'],[B,'食べ物を粗末にしてはならぬ。'],[S,'命まで粗末にしないでください。']]],
    [c=>c.price>=30&&c.s.coins<50,[[B,'旅の疲れには、うまい飯が一番だな。'],[S,'これで明日の草鞋代がなくなりました。'],[B,'歩くことこそ旅の本質。'],[S,'裸足で歩くことは本質ではありません。']]],
    [c=>c.id==='hoshii',[[B,'旅とは、己の欲を捨てることなのだ。'],[S,'昨日から三度も団子を欲しがるのは何なのでしょう。'],[B,'……別腹というものだ。'],[S,'便利な悟りですね。']]],
    [c=>c.id==='ume',[[B,'すっぱい。句まで縮む。'],[S,'ちょうど十七音になりますね。']]],
    [c=>c.id==='persimmon',[[B,'去年の秋を口に入れたようだ。'],[S,'その秋を、もう半分ください。']]],
    [c=>c.id==='porridge',[[S,'あわてると口をやけどしますよ。'],[B,'旅は急がぬ。粥も急がぬ。'],[S,'二椀目はずいぶん急いでいらっしゃいます。']]],
    [c=>c.id==='dengaku',[[B,'串を立てた姿、踊り子のようではないか。'],[S,'先生の田楽は、もう串だけ踊っていますね。']]],
    [c=>c.id==='wild-soup',[[S,'山の香りが汁に移りました。'],[B,'では、山をもう一杯。'],[S,'おかわりは一椀までです。']]],
    [c=>c.id==='grilled-fish',[[B,'魚にも旅の疲れがあったろうな。'],[S,'先生の箸から逃げる旅は短かったですね。']]],
    [c=>c.s.weather==='雨',[[B,'雨音で、飯をかむ音が聞こえぬ。'],[S,'それでもおかわりの声だけは、よく聞こえます。']]],
    [c=>c.hunger<30,[[S,'先ほどから、句よりお腹がよく鳴ります。'],[B,'あれも五・七・五に聞こえぬか。'],[S,'空腹に切れ字はありません。']]],
    [c=>c.n===2,[[B,'分け合うと、少しの飯もうまくなる。'],[S,'はい。ですから次からは、先生が小さい方で。']]],
    [c=>c.bond<0,[[S,'先生、私の分は包みにありますか。'],[B,'あるとも。梅干しが一つ。'],[S,'せめて種の外側も残しておいてください。']]],
    [c=>c.id==='millet'||c.id==='barley',[[B,'粒ごとに歯ごたえが違うな。'],[S,'はい。先生、かむ間だけは静かで助かります。']]],
    [c=>c.bond>=0,[[B,'食後の一服も、旅のうち。'],[S,'先ほどの休憩も、旅のうちでした。'],[B,'歩くのはいつであったかな。']]]
  ];
  function talk(s,c,rng){
    const b=hydrate(s);
    if(s.minute-b.lastTalk<25)return null;
    const eligible=chats.map(([when,lines],id)=>({when,lines,id}))
      .filter(x=>x.when(c)&&s.minute-(b.seen[x.id]??-3000)>=2880);
    if(!eligible.length||rng()>=.64)return null;
    const pick=eligible[Math.min(eligible.length-1,Math.floor(rng()*eligible.length))];
    b.lastTalk=b.seen[pick.id]=s.minute;
    return pick.lines;
  }
  function meal(s,id,n,condition,price,notify,rng){
    const b=hydrate(s),it=food[id],hunger=s.hunger,hp=s.energy,spirit=b.spirit,sora=b.sora;
    const factor=condition==='腐敗'?0:condition==='傷みかけ'?.5:1;
    const sick=condition==='腐敗'&&rng()<.65;
    s.hunger=cap(hunger+it.hunger*factor);
    s.energy=cap(hp+(sick?-14:it.health*factor));
    b.spirit=cap(spirit+(sick?-12:it.spirit*factor));
    if(n===2)b.sora=cap(sora+it.hunger*factor);
    if(sick)b.illUntil=Math.max(b.illUntil,s.minute+90);
    b.bond=Math.max(-5,Math.min(5,b.bond+(n===2?1:b.sora<45?-1:0)));
    advance(s,5,notify);
    const delta=[['満腹',s.hunger-hunger],['体力',s.energy-hp],['気力',b.spirit-spirit],['曾良の満腹',n===2?Math.max(0,b.sora-sora):0]]
      .map(([k,v])=>[k,Math.round(v*10)/10]).filter(([,v])=>v).map(([k,v])=>k+' '+(v>0?'+':'')+v);
    return {message:it.name+'を'+(n===2?'分け合った':'食べた')+'。 '+delta.join(' / ')+(sick?'　体調を崩した。':''),
      ate:id,count:n,sick,lines:talk(s,{s,id,n,condition,price,hunger,bond:b.bond},rng)};
  }
  function eat(s,key,n,confirmed,notify,rng=Math.random){
    tick(s,notify);
    const b=hydrate(s),lot=b.lots.find(l=>l.key===key);
    if(!lot||lot.qty<n||![1,2].includes(n)||!Object.hasOwn(food,lot.id))return {error:'食べられる品が足りません。'};
    const condition=quality(lot);
    if(condition==='腐敗'&&!confirmed)return {error:'腐敗しています。体調を崩すおそれがあります。'};
    remove(b,lot,n);
    return meal(s,lot.id,n,condition,0,notify,rng);
  }
  function order(s,venue,id,n,stay,notify,rng=Math.random){
    const place=venues[venue];
    if(!place?.menu?.includes(id)||![1,2].includes(n)||(stay&&!place.lodging))return {error:'この献立は注文できません。'};
    const cost=(food[id].price+(stay?place.lodging:0))*n;
    if(s.coins<cost)return {error:'所持金が足りません。'};
    s.coins-=cost;
    const result=meal(s,id,n,'新鮮',cost,notify,rng);
    if(stay){
      const morning=(Math.floor(s.minute/1440)+1)*1440+360;
      advance(s,morning-s.minute,notify);
      s.energy=100;
      s.hunger=cap(s.hunger-12);
      s.provisions.spirit=cap(s.provisions.spirit+24);
      result.message+='　翌朝6時。体力が全快しました。';
    }
    return result;
  }
  function manage(s,key,op){
    const b=hydrate(s),l=b.lots.find(l=>l.key===key);
    if(!l)return {error:'荷物にありません。'};
    if(op==='discard'){remove(b,l,1);return {message:'一つ処分しました。'};}
    if(op!=='wrap'||l.wrapped||quality(l)!=='新鮮'||!Number.isFinite(items[l.id].hours))return {error:'この品は包み直せません。'};
    if(s.coins<2)return {error:'包み代の2文が足りません。'};
    s.coins-=2;
    l.wrapped=true;
    return {message:'包み直しました。傷みがゆっくり進みます。'};
  }
  return {region,food,items,recipes,venues,hydrate,valid,temperature,tick,advance,buy,cook,eat,order,manage,quality,ratio,chatCount:chats.length};
})();
if(typeof module!=='undefined') module.exports=FoodLife;

function createFoodPanel(api){
  const $=id=>document.getElementById(id);
  const panel=$('food-panel'),body=$('food-body'),summary=$('food-summary'),status=$('food-status');
  const {food,items,recipes,venues,region}=FoodLife;
  const atlas=new Image();
  atlas.src='./food-atlas.png';
  const cold=['onigiri','hoshii','ume','persimmon','pickles','dried-fish','salt-fish','firm-tofu'];
  const labels={pack:'携帯食と材料',shop:'茶屋・旅籠の品書き',kitchen:'沢辺の炊事場',catalog:'旅の食図鑑'};
  let tab='pack',lines=null,pending=null,lastMeal=null;
  const icon=(id,condition='',hero=false)=>{
    const i=items[id].index;
    if(i<0)return '<span class="food-icon wood-chip" aria-hidden="true">薪</span>';
    const tone=condition==='腐敗'?' spoiled':condition==='傷みかけ'?' aging':'';
    return '<span class="food-icon'+(hero?' hero':'')+tone+'" style="--ix:'+i%5+';--iy:'+Math.floor(i/5)+'" aria-hidden="true"></span>';
  };
  const button=(op,text,{id,key,count,disabled}={})=>
    '<button type="button" data-food-op="'+op+'"'+(id?' data-id="'+id+'"':'')+(key?' data-key="'+key+'"':'')+
    (count?' data-count="'+count+'"':'')+(disabled?' disabled':'')+'>'+text+'</button>';
  const details=it=>'<p>'+it.desc+'</p><p class="food-spec">'+it.weight+'g　・　基準の保存 '+(Number.isFinite(it.hours)?it.hours+'時間':'長期')+'　・　'+it.prep+'</p>';
  const effects=it=>'<div class="food-tags"><span>満腹 +'+it.hunger+'</span><span>体力 +'+it.health+'</span><span>気力 +'+it.spirit+'</span></div>';
  const row=(id,content,condition='')=>'<article class="food-row">'+icon(id,condition)+'<div>'+content+'</div></article>';
  const title=(id,extra='')=>'<h4>'+items[id].name+extra+'</h4>';
  const actions=content=>'<div class="food-actions">'+content+'</div>';
  function pack(b){
    if(!b.lots.length)return '<p class="food-host">荷物は空です。出発点の茶屋で、携帯食や材料を買えます。</p>';
    return b.lots.map(l=>{
      const it=items[l.id],condition=FoodLife.quality(l),key=l.key;
      const label=condition==='新鮮'&&FoodLife.ratio(l)>=.65?'そろそろ傷みます':condition;
      const canEat=!it.ingredient;
      return row(l.id,title(l.id,' <small>×'+l.qty+'</small>')+
        '<span class="food-condition'+(label!=='新鮮'?' alert':'')+'">'+(l.id==='wood'?'燃料':label)+(l.wrapped?' ／ 包み直し済み':'')+'</span>'+
        details(it)+(canEat?effects(it):'')+actions(
          (canEat?button('eat',condition==='腐敗'?'腐敗した品を食べる':'食べる',{key,count:1}):'')+
          (canEat&&l.qty>1&&condition!=='腐敗'?button('eat','二人で食べる',{key,count:2}):'')+
          (Number.isFinite(it.hours)&&!l.wrapped&&condition==='新鮮'?button('wrap','包み直す 2文',{key}):'')+button('discard','一つ処分',{key}))+
        (pending===key?'<p class="food-danger">体調を崩すおそれがあります。'+button('confirm','それでも食べる',{key,count:1})+'</p>':''),condition);
    }).join('');
  }
  function shop(s,venue){
    if(!venue?.menu)return '<p class="food-host">茶屋か旅籠の主人に話しかけると、品書きが開きます。</p>';
    const greeting=venue.lodging?'旅籠の主人「温かい膳をどうぞ。お泊まりなら床も整えます。」':'茶屋の主人「お休みなされ。飯も、道中の包みもありますよ。」';
    const buy=(id,op,qty,price,label)=>button(op,label+' '+price+'文',{id,count:qty,disabled:s.coins<price});
    return '<p class="food-host">'+greeting+(venue.lodging?'<br>宿泊すると翌朝まで進みます。携帯食が傷むことがあるので、荷物をご確認ください。':'')+'</p>'+
      '<h4 class="food-divider">その場で食べる</h4>'+venue.menu.map(id=>{
        const it=food[id],l=venue.lodging;
        return row(id,title(id)+details(it)+effects(it)+actions(
          buy(id,'order',1,it.price,'一人')+buy(id,'order',2,it.price*2,'二人')+
          (l?buy(id,'stay',1,it.price+l,'一人の食事と宿')+buy(id,'stay',2,(it.price+l)*2,'二人の食事と宿'):'')));
      }).join('')+'<h4 class="food-divider">持ち帰り・調理材料</h4>'+venue.shop.map(id=>{
        const it=items[id];
        return row(id,title(id)+details(it)+actions(buy(id,'buy',1,it.price,'一つ購入')+buy(id,'buy',2,it.price*2,'二つ購入')));
      }).join('');
  }
  function kitchen(b,venue){
    const atFire=Boolean(venue?.fire);
    const have=id=>b.lots.some(l=>l.id===id&&FoodLife.quality(l)==='新鮮');
    return '<div class="hearth-scene" aria-hidden="true"><i></i><b></b><em></em></div><p class="food-host">'+
      (atFire?'薪一束と材料を使って、一人分を調理できます。':'沢辺の炊事場に近づくと調理できます。薪と材料は茶屋で買えます。')+'</p>'+
      Object.entries(recipes).map(([id,[minutes,...needs]])=>row(id,title(id)+'<div class="food-tags">'+
        needs.map(m=>'<span'+(have(m)?'':' class="missing"')+'>'+items[m].name+(have(m)?' ✓':' 不足')+'</span>').join('')+'</div>'+
        actions(button('cook',minutes+'分で作る',{id,disabled:!atFire||needs.some(m=>!have(m))})))).join('');
  }
  function catalog(){
    const sources=[
      ['https://kotenlibrary.jp/oku/','『おくのほそ道』本文','国立国会図書館公開本を底本とする翻刻。旅程と土地の記述。'],
      ['https://www.aozora.gr.jp/cards/002237/files/60640_78258.html','杉浦正一郎『おくのほそ道 解説』','曾良自筆の日記に基づく翻刻について。'],
      ['https://ndlsearch.ndl.go.jp/books/R100000094-I213433','寛永20年（1643）『料理物語』','魚・青物・汁・煮物・焼物の記載。'],
      ['https://www.imes.boj.or.jp/cm/index.html','日本銀行金融研究所 貨幣博物館','江戸時代の銭貨と文。'],
      ['https://www.maff.go.jp/j/keikaku/syokubunka/traditional-foods/area/iwate.html','農林水産省「岩手県の伝統食」','雑穀食の地域差を知る資料。'],
      ['https://www.maff.go.jp/j/keikaku/syokubunka/area_stories/miyagi.html','農林水産省「宮城県の郷土料理」','沿岸食文化の参考。'],
      ['https://www.mlit.go.jp/kankocho/content/001998181.pdf','観光庁「出羽三山の精進料理」','山菜などを使う、地域で育まれた食文化の資料。'],
      ['https://www.maff.go.jp/j/keikaku/syokubunka/traditional-foods/menu/katadohu.html','農林水産省「堅豆腐」','後世に伝わる郷土食の資料。']
    ];
    return '<p class="food-host">元禄の旅をもとにした創作献立です。芭蕉・曾良の実食や好物、当時の各店の献立や価格は断定していません。</p>'+
      Object.entries(food).map(([id,it])=>row(id,title(id)+details(it)+effects(it)+
        '<p class="food-spec">'+it.price+'文（ゲーム価格）　入手地域 '+it.where.map(r=>region[r]).join('・')+
        (it.where.includes('hiraizumi')?'':' ／ 他地域の実装時に解放')+'</p>')).join('')+
      '<details class="food-sources"><summary>史料・参考資料</summary><ul>'+
      sources.map(([url,name,detail])=>'<li><a target="_blank" rel="noopener" href="'+url+'">'+name+'</a>。'+detail+'</li>').join('')+'</ul></details>';
  }
  function render(keep=false){
    const y=keep?body.scrollTop:0,s=api.state(),b=FoodLife.hydrate(s),venue=venues[api.venue()];
    $('food-place').textContent=venue?.name||'平泉・一関の街道';
    $('food-tab-title').textContent=labels[tab];
    const load=b.lots.reduce((total,l)=>total+items[l.id].weight*l.qty,0);
    summary.textContent='所持金 '+s.coins+'文　｜　満腹 '+Math.floor(s.hunger)+'　体力 '+Math.floor(s.energy)+'　気力 '+Math.floor(b.spirit)+
      '　｜　曾良の満腹 '+Math.floor(b.sora)+'　｜　荷 '+(load/1000).toFixed(2)+'kg　｜　'+FoodLife.temperature(s)+'℃';
    body.innerHTML=tab==='pack'?pack(b):tab==='shop'?shop(s,venue):tab==='kitchen'?kitchen(b,venue):catalog();
    body.scrollTop=y;
    panel.querySelectorAll('[data-food-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.foodTab===tab)));
  }
  function show(next='pack'){
    if(panel.open)return;
    api.clearInput();
    pending=lines=lastMeal=null;
    status.textContent='';
    $('food-feature').innerHTML=icon('inn-tray','',true)+'<div><small>陸奥の旅支度</small><strong>食べることも旅の一部</strong></div>';
    tab=next;
    render();
    panel.showModal();
    panel.querySelector('[data-food-tab="'+tab+'"]').focus({preventScroll:true});
  }
  function notice(message){
    if(panel.open)status.textContent=message;
    else api.toast(message);
  }
  function feature(result){
    const id=result.ate||result.cooked;
    if(!id)return;
    const el=$('food-feature');
    el.innerHTML='<div class="food-feature-art">'+icon(id,'',true)+(cold.includes(id)?'':'<i></i><b></b>')+
      '</div><div><small>'+(result.cooked?'炊き上がり':result.sick?'食後の体調':'食事のひととき')+'</small><strong>'+food[id].name+'</strong></div>';
    el.classList.remove('fresh-effect');
    void el.offsetWidth;
    el.classList.add('fresh-effect');
  }
  panel.addEventListener('click',e=>{
    const target=e.target.closest('[data-food-op]');
    if(!target||target.disabled)return;
    const s=api.state(),venue=api.venue(),{id,foodOp:op}=target.dataset;
    const key=Number(target.dataset.key),count=Number(target.dataset.count);
    const lot=FoodLife.hydrate(s).lots.find(l=>l.key===key);
    if(op==='eat'&&lot&&FoodLife.quality(lot)==='腐敗'){
      pending=key;
      render(true);
      body.querySelector('[data-food-op="confirm"]')?.focus({preventScroll:true});
      return;
    }
    const warnings=[],warn=m=>warnings.push(m);
    let result;
    if(op==='buy')result=FoodLife.buy(s,venue,id,count,warn);
    else if(op==='cook')result=FoodLife.cook(s,id,venues[venue]?.fire,warn);
    else if(op==='order'||op==='stay')result=FoodLife.order(s,venue,id,count,op==='stay',warn);
    else if(op==='eat'||op==='confirm')result=FoodLife.eat(s,key,count,op==='confirm'&&pending===key,warn);
    else result=FoodLife.manage(s,key,op);
    pending=null;
    status.textContent=result.error||[result.message,...warnings].join('　');
    if(result.error)return;
    feature(result);
    if(result.ate||result.cooked)api.effect(result);
    if(result.ate)lastMeal=result;
    if(result.lines)lines=result.lines;
    render(true);
    const selector='[data-food-op="'+op+'"]'+(id?'[data-id="'+id+'"]':'[data-key="'+key+'"]')+(count?'[data-count="'+count+'"]':'');
    (body.querySelector(selector)||panel.querySelector('[data-food-tab="'+tab+'"]')).focus({preventScroll:true});
    api.save(true);
  });
  panel.querySelectorAll('[data-food-tab]').forEach(b=>b.addEventListener('click',()=>{
    pending=null;
    tab=b.dataset.foodTab;
    render();
  }));
  $('food-close').onclick=()=>panel.close();
  panel.addEventListener('close',()=>{
    if(lines)api.dialogue(lines);
    if(lastMeal)api.effect(lastMeal,true);
    pending=lines=lastMeal=null;
  });
  function drawMeal(ctx,actor,isSora,effect,now){
    if(!effect||now>effect.until||isSora&&effect.count!==2)return;
    const step=Math.floor(now*6)%3,x=Math.round(actor.x),y=Math.round(actor.y),i=food[effect.ate].index;
    if(atlas.naturalWidth){
      const w=atlas.naturalWidth/5,h=atlas.naturalHeight/4;
      ctx.drawImage(atlas,i%5*w,Math.floor(i/5)*h,w,h,x-7,y-26-step*2,15,15);
    }
    ctx.fillStyle='#d8a477';
    ctx.fillRect(x+5,y-22-step*2,3,3);
    ctx.fillRect(x-7,y-21-step*2,3,3);
    if(actor.dir>=1&&actor.dir<=3){
      ctx.fillStyle=effect.sick?'#83a16f':'#38271e';
      ctx.fillRect(x-4,y-29,2,1);
      ctx.fillRect(x+2,y-29,2,1);
      ctx.fillRect(x-1,y-26+(step===1?1:0),2,1);
    }
    ctx.fillStyle=effect.sick?'#b2c893':'#f8daa0';
    ctx.font='8px serif';
    ctx.fillText(effect.sick?'…':'♪',x+10,y-39-step);
  }
  return {show,notice,drawMeal};
}
