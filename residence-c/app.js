import {mountModelViewer} from './model-view.js';

(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
  function scrollEaseStep(current, target, elapsed) {
    const distance = target - current;
    const dt = Math.min(Math.max(elapsed, 0), 0.05);
    if (!dt) return current;
    if (Math.abs(distance) <= Math.min(0.008, 6 * dt)) return target;
    const movement = distance * (1 - Math.exp(-dt / 0.12));
    return current + clamp(movement, -6 * dt, 6 * dt);
  }
  const rooms = [
    {id:'arrival',label:'Welcome',title:'Come on<br><em>inside.</em>',description:'Welcome to Residence C. Scroll or press Play to walk from the front door through every connected room.',facts:['Two bedrooms','One connected home'],dot:[242,302]},
    {id:'living',label:'Living',title:'Room to<br><em>come together.</em>',description:'A shared living and dining space, opening towards the balcony.',facts:['Living & dining','Balcony connection'],dot:[280,185]},
    {id:'master',label:'Master',title:'Your quiet<br><em>retreat.</em>',description:'A private bedroom with space to unwind and an ensuite of its own.',facts:['Master bedroom','Attached bathroom'],dot:[125,205]},
    {id:'ensuite',label:'Ensuite',title:'A slower<br><em>start.</em>',description:'The master bedroom leads into its own bathroom, with a shower and vanity.',facts:['Private access','Shower & vanity'],dot:[160,101]},
    {id:'bedroom',label:'Bedroom II',title:'Make room<br><em>for your life.</em>',description:'A second bedroom for family, guests, or whatever your next chapter needs.',facts:['Second bedroom','Fitted storage concept'],dot:[435,110]},
    {id:'kitchen',label:'Kitchen',title:'Small rituals.<br><em>Every day.</em>',description:'A fitted kitchen beside the dining area, with an adjoining utility space.',facts:['Kitchen','Separate utility'],dot:[343,292]},
    {id:'utility',label:'Utility',title:'Everything<br><em>in its place.</em>',description:'A dedicated utility area keeps everyday chores out of the living spaces.',facts:['Laundry space','Kitchen access'],dot:[436,292]},
    {id:'bathroom',label:'Common bath',title:'Thoughtful<br><em>by design.</em>',description:'A second bathroom is accessed from the shared living space.',facts:['Common bathroom','Shower & vanity'],dot:[470,217]},
    {id:'balcony',label:'Balcony',title:'A little<br><em>breathing room.</em>',description:'Step out from the living room and take a moment in the open.',facts:['Private balcony','Off the living room'],dot:[280,76]}
  ];
  const canvas = $('#tour-canvas');
  const tour = $('#tour');
  const stage = $('.tour-stage');
  const header = $('#header');
  const nav = $('#room-navigation');
  const playButton = $('#tour-play');
  const seek = $('#tour-seek');
  const detailsButton = $('#details-toggle');
  const film = $('#residence-film');
  function pauseFilm() { if (!film.paused) film.pause(); }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const debug = new URLSearchParams(location.search).get('debug') === '1';
  let manifest = null, scene = null, ready = false, activeChapter = -1;
  let playing = false, currentTime = 0, targetTime = 0, scrollEasing = false;
  let scrollLinked = !reduced.matches, ownScrollY = null, scrollScheduled = false;
  let animationFrame = 0, lastFrameTime = 0, renderedFrames = 0, loadGeneration = 0;
  let frameWindowStart = 0, frameWindowCount = 0, measuredFps = 0;
  let lastRenderMilliseconds = 0, lastError = null;
  const modelViewer=mountModelViewer({canvas,getScene:()=>scene,
    onOpen:()=>{pauseFilm();scrollEasing=false;pauseForInput();stopLoop();},
    onClose:()=>{positionTourControls();if(ready)renderCurrent();}
  });
  const duration = () => manifest?.duration_seconds || 0;
  const tourVisible = () => {
    const bounds = stage.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < window.innerHeight;
  };
  const formatTime = value => {
    const seconds = Math.max(0, Math.floor(value || 0));
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  };
  const chapterRoom = chapter => rooms.find(r => r.id === (chapter.room_id || chapter.id));
  const firstChapterForRoom = id => manifest?.chapters.find(c => (c.room_id || c.id) === id);
  const navigationTime = chapter => Number.isFinite(chapter?.navigation_seconds)
    ? chapter.navigation_seconds : chapter?.start_seconds;
  const sceneStats = () => {
    try { return typeof scene?.stats === 'function' ? scene.stats() : scene?.stats || {}; }
    catch { return {}; }
  };
  // Read-only diagnostics: the browser can inspect the actual clock and renderer.
  Object.defineProperty(window, '__residenceTour', {configurable: true, get: () => Object.freeze({
    mode: 'realtime-3d', ready, playing, scrollLinked, scrollEasing,
    time: currentTime, targetTime, duration: duration(), activeChapter,
    room: manifest?.chapters[activeChapter]?.room_id || manifest?.chapters[activeChapter]?.id || null,
    chapters: manifest?.chapters.length || 0, reducedMotion: reduced.matches,
    renderedFrames, fps: measuredFps, lastRenderMilliseconds, error: lastError,
    renderer: sceneStats()
  })});
  $('#tour-debug').hidden = !debug;

  function positionTourControls() {
    stage.style.setProperty('--opening-header-offset', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
  }
  function loading(message, failed = false) {
    $('#tour-loading').hidden = false;
    $('#tour-loading-message').textContent = message;
    $('#tour-retry').hidden = !failed;
    $('#tour-loading').classList.toggle('failed', failed);
    stage.setAttribute('aria-busy', String(!failed));
  }
  function status() {
    if (!ready) return;
    $('#tour-status').textContent = playing
      ? (scrollLinked ? 'Walking through · scroll to take control' : 'Walking through your home')
      : currentTime >= duration() - 0.03 ? 'Tour complete · play again or choose a room'
        : scrollLinked ? 'Scroll to walk through, or press Play' : 'Press Play or use the timeline to explore';
  }
  function controls() {
    modelViewer.refresh(ready);
    const length = duration();
    stage.classList.toggle('is-playing', playing);
    playButton.disabled = !ready;
    $('#scroll-toggle').disabled = !ready;
    seek.disabled = !ready;
    seek.max = length || 100;
    playButton.textContent = playing ? 'Pause tour' : currentTime >= length - 0.03 && ready ? 'Replay tour' : 'Play tour';
    nav.querySelectorAll('button').forEach((button, i) => {
      const chapter = firstChapterForRoom(rooms[i].id);
      button.disabled = !ready || !chapter || chapter.start_seconds >= length;
    });
    $('#previous-room').disabled = !ready || !manifest || activeChapter <= 0;
    const next = manifest?.chapters[activeChapter + 1];
    $('#next-room').disabled = !ready || !next || next.start_seconds >= length;
    status();
  }
  function updateRoom(time) {
    if (!manifest) return;
    const chapterTime = time + 0.001;
    let index = manifest.chapters.findIndex(c => chapterTime >= c.start_seconds && chapterTime < c.end_seconds);
    if (index < 0) index = manifest.chapters.reduce((last, c, i) => c.start_seconds <= time ? i : last, 0);
    if (index === activeChapter) return;
    activeChapter = index;
    const chapter = manifest.chapters[index], room = chapterRoom(chapter);
    stage.classList.toggle('is-arrival', room?.id === 'arrival');
    $('#room-number').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(manifest.chapters.length).padStart(2, '0');
    if (room) $('#room-title').innerHTML = room.title;
    else $('#room-title').textContent = chapter.label;
    $('#room-description').textContent = room?.description || 'Continue through the connected spaces of Residence C.';
    $('#room-facts').replaceChildren(...(room?.facts || ['Continuous walkthrough']).map(text => {
      const element = document.createElement('span'); element.textContent = text; return element;
    }));
    $('#room-location').textContent = (chapter.label || room?.label || '').toUpperCase();
    $('#plan-dot').style.opacity = room ? '1' : '0';
    if (room) { $('#plan-dot').setAttribute('cx', room.dot[0]); $('#plan-dot').setAttribute('cy', room.dot[1]); }
    nav.querySelectorAll('button').forEach((button, i) => {
      const selected = rooms[i].id === room?.id;
      button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected));
      if (selected) nav.scrollTo({left: button.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + button.clientWidth / 2, behavior: 'instant'});
    });
    controls();
  }
  function updatePlanPosition(time) {
    const points = manifest?.plan_path;
    if (!Array.isArray(points) || points.length < 2) return;
    let low = 0, high = points.length - 1;
    while (low + 1 < high) {
      const middle = (low + high) >> 1;
      if (points[middle][0] <= time) low = middle; else high = middle;
    }
    const a = points[low], b = points[high];
    const mix = clamp((time - a[0]) / Math.max(0.001, b[0] - a[0]), 0, 1);
    $('#plan-dot').setAttribute('cx', a[1] + (b[1] - a[1]) * mix);
    $('#plan-dot').setAttribute('cy', a[2] + (b[2] - a[2]) * mix);
    $('#plan-dot').style.opacity = '1';
  }
  function paint() {
    const length = duration();
    seek.value = currentTime;
    seek.style.setProperty('--progress', (length ? currentTime / length * 100 : 0) + '%');
    seek.setAttribute('aria-valuetext', formatTime(currentTime) + ' of ' + formatTime(length));
    $('#tour-time').textContent = formatTime(currentTime) + ' / ' + (length ? formatTime(length) : '—');
    updateRoom(currentTime); updatePlanPosition(currentTime);
    if (debug) $('#tour-debug').textContent = `LIVE 3D · ${measuredFps ? measuredFps.toFixed(0) + ' fps' : 'idle'} · ${lastRenderMilliseconds.toFixed(1)} ms submit · ${currentTime.toFixed(2)} s`;
  }
  function progress() {
    return clamp(-tour.getBoundingClientRect().top / Math.max(1, tour.offsetHeight - window.innerHeight), 0, 1);
  }
  function scrollToTime(time) {
    if (!scrollLinked || !duration()) return;
    ownScrollY = window.scrollY + tour.getBoundingClientRect().top
      + clamp(time / duration(), 0, 1) * Math.max(1, tour.offsetHeight - window.innerHeight);
    window.scrollTo({top: ownScrollY, behavior: 'instant'});
  }
  function stopLoop() {
    cancelAnimationFrame(animationFrame); animationFrame = 0; lastFrameTime = 0;
    frameWindowStart = 0; frameWindowCount = 0;
  }
  function pauseForInput() {
    if (playing) { playing = false; controls(); }
    if (!scrollEasing) stopLoop();
  }
  function renderCurrent() {
    if (!ready || !scene) return;
    try {
      const started = performance.now();
      scene.setTime(currentTime); scene.render();
      lastRenderMilliseconds = performance.now() - started;
      renderedFrames++; paint();
    } catch (error) {
      lastError = error?.message || String(error); ready = false; playing = false; scrollEasing = false;
      stopLoop(); controls(); loading('The 3D tour could not continue. Please reload the scene.', true);
      $('#tour-status').textContent = '3D walkthrough unavailable';
      console.error('Residence C renderer:', error);
    }
  }
  function scheduleFrame() {
    if (!animationFrame && ready && !document.hidden && tourVisible()) animationFrame = requestAnimationFrame(frame);
  }
  function frame(timestamp) {
    animationFrame = 0;
    if (!ready || document.hidden || !tourVisible()) { lastFrameTime = 0; return; }
    const dt = lastFrameTime ? clamp((timestamp - lastFrameTime) / 1000, 0, 0.1) : 0;
    lastFrameTime = timestamp;
    if (playing) {
      currentTime = Math.min(duration(), currentTime + dt);
      targetTime = currentTime;
      if (scrollLinked) scrollToTime(currentTime);
      if (currentTime >= duration()) { playing = false; controls(); }
    } else if (scrollEasing) {
      // Smooth scroll reversals while keeping one continuous camera in the live scene.
      currentTime = scrollEaseStep(currentTime, targetTime, dt);
      if (currentTime === targetTime) { scrollEasing = false; controls(); }
    }
    renderCurrent();
    if (!frameWindowStart) frameWindowStart = timestamp;
    frameWindowCount++;
    if (timestamp - frameWindowStart >= 500) {
      measuredFps = (frameWindowCount - 1) * 1000 / (timestamp - frameWindowStart);
      frameWindowCount = 1; frameWindowStart = timestamp;
    }
    if (playing || scrollEasing) scheduleFrame();
    else stopLoop();
  }
  function setTime(time) {
    currentTime = targetTime = clamp(time, 0, duration());
    scrollEasing = false; renderCurrent(); controls();
  }
  function easeToScrollTime(time) {
    if(document.body.classList.contains('dialog-open'))return;
    targetTime = clamp(time, 0, duration());
    if (!ready) return;
    if (!tourVisible() || reduced.matches) { setTime(targetTime); return; }
    scrollEasing = Math.abs(currentTime - targetTime) > 0.001;
    if (scrollEasing) scheduleFrame();
  }
  function onScroll() {
    positionTourControls();
    if (ownScrollY !== null && Math.abs(window.scrollY - ownScrollY) < 2) { ownScrollY = null; return; }
    ownScrollY = null;
    if (!ready || !scrollLinked || document.body.classList.contains('dialog-open')) return;
    pauseForInput();
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(() => { scrollScheduled = false; easeToScrollTime(progress() * duration()); });
    }
  }
  function jumpToTime(time) {
    if (!ready) return;
    pauseFilm();
    scrollEasing = false; pauseForInput(); setTime(time); scrollToTime(time);
    if (!scrollLinked) tour.scrollIntoView({behavior: 'instant', block: 'start'});
  }
  function jumpToRoom(id) {
    const chapter = firstChapterForRoom(id);
    if (ready && chapter && navigationTime(chapter) < duration()) jumpToTime(navigationTime(chapter));
  }
  function setScrollLinked(value) {
    const wasVisible = tourVisible();
    scrollEasing = false; pauseForInput(); scrollLinked = value;
    document.body.classList.toggle('tour-manual', !value);
    $('#scroll-toggle').textContent = value ? 'Scroll linked' : 'Link to scroll';
    $('#scroll-toggle').setAttribute('aria-pressed', String(value));
    $('#tour-scroll-hint').textContent = value ? 'SCROLL TO WALK THROUGH ↓' : 'PLAY OR SEEK AT YOUR PACE';
    if (ready && wasVisible) {
      if (value) scrollToTime(currentTime);
      else tour.scrollIntoView({behavior: 'instant', block: 'start'});
    }
    positionTourControls(); controls();
  }

  rooms.forEach(room => {
    const button = document.createElement('button');
    button.textContent = room.label; button.disabled = true;
    button.addEventListener('click', () => jumpToRoom(room.id)); nav.append(button);
  });
  detailsButton.addEventListener('click', () => {
    const show = detailsButton.getAttribute('aria-pressed') !== 'true';
    detailsButton.setAttribute('aria-pressed', String(show));
    detailsButton.textContent = show ? 'Details on' : 'Details off';
    $('#room-information').hidden = !show; $('#tour-position').hidden = !show;
  });
  // Focus controls without moving the document underneath the scroll-linked camera.
  stage.addEventListener('pointerdown', event => {
    const control = event.target.closest('button, input');
    if (control && !control.disabled) control.focus({preventScroll: true});
  });
  playButton.addEventListener('click', () => {
    if (!ready || document.body.classList.contains('dialog-open')) return;
    scrollEasing = false;
    if (playing) { pauseForInput(); return; }
    pauseFilm();
    if (currentTime >= duration() - 0.03) setTime(0);
    playing = true; scrollToTime(currentTime); controls(); scheduleFrame();
  });
  $('#scroll-toggle').addEventListener('click', () => setScrollLinked(!scrollLinked));
  seek.addEventListener('input', () => jumpToTime(Number(seek.value)));
  $('#previous-room').addEventListener('click', () => {
    if (ready) jumpToTime(navigationTime(manifest.chapters[Math.max(0, activeChapter - 1)]));
  });
  $('#next-room').addEventListener('click', () => {
    if (ready) jumpToTime(navigationTime(manifest.chapters[Math.min(manifest.chapters.length - 1, activeChapter + 1)]));
  });
  document.querySelectorAll('[data-room]').forEach(button => button.addEventListener('click', () => jumpToRoom(rooms[Number(button.dataset.room)].id)));
  // A return link is an explicit restart, not a long eased rewind from the last room.
  document.querySelectorAll('a[href="#home"], a[href="#tour"]').forEach(link => {
    link.addEventListener('click', event => {
      if (!ready) return;
      event.preventDefault(); jumpToTime(0);
      history.replaceState(null, '', link.getAttribute('href'));
    });
  });
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('wheel', event => { if (event.deltaY) pauseForInput(); }, {passive: true});
  window.addEventListener('touchmove', pauseForInput, {passive: true});
  window.addEventListener('keydown', event => {
    if(document.body.classList.contains('dialog-open'))return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)
      && !event.target.closest('input,textarea,select,button,dialog')) pauseForInput();
  });
  window.addEventListener('resize', () => {
    positionTourControls();
    if (ready) { scene.resize(); renderCurrent(); }
    if (scrollLinked && ready && tourVisible() && !document.body.classList.contains('dialog-open')) scrollToTime(currentTime);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pauseFilm(); scrollEasing = false; pauseForInput(); stopLoop(); }
  });
  document.querySelectorAll('.visit-trigger').forEach(button => button.addEventListener('click', () => {
    pauseFilm(); scrollEasing = false; pauseForInput();
  }));
  reduced.addEventListener('change', event => setScrollLinked(!event.matches));
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) { scrollEasing = false; pauseForInput(); }
  }).observe(stage);
  film.addEventListener('play', () => {
    if (document.hidden || document.body.classList.contains('dialog-open')) { pauseFilm(); return; }
    scrollEasing = false; pauseForInput(); stopLoop();
  });
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) pauseFilm();
  }).observe(film);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lastError = 'Graphics context lost'; ready = false; playing = false; scrollEasing = false;
    stopLoop(); controls(); loading('The browser paused the 3D scene. Reload it to continue.', true);
  });
  window.addEventListener('pagehide', () => { pauseFilm(); playing = false; scrollEasing = false; stopLoop(); });

  function validateManifest(data) {
    if (data.status !== 'realtime_ready') throw Error('The complete 3D tour is not ready yet');
    if (!Number.isFinite(data.duration_seconds) || data.duration_seconds <= 0 || !Array.isArray(data.chapters) || !data.chapters.length) throw Error('Invalid walkthrough chapters');
    let previousEnd = 0;
    for (const chapter of data.chapters) {
      if (typeof chapter.id !== 'string' || typeof chapter.label !== 'string'
        || !Number.isFinite(chapter.start_seconds) || !Number.isFinite(chapter.end_seconds)
        || Math.abs(chapter.start_seconds - previousEnd) > 0.1
        || chapter.end_seconds <= chapter.start_seconds || chapter.end_seconds > data.duration_seconds + 0.1) throw Error('Invalid chapter range');
      if (chapter.navigation_seconds !== undefined && (!Number.isFinite(chapter.navigation_seconds)
        || chapter.navigation_seconds < chapter.start_seconds || chapter.navigation_seconds >= chapter.end_seconds)) throw Error('Invalid room navigation pose');
      previousEnd = chapter.end_seconds;
    }
    if (Math.abs(previousEnd - data.duration_seconds) > 0.1) throw Error('The complete camera route is missing');
    if (rooms.some(room => !data.chapters.some(chapter => (chapter.room_id || chapter.id) === room.id))) throw Error('The complete room route is missing');
  }
  async function loadTour() {
    const generation = ++loadGeneration;
    const startupLayout = document.body.classList.contains('tour-pending');
    playing = false; scrollEasing = false; ready = false; lastError = null;
    stopLoop(); controls(); loading('Opening your home in 3D…');
    try {
      scene?.dispose(); scene = null;
      const response = await fetch('assets/realtime-tour.json', {cache: 'no-store'});
      if (!response.ok) throw Error('The 3D tour files could not load');
      const data = await response.json(); validateManifest(data);
      const {createTour} = await import('./realtime-scene.js');
      const loaded = await createTour({canvas, manifest: data, onProgress: progress => {
        if (generation !== loadGeneration) return;
        const message = typeof progress === 'string' ? progress : progress?.message;
        const fraction = typeof progress === 'number' ? progress : progress?.fraction;
        loading(message || (Number.isFinite(fraction) ? 'Opening your home in 3D… ' + Math.round(clamp(fraction, 0, 1) * 100) + '%' : 'Preparing the rooms and their lighting…'));
      }});
      if (generation !== loadGeneration) { loaded.dispose(); return; }
      const previousHeight = tour.offsetHeight, visitorBeyondTour = tour.getBoundingClientRect().bottom <= 0;
      scene = loaded; manifest = data; activeChapter = -1;
      document.body.classList.remove('tour-pending'); stage.classList.remove('awaiting-scene');
      stage.classList.toggle('has-plan-path', Array.isArray(data.plan_path) && data.plan_path.length > 1);
      if (visitorBeyondTour) {
        ownScrollY = window.scrollY + tour.offsetHeight - previousHeight;
        window.scrollTo({top: ownScrollY, behavior: 'instant'});
      }
      ready = true; canvas.hidden = false; positionTourControls(); scene.resize();
      currentTime = targetTime = scrollLinked ? progress() * duration() : clamp(currentTime, 0, duration());
      renderCurrent(); controls();
      if (ready) { $('#tour-loading').hidden = true; stage.setAttribute('aria-busy', 'false'); }
      if (startupLayout) requestAnimationFrame(() => {
        if (generation !== loadGeneration || !ready) return;
        // Pending mode has a short tour; loading expands it to the full scroll
        // length. Restore the current section fragment once after that layout,
        // rather than preserving a stale pre-load pixel offset or initial hash.
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        const target = document.getElementById(id);
        if (!target?.closest('main') || target === tour || tour.contains(target) || id === 'home') return;
        scrollEasing = false; pauseForInput(); stopLoop(); ownScrollY = null;
        target.scrollIntoView({behavior: 'instant', block: 'start'});
      });
    } catch (error) {
      if (generation !== loadGeneration) return;
      lastError = error?.message || String(error); ready = false; playing = false;
      scene?.dispose(); scene = null; controls();
      loading('The 3D walkthrough could not open. Please try again.', true);
      $('#tour-status').textContent = '3D walkthrough unavailable';
      console.error('Residence C loading:', error);
    }
  }
  $('#tour-retry').addEventListener('click', loadTour);
  new ResizeObserver(() => {
    positionTourControls();
    if (ready) { scene.resize(); renderCurrent(); }
  }).observe(canvas);
  new ResizeObserver(positionTourControls).observe(header);
  positionTourControls(); setScrollLinked(scrollLinked); loadTour();

  document.querySelectorAll('[data-plan]').forEach(button=>button.addEventListener('click',()=>{
    const source=button.dataset.plan==='source';$('#plan-image').src=source?'assets/floor-plan.png':'assets/overview.webp';$('#plan-image').alt=source?'Original supplied two-bedroom floor plan':'Cutaway 3D overview of the complete flat';$('#plan-caption').textContent=source?'RESIDENCE C / ORIGINAL DRAWING':'RESIDENCE C / FURNISHED CONCEPT';
    document.querySelectorAll('[data-plan]').forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
  }));

  const dialog=$('#enquiry-dialog');let returnFocus=null,draft='';
  document.querySelectorAll('.visit-trigger').forEach(b=>b.addEventListener('click',()=>{returnFocus=b;dialog.showModal();document.body.classList.add('dialog-open');}));
  $('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');returnFocus?.focus({preventScroll: true});});
  const nameInput=$('#enquiry-form input[name="name"]');
  nameInput.addEventListener('input',()=>nameInput.setCustomValidity(''));
  $('#enquiry-form').addEventListener('submit',e=>{
    e.preventDefault();
    if(!nameInput.value.trim()){nameInput.setCustomValidity('Please enter your name.');nameInput.reportValidity();return;}
    const d=new FormData(e.currentTarget);
    draft=['RESIDENCE C — ENQUIRY DRAFT','Not submitted. No visit has been booked.','',`Name: ${d.get('name').trim()}`,`Email: ${d.get('email').trim()}`,`Phone: ${d.get('phone').trim()||'Not provided'}`,`Interest: ${d.get('interest')}`,`Message: ${d.get('message').trim()||'No additional message'}`].join('\n');
    $('#enquiry-summary').textContent=draft;$('#enquiry-form-view').hidden=true;$('#enquiry-success').hidden=false;dialog.scrollTop=0;$('#download-enquiry').focus();
  });
  $('#download-enquiry').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([draft],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='residence-c-enquiry.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('#copy-enquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft);$('#copy-status').textContent='Copied. Nothing has been sent.';}catch{$('#copy-status').textContent='Copy is unavailable here. Download the draft instead.';}});
  $('#edit-enquiry').addEventListener('click',()=>{$('#enquiry-success').hidden=true;$('#enquiry-form-view').hidden=false;$('#enquiry-form input').focus();});
})();
