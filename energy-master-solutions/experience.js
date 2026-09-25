(()=>{
'use strict';
const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>[...root.querySelectorAll(s)];
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const menu=$('.menu-toggle'),mobileNav=$('#mobile-nav');
function closeMenu(){if(!menu)return;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');mobileNav.hidden=true;document.body.classList.remove('menu-open');document.querySelector('main').inert=false;document.querySelector('footer').inert=false;menu.querySelector('span').textContent='MENU';}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';if(open){closeMenu();return;}menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-label','Close menu');mobileNav.hidden=false;document.body.classList.add('menu-open');document.querySelector('main').inert=true;document.querySelector('footer').inert=true;menu.querySelector('span').textContent='CLOSE';mobileNav.querySelector('a')?.focus();});
document.addEventListener('keydown',e=>{if(e.key!=='Tab'||menu?.getAttribute('aria-expanded')!=='true')return;const stops=[menu,...$$('a',mobileNav)];const first=stops[0],last=stops.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
let headerFrame;const masthead=$('.masthead');const updateHeader=()=>{masthead?.classList.toggle('is-fixed',scrollY>Math.min(160,innerHeight*.2));headerFrame=null;};addEventListener('scroll',()=>{if(!headerFrame)headerFrame=requestAnimationFrame(updateHeader);},{passive:true});updateHeader();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
$$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMenu));
const roof=$('#roof-video'),layerImage=$('#layer-image'),scrub=$('#roof-scrub');
const layers=[['structure','The framework carries the layers above it.','Is the concern limited to the covering, or is there more to understand beneath it?'],['deck','The deck forms a continuous base over the framing.','What is known about the deck, and what cannot be seen yet?'],['weather-barrier','A protective layer sits beneath the outer covering.','How do the layers connect around edges and openings?'],['shingles','The outer covering faces the weather every day.','Which areas show wear, and what does that mean for the proposed work?'],['ridge-drainage','Junctions, roof edges and the ridge connect the system.','What is happening where the roof changes direction or meets another surface?']];
if(roof){
 let overview=true,inView=false,examining=false;
 const load=()=>{const source=$('source[data-src]',roof);if(source){source.src=source.dataset.src;source.removeAttribute('data-src');roof.load();}};
 const shouldRun=()=>overview&&inView&&!examining&&!motionPreference.matches&&!document.hidden;
 const sync=()=>{if(shouldRun()){load();roof.play().then(()=>{if(!shouldRun())roof.pause();}).catch(()=>{});}else roof.pause();};
 const tabs=$$('[data-layer]');
 function selectLayer(tab){
  overview=tab.dataset.layer==='overview';
  tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1;});
  roof.hidden=!overview;layerImage.hidden=overview;$('.studio-controls').hidden=!overview;
  $('#layer-panel').setAttribute('aria-labelledby',tab.id);
  if(overview){$('#layer-description').textContent='A roof works as a connected system, from the framing to its outer covering.';$('#layer-question').textContent='Choose a layer to take a closer look at what it does.';}
  else{const layer=layers[Number(tab.dataset.layer)];layerImage.src='assets/diagram-'+layer[0]+'.svg';layerImage.alt=tab.textContent.replace(/\s+/g,' ').trim()+' — concept illustration';$('#layer-description').textContent=layer[1];$('#layer-question').textContent=layer[2];}
  sync();
 }
 tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectLayer(tab));tab.addEventListener('keydown',e=>{let i=index;if(['ArrowDown','ArrowRight'].includes(e.key))i=(i+1)%tabs.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))i=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();selectLayer(tabs[i]);tabs[i].focus();});});
 const clock=n=>'0:'+String(Math.floor(n)).padStart(2,'0');
 function updateTime(){const duration=Number.isFinite(roof.duration)?roof.duration:12;scrub.max=duration;scrub.value=roof.currentTime;$('#roof-time').textContent=clock(roof.currentTime)+' / '+clock(duration);scrub.setAttribute('aria-valuetext',Math.floor(roof.currentTime)+' seconds of '+Math.round(duration));}
 roof.addEventListener('loadedmetadata',updateTime);roof.addEventListener('timeupdate',updateTime);
 scrub.addEventListener('focus',()=>{examining=true;sync();});
 scrub.addEventListener('input',()=>{const value=Number(scrub.value);examining=true;roof.pause();load();const seek=()=>{roof.currentTime=Math.min(value,roof.duration);updateTime();};if(roof.readyState>=1)seek();else roof.addEventListener('loadedmetadata',seek,{once:true});});
 scrub.addEventListener('blur',()=>{examining=false;sync();});
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.12}).observe(roof.closest('.roof-studio'));
 document.addEventListener('visibilitychange',sync);motionPreference.addEventListener('change',sync);
}
// The notebook film follows the same automatic, visibility-aware behaviour as the hero.
const notebook=$('#notebook-video');
if(notebook){
 let inView=false;
 const shouldRun=()=>inView&&!document.hidden&&!motionPreference.matches;
 const sync=()=>{if(!shouldRun()){notebook.pause();return;}const source=$('source[data-src]',notebook);if(source){source.src=source.dataset.src;source.removeAttribute('data-src');notebook.load();}notebook.play().then(()=>{if(!shouldRun())notebook.pause();}).catch(()=>{});};
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.15}).observe(notebook);
 document.addEventListener('visibilitychange',sync);motionPreference.addEventListener('change',sync);
}
// A reader can hold a moving strip with the pointer, or focus it to scroll each review.
$$('.review-row').forEach(row=>{row.addEventListener('pointerdown',()=>row.classList.add('is-reading'));const release=()=>row.classList.remove('is-reading');row.addEventListener('pointerup',release);row.addEventListener('pointercancel',release);row.addEventListener('pointerleave',release);});
const concernLinks=$$('[data-concern-link]');if(concernLinks.length){const observer=new IntersectionObserver(entries=>{entries.filter(e=>e.isIntersecting).forEach(e=>concernLinks.forEach(link=>{const active=link.hash==='#'+e.target.id;link.classList.toggle('is-active',active);if(active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');}));},{rootMargin:'-20% 0px -45% 0px',threshold:0});$$('.concern-chapter').forEach(el=>observer.observe(el));}
const galleryFilters=$$('[data-filter]');galleryFilters.forEach(button=>button.addEventListener('click',()=>{galleryFilters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$$('[data-category]').forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.category!==button.dataset.filter;});}));
const imageDialog=$('#image-dialog');let lastGalleryButton, galleryItems=[], galleryIndex=0;
function showGalleryImage(index){
 galleryIndex=(index+galleryItems.length)%galleryItems.length;
 const button=galleryItems[galleryIndex];
 $('#lightbox-image').src=button.dataset.image;$('#lightbox-image').alt=button.dataset.caption;
 $('#lightbox-caption').textContent=button.dataset.caption;$('#lightbox-count').textContent=String(galleryIndex+1).padStart(2,'0')+' / '+String(galleryItems.length).padStart(2,'0');
}
$$('.image-open').forEach(button=>button.addEventListener('click',()=>{lastGalleryButton=button;galleryItems=$$('.image-open').filter(item=>!item.closest('[data-category]').hidden);showGalleryImage(galleryItems.indexOf(button));imageDialog.showModal();$('.dialog-close',imageDialog).focus();}));
$('[data-gallery-prev]')?.addEventListener('click',()=>showGalleryImage(galleryIndex-1));
$('[data-gallery-next]')?.addEventListener('click',()=>showGalleryImage(galleryIndex+1));
imageDialog?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showGalleryImage(galleryIndex+(e.key==='ArrowRight'?1:-1));}});
$('.dialog-close')?.addEventListener('click',()=>imageDialog.close());
imageDialog?.addEventListener('close',()=>lastGalleryButton?.focus());
imageDialog?.addEventListener('click',e=>{if(e.target===imageDialog){const r=imageDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)imageDialog.close();}});
let galleryTouchX;
$('#lightbox-image')?.addEventListener('touchstart',e=>{galleryTouchX=e.touches.length===1?e.touches[0].clientX:undefined;},{passive:true});
$('#lightbox-image')?.addEventListener('touchend',e=>{if(galleryTouchX===undefined)return;const delta=e.changedTouches[0].clientX-galleryTouchX;if(Math.abs(delta)>60)showGalleryImage(galleryIndex+(delta<0?1:-1));galleryTouchX=undefined;},{passive:true});
const detailButtons=$$('[data-detail]');const detailContent={ridge:['The ridge is the upper line where two sloping roof surfaces meet.','58%','9%'],course:['Shingle courses are the overlapping rows of the outer covering.','64%','30%'],edge:['The roof edge is where the covering ends, above the eave and gutter.','28%','38%']};
function selectDetail(button){const [copy,x,y]=detailContent[button.dataset.detail];$('#detail-copy').textContent=copy;$('#detail-copy').setAttribute('aria-labelledby',button.id);const marker=$('#detail-marker'),art=$('.annotation-image img');marker.style.left=(art.offsetLeft+art.clientWidth*parseFloat(x)/100)+'px';marker.style.top=(art.offsetTop+art.clientHeight*parseFloat(y)/100)+'px';detailButtons.forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});}
detailButtons.forEach((button,index)=>{button.addEventListener('click',()=>selectDetail(button));button.addEventListener('keydown',e=>{let next=index;if(e.key==='ArrowRight')next=(index+1)%3;else if(e.key==='ArrowLeft')next=(index+2)%3;else if(e.key==='Home')next=0;else if(e.key==='End')next=2;else return;e.preventDefault();selectDetail(detailButtons[next]);detailButtons[next].focus();});});
if(detailButtons.length){const syncDetail=()=>selectDetail(detailButtons.find(b=>b.getAttribute('aria-selected')==='true')||detailButtons[0]);$('.annotation-image img').addEventListener('load',syncDetail);new ResizeObserver(syncDetail).observe($('.annotation-image img'));syncDetail();}
const search=$('#faq-search'),clearSearch=$('#faq-clear');
function filterQuestions(){const term=search.value.trim().toLowerCase();let count=0;$$('[data-faq]').forEach(faq=>{faq.hidden=!faq.textContent.toLowerCase().includes(term);if(!faq.hidden)count++;});$('#faq-result').textContent=term?count+' matching '+(count===1?'question':'questions'):'';$('#faq-empty').hidden=count!==0;clearSearch.hidden=!search.value;}
search?.addEventListener('input',filterQuestions);
clearSearch?.addEventListener('click',()=>{search.value='';filterQuestions();search.focus();});
const form=$('#inspection-form');
if(form){
 form.noValidate=true;let currentStep=1,requestText='';const preview=$('#request-preview');
 const options=$$('input[name=concern]',form);const concern=new URLSearchParams(location.search).get('concern');const selected=options.find(input=>input.value===concern);if(selected)selected.checked=true;
 function step(n){currentStep=n;$$('[data-step]',form).forEach(panel=>panel.hidden=Number(panel.dataset.step)!==n);$$('[data-progress]').forEach(item=>{item.classList.toggle('active',Number(item.dataset.progress)===n);item.setAttribute('aria-current',Number(item.dataset.progress)===n?'step':'false');});form.hidden=n===3;preview.hidden=n!==3;if(n!==3){const panel=$('[data-step="'+n+'"]',form);const target=$('input',panel);target?.focus({preventScroll:true});panel.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth',block:'start'});}else{$('#request-preview-title').focus({preventScroll:true});preview.scrollIntoView({behavior:motionPreference.matches?'auto':'smooth',block:'start'});}}
 function valid(n){for(const input of $$('input,textarea',$('[data-step="'+n+'"]',form))){if(!input.checkValidity()){input.reportValidity();return false;}}return true;}
 $$('[data-next]').forEach(button=>button.addEventListener('click',()=>{if(valid(currentStep))step(Number(button.dataset.next));}));$$('[data-back]').forEach(button=>button.addEventListener('click',()=>step(Number(button.dataset.back))));
 form.addEventListener('submit',e=>{e.preventDefault();if(currentStep===1){if(valid(1))step(2);return;}if(!valid(2))return;const values=new FormData(form),summary=$('#request-summary');summary.replaceChildren();const lines=['ENERGY MASTER SOLUTIONS — INSPECTION REQUEST PREVIEW','Nothing has been sent or booked.',''];for(const [key,label]of [['concern','Concern'],['message','Notes'],['name','Name'],['email','Email'],['area','Property area'],['phone','Phone']]){const value=String(values.get(key)||'').trim();if(!value)continue;const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;summary.append(dt,dd);lines.push(label+': '+value);}requestText=lines.join('\n');$('#copy-status').textContent='';step(3);});
 $('#copy-request').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(requestText);$('#copy-status').textContent='Request text copied. Nothing has been sent.';}catch{$('#copy-status').textContent='Copy is unavailable in this browser. Select the preview text, or download it below.';}});
 $('#download-request').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([requestText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='energy-master-inspection-request.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#copy-status').textContent='Request downloaded to your device. Nothing has been sent.';});
}
})();
