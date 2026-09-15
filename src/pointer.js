// The same coordinates drive the visible crosshair and the dwell hit test.
export function createPointer(element) {
  element.setAttribute('popover','manual');
  element.setAttribute('aria-hidden','true');
  element.innerHTML='<svg viewBox="0 0 56 56"><circle class="pointer-track" cx="28" cy="28" r="23"/><circle class="pointer-progress" cx="28" cy="28" r="23"/><path d="M28 16v24M16 28h24"/><circle class="pointer-center" cx="28" cy="28" r="4"/></svg><span class="pointer-label"></span>';
  return (point,label='',progress=0,selected=false) => {
    if(!point){if(element.matches(':popover-open'))element.hidePopover();element.hidden=true;return;}
    element.hidden=false;
    if(!element.matches(':popover-open'))element.showPopover();
    element.style.left=`${point.x}px`;element.style.top=`${point.y}px`;
    element.style.setProperty('--pointer-progress',Math.max(0,Math.min(1,progress)));
    element.classList.toggle('selected',selected);
    const badge=element.querySelector('.pointer-label');badge.textContent=label;
    // Keep the label readable at either edge, without moving the actual crosshair.
    const width=Math.min(260,innerWidth-24);
    badge.style.width=`${width}px`;
    badge.style.left=`${Math.max(12,Math.min(innerWidth-width-12,point.x-width/2))-point.x+28}px`;
    badge.style.top=point.y>innerHeight-90?'-48px':'62px';
  };
}
