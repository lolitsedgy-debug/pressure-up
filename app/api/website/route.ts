import {publishedWebsite} from '../../../lib/website';
import {failure} from '../records-utils';
export async function GET(){try{return Response.json(await publishedWebsite(),{headers:{'Cache-Control':'no-store'}})}catch(e){return failure(e)}}
