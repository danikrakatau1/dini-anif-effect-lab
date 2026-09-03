import { initSakuraEffects } from './effects/sakura-global.js';
import { initSakuraStability } from './effects/sakura-stability.js';

const gsap = window.gsap;
const scene = document.querySelector('#sakuraV2');
const artwork = document.querySelector('#sakuraArtwork');
const guard = document.querySelector('#assetGuard');
const invitation = document.querySelector('#invitationMain');
const stability = initSakuraStability();
const effects = initSakuraEffects(document);
const coarsePointer = matchMedia('(pointer: coarse)').matches;

function lockScroll(){document.body.classList.add('cover-locked');document.body.classList.remove('cover-open')}
function unlockScroll(){document.body.classList.remove('cover-locked');document.body.classList.add('cover-open')}
function showAssetGuard(){if(guard)guard.hidden=false;scene?.classList.add('asset-missing')}
artwork?.addEventListener('error',showAssetGuard,{once:true});
artwork?.addEventListener('load',()=>{if(guard)guard.hidden=true;scene?.classList.remove('asset-missing')},{once:true});

function finishOpen(){
  scene?.classList.remove('is-opening');scene?.classList.add('is-open','is-dismissed');
  invitation?.setAttribute('aria-hidden','false');effects.setPetalIntensity(stability.lowPower||coarsePointer ? .38 : .58);unlockScroll();window.scrollTo(0,0);
  requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent('sakura:opened',{detail:{version:'v4.0.3'}})));
}
function openScene(){
  if(!scene||scene.classList.contains('is-open')||scene.classList.contains('is-opening'))return;
  scene.classList.add('is-opening');effects.setPetalIntensity(stability.lowPower||coarsePointer ? .42 : .72);
  if(effects.reduced||!gsap){
    window.dispatchEvent(new CustomEvent('sakura:opening-reveal',{detail:{version:'v4.0.3'}}));
    scene.style.display='none';finishOpen();return
  }
  const tl=gsap.timeline({defaults:{overwrite:'auto'},onComplete:finishOpen});
  tl.to('#openInvitation',{scale:.96,duration:.12,ease:'power1.out'})
    .to('.wedding-label,.guest-copy,.fine-rule',{opacity:0,y:-13,filter:'blur(2px)',duration:.4,stagger:.035,ease:'power2.in'},.06)
    .to('.couple-names',{opacity:0,y:-19,scale:.98,filter:'blur(4px)',duration:.58,ease:'power2.inOut'},.1)
    .to('#openInvitation',{opacity:0,y:14,scale:.98,filter:'blur(3px)',duration:.4,ease:'power2.in'},.18)
    .to('.lab-state',{opacity:0,duration:.24},.08)
    .to('.artwork-image',{scale:1.055,y:-8,duration:1.08,ease:'power2.inOut'},.1)
    .to('.ambient-light',{opacity:.42,scale:1.05,duration:.88,ease:'power2.inOut'},.15)
    .to('.vintage-vignette',{opacity:.76,duration:.7,ease:'power1.inOut'},.2)
    .add(()=>window.dispatchEvent(new CustomEvent('sakura:opening-reveal',{detail:{version:'v4.0.3'}})),.42)
    .to(scene,{yPercent:-100,opacity:.18,duration:1.25,ease:'power3.inOut'},.48);
}

function setupCopyDemo(){
  const disposers=[];
  document.querySelectorAll('.copy-demo').forEach(button=>{
    const click=async()=>{
      const original=button.textContent;try{await navigator.clipboard?.writeText('000000000000')}catch{}
      button.textContent='Tersalin ✓';if(gsap)gsap.fromTo(button,{scale:.96},{scale:1,duration:.36,ease:'back.out(2)'});
      const timer=window.setTimeout(()=>button.textContent=original,1800);disposers.push(()=>clearTimeout(timer));
    };
    button.addEventListener('click',click);disposers.push(()=>button.removeEventListener('click',click));
  });
  return()=>disposers.splice(0).forEach(fn=>fn());
}

function setupCountdown(){
  const root=document.querySelector('#sakuraCountdown');if(!root)return()=>{};
  const target=new Date(root.dataset.target||'').getTime();if(!Number.isFinite(target))return()=>{};
  const nodes={days:root.querySelector('[data-count="days"]'),hours:root.querySelector('[data-count="hours"]'),minutes:root.querySelector('[data-count="minutes"]'),seconds:root.querySelector('[data-count="seconds"]')};let last={};
  const render=()=>{const diff=Math.max(0,target-Date.now());const values={days:Math.floor(diff/86400000),hours:Math.floor(diff/3600000)%24,minutes:Math.floor(diff/60000)%60,seconds:Math.floor(diff/1000)%60};Object.entries(values).forEach(([key,value])=>{const node=nodes[key];if(!node)return;const text=String(value).padStart(2,'0');if(last[key]!==text){node.textContent=text;const card=node.closest('.count-item');card?.classList.remove('tick');requestAnimationFrame(()=>card?.classList.add('tick'));last[key]=text}})};
  render();const timer=window.setInterval(render,1000);return()=>window.clearInterval(timer);
}

function setupStoryCarousel(){
  const track=document.querySelector('#storyTrack');if(!track)return()=>{};
  const slides=[...track.querySelectorAll('.story-card')],dots=document.querySelector('#storyDots'),prev=document.querySelector('[data-story-prev]'),next=document.querySelector('[data-story-next]');if(slides.length<2)return()=>{};
  let index=0,timer=0,startX=null,startY=null;
  dots.innerHTML=slides.map((_,i)=>`<i class="${i===0?'is-active':''}"></i>`).join('');const dotNodes=[...dots.children];
  const go=value=>{index=(value+slides.length)%slides.length;track.style.transform=`translate3d(${-index*100}%,0,0)`;slides.forEach((slide,i)=>slide.classList.toggle('is-current',i===index));dotNodes.forEach((dot,i)=>dot.classList.toggle('is-active',i===index))};
  const restart=()=>{clearInterval(timer);if(!effects.reduced&&!document.hidden)timer=setInterval(()=>go(index+1),stability.lowPower||coarsePointer?6800:5200)};
  const onPrev=()=>{go(index-1);restart()},onNext=()=>{go(index+1);restart()};
  const viewport=track.parentElement;
  const down=e=>{startX=e.clientX;startY=e.clientY;clearInterval(timer)};
  const up=e=>{if(startX==null)return;const dx=e.clientX-startX,dy=e.clientY-startY;startX=startY=null;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.25)go(index+(dx<0?1:-1));restart()};
  prev?.addEventListener('click',onPrev);next?.addEventListener('click',onNext);viewport?.addEventListener('pointerenter',()=>clearInterval(timer));viewport?.addEventListener('pointerleave',restart);viewport?.addEventListener('pointerdown',down,{passive:true});viewport?.addEventListener('pointerup',up,{passive:true});viewport?.addEventListener('pointercancel',restart,{passive:true});restart();
  return()=>{clearInterval(timer);prev?.removeEventListener('click',onPrev);next?.removeEventListener('click',onNext);viewport?.removeEventListener('pointerdown',down);viewport?.removeEventListener('pointerup',up)};
}

function setupSceneChoreography(){
  const sections=[...document.querySelectorAll('[data-sakura-scene]')];if(!sections.length)return()=>{};
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;const section=visible.target;const raw=Number(section.dataset.petalIntensity||.5);effects.setPetalIntensity(stability.lowPower||coarsePointer?Math.min(raw,.42):raw);sections.forEach(s=>s.classList.toggle('is-scene-active',s===section));document.documentElement.dataset.sakuraScene=section.dataset.sakuraScene||''},{threshold:[.22,.45,.7],rootMargin:'-12% 0px -12% 0px'});
  sections.forEach(section=>observer.observe(section));return()=>observer.disconnect();
}

function setupContinuityPetals(){
  const layer=document.querySelector('#continuityPetals');if(!layer||effects.reduced)return()=>{};
  const count=stability.lowPower?4:(effects.coarse?5:10);layer.innerHTML=Array.from({length:count},(_,i)=>{const left=(i*83+17)%100,size=5+(i%5)*1.4,dur=10+(i%6)*1.7,delay=-(i*1.9),drift=-34+(i%7)*13,alpha=.22+(i%4)*.09,blur=0;return `<i class="continuity-petal" style="left:${left}%;--size:${size}px;--dur:${dur}s;--delay:${delay}s;--drift:${drift}px;--alpha:${alpha};--blur:${blur}px;--rot:${i*19}deg"></i>`}).join('');
  return()=>{layer.innerHTML=''};
}

function setupScrollContinuity(){
  const sections=[...document.querySelectorAll('[data-sakura-scene]')];if(!sections.length||effects.reduced||stability.lowPower||coarsePointer)return()=>{};let raf=0;
  const render=()=>{raf=0;const vh=innerHeight||1;let best=null,bestDistance=Infinity;sections.forEach(section=>{const r=section.getBoundingClientRect(),center=r.top+r.height/2,distance=Math.abs(center-vh/2);if(distance<bestDistance){bestDistance=distance;best=section}const progress=Math.max(-1,Math.min(1,(center-vh/2)/(vh*.9)));section.style.setProperty('--local-shift',`${progress*-12}px`);section.style.setProperty('--local-scale',String(1-Math.abs(progress)*.012));section.style.setProperty('--local-opacity',String(1-Math.min(.12,Math.abs(progress)*.08)));section.style.setProperty('--handoff-opacity',String(.36+Math.max(0,1-Math.abs(progress))*.28))});if(best){const idx=sections.indexOf(best);document.documentElement.style.setProperty('--continuity-x',`${((idx%3)-1)*8}px`);document.documentElement.style.setProperty('--continuity-y',`${((idx%2)?1:-1)*6}px`)}};
  const onScroll=()=>{if(!raf)raf=requestAnimationFrame(render)};addEventListener('scroll',onScroll,{passive:true});addEventListener('sakura:stable-resize',onScroll);render();return()=>{removeEventListener('scroll',onScroll);removeEventListener('sakura:stable-resize',onScroll);cancelAnimationFrame(raf)};
}

function setupGalleryLightbox(){
  const tiles=[...document.querySelectorAll('.gallery-tile')];if(!tiles.length)return()=>{};
  const box=document.createElement('div');box.className='gallery-lightbox';box.setAttribute('aria-hidden','true');box.innerHTML='<div class="gallery-lightbox-card" role="dialog" aria-modal="true" aria-label="Preview gallery"><div class="gallery-lightbox-art"></div><button class="gallery-lightbox-close" type="button" aria-label="Tutup">×</button><div class="gallery-lightbox-caption"><small>Sakura Vintage</small><strong>Moment</strong></div></div>';document.body.appendChild(box);
  const caption=box.querySelector('.gallery-lightbox-caption strong'),art=box.querySelector('.gallery-lightbox-art');let lastFocus=null;
  const close=()=>{box.classList.remove('is-open');box.setAttribute('aria-hidden','true');document.body.classList.remove('lightbox-open');lastFocus?.focus?.()};
  const open=tile=>{lastFocus=document.activeElement;caption.textContent=tile.querySelector('span')?.textContent||'Moment';art.style.background=tile.classList.contains('gallery-art')?"linear-gradient(rgba(89,48,45,.06),rgba(39,23,24,.28)),url('/assets/sakura-v2-landscape.png') center/cover no-repeat":"linear-gradient(145deg,#d9b796,#8c5f58)";box.classList.add('is-open');box.setAttribute('aria-hidden','false');document.body.classList.add('lightbox-open');box.querySelector('.gallery-lightbox-close')?.focus()};
  const handlers=tiles.map(tile=>{const click=()=>open(tile),key=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(tile)}};tile.addEventListener('click',click);tile.addEventListener('keydown',key);return()=>{tile.removeEventListener('click',click);tile.removeEventListener('keydown',key)}});
  const closeBtn=box.querySelector('.gallery-lightbox-close'),onClose=()=>close(),onBackdrop=e=>{if(e.target===box)close()},onKey=e=>{if(e.key==='Escape'&&box.classList.contains('is-open'))close()};closeBtn?.addEventListener('click',onClose);box.addEventListener('click',onBackdrop);document.addEventListener('keydown',onKey);
  return()=>{handlers.forEach(fn=>fn());closeBtn?.removeEventListener('click',onClose);box.removeEventListener('click',onBackdrop);document.removeEventListener('keydown',onKey);box.remove()};
}

function setupMusicSeal(){
  const button=document.querySelector('#musicSeal');if(!button)return()=>{};const audio=document.querySelector('audio[data-sakura-music]');button.dataset.audioState=audio?'ready':'missing';button.classList.toggle('is-ready',Boolean(audio));
  const sync=()=>{const playing=Boolean(audio&&!audio.paused);button.classList.toggle('is-playing',playing);button.classList.toggle('is-ready',Boolean(audio)&&!playing);button.setAttribute('aria-pressed',String(playing))};
  const onClick=async()=>{if(!audio){button.animate?.([{transform:'scale(1)'},{transform:'scale(.94)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});button.title='Audio asli belum dipasang';return}if(audio.paused){try{await audio.play()}catch{}}else audio.pause();sync()};
  button.addEventListener('click',onClick);audio?.addEventListener('play',sync);audio?.addEventListener('pause',sync);sync();return()=>{button.removeEventListener('click',onClick);audio?.removeEventListener('play',sync);audio?.removeEventListener('pause',sync)};
}

const cleanups=[setupCopyDemo(),setupCountdown(),setupStoryCarousel(),setupSceneChoreography(),setupContinuityPetals(),setupScrollContinuity(),setupGalleryLightbox(),setupMusicSeal()];
document.querySelector('#openInvitation')?.addEventListener('click',openScene);
window.addEventListener('beforeunload',()=>window.scrollTo(0,0));
window.addEventListener('pagehide',()=>{cleanups.forEach(fn=>fn?.());effects.destroy();stability.destroy()},{once:true});
invitation?.setAttribute('aria-hidden','true');lockScroll();
