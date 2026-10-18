// Prototype saves use their own namespace. Production save keys are never read or written.
(()=>{const original=window.localStorage,prefix='kotoba_sprite_prototype_v1:';
const keys=()=>Array.from({length:original.length},(_,i)=>original.key(i)).filter(k=>k?.startsWith(prefix));
Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>original.getItem(prefix+key),setItem:(key,value)=>original.setItem(prefix+key,String(value)),removeItem:key=>original.removeItem(prefix+key),clear:()=>keys().forEach(key=>original.removeItem(key)),key:index=>keys()[index]?.slice(prefix.length)||null,get length(){return keys().length}}});})();
