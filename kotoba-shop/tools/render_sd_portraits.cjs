/* Render original 3D rigs into UI portrait atlases. The game still uses live meshes. */
const fs=require('fs'),path=require('path'),vm=require('vm'),T=require('../vendor/three.min.js');
const {createCanvas}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const root=path.resolve(__dirname,'..'),document={createElement:()=>createCanvas(32,32)},ctx={window:{THREE:T},document,console};
for(const f of ['hero-models.js','software-3d.js'])vm.runInNewContext(fs.readFileSync(path.join(root,'prototypes',f),'utf8'),ctx);
const factory=ctx.window.PlazaHeroModels.make(T,{compatible:true}),out=path.join(root,'prototypes/portraits');fs.mkdirSync(out,{recursive:true});
for(const kind of ['girl','boy','tsuki','green']){
 const atlas=createCanvas(512,160),ag=atlas.getContext('2d'),c=createCanvas(128,160),renderer=new ctx.window.PlazaSoftware3D({canvas:c});renderer.setSize(128,160);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-.99,.99,1.2375,-1.2375,.1,20);camera.position.set(0,1.35,6);camera.lookAt(0,1.2,0);
 const model=factory.build(kind,{batch(){},shadow:()=>new T.Group()});scene.add(model);
 for(let frame=0;frame<4;frame++){model.userData.phase=frame*Math.PI/2;ctx.window.PlazaHeroModels.animate(model,{time:1000,dt:0,moving:frame!==0});renderer.render(scene,camera);const img=c.getContext('2d').getImageData(0,0,128,160);for(let i=0;i<renderer.depth.length;i++)if(!Number.isFinite(renderer.depth[i]))img.data[i*4+3]=0;c.getContext('2d').putImageData(img,0,0);ag.drawImage(c,frame*128,0);}
 fs.writeFileSync(path.join(out,kind+'.png'),atlas.toBuffer('image/png'));console.log(kind+': 4 rendered 3D poses');
}
