// Local provided recording. No streaming, personal data or normal-portal writes.
export const ENDING_CUE={scene:'C07-S09',line:17,fadeIn:6000,ceiling:.22,scale:.45};
export function isEndingCue(step){return step.kind==='end'||step.sceneId>ENDING_CUE.scene||step.sceneId===ENDING_CUE.scene&&(step.line??-1)>=ENDING_CUE.line}
export class EndingTrack{
 constructor(src,{AudioClass=globalThis.Audio,now=()=>performance.now(),notify=()=>{},onMedia=()=>{}}={}){this.src=src;this.AudioClass=AudioClass;this.now=now;this.notify=notify;this.onMedia=onMedia;this.active=false;this.elapsed=0;this.playing=false;this.token=0;this.settings={volume:.3,mute:false};}
 ensure(){if(this.media)return;this.media=new this.AudioClass();this.onMedia(this.media);this.media.preload='none';this.media.src=this.src;this.media.volume=0;this.media.onended=()=>{this.finished=true;this.playing=false;this.clearTick();this.notify('finished')};this.media.onerror=()=>{this.playing=false;this.clearTick();this.notify('blocked')};}
 update(step,settings){this.settings=settings;if(!isEndingCue(step)){this.stop();return}if(!this.active){this.active=true;this.finished=false;this.elapsed=0;this.play()}this.apply();}
 target(){return this.settings.mute?0:Math.min(ENDING_CUE.ceiling,this.settings.volume*ENDING_CUE.scale)}
 apply(){if(!this.media)return;const elapsed=this.elapsed+(this.playing?Math.max(0,this.now()-this.started):0);this.media.volume=this.target()*Math.min(1,elapsed/ENDING_CUE.fadeIn);if(this.media.dataset)this.media.dataset.playbackVolume=String(this.media.volume);}
 async play(){if(!this.active||this.finished||this.playing||this.pending)return;this.ensure();const token=++this.token;this.pending=true;try{await this.media.play();if(token!==this.token){if(!this.active)this.media.pause();return}this.playing=true;this.started=this.now();this.clearTick();this.tick=setInterval(()=>this.apply(),80);this.notify('playing');this.apply()}catch{if(token===this.token)this.notify('blocked')}finally{if(token===this.token)this.pending=false}}
 pause(){++this.token;this.pending=false;if(this.playing)this.elapsed+=Math.max(0,this.now()-this.started);this.playing=false;this.clearTick();this.media?.pause();}
 resume(){if(this.active&&!this.finished)this.play()}
 stop(){this.pause();this.active=false;this.finished=false;this.elapsed=0;if(this.media){this.media.currentTime=0;this.media.volume=0}this.notify('stopped')}
 retry(){if(!this.active)return;if(this.finished){this.finished=false;this.elapsed=0;this.media.currentTime=0}this.play()}
 clearTick(){if(this.tick)clearInterval(this.tick);this.tick=null;}
}
