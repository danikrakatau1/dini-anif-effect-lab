/* Sakura V4.0.2 — No-Blank Seamless Reveal behavior */
const gsap=window.gsap;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const saveData=Boolean(navigator.connection?.saveData);
const lowMemory=Number(navigator.deviceMemory||8)<=4;
const opening=document.querySelector('.scene-opening');
const openButton=document.querySelector('#openInvitation');
const artworkSrc='/assets/sakura-v2-landscape.png';
let timeline=null;
let started=false;

function buildStage(){
  if(!opening||opening.querySelector(':scope > .v40-stage'))return;
  opening.querySelectorAll(':scope > .v394-opening-cinema,:scope > .v395-stage,:scope > .v396-stage').forEach(node=>node.remove());
  const petalCount=(coarse||saveData||lowMemory)?5:8;
  const stage=document.createElement('div');
  stage.className='v40-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v40-plate v40-far"><img src="${artworkSrc}" alt="" decoding="async" fetchpriority="high"></div>
    <div class="v40-plate v40-mid"></div>
    <div class="v40-plate v40-branches"></div>
    <div class="v40-plate v40-floral"></div>
    <div class="v40-atmosphere"></div>
    <div class="v40-light"></div>
    <div class="v40-veil"></div>
    <div class="v40-frame"></div>
    <div class="v40-shimmer"><i></i></div>
    <div class="v40-burst">${Array.from({length:petalCount},()=>'<i class="v40-petal"></i>').join('')}</div>`;
  opening.insertBefore(stage,opening.firstChild);
}

function setStatic(){
  if(!opening)return;
  opening.classList.add('v40-complete');
  opening.dataset.v393Panel='ready';
  const frame=opening.querySelector('.v40-frame');
  const panel=opening.querySelector(':scope > .inv-shell');
  if(frame){frame.style.opacity='1';frame.style.transform='none'}
  if(panel){panel.style.opacity='1';panel.style.transform='none'}
}

function prepare(){
  if(!opening||!gsap)return null;
  timeline?.kill();
  const far=opening.querySelector('.v40-far'),farImg=far?.querySelector('img');
  const mid=opening.querySelector('.v40-mid');
  const branches=opening.querySelector('.v40-branches');
  const floral=opening.querySelector('.v40-floral');
  const atmosphere=opening.querySelector('.v40-atmosphere');
  const light=opening.querySelector('.v40-light');
  const veil=opening.querySelector('.v40-veil');
  const frame=opening.querySelector('.v40-frame');
  const shimmer=opening.querySelector('.v40-shimmer'),shimmerBar=shimmer?.querySelector('i');
  const burst=opening.querySelector('.v40-burst'),petals=[...opening.querySelectorAll('.v40-petal')];
  const panel=opening.querySelector(':scope > .inv-shell');
  const eyebrow=opening.querySelector('.inv-eyebrow'),title=opening.querySelector('.inv-title'),rule=opening.querySelector('.inv-rule'),copy=opening.querySelector('.inv-copy');
  const moving=[far,farImg,mid,branches,floral,atmosphere,light,veil,frame,shimmer,shimmerBar,panel,eyebrow,title,rule,copy,...petals].filter(Boolean);

  opening.classList.remove('v40-complete');opening.classList.add('v40-playing');opening.dataset.v393Panel='waiting';
  document.documentElement.classList.add('v40-intro-active');
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  gsap.killTweensOf(moving);

  [farImg,mid,branches,floral,frame,panel].forEach(el=>{if(el)el.style.willChange='transform,opacity'});
  gsap.set(far,{opacity:1});gsap.set(farImg,{scale:1.045,y:8});
  gsap.set(mid,{opacity:0,y:18,scale:1.045});
  gsap.set(branches,{opacity:0,x:14,y:-20,scale:1.035});
  gsap.set(floral,{opacity:0,y:27,scale:1.025});
  gsap.set(atmosphere,{opacity:0});gsap.set(light,{opacity:0,xPercent:-18});
  gsap.set(veil,{clipPath:'inset(0 50% 0 50%)',opacity:.46});
  gsap.set(frame,{opacity:0,y:8,scale:.94});
  gsap.set(shimmer,{opacity:0});gsap.set(shimmerBar,{xPercent:0});
  gsap.set(panel,{opacity:0,y:18,scale:.975});
  gsap.set([eyebrow,title,rule,copy],{opacity:0,y:10});

  petals.forEach((petal,i)=>{
    const angle=-145+i*(290/Math.max(1,petals.length-1));
    const radius=60+(i%3)*20;
    petal.dataset.x=String(Math.cos(angle*Math.PI/180)*radius);
    petal.dataset.y=String(Math.sin(angle*Math.PI/180)*radius-12);
    gsap.set(petal,{x:0,y:4,rotation:-30+i*23,scale:.54+(i%2)*.13,opacity:0});
  });
  return{far,farImg,mid,branches,floral,atmosphere,light,veil,frame,shimmer,shimmerBar,burst,petals,panel,eyebrow,title,rule,copy};
}

function burstPetals(petals){
  if(!gsap||reduceMotion)return;
  petals.forEach((petal,i)=>{
    const x=Number(petal.dataset.x||0),y=Number(petal.dataset.y||0);
    gsap.fromTo(petal,{x:0,y:4,opacity:0,rotation:-25+i*18},{x,y,opacity:.78,rotation:120+i*28,duration:.58+(i%2)*.08,ease:'power2.out',delay:i*.02,onComplete:()=>gsap.to(petal,{x:x+(i%2?12:-10),y:y+36,opacity:0,duration:.4,ease:'power1.in'})});
  });
}

function settle(p){
  opening.classList.remove('v40-playing');opening.classList.add('v40-complete');opening.dataset.v393Panel='ready';
  document.documentElement.classList.remove('v40-intro-active');
  [p.farImg,p.mid,p.branches,p.floral,p.frame,p.panel].forEach(el=>{if(el)el.style.willChange='auto'});
  if(p.light)p.light.style.visibility='hidden';if(p.veil)p.veil.style.visibility='hidden';if(p.shimmer)p.shimmer.style.visibility='hidden';if(p.burst)p.burst.innerHTML='';
  if(coarse||saveData||lowMemory){p.mid?.remove();p.branches?.remove();p.floral?.remove()}
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:(coarse ? .24 : .36)}}));
}

function play(){
  if(!opening)return;
  if(reduceMotion||!gsap){setStatic();return}
  const p=prepare();if(!p)return;
  const fast=coarse||saveData||lowMemory;
  const speed=(fast ? .9 : 1);
  timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>settle(p)});
  timeline
    .to(p.farImg,{scale:1.012,y:0,duration:1.25*speed,ease:'power2.out'},0)
    .to(p.veil,{clipPath:'inset(0 0% 0 0%)',opacity:.1,duration:.38*speed,ease:'power3.inOut'},.02)
    .to(p.mid,{opacity:.78,y:0,scale:1,duration:.58*speed,ease:'power3.out'},.16)
    .to(p.branches,{opacity:.82,x:0,y:0,scale:1,duration:.62*speed,ease:'power3.out'},.42)
    .to(p.floral,{opacity:.86,y:0,scale:1,duration:.62*speed,ease:'power3.out'},.52)
    .to(p.atmosphere,{opacity:.32,duration:.38*speed,ease:'power1.out'},.48)
    .to(p.light,{opacity:.4,xPercent:175,duration:.68*speed,ease:'power2.inOut'},.62)
    .add(()=>burstPetals(p.petals),.78)
    .to(p.frame,{opacity:1,y:0,scale:1.014,duration:.46*speed,ease:'back.out(1.45)'},.94)
    .to(p.frame,{scale:1,duration:.16*speed,ease:'power2.out'},1.34)
    .to(p.shimmer,{opacity:1,duration:.04},1.08)
    .to(p.shimmerBar,{xPercent:620,duration:.42*speed,ease:'power2.inOut'},1.1)
    .to(p.shimmer,{opacity:0,duration:.12},1.5)
    .to(p.panel,{opacity:1,y:0,scale:1,duration:.52*speed,ease:'power3.out'},1.38)
    .to(p.eyebrow,{opacity:1,y:0,duration:.26*speed,ease:'power2.out'},1.62)
    .to(p.title,{opacity:1,y:0,duration:.36*speed,ease:'power3.out'},1.74)
    .to(p.rule,{opacity:1,y:0,duration:.24*speed,ease:'power2.out'},1.92)
    .to(p.copy,{opacity:1,y:0,duration:.34*speed,ease:'power2.out'},2.02)
    .to(p.atmosphere,{opacity:.12,duration:.4*speed,ease:'power1.out'},2.22)
    .to(p.veil,{opacity:0,duration:.24*speed,ease:'power1.out'},2.26);
}

function start(){if(started)return;started=true;play()}
function onOpeningStart(){start()}
function onOpened(){if(!started)start()}
function onVisibility(){if(!timeline)return;document.hidden?timeline.pause():timeline.resume()}

buildStage();
window.__SAKURA_TARGET_VERSION='v4.0.2';
document.body.dataset.sakuraFinalCandidate='v4.0.2';
document.title='Sakura Vintage V4.0.2 No-Blank Seamless Reveal · Dini Anif Effect Lab';
if(reduceMotion)setStatic();
/* Capture click starts V4 under the still-visible fixed cover. */
openButton?.addEventListener('click',onOpeningStart,{capture:true});
window.addEventListener('sakura:opening-start',onOpeningStart,{capture:true});
window.addEventListener('sakura:opened',onOpened,{capture:true});
document.addEventListener('visibilitychange',onVisibility);
window.addEventListener('pagehide',()=>{openButton?.removeEventListener('click',onOpeningStart,{capture:true});window.removeEventListener('sakura:opening-start',onOpeningStart,{capture:true});window.removeEventListener('sakura:opened',onOpened,{capture:true});document.removeEventListener('visibilitychange',onVisibility);timeline?.kill()},{once:true});
