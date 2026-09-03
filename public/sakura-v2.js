import { initSakuraEffects } from './effects/sakura-global.js';

const gsap = window.gsap;
const scene = document.querySelector('#sakuraV2');
const artwork = document.querySelector('#sakuraArtwork');
const guard = document.querySelector('#assetGuard');
const invitation = document.querySelector('#invitationMain');
const effects = initSakuraEffects(document);

function lockScroll(){
  document.body.classList.add('cover-locked');
  document.body.classList.remove('cover-open');
}

function unlockScroll(){
  document.body.classList.remove('cover-locked');
  document.body.classList.add('cover-open');
}

function showAssetGuard(){
  if(guard) guard.hidden = false;
  scene?.classList.add('asset-missing');
}

artwork?.addEventListener('error', showAssetGuard, {once:true});
artwork?.addEventListener('load', ()=>{
  if(guard) guard.hidden = true;
  scene?.classList.remove('asset-missing');
}, {once:true});

function finishOpen(){
  scene?.classList.remove('is-opening');
  scene?.classList.add('is-open','is-dismissed');
  invitation?.setAttribute('aria-hidden','false');
  effects.setPetalIntensity(.58);
  unlockScroll();
  window.scrollTo(0,0);
}

function openScene(){
  if(!scene || scene.classList.contains('is-open') || scene.classList.contains('is-opening')) return;
  scene.classList.add('is-opening');
  effects.setPetalIntensity(.72);

  if(effects.reduced || !gsap){
    scene.style.display='none';
    finishOpen();
    return;
  }

  const tl = gsap.timeline({defaults:{overwrite:'auto'},onComplete:finishOpen});
  tl.to('#openInvitation',{scale:.96,duration:.12,ease:'power1.out'})
    .to('.wedding-label,.guest-copy,.fine-rule',{opacity:0,y:-13,filter:'blur(2px)',duration:.4,stagger:.035,ease:'power2.in'},.06)
    .to('.couple-names',{opacity:0,y:-19,scale:.98,filter:'blur(4px)',duration:.58,ease:'power2.inOut'},.1)
    .to('#openInvitation',{opacity:0,y:14,scale:.98,filter:'blur(3px)',duration:.4,ease:'power2.in'},.18)
    .to('.lab-state',{opacity:0,duration:.24},.08)
    .to('.artwork-stage',{scale:1.065,y:-12,duration:1.08,ease:'power2.inOut'},.1)
    .to('.ambient-light',{opacity:.42,scale:1.05,duration:.88,ease:'power2.inOut'},.15)
    .to('.vintage-vignette',{opacity:.76,duration:.7,ease:'power1.inOut'},.2)
    .to(scene,{yPercent:-100,opacity:.18,duration:1.25,ease:'power3.inOut'},.48);
}

function setupCopyDemo(){
  document.querySelectorAll('.copy-demo').forEach(button=>{
    button.addEventListener('click',async()=>{
      const original=button.textContent;
      try{await navigator.clipboard?.writeText('000000000000')}catch{}
      button.textContent='Tersalin ✓';
      if(gsap) gsap.fromTo(button,{scale:.96},{scale:1,duration:.36,ease:'back.out(2)'});
      window.setTimeout(()=>button.textContent=original,1800);
    });
  });
}

function setupCountdown(){
  const root=document.querySelector('#sakuraCountdown');
  if(!root)return ()=>{};
  const target=new Date(root.dataset.target||'').getTime();
  if(!Number.isFinite(target))return ()=>{};
  const nodes={days:root.querySelector('[data-count="days"]'),hours:root.querySelector('[data-count="hours"]'),minutes:root.querySelector('[data-count="minutes"]'),seconds:root.querySelector('[data-count="seconds"]')};
  let last={};
  const render=()=>{
    const diff=Math.max(0,target-Date.now());
    const values={days:Math.floor(diff/86400000),hours:Math.floor(diff/3600000)%24,minutes:Math.floor(diff/60000)%60,seconds:Math.floor(diff/1000)%60};
    Object.entries(values).forEach(([key,value])=>{
      const node=nodes[key];if(!node)return;
      const text=String(value).padStart(2,'0');
      if(last[key]!==text){
        node.textContent=text;
        const card=node.closest('.count-item');
        card?.classList.remove('tick');
        requestAnimationFrame(()=>card?.classList.add('tick'));
        last[key]=text;
      }
    });
  };
  render();
  const timer=window.setInterval(render,1000);
  return ()=>window.clearInterval(timer);
}

function setupStoryCarousel(){
  const track=document.querySelector('#storyTrack');
  if(!track)return ()=>{};
  const slides=[...track.querySelectorAll('.story-card')];
  const dots=document.querySelector('#storyDots');
  const prev=document.querySelector('[data-story-prev]');
  const next=document.querySelector('[data-story-next]');
  if(slides.length<2)return ()=>{};
  let index=0;
  let timer=0;
  dots.innerHTML=slides.map((_,i)=>`<i class="${i===0?'is-active':''}"></i>`).join('');
  const dotNodes=[...dots.children];
  const go=value=>{
    index=(value+slides.length)%slides.length;
    track.style.transform=`translate3d(${-index*100}%,0,0)`;
    slides.forEach((slide,i)=>slide.classList.toggle('is-current',i===index));
    dotNodes.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
  };
  const restart=()=>{
    window.clearInterval(timer);
    if(!effects.reduced)timer=window.setInterval(()=>go(index+1),5200);
  };
  const onPrev=()=>{go(index-1);restart()};
  const onNext=()=>{go(index+1);restart()};
  prev?.addEventListener('click',onPrev);next?.addEventListener('click',onNext);
  track.parentElement?.addEventListener('pointerenter',()=>window.clearInterval(timer));
  track.parentElement?.addEventListener('pointerleave',restart);
  restart();
  return ()=>{window.clearInterval(timer);prev?.removeEventListener('click',onPrev);next?.removeEventListener('click',onNext)};
}

function setupSceneChoreography(){
  const sections=[...document.querySelectorAll('[data-sakura-scene]')];
  if(!sections.length)return ()=>{};
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!visible)return;
    const section=visible.target;
    const intensity=Number(section.dataset.petalIntensity||.5);
    effects.setPetalIntensity(intensity);
    sections.forEach(s=>s.classList.toggle('is-scene-active',s===section));
    document.documentElement.dataset.sakuraScene=section.dataset.sakuraScene||'';
  },{threshold:[.22,.45,.7],rootMargin:'-12% 0px -12% 0px'});
  sections.forEach(section=>observer.observe(section));
  return ()=>observer.disconnect();
}

function setupMusicSeal(){
  const button=document.querySelector('#musicSeal');
  if(!button)return ()=>{};
  const onClick=()=>{
    const hasAudio=Boolean(document.querySelector('audio[data-sakura-music]'));
    if(!hasAudio){
      button.animate?.([{transform:'scale(1)'},{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});
      button.title='Audio asli belum dipasang';
      return;
    }
  };
  button.addEventListener('click',onClick);
  return ()=>button.removeEventListener('click',onClick);
}

const cleanups=[setupCountdown(),setupStoryCarousel(),setupSceneChoreography(),setupMusicSeal()];

document.querySelector('#openInvitation')?.addEventListener('click',openScene);
window.addEventListener('beforeunload',()=>window.scrollTo(0,0));
window.addEventListener('pagehide',()=>{cleanups.forEach(fn=>fn?.());effects.destroy()},{once:true});

setupCopyDemo();
invitation?.setAttribute('aria-hidden','true');
lockScroll();
