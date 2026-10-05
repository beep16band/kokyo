// Injected only into the disposable test fixture, never the released game.
window.__ch1Test={
 get p(){return p},get story(){return story},get dialogue(){return dialogue},get battle(){return battle},get stats(){return stats},get ren(){return ren},
 begin,move,draw,blocked,changeScene,safeSave,
 inspect(){if(typeof KeyboardEvent==='undefined')return inspect();if(battle){document.querySelector('#battle-next').click();return}if(innerWidth<600){const button=document.querySelector('.touch .ok');button.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}));button.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));return}window.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true,cancelable:true}));window.dispatchEvent(new KeyboardEvent('keyup',{key:' ',code:'Space',bubbles:true}));},
 setKeys(value){keys=value},elapsedEntry(){entryAt=performance.now()-31000},
 answerCorrect(){const i=existingQuestions[battle.q][2],button=document.querySelectorAll('#battle-choices button')[i];if(button?.click)button.click();else answerBattle(i)},
 answerWrong(){const i=(existingQuestions[battle.q][2]+1)%4,button=document.querySelectorAll('#battle-choices button')[i];if(button?.click)button.click();else answerBattle(i)},
 get checkpoint(){return checkpoint},bank:existingQuestions,
 getImages(){return [room,hall,stairs,floor1,library,rightHall,rightStairs,cleaner,hero,boy,glasses,girlRight,girlLeft,...Object.values(adventureImages)]}
};
