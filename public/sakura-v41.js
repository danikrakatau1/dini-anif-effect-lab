/* Sakura V4.1.1 — Reference-Accurate Step-by-Step Reveal reliability hardening */
let gsap=window.gsap;
const systemReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const params=new URLSearchParams(location.search);
/* Effect Lab defaults to motion ON. Use ?motion=reduced to explicitly test reduced motion. */
const reduceMotion=params.get('motion')==='reduced';
const coarse=matchMedia('(pointer: coarse)').matches;
const saveData=Boolean(navigator.connection?.saveData);
const lowMemory=Number(navigator.deviceMemory||8)<=4;
const opening=document.querySelector('.scene-opening');
const cover=document.querySelector('#sakuraV2');
const openButton=document.querySelector('#openInvitation');
const artworkSrc='/assets/sakura-v2-landscape.png';
let timeline=null;
let started=false;
let innerBorderTimer=0;
let armTimer=0;
let gsapRetryTimer=0;
let coverObserver=null;

function mark(state){
  if(document.body) document.body.dataset.v41State=state;
  document.documentElement.dataset.sakuraOpeningEngine='v4.1.1';
  document.documentElement.dataset.systemReducedMotion=systemReducedMotion?'1':'0';
}

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
  mark('ready');
}

function setStatic(){
  if(!opening)return;
  opening.classList.add('v41-complete');
  opening.dataset.v393Panel='ready';
  mark('reduced-static');
}

function prepare(){
  gsap=window.gsap||gsap;
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
  mark('prepared');

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
  mark('complete');
}

function play(){
  if(!opening)return;
  gsap=window.gsap||gsap;
  if(reduceMotion){setStatic();return}
  if(!gsap){
    mark('waiting-gsap');
    clearTimeout(gsapRetryTimer);
    gsapRetryTimer=setTimeout(()=>{started=false;start()},80);
    return;
  }
  const p=prepare();if(!p){started=false;return}
  const fast=coarse||saveData||lowMemory;
  const speed=fast ? .92 : 1;
  mark('playing-world');

  timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>settle(p)});

  /* 1 — WORLD: close crop pulls back until the full landscape is visible. */
  timeline
    .to(p.farImg,{scale:1,y:0,duration:1.72*speed,ease:'power2.inOut',onStart:()=>mark('world')},0)
    .to(p.mid,{opacity:.42,y:0,scale:1,duration:.9*speed,ease:'power2.out'},.24)
    .to(p.branches,{opacity:.48,x:0,y:0,scale:1,duration:.82*speed,ease:'power2.out'},.48)
    .to(p.floral,{opacity:.54,y:0,scale:1,duration:.82*speed,ease:'power2.out'},.7)
    .to(p.atmosphere,{opacity:.18,duration:.7*speed,ease:'sine.out'},.74)

  /* 2 — SEED: one thin vertical slit. */
    .to(p.slit,{opacity:1,height:'58%',duration:.42*speed,ease:'power2.out',onStart:()=>mark('slit')},1.56)

  /* 3 — PAPER BODY: slit expands into ivory paper. */
    .to(p.panel,{opacity:1,clipPath:'inset(0 0% 0 0% round 42px)',duration:.66*speed,ease:'power3.inOut',onStart:()=>mark('panel')},1.92)
    .to(p.slit,{opacity:0,duration:.2*speed,ease:'power1.out'},2.38)

  /* 4 — BORDER: maroon outer line, then gold inner line. */
    .to(p.border,{opacity:1,clipPath:'inset(0% 0 0 0)',duration:.72*speed,ease:'power2.inOut',onStart:()=>{
      mark('border');
      innerBorderTimer=setTimeout(()=>p.border?.classList.add('is-inner-drawn'),Math.round(360*speed));
    }},2.54)

  /* 5 — CREST. */
    .to(p.crest,{opacity:1,scale:1,rotation:45,duration:.44*speed,ease:'back.out(1.65)',onStart:()=>mark('crest')},3.18)

  /* 6 — CONTENT: deliberately one-by-one. */
    .to(p.eyebrow,{opacity:1,y:0,duration:.34*speed,ease:'power2.out',onStart:()=>mark('eyebrow')},3.48)
    .to(p.title,{opacity:1,y:0,duration:.5*speed,ease:'power3.out',onStart:()=>mark('title')},3.78)
    .to(p.rule,{opacity:1,y:0,duration:.32*speed,ease:'power2.out',onStart:()=>mark('divider')},4.16)
    .to(p.copy,{opacity:1,y:0,duration:.5*speed,ease:'power2.out',onStart:()=>mark('copy')},4.42)

  /* 7 — SETTLE. */
    .to(p.atmosphere,{opacity:.1,duration:.44*speed,ease:'sine.out'},4.7);
}

function start(){
  if(started)return;
  started=true;
  mark('starting');
  play();
}
function onOpeningReveal(){start()}
function onOpened(){if(!started)start()}
function onOpenClick(){
  /* Independent fallback: match the cover's .42s reveal trigger even if CustomEvent is missed. */
  clearTimeout(armTimer);
  armTimer=setTimeout(start,420);
  mark('armed');
}
function onVisibility(){if(!timeline)return;document.hidden?timeline.pause():timeline.resume()}
function coverHasPassedReveal(){
  return Boolean(cover?.classList.contains('is-opening')||cover?.classList.contains('is-open')||document.body.classList.contains('cover-open'));
}

buildStage();
window.__SAKURA_TARGET_VERSION='v4.1.1';
document.body.dataset.sakuraFinalCandidate='v4.1.1';
document.title='Sakura Vintage V4.1.1 Reliable Step-by-Step Reveal · Dini Anif Effect Lab';
if(reduceMotion)setStatic();

openButton?.addEventListener('click',onOpenClick,{capture:true});
window.addEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
window.addEventListener('sakura:opened',onOpened,{capture:true});
document.addEventListener('visibilitychange',onVisibility);

/* Fail-safe for slow module loading: observe cover state instead of relying only on past events. */
if(cover){
  coverObserver=new MutationObserver(()=>{if(!started&&coverHasPassedReveal())start()});
  coverObserver.observe(cover,{attributes:true,attributeFilter:['class']});
}
if(coverHasPassedReveal()) requestAnimationFrame(start);

window.addEventListener('pagehide',()=>{
  openButton?.removeEventListener('click',onOpenClick,{capture:true});
  window.removeEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  document.removeEventListener('visibilitychange',onVisibility);
  coverObserver?.disconnect();
  timeline?.kill();
  clearTimeout(innerBorderTimer);clearTimeout(armTimer);clearTimeout(gsapRetryTimer);
},{once:true});
