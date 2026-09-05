/* Sakura V3.9.3 — Clean stable interior runtime */
/* Opening remains V4.5.2 + V4.5.3 plaque. Interior returns to the V4.8.3 visual stack. */
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

const v396Href='/sakura-v396.css';
if(!document.querySelector(`link[href="${v396Href}"]`)){
  const link=document.createElement('link');link.rel='stylesheet';link.href=v396Href;document.head.appendChild(link);
}

/* Opening core is still the locked V4.5.2 engine. */
window.__SAKURA_TARGET_VERSION='v4.5.2';
let v45Link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href.includes('/sakura-v45.css'));
if(!v45Link){v45Link=document.createElement('link');v45Link.rel='stylesheet'}
v45Link.href='/sakura-v45.css?v=452';
document.head.appendChild(v45Link);
await import('./sakura-v45.js?v=452');
document.body.dataset.sakuraFinalCandidate='v4.5.3';

/* Date keeps its established visual styling, but NO slideshow JS is loaded. */
let v47Link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href.includes('/sakura-v47.css'));
if(!v47Link){v47Link=document.createElement('link');v47Link.rel='stylesheet'}
v47Link.href='/sakura-v47.css?v=473';
document.head.appendChild(v47Link);

/* V4.8.3 is the last active interior polish layer. */
let v483Link=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href.includes('/sakura-v483.css'));
if(!v483Link){v483Link=document.createElement('link');v483Link.rel='stylesheet'}
v483Link.href='/sakura-v483.css?v=483';
document.head.appendChild(v483Link);
await import('./sakura-v483.js?v=483');
document.documentElement.dataset.sakuraInterior='v4.8.3-clean-reset';

/* Explicitly remove stale experiment DOM if a cached module created it before this runtime. */
document.querySelectorAll('.v491-shared-stage,.v492-date-stage,.v49-scene-bg,.v50-date-stage,.v50-living-art,.v503-date-stage').forEach(node=>node.remove());

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const lowPower=navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4);
const sections=[...document.querySelectorAll('[data-sakura-scene]')];

function setupDelayedPanels(){
  if(!sections.length)return ()=>{};
  const delayed=sections.filter(section=>section.dataset.sakuraScene!=='opening' && section.querySelector('.paper-card,.story-carousel,.form-card,.gift-card,.message-list'));
  delayed.forEach(section=>section.dataset.v393Panel=reduceMotion?'ready':'waiting');
  if(reduceMotion)return ()=>{};
  const timers=new Map();
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const section=entry.target;
      if(entry.isIntersecting && entry.intersectionRatio>=.28 && section.dataset.v393Panel!=='ready'){
        const delay=lowPower?160:(coarse?200:320);
        clearTimeout(timers.get(section));
        const timer=setTimeout(()=>{
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

function setupButterflies(){
  if(reduceMotion || lowPower || coarse)return ()=>{};
  const targets=sections.filter(s=>['couple','event','wishes','closing'].includes(s.dataset.sakuraScene));
  targets.forEach((section,sceneIndex)=>{
    const layer=document.createElement('div');
    layer.className='v393-butterfly-layer';
    layer.innerHTML=Array.from({length:2},(_,i)=>{
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

function setupCopyFeedback(){
  const buttons=[...document.querySelectorAll('.copy-demo')];
  const cleanup=[];
  buttons.forEach(button=>{
    const onClick=()=>{
      button.classList.add('is-copied');
      const timer=setTimeout(()=>button.classList.remove('is-copied'),900);
      cleanup.push(()=>clearTimeout(timer));
    };
    button.addEventListener('click',onClick);
    cleanup.push(()=>button.removeEventListener('click',onClick));
  });
  return ()=>cleanup.forEach(fn=>fn());
}

function setupVisibilityGuard(){
  const onVisibility=()=>document.documentElement.classList.toggle('v393-paused',document.hidden);
  document.addEventListener('visibilitychange',onVisibility);
  onVisibility();
  return ()=>document.removeEventListener('visibilitychange',onVisibility);
}

const cleanup=[setupDelayedPanels(),setupButterflies(),setupCopyFeedback(),setupVisibilityGuard()];
addEventListener('pagehide',()=>cleanup.forEach(fn=>fn?.()),{once:true});
