import {defaultServices,type Service} from './website-model';
const names:Record<string,string>={driveway:'Driveway',patio:'Patio',walkways:'Walkways',exterior:'Exterior walls',whole:'Entire property',commercial:'Commercial property'};
export function calculateQuote(input:any,catalog:Service[]=defaultServices){
 const byId=Object.fromEntries(catalog.map(s=>[s.id,s]));
 const services=[...new Set<string>(Array.isArray(input.services)?input.services:[])];if(!services.length||services.length>6||services.some(s=>!names[s]||!byId[s]?.active||!byId[s]?.bookable))throw Error('Choose the areas to clean.');
 const two=input.stories==='Two stories',size=['Small','Standard','Large'].includes(input.patioSize)?input.patioSize:'Standard';
 const full:Record<string,number>=Object.fromEntries(catalog.map(s=>[s.id,Math.max(s.prices.minimum,s.id==='patio'?(size==='Small'?s.prices.small:size==='Large'?s.prices.large:s.prices.base):two&&['exterior','whole'].includes(s.id)?s.prices.twoStory:s.prices.base)]));let base:number;
 if(services.includes('whole'))base=full.whole;else{const sorted=services.slice().sort((a,b)=>full[b]-full[a]),bundle:Record<string,number>=Object.fromEntries(catalog.map(s=>[s.id,s.id==='patio'&&size==='Large'?s.prices.bundleLarge:s.id==='exterior'&&two?s.prices.bundleTwoStory:s.prices.bundle]));base=full[sorted[0]]+sorted.slice(1).reduce((n,s)=>n+bundle[s],0);if(['Dark or green buildup','Oil or grease','Several concerns'].includes(input.condition))base+=20;if(input.prep==='Several or heavy items')base+=20}
 const city=String(input.city||'Lawndale').toLowerCase();if(/long beach|downtown|los angeles|santa monica/.test(city))base+=20;else if(/carson|san pedro|culver|compton/.test(city))base+=10;
 const nearby=['lawndale','hawthorne','gardena','redondo','manhattan beach','torrance','el segundo','inglewood','carson','san pedro','culver','compton','long beach','downtown','los angeles','santa monica'];
 const price=Math.round(base/5)*5,duration=price>500?360:price>350?300:price>180?180:120;
 return {price,duration,service:services.includes('whole')?byId.whole.name.en:services.map(s=>byId[s].name.en).join(' + '),review:price>500||!nearby.some(x=>city.includes(x)),services};
}
