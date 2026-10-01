export function canonicalRedirect(request:Request):Response|null {
 const url=new URL(request.url);
 if(url.hostname!=='www.pressureup.info'&&url.hostname!=='pressureup.info')return null;
 // Leave certificate challenges to the hosting provider.
 if(url.pathname.startsWith('/.well-known/'))return null;
 if(url.hostname==='pressureup.info'&&url.protocol==='https:')return null;
 url.hostname='pressureup.info';url.protocol='https:';url.port='';
 return Response.redirect(url.toString(),308);
}
