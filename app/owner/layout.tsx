import type {Metadata} from 'next';
export const metadata:Metadata={title:'Pressure Up Owner',manifest:'/legacy/manifest.json',appleWebApp:{capable:true,title:'Pressure Up',statusBarStyle:'default'}};
export default function OwnerLayout({children}:{children:React.ReactNode}){return children;}
