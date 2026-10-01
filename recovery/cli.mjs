// Offline operator interface. Passphrase is read from stdin, never command arguments.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createPackage,restorePackage} from './package.mjs';
const [action,...a]=process.argv.slice(2);
try {
 if(action==='export'&&a.length===4&&a[3]==='--offline-confirmed') {
  const password=readFileSync(0,'utf8').replace(/\r?\n$/,'');
  const m=createPackage({database:resolve(a[0]),objects:resolve(a[1]),output:resolve(a[2]),migrations:resolve('drizzle'),password,offlineConfirmed:true,productionData:true});
  console.log(JSON.stringify({created:true,counts:m.counts,files:m.files.length,diagnostics:m.diagnostics}));
 } else if(action==='restore'&&a.length===2) {
  const password=readFileSync(0,'utf8').replace(/\r?\n$/,'');
  const r=restorePackage({input:resolve(a[0]),target:resolve(a[1]),password});
  console.log(JSON.stringify({restored:true,counts:r.manifest.counts,files:r.manifest.files.length,authReady:false}));
 } else throw Error('Usage: export DATABASE OBJECT_DIRECTORY NEW_OUTPUT --offline-confirmed | restore PACKAGE NEW_TARGET. Run from source root. Passphrase via stdin. Offline sources only.');
} catch(e) { console.error(e.message);process.exitCode=1; }
