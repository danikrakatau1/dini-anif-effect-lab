/* Sakura V3.9.4 — Reference Motion + Ornament Rescue behavior */
const gsap = window.gsap;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const opening = document.querySelector('.scene-opening');
const artworkSrc = '/assets/sakura-v2-landscape.png';

function buildOrnaments(){
  const targets=[...document.querySelectorAll('.scene-couple,.scene-date,.scene-event,.scene-gift,.scene-closing')];
  targets.forEach(section=>{
    if(section.querySelector(':scope > .v394-ornament-layer')) return;
    const layer=document.createElement('div');
    layer.className='v394-ornament-layer';
    layer.setAttribute('aria-hidden','true');
    layer.innerHTML='<div class="v394-edge left"></div><div class="v394-edge right"></div><div class="v394-edge bottom"></div><div class="v394-frame"><span class="v394-medallion"></span></div>';
    section.insertBefore(layer,section.firstChild);
  });
}

function buildOpeningCinema(){
  if(!opening || opening.querySelector(':scope > .v394-opening-cinema')) return;
  const cinema=document.createElement('div');
  cinema.className='v394-opening-cinema';
  cinema.setAttribute('aria-hidden','true');
  cinema.innerHTML=`
    <div class="v394-opening-art"><img src="${artworkSrc}" alt="" decoding="async"></div>
    <div class="v394-opening-foreground"><img src="${artworkSrc}" alt="" decoding="async"></div>
    <div class="v394-opening-haze"></div>
    <div class="v394-opening-curtain"></div>
    <div class="v394-opening-frame"></div>`;
  opening.insertBefore(cinema,opening.firstChild);
}

function prepareOpeningText(){
  if(!opening || !gsap || reduceMotion) return;
  gsap.set(opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy'),{opacity:0,y:16,filter:'blur(5px)'});
}

function playOpeningSequence(){
  if(!opening) return;
  opening.classList.remove('v394-intro-complete');
  opening.classList.add('v394-playing');
  opening.dataset.v393Panel='waiting';

  if(reduceMotion || !gsap){
    opening.classList.remove('v394-playing');
    opening.classList.add('v394-intro-complete');
    opening.dataset.v393Panel='ready';
    return;
  }

  const artWrap=opening.querySelector('.v394-opening-art');
  const art=opening.querySelector('.v394-opening-art img');
  const foreground=opening.querySelector('.v394-opening-foreground');
  const foregroundImg=opening.querySelector('.v394-opening-foreground img');
  const haze=opening.querySelector('.v394-opening-haze');
  const curtain=opening.querySelector('.v394-opening-curtain');
  const frame=opening.querySelector('.v394-opening-frame');
  const panel=opening.querySelector(':scope > .inv-shell');
  const text=[...opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy')];

  gsap.killTweensOf([artWrap,art,foreground,foregroundImg,haze,curtain,frame,panel,...text]);
  gsap.set(artWrap,{clipPath:'inset(0 17% 0 17% round 34px)'});
  gsap.set(art,{scale:1.115,y:14,filter:'saturate(.82) sepia(.07) brightness(1.025)'});
  gsap.set(foreground,{y:34,opacity:.18});
  gsap.set(foregroundImg,{scale:1.16,y:28});
  gsap.set(haze,{opacity:0});
  gsap.set(curtain,{clipPath:'inset(0 50% 0 50%)',opacity:.9});
  gsap.set(frame,{opacity:0,scale:.9});
  gsap.set(panel,{opacity:0,y:30,scale:.95,filter:'blur(10px)'});
  gsap.set(text,{opacity:0,y:16,filter:'blur(5px)'});

  const tl=gsap.timeline({defaults:{overwrite:'auto'}});
  tl.to(curtain,{clipPath:'inset(0 0% 0 0%)',opacity:.18,duration:.85,ease:'power2.inOut'},0)
    .to(artWrap,{clipPath:'inset(0 0% 0 0% round 0px)',duration:1.15,ease:'power3.out'},.08)
    .to(art,{scale:1.045,y:-8,duration:2.6,ease:'power2.inOut'},.05)
    .to(haze,{opacity:.58,duration:.8,ease:'power1.out'},.45)
    .to(haze,{opacity:.2,duration:1.35,ease:'power1.inOut'},1.15)
    .to(foreground,{y:0,opacity:.9,duration:1.25,ease:'power3.out'},.68)
    .to(foregroundImg,{scale:1.08,y:0,duration:1.65,ease:'power2.out'},.68)
    .to(frame,{opacity:1,scale:1,duration:.95,ease:'back.out(1.25)'},1.25)
    .to(panel,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:1.05,ease:'power3.out'},1.9)
    .to(text,{opacity:1,y:0,filter:'blur(0px)',duration:.72,stagger:.16,ease:'power2.out'},2.25)
    .to(art,{scale:1.025,y:-3,duration:1.15,ease:'power2.out'},2.8)
    .to(foreground,{opacity:.72,duration:.8,ease:'power1.out'},3.1)
    .add(()=>{
      opening.classList.remove('v394-playing');
      opening.classList.add('v394-intro-complete');
      opening.dataset.v393Panel='ready';
    },3.65);
}

function setupSceneOrnamentMotion(){
  if(reduceMotion || !gsap) return ()=>{};
  const sections=[...document.querySelectorAll('.scene-couple,.scene-date,.scene-event,.scene-gift,.scene-closing')];
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting || entry.intersectionRatio<.28) return;
      const section=entry.target;
      const left=section.querySelector('.v394-edge.left');
      const right=section.querySelector('.v394-edge.right');
      const bottom=section.querySelector('.v394-edge.bottom');
      const frame=section.querySelector('.v394-frame');
      gsap.fromTo(left,{x:-14,opacity:.12},{x:0,opacity:.36,duration:1.05,ease:'power2.out'});
      gsap.fromTo(right,{x:14,opacity:.12},{x:0,opacity:.36,duration:1.05,ease:'power2.out'});
      gsap.fromTo(bottom,{y:18,opacity:.16},{y:0,opacity:.46,duration:1.2,ease:'power2.out'});
      gsap.fromTo(frame,{scale:.97,opacity:.2},{scale:1,opacity:1,duration:.95,ease:'power2.out'});
    });
  },{threshold:[.18,.28,.5],rootMargin:'-8% 0px -8% 0px'});
  sections.forEach(s=>observer.observe(s));
  return ()=>observer.disconnect();
}

buildOrnaments();
buildOpeningCinema();
prepareOpeningText();
const cleanupOrnaments=setupSceneOrnamentMotion();
window.addEventListener('sakura:opened',playOpeningSequence);
window.addEventListener('pagehide',()=>{
  window.removeEventListener('sakura:opened',playOpeningSequence);
  cleanupOrnaments?.();
},{once:true});
