/* Sakura V4.0 — True Layered Opening behavior */
const gsap=window.gsap;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const saveData=Boolean(navigator.connection?.saveData);
const lowMemory=Number(navigator.deviceMemory||8)<=4;
const opening=document.querySelector('.scene-opening');
let timeline=null;
let readyPromise=Promise.resolve();

const assets={
  far:'/assets/sakura-v40/far-sky.webp',
  mid:'/assets/sakura-v40/mid-landscape.webp',
  branches:'/assets/sakura-v40/fg-branches.webp',
  floral:'/assets/sakura-v40/fg-floral.webp'
};

function imageReady(img){
  if(!img)return Promise.resolve();
  if(typeof img.decode==='function')return img.decode().catch(()=>{});
  if(img.complete)return Promise.resolve();
  return new Promise(resolve=>{
    img.addEventListener('load',resolve,{once:true});
    img.addEventListener('error',resolve,{once:true});
  });
}

function buildStage(){
  if(!opening||opening.querySelector(':scope > .v40-stage'))return;
  opening.querySelectorAll(':scope > .v394-opening-cinema,:scope > .v395-stage,:scope > .v396-stage').forEach(node=>node.remove());
  const petalCount=(coarse||saveData||lowMemory)?6:8;
  const stage=document.createElement('div');
  stage.className='v40-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v40-plate v40-far"><img src="${assets.far}" alt="" decoding="async" fetchpriority="high"></div>
    <div class="v40-plate v40-mid"><img src="${assets.mid}" alt="" decoding="async" fetchpriority="high"></div>
    <div class="v40-plate v40-branches"><img src="${assets.branches}" alt="" decoding="async"></div>
    <div class="v40-plate v40-floral"><img src="${assets.floral}" alt="" decoding="async"></div>
    <div class="v40-atmosphere"></div>
    <div class="v40-light"></div>
    <div class="v40-veil"></div>
    <div class="v40-frame"></div>
    <div class="v40-shimmer"><i></i></div>
    <div class="v40-burst">${Array.from({length:petalCount},()=>'<i class="v40-petal"></i>').join('')}</div>`;
  opening.insertBefore(stage,opening.firstChild);
  readyPromise=Promise.allSettled([...stage.querySelectorAll('img')].map(imageReady));
}

function setStatic(){
  if(!opening)return;
  opening.classList.add('v40-complete');
  opening.dataset.v393Panel='ready';
  opening.querySelectorAll('.v40-far,.v40-mid,.v40-branches,.v40-floral').forEach(el=>el.style.opacity='1');
  const frame=opening.querySelector('.v40-frame');if(frame){frame.style.opacity='1';frame.style.transform='none'}
}

function prepare(){
  if(!opening||!gsap)return null;
  timeline?.kill();
  const far=opening.querySelector('.v40-far'),farImg=far?.querySelector('img');
  const mid=opening.querySelector('.v40-mid'),midImg=mid?.querySelector('img');
  const branches=opening.querySelector('.v40-branches'),branchesImg=branches?.querySelector('img');
  const floral=opening.querySelector('.v40-floral'),floralImg=floral?.querySelector('img');
  const atmosphere=opening.querySelector('.v40-atmosphere');
  const light=opening.querySelector('.v40-light');
  const veil=opening.querySelector('.v40-veil');
  const frame=opening.querySelector('.v40-frame');
  const shimmer=opening.querySelector('.v40-shimmer'),shimmerBar=shimmer?.querySelector('i');
  const burst=opening.querySelector('.v40-burst'),petals=[...opening.querySelectorAll('.v40-petal')];
  const panel=opening.querySelector(':scope > .inv-shell');
  const eyebrow=opening.querySelector('.inv-eyebrow'),title=opening.querySelector('.inv-title'),rule=opening.querySelector('.inv-rule'),copy=opening.querySelector('.inv-copy');
  const moving=[far,farImg,mid,midImg,branches,branchesImg,floral,floralImg,atmosphere,light,veil,frame,shimmer,shimmerBar,panel,eyebrow,title,rule,copy,...petals].filter(Boolean);

  opening.classList.remove('v40-complete');opening.classList.add('v40-playing');opening.dataset.v393Panel='waiting';
  document.documentElement.classList.add('v40-intro-active');
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  gsap.killTweensOf(moving);

  [farImg,midImg,branchesImg,floralImg,frame,panel].forEach(el=>{if(el)el.style.willChange='transform,opacity'});
  gsap.set(far,{opacity:.2});gsap.set(farImg,{scale:1.035,y:8});
  gsap.set(mid,{opacity:0,y:24});gsap.set(midImg,{scale:1.055,y:14});
  gsap.set(branches,{opacity:0,x:16,y:-24});gsap.set(branchesImg,{scale:1.035});
  gsap.set(floral,{opacity:0,y:34});gsap.set(floralImg,{scale:1.03});
  gsap.set(atmosphere,{opacity:0});gsap.set(light,{opacity:0,xPercent:-20});
  gsap.set(veil,{clipPath:'inset(0 50% 0 50%)',opacity:.92});
  gsap.set(frame,{opacity:0,y:10,scale:.92});
  gsap.set(shimmer,{opacity:0});gsap.set(shimmerBar,{xPercent:0});
  gsap.set(panel,{opacity:0,y:20,scale:.97});
  gsap.set([eyebrow,title,rule,copy],{opacity:0,y:12});

  petals.forEach((petal,i)=>{
    const angle=-150+i*(300/Math.max(1,petals.length-1));
    const radius=66+(i%3)*22;
    petal.dataset.x=String(Math.cos(angle*Math.PI/180)*radius);
    petal.dataset.y=String(Math.sin(angle*Math.PI/180)*radius-16);
    gsap.set(petal,{x:0,y:6,rotation:-35+i*25,scale:.55+(i%2)*.14,opacity:0});
  });
  return{far,farImg,mid,midImg,branches,branchesImg,floral,floralImg,atmosphere,light,veil,frame,shimmer,shimmerBar,burst,petals,panel,eyebrow,title,rule,copy};
}

function burstPetals(petals){
  if(!gsap||reduceMotion)return;
  petals.forEach((petal,i)=>{
    const x=Number(petal.dataset.x||0),y=Number(petal.dataset.y||0);
    gsap.fromTo(petal,{x:0,y:5,opacity:0,rotation:-30+i*20},{x,y,opacity:.82,rotation:130+i*30,duration:.7+(i%2)*.1,ease:'power2.out',delay:i*.024,onComplete:()=>{
      gsap.to(petal,{x:x+(i%2?14:-12),y:y+44,opacity:0,duration:.5,ease:'power1.in'});
    }});
  });
}

function settle(p){
  opening.classList.remove('v40-playing');opening.classList.add('v40-complete');opening.dataset.v393Panel='ready';
  document.documentElement.classList.remove('v40-intro-active');
  [p.farImg,p.midImg,p.branchesImg,p.floralImg,p.frame,p.panel].forEach(el=>{if(el)el.style.willChange='auto'});
  if(p.light)p.light.style.visibility='hidden';if(p.veil)p.veil.style.visibility='hidden';if(p.shimmer)p.shimmer.style.visibility='hidden';if(p.burst)p.burst.innerHTML='';
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:(coarse ? .26 : .38)}}));
}

function play(){
  if(!opening)return;
  if(reduceMotion||!gsap){setStatic();return}
  const p=prepare();if(!p)return;
  const fast=coarse||saveData||lowMemory;
  const speed=(fast ? .92 : 1);
  timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>settle(p)});
  timeline
    .to(p.veil,{clipPath:'inset(0 0% 0 0%)',opacity:.14,duration:.52*speed,ease:'power3.inOut'},0)
    .to(p.far,{opacity:1,duration:.58*speed,ease:'power2.out'},.02)
    .to(p.farImg,{scale:1.012,y:0,duration:1.5*speed,ease:'power2.out'},.02)
    .to(p.mid,{opacity:1,y:0,duration:.72*speed,ease:'power3.out'},.34)
    .to(p.midImg,{scale:1,y:0,duration:1.08*speed,ease:'power2.out'},.3)
    .to(p.branches,{opacity:1,x:0,y:0,duration:.78*speed,ease:'power3.out'},.7)
    .to(p.branchesImg,{scale:1,duration:.9*speed,ease:'power2.out'},.66)
    .to(p.floral,{opacity:1,y:0,duration:.78*speed,ease:'power3.out'},.82)
    .to(p.floralImg,{scale:1,duration:.9*speed,ease:'power2.out'},.78)
    .to(p.atmosphere,{opacity:.36,duration:.48*speed,ease:'power1.out'},.78)
    .to(p.light,{opacity:.46,xPercent:185,duration:.82*speed,ease:'power2.inOut'},.9)
    .add(()=>burstPetals(p.petals),1.08)
    .to(p.frame,{opacity:1,y:0,scale:1.018,duration:.56*speed,ease:'back.out(1.55)'},1.24)
    .to(p.frame,{scale:1,duration:.2*speed,ease:'power2.out'},1.72)
    .to(p.shimmer,{opacity:1,duration:.05},1.38)
    .to(p.shimmerBar,{xPercent:650,duration:.5*speed,ease:'power2.inOut'},1.4)
    .to(p.shimmer,{opacity:0,duration:.15},1.86)
    .to(p.panel,{opacity:1,y:0,scale:1,duration:.62*speed,ease:'power3.out'},1.66)
    .to(p.eyebrow,{opacity:1,y:0,duration:.32*speed,ease:'power2.out'},1.94)
    .to(p.title,{opacity:1,y:0,duration:.44*speed,ease:'power3.out'},2.08)
    .to(p.rule,{opacity:1,y:0,duration:.28*speed,ease:'power2.out'},2.28)
    .to(p.copy,{opacity:1,y:0,duration:.4*speed,ease:'power2.out'},2.4)
    .to(p.atmosphere,{opacity:.14,duration:.48*speed,ease:'power1.out'},2.62)
    .to(p.veil,{opacity:0,duration:.28*speed,ease:'power1.out'},2.7);
}

function onOpened(event){event.stopImmediatePropagation();readyPromise.finally(play)}
function onVisibility(){if(!timeline)return;document.hidden?timeline.pause():timeline.resume()}

buildStage();
document.body.dataset.sakuraFinalCandidate='v4.0';
document.title='Sakura Vintage V4.0 True Layered Opening · Dini Anif Effect Lab';
if(reduceMotion)setStatic();
window.addEventListener('sakura:opened',onOpened,{capture:true});
document.addEventListener('visibilitychange',onVisibility);
window.addEventListener('pagehide',()=>{window.removeEventListener('sakura:opened',onOpened,{capture:true});document.removeEventListener('visibilitychange',onVisibility);timeline?.kill()},{once:true});
