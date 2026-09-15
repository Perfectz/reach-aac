// Vite supplies the deployment prefix; plain Node tests default to root hosting.
export const assetPath=path=>(import.meta.env?.BASE_URL||'/')+path.replace(/^\//,'');
