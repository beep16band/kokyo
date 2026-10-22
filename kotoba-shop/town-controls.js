// Pointer capture keeps the stick working when a thumb leaves the pad.
const TownStick={x:0,y:0,pointer:null,element:null};
(function(){
 const dock=document.createElement('section');dock.id='townControlDock';dock.setAttribute('aria-label','移動と決定');
 dock.innerHTML='<div class="stickWrap"><div id="townStick" tabindex="0" role="group" aria-label="移動スティック。指を動かす方向に歩き、指をはなすと止まります。矢印キーでも操作できます。"><span class="stickCross" aria-hidden="true"></span><span id="townStickKnob" aria-hidden="true"></span></div><small>指を動かして歩こう</small></div><div class="stickActions"><strong>ななめにも歩けるよ</strong><small>指をはなすと止まります。<br>パソコン：矢印キー・WASD</small><div><button id="stickAction" type="button">調べる・話す</button><button id="stickDash" type="button" aria-pressed="false">走る：OFF</button></div></div>';
 frame.after(dock);const pad=dock.querySelector('#townStick'),knob=dock.querySelector('#townStickKnob'),dash=dock.querySelector('#stickDash');TownStick.element=pad;
 const allowed=()=>!document.documentElement.classList.contains('townBooting')&&!(typeof TownTitle!=='undefined'&&TownTitle.active)&&!setupOpen&&!menuOpen&&!editorOpen&&!mini&&!busy&&!choices.children.length;
 function reset(){const id=TownStick.pointer;TownStick.pointer=null;TownStick.x=TownStick.y=0;pad.classList.remove('engaged');knob.style.transform='translate(0px,0px)';if(id!==null&&pad.hasPointerCapture?.(id))pad.releasePointerCapture(id);}
 const stopBeforeStick=stopWorldInput;stopWorldInput=function(){stopBeforeStick();reset();};
 function sample(e){const rect=pad.getBoundingClientRect(),radius=rect.width*.34,dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2,d=Math.hypot(dx,dy),scale=Math.min(1,radius/Math.max(1,d));knob.style.transform='translate('+dx*scale+'px,'+dy*scale+'px)';
  if(d<rect.width*.13){TownStick.x=TownStick.y=0;return;}
  const sector=(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;[TownStick.x,TownStick.y]=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]][sector];if(!walkStep)attemptInputStep();
 }
 pad.addEventListener('pointerdown',e=>{if(e.button!==0||TownStick.pointer!==null||!allowed())return;e.preventDefault();TownStick.pointer=e.pointerId;pad.setPointerCapture(e.pointerId);pad.classList.add('engaged');sample(e);});
 pad.addEventListener('pointermove',e=>{if(e.pointerId!==TownStick.pointer)return;e.preventDefault();if(!allowed()){reset();return;}sample(e);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(e.pointerId===TownStick.pointer)reset();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});window.addEventListener('blur',reset);
 dock.querySelector('#stickAction').onclick=()=>{if(!allowed())return;stopWorldInput();if(walkStep)pendingAction=true;else action();};
 dash.onclick=()=>{if(!allowed())return;state.settings.dashMode=!state.settings.dashMode;save(false);syncFieldTools();sync();};
 function sync(){const enabled=allowed();pad.setAttribute('aria-disabled',String(!enabled));dock.classList.toggle('controlsPaused',!enabled);dock.querySelector('#stickAction').disabled=!enabled;dash.disabled=!enabled;const on=!!state.settings.dashMode||dashHeld;dash.setAttribute('aria-pressed',String(on));dash.textContent=on?'走る：ON':'走る：OFF';if(!enabled&&TownStick.pointer!==null)reset();}
 const drawBeforeStick=draw;draw=function(now){sync();drawBeforeStick(now);};
 new ResizeObserver(()=>{dock.style.width=frame.getBoundingClientRect().width+'px';}).observe(frame);
 footer.textContent='矢印・WASD・スティック：8方向に歩く　Space：話す・調べる　Shift：ダッシュ　M：メニュー';sync();
})();
