/* Hiyori low-poly character prototype. Isolated: not loaded by production index.html.
 * Requires THREE and scene3d.js town3DMesh; front faces +Z.
 */
(function(global){
  function createHiyoriPrototype(){
    if(!global.THREE||typeof global.town3DMesh!=='function')throw Error('Three.js and scene3d.js are required');
    const T=global.THREE, root=new T.Group(), skin='#f4cdb3', hair='#946149';
    const add=(p,t,c,x,y,z,a,b,d)=>global.town3DMesh(p,t,c,x,y,z,a,b,d);
    const torso=add(root,'sphere','#f8e3df',0,.82,0,.31,.33,.24);
    const head=new T.Group();head.position.y=1.48;root.add(head);
    add(head,'sphere',skin,0,0,0,.46,.43,.37);
    add(head,'sphere',hair,0,.29,-.09,.47,.23,.34);
    for(let i=0;i<5;i++){const x=(i-2)*.155;add(head,'sphere',hair,x,.27,.265,.11,.19,.105);}
    for(const side of [-1,1]){
      add(head,'sphere',hair,side*.43,-.06,-.09,.16,.23,.19);
      add(head,'sphere','#a66b51',side*.49,-.17,-.1,.14,.15,.14);
      add(head,'sphere','#fffaf5',side*.17,-.045,.328,.115,.145,.041);
      add(head,'sphere','#6a4439',side*.17,-.046,.363,.092,.119,.026);
      add(head,'sphere','#332b35',side*.17,-.047,.387,.053,.079,.015);
      add(head,'sphere','#ffffff',side*.17-.028,.005,.402,.028,.034,.012);
      add(head,'sphere','#ffffff',side*.17+.03,-.084,.401,.013,.016,.008);
      add(head,'sphere','#eda6a4',side*.32,-.15,.304,.08,.032,.018);
    }
    add(head,'sphere','#b96e70',0,-.19,.366,.057,.018,.012);
    const legs=[],arms=[];
    for(const side of [-1,1]){
      const leg=new T.Group();leg.position.set(side*.145,.56,0);root.add(leg);
      add(leg,'cylinder','#45465c',0,-.17,0,.095,.34,.095);
      add(leg,'sphere','#f5c7ce',0,-.39,.085,.15,.105,.19);legs.push(leg);
      const arm=new T.Group();arm.position.set(side*.34,1.02,0);root.add(arm);
      add(arm,'sphere','#f8e3df',0,-.14,0,.105,.19,.11);
      add(arm,'sphere',skin,0,-.33,.015,.092,.09,.09);arms.push(arm);
    }
    add(root,'cone','#53556d',0,.62,0,.36,.38,.3);
    add(root,'box','#d98091',0,.94,.242,.12,.14,.026);
    root.userData={head,leftLeg:legs[0],rightLeg:legs[1],leftArm:arms[0],rightArm:arms[1],prototype:true};
    return root;
  }
  global.createHiyoriPrototype=createHiyoriPrototype;
})(typeof window!=='undefined'?window:globalThis);
