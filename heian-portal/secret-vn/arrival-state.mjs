export const ARRIVAL_KEY='heian-portal-secret-arrival-v1';
export function readArrival(local,session){for(const s of[local,session]){try{const v=JSON.parse(s?.getItem(ARRIVAL_KEY)||'null');if(v?.version===1&&['pending','entered'].includes(v.status))return v}catch{}}return null}
export function writeArrival(status,local,session){const v=JSON.stringify({version:1,status,at:Date.now()});let saved=false;for(const s of[local,session])try{if(s){s.setItem(ARRIVAL_KEY,v);saved=true}}catch{}return saved}
export function hiddenStoryStarted(storage){try{const s=JSON.parse(storage.getItem('heian-portal-secret-vn-v1')||'null');return s?.schema===1&&s.chapter==='C01'&&(s.complete===true||Number.isInteger(s.cursor)&&s.cursor>0||Array.isArray(s.read)&&s.read.length>0)}catch{return false}}
export class ArrivalController{
 constructor({unlocked,marker,started,ready,write,present,navigate}){Object.assign(this,{unlocked,marker,started,ready,write,present,navigate});this.phase='idle'}
 check(){if(this.phase!=='idle'||!this.unlocked())return false;if(this.marker()?.status==='entered')return false;if(this.started()){this.write('entered');return false}if(!this.ready())return false;this.phase='signal';this.write('pending');this.present(()=>this.go());return true}
 reset(){this.phase='idle'}
 go(){if(this.phase!=='signal')return;this.phase='leaving';this.navigate()}
}
