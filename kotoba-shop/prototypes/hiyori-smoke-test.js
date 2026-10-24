/* Hiyori prototype structural smoke test.
 * Run in browser console on hiyori-preview.html:
 * HiyoriSmokeTest.run()
 */
window.HiyoriSmokeTest={
 run(){
  const results=[],check=(name,ok,detail='')=>results.push({name,pass:!!ok,detail});
  check('Three.js loaded',typeof THREE!=='undefined');
  check('model factory loaded',typeof createHiyoriPrototype==='function');
  if(typeof THREE==='undefined'||typeof createHiyoriPrototype!=='function')return results;
  let model;
  try{model=createHiyoriPrototype();check('model instantiated',model instanceof THREE.Group);}
  catch(e){check('model instantiated',false,String(e));return results;}
  const nodes=[];model.traverse(n=>{if(n.isMesh)nodes.push(n);});
  check('3D mesh present',nodes.length>=20,'mesh count: '+nodes.length);
  check('both legs independent',model.userData.leftLeg!==model.userData.rightLeg);
  check('both arms independent',model.userData.leftArm!==model.userData.rightArm);
  check('head group exists',model.userData.head instanceof THREE.Group);
  const white=nodes.filter(n=>n.material&&n.material.color&&n.material.color.getHexString()==='ffffff');
  check('eye highlights exist',white.length>=4,'white highlight meshes: '+white.length);
  check('finite geometry transforms',nodes.every(n=>[n.position.x,n.position.y,n.position.z,n.scale.x,n.scale.y,n.scale.z].every(Number.isFinite)));
  console.table(results);
  return results;
 }
};