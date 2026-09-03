/* Sakura V3.9.3 — Living Scene & Cinematic Motion behavior layer */
const v394Href='/sakura-v394.css';
if(!document.querySelector(`link[href="${v394Href}"]`)){
  const link=document.createElement('link');link.rel='stylesheet';link.href=v394Href;document.head.appendChild(link);
}
await import('./sakura-v394.js');
document.body.dataset.sakuraFinalCandidate='v3.9.4';

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
        const delay = lowPower ? 260 : (coarse ? 360 : 480);
        clearTimeout(timers.get(section));
        const timer = setTimeout(()=>{
          section.dataset.v393Panel='ready';
          section.classList.add('panel-focused');
          timers.delete(section);
        },delay);
        timers.set(section,timer);
      }
    });
  },{threshold:[.18,.28,.45],rootMargin:'-8% 0px -8% 0px'});
  delayed.forEach(section=>observer.observe(section));
  return ()=>{observer.disconnect();timers.forEach(clearTimeout);timers.clear()};
}

function setupFakeCameraDepth(){
  if(reduceMotion || lowPower || !sections.length) return ()=>{};
  const artSections = sections.filter(s=>s.classList.contains('sakura-art-section') && s.dataset.sakuraScene!=='opening');
  if(!artSections.length) return ()=>{};
  let raf=0;
  const render=()=>{
    raf=0;
    const vh=innerHeight||1;
    artSections.forEach(section=>{
      const r=section.getBoundingClientRect();
      const progress=Math.max(-1,Math.min(1,(r.top+r.height/2-vh/2)/(vh*.9)));
      const proximity=1-Math.abs(progress);
      section.style.setProperty('--cam-y',`${progress*7}px`);
      section.style.setProperty('--cam-size',`${111 + proximity*3}%`);
    });
  };
  const onScroll=()=>{if(!raf)raf=requestAnimationFrame(render)};
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('sakura:stable-resize',onScroll);
  render();
  return ()=>{removeEventListener('scroll',onScroll);removeEventListener('sakura:stable-resize',onScroll);cancelAnimationFrame(raf)};
}

function setupButterflies(){
  if(reduceMotion) return ()=>{};
  const targets = sections.filter(s=>['opening','couple','event','wishes','closing'].includes(s.dataset.sakuraScene));
  targets.forEach((section,sceneIndex)=>{
    const layer=document.createElement('div');
    layer.className='v393-butterfly-layer';
    const amount = lowPower ? 1 : (coarse ? 2 : 3);
    layer.innerHTML=Array.from({length:amount},(_,i)=>{
      const left=12+((sceneIndex*23+i*31)%72);
      const top=12+((sceneIndex*17+i*27)%56);
      const flight=10+((i+sceneIndex)%4)*1.8;
      const delay=-(i*2.4+sceneIndex*.8);
      return `<span class="v393-butterfly" style="left:${left}%;top:${top}%;--flight:${flight}s;--delay:${delay}s"><i></i></span>`;
    }).join('');
    section.appendChild(layer);
  });
  return ()=>document.querySelectorAll('.v393-butterfly-layer').forEach(n=>n.remove());
}

function setupSceneFocus(){
  if(!sections.length) return ()=>{};
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible) return;
    sections.forEach(s=>s.classList.toggle('v393-active',s===visible.target));
    document.documentElement.style.setProperty('--v393-scene-index',String(sections.indexOf(visible.target)));
  },{threshold:[.25,.5,.72],rootMargin:'-14% 0px -14% 0px'});
  sections.forEach(s=>observer.observe(s));
  return ()=>observer.disconnect();
}

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

const cleanup=[setupDelayedPanels(),setupFakeCameraDepth(),setupButterflies(),setupSceneFocus(),setupCopyFeedback(),setupVisibilityGuard()];
addEventListener('pagehide',()=>cleanup.forEach(fn=>fn?.()),{once:true});
