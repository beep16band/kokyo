// Build the additive chapter extension inside the existing school game's closure.
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..');
const records=JSON.parse(fs.readFileSync(path.join(root,'assets/kotoba-tower/question-bank.json'),'utf8'));
const bank=records.map(q=>[q['問題文'],['A','B','C','D'].map(c=>q['選択肢'+c]),'ABCD'.indexOf(q['正解']),q['解説'],{id:q.ID,category:q['分野'],level:Number(q['難度']),hints:[q['ヒント1'],q['ヒント2']],exp:Number(q['獲得EXP'])}]);
let html=fs.readFileSync(path.join(root,'kt-prep-v022.html'),'utf8');
const start='/* CH1_ADVENTURE_BEGIN */',end='/* CH1_ADVENTURE_END */';
const extension=fs.readFileSync(path.join(root,'scripts/ch1-adventure.inc.js'),'utf8');
const block=start+'\nconst existingQuestions='+JSON.stringify(bank)+';\n'+extension+'\n'+end+'\n';
while(html.includes(start))html=html.slice(0,html.indexOf(start))+html.slice(html.indexOf(end)+end.length).replace(/^\n/,'');
const anchor=' restore();setInterval(move,16);draw();';
const anchorAt=html.lastIndexOf(anchor);
if(anchorAt<0)throw Error('Active game initialization not found');
html=html.slice(0,anchorAt)+block+html.slice(anchorAt);
html=html.replace('第1章 v0.23','第1章 v0.27').replace('第1章　言い回しの庭','第1章　消えたコトバ');
fs.writeFileSync(path.join(root,'kt-prep-v022.html'),html);
console.log('Existing questions preserved:',bank.length);
