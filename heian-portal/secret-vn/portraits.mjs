// Crop coordinates belong to each expression's source image, not to viewport size.
export function createPortrait(portrait,base){
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),img=document.createElementNS(ns,'image');
 const crop=portrait.faceCrop;
 if(!Array.isArray(crop)||crop.length!==4)throw Error('Missing portrait face crop');
 svg.setAttribute('viewBox',crop.join(' '));svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('aria-hidden','true');
 img.setAttribute('href',base+portrait.file);img.setAttribute('width',portrait.width);img.setAttribute('height',portrait.height);svg.append(img);return svg;
}
