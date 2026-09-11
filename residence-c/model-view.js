// The model view borrows the loaded canvas; it owns no duplicate model or GPU context.
export function mountModelViewer({canvas, getScene, onOpen, onClose}) {
  const dialog=document.querySelector('#model-dialog');
  const mount=document.querySelector('#model-canvas-mount');
  const triggers=[...document.querySelectorAll('[data-open-model]')];
  const originalParent=canvas.parentNode, originalNext=canvas.nextSibling;
  const originalLabel=canvas.getAttribute('aria-label');
  const originalDescription=canvas.getAttribute('aria-describedby');
  let ready=false, returnFocus=null, borrowed=false;
  Object.defineProperty(window,'__residenceModel',{configurable:true,get:()=>Object.freeze({
    ready,open:dialog.open,sharedCanvas:borrowed,
    renderer:getScene()?.stats?.()||null,
  })});
  function close(){if(dialog.open)dialog.close();}
  for(const trigger of triggers)trigger.addEventListener('click',()=>{
    if(!ready||!getScene())return;
    returnFocus=trigger;onOpen();
    document.body.classList.add('dialog-open');
    dialog.showModal();mount.append(canvas);borrowed=true;
    canvas.tabIndex=0;
    canvas.setAttribute('aria-label','Interactive roof-off model of the complete flat');
    canvas.setAttribute('aria-describedby','model-instructions');
    try{
      getScene().setModelMode(true);
      document.querySelector('#model-reset').focus({preventScroll:true});
    }catch(error){
      close();
      document.querySelector('#model-availability').textContent='The model view could not open. Please try again.';
      console.error('Residence C model view:',error);
    }
  });
  dialog.addEventListener('close',()=>{
    if(borrowed){
      originalParent.insertBefore(canvas,originalNext);
      borrowed=false;
      canvas.removeAttribute('tabindex');
      canvas.setAttribute('aria-label',originalLabel);
      canvas.setAttribute('aria-describedby',originalDescription);
      getScene()?.setModelMode(false);
    }
    document.body.classList.remove('dialog-open');
    onClose();returnFocus?.focus({preventScroll:true});
  });
  document.querySelector('#model-close').addEventListener('click',close);
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();
  });
  dialog.querySelectorAll('[data-model-action]').forEach(button=>button.addEventListener('click',()=>{
    getScene()?.modelAction(button.dataset.modelAction);
  }));
  canvas.addEventListener('keydown',event=>{
    if(!dialog.open)return;
    const action=({'+':'zoom-in','=':'zoom-in','-':'zoom-out','r':'reset','R':'reset'})[event.key];
    if(action){event.preventDefault();getScene()?.modelAction(action);}
  });
  return {
    refresh(value){
      ready=value;
      triggers.forEach(button=>{button.disabled=!ready;});
      document.querySelector('#model-availability').textContent=ready
        ? 'Rotate, zoom and explore the whole home with the roof removed.'
        : 'The interactive model becomes available when the 3D home has loaded.';
      if(!ready)close();
    },
  };
}
