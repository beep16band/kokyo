export const SAVE_KEY='heian-portal-secret-vn-v1';
export const MANUAL_KEY=SAVE_KEY+'-manual';
export function shuffle(input,random=Math.random){const out=[...input];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
export function normalProgress(storage,schema){
 const read=k=>{try{const x=JSON.parse(storage.getItem(k)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}};
 const story=read(schema.storyKey),games=read(schema.gameKey);
 const episodes=Array.from({length:5},(_,i)=>story.storyVersion===53&&story.episodes?.[i+1]?.complete===true);
 const perfect=schema.gameLengths.map((max,i)=>[8,16,max].some(len=>{const r=games[len===8?String(i):`${i}:${len}`];return r&&Number.isInteger(r.best)&&r.best===len&&Number.isInteger(r.plays)&&r.plays>0}));
 return {episodes,perfect,unlocked:episodes.every(Boolean)&&perfect.length===6&&perfect.every(Boolean)};
}
export function makeSteps(data){return data.scenes.flatMap(scene=>[
 ...scene.script.map((line,n)=>({id:`${scene.scene_id}-L${n}`,kind:'line',sceneId:scene.scene_id,line:n,...line})).filter(x=>!x.text.startsWith('QUIZ')&&!x.text.startsWith('読解試練「')),
 ...scene.quiz_ids.map(q=>({id:q,kind:'quiz',sceneId:scene.scene_id,questionId:q}))
]).concat([{id:'C01-END',kind:'end',sceneId:'C01-S07'}])}
export class StoryEngine{
 constructor(data,saved=null){this.data=data;this.steps=makeSteps(data);this.questions=new Map(data.questions.map(q=>[q.id,q]));this.state={schema:1,chapter:'C01',cursor:0,answers:{},attempts:{},read:[],complete:false,settings:{speed:24,volume:.3,seVolume:.35,mute:false,effects:true},...this.sanitize(saved)};this.guard();}
 sanitize(s){if(!s||s.schema!==1||s.chapter!=='C01')return {};const valid=new Set(this.steps.map(x=>x.id));const answers={};for(const q of this.data.questions)if(s.answers?.[q.id]===q.answerId)answers[q.id]=q.answerId;const attempts={};for(const q of this.data.questions){const n=s.attempts?.[q.id];if(Number.isInteger(n)&&n>=0)attempts[q.id]=Math.min(n,10000)}const settings={};for(const [k,min,max]of [['speed',0,80],['volume',0,1],['seVolume',0,1]])if(Number.isFinite(s.settings?.[k]))settings[k]=Math.max(min,Math.min(max,s.settings[k]));for(const k of ['mute','effects'])if(typeof s.settings?.[k]==='boolean')settings[k]=s.settings[k];return {cursor:Number.isInteger(s.cursor)?Math.max(0,Math.min(this.steps.length-1,s.cursor)):0,answers,attempts,read:Array.isArray(s.read)?s.read.filter(x=>valid.has(x)):[],complete:s.complete===true&&Object.keys(answers).length===8,settings:{speed:24,volume:.3,seVolume:.35,mute:false,effects:true,...settings}};}
 get current(){return this.steps[this.state.cursor]}
 get solved(){return Object.keys(this.state.answers).length}
 get canNext(){return this.current.kind!=='quiz'||this.state.answers[this.current.id]===this.questions.get(this.current.id).answerId}
 markRead(){if(this.current.kind==='line'&&!this.state.read.includes(this.current.id))this.state.read.push(this.current.id)}
 answer(id){if(this.current.kind!=='quiz')return false;const q=this.questions.get(this.current.id);if(!q.choices.some(c=>c.id===id))return false;this.state.attempts[q.id]=(this.state.attempts[q.id]||0)+1;const correct=id===q.answerId;if(correct)this.state.answers[q.id]=id;return correct;}
 next(){if(!this.canNext)return false;this.markRead();if(this.state.cursor<this.steps.length-1)this.state.cursor++;if(this.current.kind==='end'&&this.solved===8)this.state.complete=true;return true;}
 back(){if(this.state.cursor>0)this.state.cursor--;}
 replay(){this.state.cursor=0;}
 guard(){for(let i=0;i<this.state.cursor;i++){const s=this.steps[i];if(s.kind==='quiz'&&!this.state.answers[s.id]){this.state.cursor=i;this.state.complete=false;break}}}
 serialize(){return JSON.stringify({...this.state,updatedAt:new Date().toISOString()})}
}
