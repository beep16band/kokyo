const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');fs.mkdirSync(path.join(root,'tests'),{recursive:true});
let html=fs.readFileSync(path.join(root,'kt-prep-v022.html'),'utf8');
const bridge=fs.readFileSync(path.join(__dirname,'ch1-test-bridge.inc.js'),'utf8');
const anchor=' restore();setInterval(move,16);draw();',i=html.lastIndexOf(anchor);
html=html.slice(0,i)+bridge+'\n restore();draw();'+html.slice(i+anchor.length);
html=html.replaceAll("assets/kotoba-tower/","../assets/kotoba-tower/");
fs.writeFileSync(path.join(root,'tests/ch1-fixture.html'),html);
