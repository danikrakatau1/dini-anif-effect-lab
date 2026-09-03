/* Sakura V3.9.6 — Mobile Performance Rescue behavior */
const gsap=window.gsap;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const saveData=Boolean(navigator.connection?.saveData);
const lowMemory=Number(navigator.deviceMemory||8)<=4;
const opening=document.querySelector('.scene-opening');
const artworkSrc='/assets/sakura-v2-landscape.png';
let timeline=null;

function buildLightStage(){
  if(!opening||opening.querySelector(':scope > .v396-stage'))return;
  opening.querySelectorAll(':scope > .v394-opening-cinema,:scope > .v395-stage').forEach(node=>node.remove());
  const petalCount=coarse||saveData||lowMemory?6:8;
  const stage=document.createElement('div');
  stage.className='v396-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v396-far"><img src="${artworkSrc}" alt="" decoding="async"></div>
    <div class="v396-near"><img src="${artworkSrc}" alt="" decoding="async"></div>
    <div class="v396-haze"></div>
    <div class="v396-beam"></div>
    <div class="v396-veil"></div>
    <div class="v396-portal"></div>
    <div class="v396-shimmer"><i></i></div>
    <div class="v396-burst">${Array.from({length:petalCount},()=>'<i class="v396-petal"></i>').join('')}</div>`;
  opening.insertBefore(stage,opening.firstChild);
}

function setStatic(){
  if(!opening)return;
  opening.classList.add('v396-complete');
  opening.dataset.v393Panel='ready';
  const portal=opening.querySelector('.v396-portal');
  const near=opening.querySelector('.v396-near');
  if(portal)portal.style.opacity='1';
  if(near)near.style.opacity='.34';
}

function prepare(){
  if(!opening||!gsap)return null;
  timeline?.kill();
  const far=opening.querySelector('.v396-far');
  const farImg=opening.querySelector('.v396-far img');
  const near=opening.querySelector('.v396-near');
  const nearImg=opening.querySelector('.v396-near img');
  const haze=opening.querySelector('.v396-haze');
  const beam=opening.querySelector('.v396-beam');
  const veil=opening.querySelector('.v396-veil');
  const portal=opening.querySelector('.v396-portal');
  const shimmer=opening.querySelector('.v396-shimmer');
  const shimmerBar=opening.querySelector('.v396-shimmer i');
  const burst=opening.querySelector('.v396-burst');
  const petals=[...opening.querySelectorAll('.v396-petal')];
  const panel=opening.querySelector(':scope > .inv-shell');
  const eyebrow=opening.querySelector('.inv-eyebrow');
  const title=opening.querySelector('.inv-title');
  const rule=opening.querySelector('.inv-rule');
  const copy=opening.querySelector('.inv-copy');

  opening.classList.remove('v396-complete');
  opening.classList.add('v396-playing');
  opening.dataset.v393Panel='waiting';
  document.documentElement.classList.add('v396-intro-active');
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));

  [farImg,nearImg,far,near,portal,panel].forEach(el=>{if(el)el.style.willChange='transform,opacity,clip-path'});
  gsap.killTweensOf([far,farImg,near,nearImg,haze,beam,veil,portal,shimmer,shimmerBar,panel,eyebrow,title,rule,copy,...petals]);
  gsap.set(far,{clipPath:'inset(0 12% 0 12% round 34px)'});
  gsap.set(farImg,{scale:1.115,y:14,x:0});
  gsap.set(near,{opacity:0,y:22,x:0});
  gsap.set(nearImg,{scale:1.155,y:24,x:0});
  gsap.set(haze,{opacity:0});
  gsap.set(beam,{opacity:0,xPercent:-25});
  gsap.set(veil,{clipPath:'inset(0 50% 0 50%)',opacity:.94});
  gsap.set(portal,{opacity:0,scale:.9,y:10});
  gsap.set(shimmer,{opacity:0});
  gsap.set(shimmerBar,{xPercent:0});
  gsap.set(panel,{opacity:0,y:22,scale:.965});
  gsap.set([eyebrow,title,rule,copy],{opacity:0,y:12});

  petals.forEach((petal,i)=>{
    const angle=-150+i*(300/Math.max(1,petals.length-1));
    const radius=70+(i%3)*24;
    petal.dataset.x=String(Math.cos(angle*Math.PI/180)*radius);
    petal.dataset.y=String(Math.sin(angle*Math.PI/180)*radius-18);
    gsap.set(petal,{x:0,y:6,rotation:-40+i*24,scale:.55+(i%2)*.15,opacity:0});
  });
  return{far,farImg,near,nearImg,haze,beam,veil,portal,shimmer,shimmerBar,burst,petals,panel,eyebrow,title,rule,copy};
}

function burstPetals(petals){
  if(!gsap||reduceMotion)return;
  petals.forEach((petal,i)=>{
    const x=Number(petal.dataset.x||0),y=Number(petal.dataset.y||0);
    gsap.fromTo(petal,{x:0,y:6,opacity:0,rotation:-35+i*21},{x,y,opacity:.82,rotation:135+i*29,duration:.72+(i%2)*.12,ease:'power2.out',delay:i*.025,onComplete:()=>{
      gsap.to(petal,{x:x+(i%2?16:-13),y:y+48,opacity:0,duration:.55,ease:'power1.in'});
    }});
  });
}

function settle(parts){
  opening.classList.remove('v396-playing');
  opening.classList.add('v396-complete');
  opening.dataset.v393Panel='ready';
  document.documentElement.classList.remove('v396-intro-active');
  [parts.farImg,parts.nearImg,parts.far,parts.near,parts.portal,parts.panel].forEach(el=>{if(el)el.style.willChange='auto'});
  if(parts.beam)parts.beam.style.visibility='hidden';
  if(parts.veil)parts.veil.style.visibility='hidden';
  if(parts.shimmer)parts.shimmer.style.visibility='hidden';
  if(parts.burst)parts.burst.innerHTML='';
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:(coarse ? .28 : .4)}}));
}

function play(){
  if(!opening)return;
  if(reduceMotion||!gsap){setStatic();return}
  const p=prepare();if(!p)return;
  const fast=coarse||saveData||lowMemory;
  const speed=(fast ? .88 : 1);

  timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>settle(p)});
  timeline
    .to(p.veil,{clipPath:'inset(0 0% 0 0%)',opacity:.18,duration:.58*speed,ease:'power3.inOut'},0)
    .to(p.far,{clipPath:'inset(0 0% 0 0% round 0px)',duration:.82*speed,ease:'power4.out'},.02)
    .to(p.farImg,{scale:1.06,y:-4,duration:1.72*speed,ease:'power2.inOut'},.02)
    .to(p.near,{opacity:.78,y:0,duration:.78*speed,ease:'power3.out'},.42)
    .to(p.nearImg,{scale:1.09,y:0,x:-2,duration:1.15*speed,ease:'power2.out'},.4)
    .to(p.haze,{opacity:.42,duration:.5*speed,ease:'power1.out'},.5)
    .to(p.beam,{opacity:.42,xPercent:135,duration:.82*speed,ease:'power2.inOut'},.66)
    .add(()=>burstPetals(p.petals),.86)
    .to(p.portal,{opacity:1,scale:1.018,y:0,duration:.56*speed,ease:'back.out(1.45)'},.94)
    .to(p.portal,{scale:1,duration:.2*speed,ease:'power2.out'},1.43)
    .to(p.shimmer,{opacity:1,duration:.05},1.12)
    .to(p.shimmerBar,{xPercent:620,duration:.52*speed,ease:'power2.inOut'},1.14)
    .to(p.shimmer,{opacity:0,duration:.16},1.62)
    .to(p.panel,{opacity:1,y:0,scale:1,duration:.66*speed,ease:'power3.out'},1.38)
    .to(p.eyebrow,{opacity:1,y:0,duration:.34*speed,ease:'power2.out'},1.68)
    .to(p.title,{opacity:1,y:0,duration:.46*speed,ease:'power3.out'},1.82)
    .to(p.rule,{opacity:1,y:0,duration:.3*speed,ease:'power2.out'},2.02)
    .to(p.copy,{opacity:1,y:0,duration:.42*speed,ease:'power2.out'},2.12)
    .to(p.farImg,{scale:1.035,y:-3,duration:.72*speed,ease:'power2.out'},2.26)
    .to(p.near,{opacity:.58,duration:.48*speed,ease:'power1.out'},2.32)
    .to(p.haze,{opacity:.16,duration:.5*speed,ease:'power1.out'},2.34)
    .to(p.veil,{opacity:0,duration:.32*speed,ease:'power1.out'},2.38);
}

function onOpened(event){
  event.stopImmediatePropagation();
  play();
}
function onVisibility(){if(!timeline)return;document.hidden?timeline.pause():timeline.resume()}

buildLightStage();
document.body.dataset.sakuraFinalCandidate='v3.9.6';
document.title='Sakura Vintage V3.9.6 Mobile Performance Rescue · Dini Anif Effect Lab';
if(reduceMotion)setStatic();
window.addEventListener('sakura:opened',onOpened,{capture:true});
document.addEventListener('visibilitychange',onVisibility);
window.addEventListener('pagehide',()=>{
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  document.removeEventListener('visibilitychange',onVisibility);
  timeline?.kill();
},{once:true});
