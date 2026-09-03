/* Sakura V4.1 — Reference-Accurate Step-by-Step Reveal engine */
const gsap=window.gsap;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const saveData=Boolean(navigator.connection?.saveData);
const lowMemory=Number(navigator.deviceMemory||8)<=4;
const opening=document.querySelector('.scene-opening');
const artworkSrc='/assets/sakura-v2-landscape.png';
let timeline=null;
let started=false;
let innerBorderTimer=0;

function buildStage(){
  if(!opening||opening.querySelector(':scope > .v41-stage'))return;
  opening.querySelectorAll(':scope > .v394-opening-cinema,:scope > .v395-stage,:scope > .v396-stage,:scope > .v40-stage').forEach(node=>node.remove());
  const stage=document.createElement('div');
  stage.className='v41-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v40-far"><img src="${artworkSrc}" alt="" decoding="async" fetchpriority="high"></div>
    <div class="v40-mid"></div>
    <div class="v40-branches"></div>
    <div class="v40-floral"></div>
    <div class="v40-atmosphere"></div>
    <div class="v41-slit"></div>
    <div class="v41-border"></div>
    <div class="v41-crest"></div>`;
  opening.insertBefore(stage,opening.firstChild);
}

function setStatic(){
  if(!opening)return;
  opening.classList.add('v41-complete');
  opening.dataset.v393Panel='ready';
}

function prepare(){
  if(!opening||!gsap)return null;
  timeline?.kill();
  clearTimeout(innerBorderTimer);
  const far=opening.querySelector('.v40-far'),farImg=far?.querySelector('img');
  const mid=opening.querySelector('.v40-mid');
  const branches=opening.querySelector('.v40-branches');
  const floral=opening.querySelector('.v40-floral');
  const atmosphere=opening.querySelector('.v40-atmosphere');
  const slit=opening.querySelector('.v41-slit');
  const border=opening.querySelector('.v41-border');
  const crest=opening.querySelector('.v41-crest');
  const panel=opening.querySelector(':scope > .inv-shell');
  const eyebrow=opening.querySelector('.inv-eyebrow');
  const title=opening.querySelector('.inv-title');
  const rule=opening.querySelector('.inv-rule');
  const copy=opening.querySelector('.inv-copy');
  const moving=[farImg,mid,branches,floral,atmosphere,slit,border,crest,panel,eyebrow,title,rule,copy].filter(Boolean);

  opening.classList.remove('v40-playing','v40-complete','v41-complete');
  opening.classList.add('v41-playing');
  opening.dataset.v393Panel='waiting';
  document.documentElement.classList.add('v41-intro-active');
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  gsap.killTweensOf(moving);
  border?.classList.remove('is-inner-drawn');

  [farImg,mid,branches,floral,panel,border].forEach(el=>{if(el)el.style.willChange='transform,opacity,clip-path'});
  gsap.set(farImg,{scale:1.18,y:-18,x:0,transformOrigin:'50% 50%'});
  gsap.set(mid,{opacity:0,y:12,scale:1.07});
  gsap.set(branches,{opacity:0,x:12,y:-14,scale:1.055});
  gsap.set(floral,{opacity:0,y:22,scale:1.045});
  gsap.set(atmosphere,{opacity:0});
  gsap.set(slit,{opacity:0,height:0});
  gsap.set(panel,{opacity:0,clipPath:'inset(0 49.8% 0 49.8% round 42px)'});
  gsap.set(border,{opacity:0,clipPath:'inset(100% 0 0 0)'});
  gsap.set(crest,{opacity:0,scale:.5,rotation:45,xPercent:-50,transformOrigin:'50% 50%'});
  gsap.set([eyebrow,title,rule,copy],{opacity:0,y:12});

  return{farImg,mid,branches,floral,atmosphere,slit,border,crest,panel,eyebrow,title,rule,copy};
}

function settle(p){
  opening.classList.remove('v41-playing');
  opening.classList.add('v41-complete');
  opening.dataset.v393Panel='ready';
  document.documentElement.classList.remove('v41-intro-active');
  [p.farImg,p.mid,p.branches,p.floral,p.panel,p.border].forEach(el=>{if(el)el.style.willChange='auto'});
  if(p.slit)p.slit.style.visibility='hidden';
  if(coarse||saveData||lowMemory){p.mid?.remove();p.branches?.remove();p.floral?.remove()}
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:(coarse ? .22 : .34)}}));
}

function play(){
  if(!opening)return;
  if(reduceMotion||!gsap){setStatic();return}
  const p=prepare();if(!p)return;
  const fast=coarse||saveData||lowMemory;
  const speed=fast ? .92 : 1;

  timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>settle(p)});

  /* 1 — WORLD: reference-style pull-back, no panel yet. */
  timeline
    .to(p.farImg,{scale:1,y:0,duration:1.72*speed,ease:'power2.inOut'},0)
    .to(p.mid,{opacity:.42,y:0,scale:1,duration:.9*speed,ease:'power2.out'},.24)
    .to(p.branches,{opacity:.48,x:0,y:0,scale:1,duration:.82*speed,ease:'power2.out'},.48)
    .to(p.floral,{opacity:.54,y:0,scale:1,duration:.82*speed,ease:'power2.out'},.7)
    .to(p.atmosphere,{opacity:.18,duration:.7*speed,ease:'sine.out'},.74)

  /* 2 — SEED: one thin vertical slit appears after the landscape opens. */
    .to(p.slit,{opacity:1,height:'58%',duration:.42*speed,ease:'power2.out'},1.56)

  /* 3 — PAPER BODY: slit expands into the ivory panel, border still absent. */
    .to(p.panel,{opacity:1,clipPath:'inset(0 0% 0 0% round 42px)',duration:.66*speed,ease:'power3.inOut'},1.92)
    .to(p.slit,{opacity:0,duration:.2*speed,ease:'power1.out'},2.38)

  /* 4 — BORDER: outer maroon line draws bottom-to-top, inner gold line follows. */
    .to(p.border,{opacity:1,clipPath:'inset(0% 0 0 0)',duration:.72*speed,ease:'power2.inOut',onStart:()=>{
      innerBorderTimer=setTimeout(()=>p.border?.classList.add('is-inner-drawn'),Math.round(360*speed));
    }},2.54)

  /* 5 — CREST: only after the frame exists. */
    .to(p.crest,{opacity:1,scale:1,rotation:45,duration:.44*speed,ease:'back.out(1.65)'},3.18)

  /* 6 — CONTENT: deliberately one-by-one. */
    .to(p.eyebrow,{opacity:1,y:0,duration:.34*speed,ease:'power2.out'},3.48)
    .to(p.title,{opacity:1,y:0,duration:.5*speed,ease:'power3.out'},3.78)
    .to(p.rule,{opacity:1,y:0,duration:.32*speed,ease:'power2.out'},4.16)
    .to(p.copy,{opacity:1,y:0,duration:.5*speed,ease:'power2.out'},4.42)

  /* 7 — SETTLE: background calms after the full invitation hierarchy is built. */
    .to(p.atmosphere,{opacity:.1,duration:.44*speed,ease:'sine.out'},4.7);
}

function start(){if(started)return;started=true;play()}
function onOpeningReveal(){start()}
function onOpened(){if(!started)start()}
function onVisibility(){if(!timeline)return;document.hidden?timeline.pause():timeline.resume()}

buildStage();
window.__SAKURA_TARGET_VERSION='v4.1';
document.body.dataset.sakuraFinalCandidate='v4.1';
document.title='Sakura Vintage V4.1 Step-by-Step Reveal · Dini Anif Effect Lab';
if(reduceMotion)setStatic();
window.addEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
window.addEventListener('sakura:opened',onOpened,{capture:true});
document.addEventListener('visibilitychange',onVisibility);
window.addEventListener('pagehide',()=>{
  window.removeEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  document.removeEventListener('visibilitychange',onVisibility);
  timeline?.kill();clearTimeout(innerBorderTimer);
},{once:true});
