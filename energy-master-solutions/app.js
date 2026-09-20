const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const hero=document.querySelector('#hero-video');
hero.poster=window.matchMedia('(max-width: 760px)').matches?'assets/hero-mobile-poster.jpg':'assets/hero-poster.jpg';
const heroToggle=document.querySelector('#hero-toggle');
let heroUserPaused=false;
function loadVideo(video){video.querySelectorAll('source[data-src]').forEach(source=>{source.src=source.dataset.src;source.removeAttribute('data-src')});video.load();}
function syncHero(){const playing=!hero.paused;heroToggle.setAttribute('aria-label',playing?'Pause background video':'Play background video');heroToggle.querySelector('[aria-hidden]').textContent=playing?'Ⅱ':'▶';heroToggle.querySelector('.toggle-label').textContent=playing?'Pause film':'Play film';}
hero.addEventListener('play',syncHero);hero.addEventListener('pause',syncHero);
heroToggle.addEventListener('click',()=>{if(hero.querySelector('[data-src]'))loadVideo(hero);if(hero.paused){heroUserPaused=false;hero.play().catch(syncHero)}else{heroUserPaused=true;hero.pause()}});
if(!reducedMotion.matches){loadVideo(hero);hero.play().catch(syncHero)}
const roofVideo=document.querySelector('#roof-video');const layerImage=document.querySelector('#layer-image');const roofReplay=document.querySelector('#roof-replay');
const layers=[['structure','The framework beneath the roof supports the layers above. Its condition is one part of the bigger picture.'],['deck','The roof deck provides a continuous base for the covering above it. What happens here matters to the whole system.'],['weather-barrier','A protective layer beneath the outer covering helps manage water. The right details depend on the roof system.'],['shingles','The outer surface takes the everyday weather. Looking at its condition can reveal where a closer inspection is needed.'],['ridge-drainage','Edges, junctions, and the ridge bring the system together. These details deserve a closer look, too.']];
const tabs=[...document.querySelectorAll('[data-layer]')];
function selectLayer(index){roofVideo.pause();roofVideo.hidden=true;layerImage.hidden=false;layerImage.src=`assets/diagram-${layers[index][0]}.svg`;layerImage.alt=`Illustration of ${tabs[index].querySelector('span').textContent.toLowerCase()}`;document.querySelector('#layer-description').textContent=layers[index][1];document.querySelector('#layer-panel').setAttribute('aria-labelledby',tabs[index].id);tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1});roofReplay.innerHTML='<span aria-hidden="true">↻</span> Play assembly';roofReplay.setAttribute('aria-label','Play roof assembly animation');}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectLayer(index));tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();selectLayer(next);tabs[next].focus()})});
function playRoof(){if(roofVideo.querySelector('[data-src]'))loadVideo(roofVideo);if(roofVideo.hidden||roofVideo.ended)roofVideo.currentTime=0;layerImage.hidden=true;roofVideo.hidden=false;roofVideo.play().catch(()=>selectLayer(0));}
roofVideo.addEventListener('play',()=>{roofReplay.innerHTML='<span aria-hidden="true">Ⅱ</span> Pause assembly';roofReplay.setAttribute('aria-label','Pause roof assembly animation')});
roofVideo.addEventListener('pause',()=>{roofReplay.innerHTML='<span aria-hidden="true">↻</span> Play assembly';roofReplay.setAttribute('aria-label','Play roof assembly animation')});
roofReplay.addEventListener('click',()=>{if(!roofVideo.paused)roofVideo.pause();else playRoof()});
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)hero.pause();else if(!heroUserPaused&&!reducedMotion.matches)hero.play().catch(syncHero)})},{threshold:.15});observer.observe(hero);
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){hero.pause();roofVideo.pause()}});
document.querySelectorAll('[data-concern]').forEach(link=>link.addEventListener('click',()=>{document.querySelector('#concern-select').value=link.dataset.concern}));
const filmDialog=document.querySelector('#film-dialog');const featureFilm=document.querySelector('#feature-film');
document.querySelector('#open-film').addEventListener('click',()=>{hero.pause();filmDialog.showModal();featureFilm.play().catch(()=>{})});
document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});dialog.addEventListener('close',()=>{if(dialog===filmDialog)featureFilm.pause()})});
document.querySelector('#inspection-form').addEventListener('submit',event=>{event.preventDefault();const data=new FormData(event.currentTarget);const list=document.querySelector('#request-summary');list.replaceChildren();[['name','Name'],['email','Email'],['area','Property area'],['concern','Reason'],['message','Details']].forEach(([key,label])=>{if(!data.get(key))return;const term=document.createElement('dt');term.textContent=label;const value=document.createElement('dd');value.textContent=data.get(key);list.append(term,value)});document.querySelector('#request-dialog').showModal()});

const roofScrub=document.querySelector('#roof-scrub');const roofTime=document.querySelector('#roof-time');
function displayRoofTime(){const duration=Number.isFinite(roofVideo.duration)?roofVideo.duration:12;roofScrub.max=duration;roofScrub.value=roofVideo.currentTime;const fmt=value=>'0:'+String(Math.floor(value)).padStart(2,'0');roofTime.textContent=fmt(roofVideo.currentTime)+' / '+fmt(duration);roofScrub.setAttribute('aria-valuetext',Math.floor(roofVideo.currentTime)+' seconds of '+Math.round(duration)+' seconds');}
roofVideo.addEventListener('loadedmetadata',displayRoofTime);roofVideo.addEventListener('timeupdate',displayRoofTime);
roofScrub.addEventListener('input',()=>{const desired=Number(roofScrub.value);if(roofVideo.querySelector('[data-src]')){loadVideo(roofVideo);roofVideo.addEventListener('loadedmetadata',()=>{roofVideo.currentTime=Math.min(desired,roofVideo.duration)},{once:true})}else roofVideo.currentTime=Math.min(desired,roofVideo.duration||12);roofVideo.pause();roofVideo.hidden=false;layerImage.hidden=true;displayRoofTime();});

// Keep the wireframe moving when visitors reach it; manual pause and layer selection stay paused.
if(!reducedMotion.matches)playRoof();
