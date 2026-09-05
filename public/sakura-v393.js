/* Sakura V3.9.3 — Living Scene & Cinematic Motion behavior layer */
/* Legacy opening builders stay disabled; their non-opening decoration remains available. */
window.__SAKURA_TARGET_VERSION='v3.9.6';

const v394Href='/sakura-v394.css';
if(!document.querySelector(`link[href="${v394Href}"]`)){
  const link=document.createElement('link');link.rel='stylesheet';link.href=v394Href;document.head.appendChild(link);
}
await import('./sakura-v394.js');

const v395Href='/sakura-v395.css';
if(!document.querySelector(`link[href="${v395Href}"]`)){
  const link=document.createElement('link');link.rel='stylesheet';link.href=v395Href;document.head.appendChild(link);
}
await import('./sakura-v395.js');

/* V3.9.6 CSS stays as mobile baseline; its opening JS is intentionally not imported. */
const v396Href='/sakura-v396.css';
if(!document.querySelector(`link[href="${v396Href}"]`)){
  const link=document.createElement('link');link.rel='stylesheet';link.href=v396Href;document.head.appendChild(link);
}

/* Opening core remains V4.5.2. V4.5.3 plaque is loaded directly by index.html. */
window.__SAKURA_TARGET_VERSION='v4.5.2';
let v45Link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href.includes('/sakura-v45.css'));
if(!v45Link){v45Link=document.createElement('link');v45Link.rel='stylesheet'}
v45Link.href='/sakura-v45.css?v=452';
document.head.appendChild(v45Link);
await import('./sakura-v45.js?v=452');
document.body.dataset.sakuraFinalCandidate='v4.5.3';

/* Keep Date baseline styling only; all older Date slideshow JS stays disabled. */
let v47Link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href.includes('/sakura-v47.css'));
if(!v47Link){v47Link=document.createElement('link');v47Link.rel='stylesheet'}
v47Link.href='/sakura-v47.css?v=473';
document.head.appendChild(v47Link);

/* Keep smooth section seam CSS only; no separate seam observer. */
let v483Link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href.includes('/sakura-v483.css'));
if(!v483Link){v483Link=document.createElement('link');v483Link.rel='stylesheet'}
v483Link.href='/sakura-v483.css?v=483';
document.head.appendChild(v483Link);

/* V5.0.2 TOOLS ENGINE ADAPTER: viewport-triggered guaranteed local slideshow. */
let v50Link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href.includes('/sakura-v50.css'));
if(!v50Link){v50Link=document.createElement('link');v50Link.rel='stylesheet'}
v50Link.href='/sakura-v50.css?v=502';
document.head.appendChild(v50Link);
await import('./sakura-v50.js?v=502');
document.documentElement.dataset.sakuraInterior='v5.0.2-tools-engine';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const lowPower = navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
const sections = [...document.querySelectorAll('[data-sakura-scene]')];

function setupDelayedPanels(){
  if(!sections.length) return ()=>{};
  const delayed = sections.filter(section => section.dataset.sakuraScene !== 'opening' && section.querySelector('.paper-card,.story-carousel,.form-card,.gift-card,.message-list'));
  delayed.forEach(section=>section.dataset.v393Panel = reduceMotion ? 'ready' : 'waiting');
  if(reduceMotion) return ()=>{};
  const timers = new Map();
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const section = entry.target;
      if(entry.isIntersecting && entry.intersectionRatio >= .28 && section.dataset.v393Panel !== 'ready'){
        const delay = lowPower ? 180 : (coarse ? 220 : 360);
        clearTimeout(timers.get(section));
        const timer = setTimeout(()=>{
          section.dataset.v393Panel='ready';
          section.classList.add('panel-focused');
          timers.delete(section);
          observer.unobserve(section);
        },delay);
        timers.set(section,timer);
      }
    });
  },{threshold:[.18,.28,.45],rootMargin:'-8% 0px -8% 0px'});
  delayed.forEach(section=>observer.observe(section));
  return ()=>{observer.disconnect();timers.forEach(clearTimeout);timers.clear()};
}

/* Legacy fake-camera function retained only for rollback reference; V5.0 owns artwork motion. */
function setupFakeCameraDepth(){return ()=>{}}

function setupButterflies(){
  /* Decorative flight stays desktop-only; mobile/low-power remains light. */
  if(reduceMotion || lowPower || coarse) return ()=>{};
  const targets = sections.filter(s=>['couple','event','wishes','closing'].includes(s.dataset.sakuraScene));
  targets.forEach((section,sceneIndex)=>{
    const layer=document.createElement('div');
    layer.className='v393-butterfly-layer';
    const amount=2;
    layer.innerHTML=Array.from({length:amount},(_,i)=>{
      const left=12+((sceneIndex*23+i*31)%72);
      const top=12+((sceneIndex*17+i*27)%56);
      const flight=12+((i+sceneIndex)%4)*2;
      const delay=-(i*2.4+sceneIndex*.8);
      return `<span class="v393-butterfly" style="left:${left}%;top:${top}%;--flight:${flight}s;--delay:${delay}s"><i></i></span>`;
    }).join('');
    section.appendChild(layer);
  });
  return ()=>document.querySelectorAll('.v393-butterfly-layer').forEach(n=>n.remove());
}

/* Legacy scene-focus observer retained only for rollback reference; V5.0 owns scene activation. */
function setupSceneFocus(){return ()=>{}}

function setupCopyFeedback(){
  const buttons=[...document.querySelectorAll('.copy-demo')];
  const local=[];
  buttons.forEach(button=>{
    const onClick=()=>{button.classList.add('is-copied');const t=setTimeout(()=>button.classList.remove('is-copied'),900);local.push(()=>clearTimeout(t));};
    button.addEventListener('click',onClick);local.push(()=>button.removeEventListener('click',onClick));
  });
  return ()=>local.forEach(fn=>fn());
}

function setupVisibilityGuard(){
  const onVisibility=()=>document.documentElement.classList.toggle('v393-paused',document.hidden);
  document.addEventListener('visibilitychange',onVisibility);onVisibility();
  return ()=>document.removeEventListener('visibilitychange',onVisibility);
}

const cleanup=[setupDelayedPanels(),setupButterflies(),setupCopyFeedback(),setupVisibilityGuard()];
addEventListener('pagehide',()=>cleanup.forEach(fn=>fn?.()),{once:true});
