// Injected only into the disposable test fixture, never the released game.
window.__ch1Test={
 get p(){return p},get story(){return story},get dialogue(){return dialogue},get battle(){return battle},get stats(){return stats},get ren(){return ren},
 begin,inspect,move,draw,blocked,changeScene,safeSave,
 setKeys(value){keys=value},elapsedEntry(){entryAt=performance.now()-31000},
 answerCorrect(){answerBattle(existingQuestions[battle.q][2])},
 answerWrong(){answerBattle((existingQuestions[battle.q][2]+1)%4)},
 get checkpoint(){return checkpoint},bank:existingQuestions,
 getImages(){return [room,hall,stairs,floor1,library,rightHall,rightStairs,cleaner,hero,boy,glasses,girlRight,girlLeft,...Object.values(adventureImages)]}
};
