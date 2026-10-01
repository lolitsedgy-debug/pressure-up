import {websiteImage} from '../../../../../../lib/website-media';import {ownerAuthorized,forbidden} from '../../../../owner-auth';
export async function GET(r:Request,{params}:{params:Promise<{id:string}>}){if(!(await ownerAuthorized(r)))return forbidden();return websiteImage(r,(await params).id,true)}
