// Match all three contact identifiers, never a name or shared phone alone.
// ASCII folding matches SQLite lower() used by the historical migration.
export function customerIdentity(c:{firstName:string;lastName:string;phone:string;email:string}) {
 const fold=(v:string)=>v.trim().replace(/[A-Z]/g,x=>x.toLowerCase());
 const digits=c.phone.replace(/[+ ().\-]/g,'');
 return JSON.stringify([fold(c.firstName),fold(c.lastName),digits.length===10?'1'+digits:digits,fold(c.email)]);
}
