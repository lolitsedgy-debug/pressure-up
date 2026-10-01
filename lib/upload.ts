export const uploadTypes=['image/jpeg','image/png','image/webp','image/heic','image/heif','image/avif','image/gif','video/mp4','video/quicktime','video/webm'];
export function validUpload(file:unknown):file is File{return file instanceof File&&file.size>0&&file.size<=25*1024*1024&&uploadTypes.includes(file.type)}
