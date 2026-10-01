import {websiteImage} from '../../../../../lib/website-media';
export async function GET(r:Request,{params}:{params:Promise<{id:string}>}){return websiteImage(r,(await params).id)}
