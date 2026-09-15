export function eyeFeatures(result) {
  const p=result.faceLandmarks?.[0];
  if(!p||result.faceLandmarks.length!==1||p.length<478)return null;
  if(result.faceBlendshapes?.[0]?.categories.some(c=>/^eyeBlink(Left|Right)$/.test(c.categoryName)&&c.score>0.55))return null;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const eye=(a,b,top,bottom,iris)=>{
    const w=dist(p[a],p[b]);if(w<.015||dist(p[top],p[bottom])/w<.12)return null;
    const dx=(p[b].x-p[a].x)/w,dy=(p[b].y-p[a].y)/w;
    return [((p[iris].x-p[a].x)*dx+(p[iris].y-p[a].y)*dy)/w,(-(p[iris].x-p[a].x)*dy+(p[iris].y-p[a].y)*dx)/w];
  };
  const a=eye(33,133,159,145,468),b=eye(362,263,386,374,473);
  if(!a||!b)return null;
  const width=dist(p[33],p[263]);
  const features=[...a,...b,p[1].x,p[1].y,(p[1].x-(p[33].x+p[263].x)/2)/width];
  return features.every(Number.isFinite)?{features,head:[p[1].x,p[1].y,width]}:null;
}
function solve(a,b){
  const m=a.map((r,i)=>[...r,b[i]]),n=b.length;
  for(let i=0;i<n;i++){
    let pivot=i;for(let j=i+1;j<n;j++)if(Math.abs(m[j][i])>Math.abs(m[pivot][i]))pivot=j;
    [m[i],m[pivot]]=[m[pivot],m[i]];if(Math.abs(m[i][i])<1e-10)throw Error('Calibration needs more varied eye positions.');
    const d=m[i][i];for(let k=i;k<=n;k++)m[i][k]/=d;
    for(let j=0;j<n;j++)if(j!==i){const s=m[j][i];for(let k=i;k<=n;k++)m[j][k]-=s*m[i][k];}
  }return m.map(r=>r[n]);
}
export function trainGaze(samples){
  if(samples.length<90)throw Error('Not enough clear eye samples. Please recalibrate.');
  const n=samples.length,k=samples[0].features.length;
  const mean=Array.from({length:k},(_,i)=>samples.reduce((s,p)=>s+p.features[i],0)/n);
  const scale=mean.map((m,i)=>Math.max(.002,Math.sqrt(samples.reduce((s,p)=>s+(p.features[i]-m)**2,0)/n)));
  const rows=samples.map(p=>[1,...p.features.map((v,i)=>(v-mean[i])/scale[i])]);
  const a=Array.from({length:k+1},(_,i)=>Array.from({length:k+1},(_,j)=>rows.reduce((s,r)=>s+r[i]*r[j],0)+(i===j&&i>0?2:0)));
  const fit=axis=>solve(a,Array.from({length:k+1},(_,i)=>rows.reduce((s,r,j)=>s+r[i]*samples[j].target[axis],0)));
  const bx=fit(0),by=fit(1);
  return features=>{const row=[1,...features.map((v,i)=>(v-mean[i])/scale[i])];return {x:row.reduce((s,v,i)=>s+v*bx[i],0),y:row.reduce((s,v,i)=>s+v*by[i],0)};};
}
export function validationPass(groups){
  return groups.length===4&&groups.every(g=>g.length>=12&&g.filter(s=>Math.abs(s.point.x-s.target[0])<.18&&Math.abs(s.point.y-s.target[1])<.18).length/g.length>=.7);
}
export function goodCheck(group){return !!group&&group.length>=12&&group.filter(s=>Math.abs(s.point.x-s.target[0])<.18&&Math.abs(s.point.y-s.target[1])<.18).length/group.length>=.7;}
// Trim training outliers only. Validation always scores every collected sample.
export function steadySamples(samples,count=20){
  const median=values=>{const a=[...values].sort((a,b)=>a-b);return a[Math.floor(a.length/2)];};
  const center=samples[0].features.map((_,i)=>median(samples.map(s=>s.features[i])));
  const spread=center.map((v,i)=>Math.max(.002,median(samples.map(s=>Math.abs(s.features[i]-v)))));
  return [...samples].sort((a,b)=>{
    const score=s=>s.features.reduce((sum,v,i)=>sum+Math.abs(v-center[i])/spread[i],0);
    return score(a)-score(b);
  }).slice(0,count);
}
