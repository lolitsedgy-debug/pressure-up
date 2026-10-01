fetch('/api/contact',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(c=>{window.businessContact=c;
 const footer=document.createElement('footer');footer.style.cssText='padding:24px;text-align:center;font-size:14px;display:flex;gap:18px;justify-content:center;flex-wrap:wrap;color:#173b32';
 const name=document.createElement('span');name.textContent=c.name;footer.append(name);
 for(const [value,href] of [[c.phone,'tel:'+c.phone.replace(/[^+\d]/g,'')],[c.email,'mailto:'+c.email]]){const a=document.createElement('a');a.textContent=value;a.href=href;footer.append(a)}footer.id='cms-contact';if(!document.getElementById('cms-contact'))document.body.append(footer);
 const portrait=document.querySelector('.portrait-placeholder');if(c.ownerPhoto&&portrait){const img=document.createElement('img');img.src=c.ownerPhoto;img.alt=c.ownerName+' — '+c.name;img.loading='lazy';img.style.cssText='width:100%;height:100%;object-fit:cover;border-radius:inherit';portrait.replaceChildren(img)}
if(window.applyWebsite)window.applyWebsite();}).catch(()=>{});
