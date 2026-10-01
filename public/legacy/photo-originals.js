// Keep the File untouched; the small JPEG is only a separate browsing thumbnail.
window.pressureUpPhoto=async function(file){
 const data=URL.createObjectURL(file),result={file,type:file.type.startsWith('image/')?'image':'video',name:file.name,data};
 if(result.type!=='image')return result;
 result.quality=await window.checkPressurePhoto(file);result.coverage='unknown';
 try{const img=new Image();img.src=data;await img.decode();const scale=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);result.thumbnail=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.8));}catch{/* Unsupported previews never discard the original. */}
 return result;
};
