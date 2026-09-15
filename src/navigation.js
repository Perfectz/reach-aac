export function pageCapacity(width,height,simple=false){
  if(simple)return height<720?2:4;
  if(width<720||height<500)return height<720?2:4;
  return width>=1100&&height>=850?12:8;
}
export function eyeCapacity(width,height,simple=false){return simple||width<720||height<500?4:width>=1100&&height>=850?8:6;}
export function pageSlice(items,page,size){
  const count=Math.max(1,Math.ceil(items.length/size));
  const index=Math.max(0,Math.min(count-1,page));
  return {items:items.slice(index*size,(index+1)*size),index,count};
}
// A page-changing action must be followed by leaving its activation area.
// Losing tracking is not evidence that the person deliberately moved away.
export class NavigationRelease {
  block(rect){this.rect={left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom};}
  allows(point){
    if(!this.rect)return true;
    if(!point)return false;
    const r=this.rect;
    if(point.x>=r.left&&point.x<=r.right&&point.y>=r.top&&point.y<=r.bottom)return false;
    this.rect=null;return true;
  }
}

// Keep the highlighted control by identity when the available controls change.
export class ScanCursor {
 constructor(){this.reset(0,0);}
 reset(now,duration){this.target=null;this.index=0;this.next=now+duration;}
 update(targets,now,duration){
  const previous=this.target;
  if(!targets.length){this.reset(now,duration);return {target:null,changed:!!previous};}
  const index=targets.indexOf(this.target);
  if(index>=0)this.index=index;
  else{
   this.index=Math.min(this.index,targets.length-1);this.target=targets[this.index];
   // A replacement gets a full interval; never inherit an almost-expired timer.
   this.next=now+duration;
  }
  if(now>=this.next){this.index=(this.index+1)%targets.length;this.target=targets[this.index];this.next=now+duration;}
  return {target:this.target,changed:previous!==this.target};
 }
 selected(targets){return targets.includes(this.target)?this.target:null;}
}
