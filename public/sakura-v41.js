/* Sakura V4.2.2 — LOCKED: Continuous Matte World Build → Name Frame → Final Name */
let gsap=window.gsap;
const systemReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const params=new URLSearchParams(location.search);
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
let armTimer=0;
let gsapRetryTimer=0;
let coverObserver=null;

function mark(state){
  if(document.body)document.body.dataset.v42State=state;
  document.documentElement.dataset.sakuraOpeningEngine='v4.2.2';
  document.documentElement.dataset.systemReducedMotion=systemReducedMotion?'1':'0';
}

function suppressGlobalOpeningReveal(){
  if(!opening)return;
  const panel=opening.querySelector(':scope > .inv-shell');
  panel?.removeAttribute('data-sakura-cascade');
  opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy').forEach(node=>node.removeAttribute('data-sakura-reveal'));
  opening.dataset.v42Exclusive='true';
}

function buildStage(){
  if(!opening)return;
  opening.querySelectorAll(':scope > .v394-opening-cinema,:scope > .v395-stage,:scope > .v396-stage,:scope > .v40-stage,:scope > .v41-stage,:scope > .v42-world-stage').forEach(node=>node.remove());

  const stage=document.createElement('div');
  stage.className='v42-world-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v42-paper-base"></div>
    <div class="v42-piece v42-top"></div>
    <div class="v42-piece v42-center"></div>
    <div class="v42-piece v42-left"></div>
    <div class="v42-piece v42-right"></div>
    <div class="v42-piece v42-bottom"></div>
    <div class="v42-composite"><img src="${artworkSrc}" alt="" decoding="async" fetchpriority="high"></div>
    <div class="v42-atmosphere"></div>`;
  opening.insertBefore(stage,opening.firstChild);

  const panel=opening.querySelector(':scope > .inv-shell');
  if(panel){
    panel.querySelectorAll(':scope > .v42-name-frame').forEach(node=>node.remove());
    const frame=document.createElement('div');
    frame.className='v42-name-frame';
    frame.setAttribute('aria-hidden','true');
    frame.innerHTML=`
      <svg viewBox="0 0 330 196" preserveAspectRatio="none">
        <path class="v42-frame-outer" d="M20 176 L20 72 C20 31 75 14 165 14 C255 14 310 31 310 72 L310 176 Q310 184 302 184 L28 184 Q20 184 20 176 Z"/>
        <path class="v42-frame-inner" d="M31 168 L31 75 C31 40 82 25 165 25 C248 25 299 40 299 75 L299 168 Q299 174 293 174 L37 174 Q31 174 31 168 Z"/>
        <path class="v42-frame-accent" d="M137 42 Q165 29 193 42 M146 158 Q165 168 184 158"/>
      </svg>`;
    panel.insertBefore(frame,panel.firstChild);
  }
  mark('ready');
}

function primeStroke(path){
  if(!path)return;
  let length=0;
  try{length=path.getTotalLength()}catch{}
  if(!Number.isFinite(length)||length<=0)length=1000;
  path.style.strokeDasharray=String(length);
  path.style.strokeDashoffset=String(length);
}

function showStroke(path){
  if(!path)return;
  path.style.strokeDasharray='none';
  path.style.strokeDashoffset='0';
}

function setMaskSize(node,size){
  if(!node)return;
  node.style.webkitMaskSize=size;
  node.style.maskSize=size;
}

function setStatic(){
  if(!opening)return;
  const stage=opening.querySelector('.v42-world-stage');
  stage?.querySelectorAll('.v42-piece').forEach(node=>node.style.opacity='0');
  const composite=stage?.querySelector('.v42-composite');if(composite)composite.style.opacity='1';
  const panel=opening.querySelector(':scope > .inv-shell');if(panel){panel.style.opacity='1';panel.style.transform='none'}
  const frame=opening.querySelector('.v42-name-frame');if(frame)frame.style.opacity='1';
  opening.querySelectorAll('.v42-name-frame path').forEach(showStroke);
  const title=opening.querySelector('.inv-title');if(title){title.style.opacity='1';title.style.transform='none';title.style.filter='none'}
  opening.classList.add('v42-complete');
  opening.dataset.v393Panel='ready';
  mark('reduced-static');
}

function prepare(){
  gsap=window.gsap||gsap;
  if(!opening||!gsap)return null;
  timeline?.kill();

  const stage=opening.querySelector('.v42-world-stage');
  const top=stage?.querySelector('.v42-top');
  const center=stage?.querySelector('.v42-center');
  const left=stage?.querySelector('.v42-left');
  const right=stage?.querySelector('.v42-right');
  const bottom=stage?.querySelector('.v42-bottom');
  const composite=stage?.querySelector('.v42-composite');
  const compositeImg=composite?.querySelector('img');
  const atmosphere=stage?.querySelector('.v42-atmosphere');
  const panel=opening.querySelector(':scope > .inv-shell');
  const frame=opening.querySelector('.v42-name-frame');
  const outer=opening.querySelector('.v42-frame-outer');
  const inner=opening.querySelector('.v42-frame-inner');
  const accent=opening.querySelector('.v42-frame-accent');
  const title=opening.querySelector('.inv-title');
  const moving=[top,center,left,right,bottom,composite,compositeImg,atmosphere,panel,frame,outer,inner,accent,title].filter(Boolean);

  opening.classList.remove('v40-playing','v40-complete','v41-playing','v41-complete','v42-complete');
  opening.classList.add('v42-playing');
  opening.dataset.v393Panel='waiting';
  document.documentElement.classList.add('v42-intro-active');
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  gsap.killTweensOf(moving);

  [top,center,left,right,bottom,compositeImg,panel,frame,title].forEach(el=>{if(el)el.style.willChange='opacity,filter,-webkit-mask-size,mask-size'});

  /* Keep every artwork copy perfectly aligned. Only its soft matte changes size. */
  gsap.set([top,center,left,right,bottom],{opacity:1});
  setMaskSize(top,'100% 1%');
  setMaskSize(center,'2% 2%');
  setMaskSize(left,'1% 100%');
  setMaskSize(right,'1% 100%');
  setMaskSize(bottom,'100% 1%');
  gsap.set(top,{filter:'blur(1.8px) saturate(.97) contrast(1.01)'});
  gsap.set(center,{filter:'blur(2.2px) saturate(.97) contrast(1.01)'});
  gsap.set(left,{filter:'blur(1.8px) saturate(.97) contrast(1.01)'});
  gsap.set(right,{filter:'blur(1.8px) saturate(.97) contrast(1.01)'});
  gsap.set(bottom,{filter:'blur(2px) saturate(.97) contrast(1.01)'});

  gsap.set(composite,{opacity:0});
  gsap.set(compositeImg,{scale:1.012,y:2});
  gsap.set(atmosphere,{opacity:0});
  gsap.set(panel,{opacity:0,y:22,scale:.94});
  gsap.set(frame,{opacity:0});
  primeStroke(outer);primeStroke(inner);primeStroke(accent);
  gsap.set(title,{opacity:0,y:18,scale:.94,filter:'blur(7px)'});
  mark('prepared');

  return{stage,top,center,left,right,bottom,composite,compositeImg,atmosphere,panel,frame,outer,inner,accent,title};
}

function settle(p){
  opening.classList.remove('v42-playing');
  opening.classList.add('v42-complete');
  opening.dataset.v393Panel='ready';
  document.documentElement.classList.remove('v42-intro-active');
  [p.top,p.center,p.left,p.right,p.bottom,p.compositeImg,p.panel,p.frame,p.title].forEach(el=>{if(el)el.style.willChange='auto'});
  if(coarse||saveData||lowMemory){[p.top,p.center,p.left,p.right,p.bottom].forEach(el=>el?.remove())}
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:(coarse ? .18 : .28)}}));
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
  const speed=fast ? .97 : 1;
  mark('playing-world');

  timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>settle(p)});
  timeline
    /* CONTINUOUS WORLD BUILD — soft mattes grow over a perfectly aligned master image. */
    .to(p.top,{webkitMaskSize:'100% 73%',maskSize:'100% 73%',filter:'blur(0px) saturate(.97) contrast(1.01)',duration:1.32*speed,ease:'sine.inOut',onStart:()=>mark('world-top')},.06)
    .to(p.center,{webkitMaskSize:'92% 70%',maskSize:'92% 70%',filter:'blur(0px) saturate(.97) contrast(1.01)',duration:1.48*speed,ease:'power2.inOut',onStart:()=>mark('world-fuji')},.9)
    .to(p.left,{webkitMaskSize:'58% 100%',maskSize:'58% 100%',filter:'blur(0px) saturate(.97) contrast(1.01)',duration:1.16*speed,ease:'sine.inOut',onStart:()=>mark('world-left')},1.92)
    .to(p.right,{webkitMaskSize:'58% 100%',maskSize:'58% 100%',filter:'blur(0px) saturate(.97) contrast(1.01)',duration:1.16*speed,ease:'sine.inOut',onStart:()=>mark('world-right')},2.52)
    .to(p.bottom,{webkitMaskSize:'100% 62%',maskSize:'100% 62%',filter:'blur(0px) saturate(.97) contrast(1.01)',duration:1.42*speed,ease:'power2.inOut',onStart:()=>mark('world-floral')},3.14)
    .to(p.atmosphere,{opacity:.11,duration:.68*speed,ease:'sine.inOut'},3.78)

    /* Overlapping feathered mattes dissolve into the exact full artwork without a seam. */
    .to(p.composite,{opacity:1,duration:1.08*speed,ease:'sine.inOut',onStart:()=>mark('world-merge')},4.4)
    .to([p.top,p.center,p.left,p.right,p.bottom],{opacity:0,duration:.82*speed,ease:'sine.inOut'},4.86)
    .to(p.compositeImg,{scale:1,y:0,duration:.9*speed,ease:'power2.out'},4.42)
    .call(()=>mark('world-complete'),null,5.58)

    /* HOLD — completed background gets a clean visual breath. */
    .call(()=>mark('world-hold'),null,5.92)

    /* NAME FRAME — background is already complete; no text yet. */
    .to(p.panel,{opacity:1,y:0,scale:1,duration:.7*speed,ease:'power3.out',onStart:()=>mark('frame-paper')},6.18)
    .to(p.frame,{opacity:1,duration:.08,onStart:()=>mark('frame-outer')},6.8)
    .to(p.outer,{strokeDashoffset:0,duration:.8*speed,ease:'power1.inOut'},6.84)
    .to(p.inner,{strokeDashoffset:0,duration:.64*speed,ease:'power1.inOut',onStart:()=>mark('frame-inner')},7.68)
    .to(p.accent,{strokeDashoffset:0,duration:.38*speed,ease:'power1.inOut',onStart:()=>mark('frame-accent')},8.36)
    .call(()=>mark('frame-complete'),null,8.76)

    /* FINAL REVEAL — locked name remains the last new visual element. */
    .to(p.title,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.92*speed,ease:'power3.out',onStart:()=>mark('final-name')},9.08)
    .to(p.atmosphere,{opacity:.065,duration:.42*speed,ease:'sine.out'},9.86);
}

function start(){if(started)return;started=true;mark('starting');play()}
function onOpeningReveal(){start()}
function onOpened(){if(!started)start()}
function onOpenClick(){clearTimeout(armTimer);armTimer=setTimeout(start,420);mark('armed')}
function onVisibility(){if(!timeline)return;document.hidden?timeline.pause():timeline.resume()}
function coverHasPassedReveal(){return Boolean(cover?.classList.contains('is-open')||document.body.classList.contains('cover-open'))}

suppressGlobalOpeningReveal();
buildStage();
window.__SAKURA_TARGET_VERSION='v4.2.2';
document.body.dataset.sakuraFinalCandidate='v4.2.2';
document.title='Sakura Vintage V4.2.2 Continuous Matte Reveal · Dini Anif Effect Lab';
const labState=document.querySelector('.lab-state');if(labState)labState.textContent='Sakura Vintage · V4.2.2 Continuous Matte Reveal';
if(reduceMotion)setStatic();

openButton?.addEventListener('click',onOpenClick,{capture:true});
window.addEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
window.addEventListener('sakura:opened',onOpened,{capture:true});
document.addEventListener('visibilitychange',onVisibility);

if(cover){
  coverObserver=new MutationObserver(()=>{if(!started&&coverHasPassedReveal())start()});
  coverObserver.observe(cover,{attributes:true,attributeFilter:['class']});
}
if(coverHasPassedReveal())requestAnimationFrame(start);

window.addEventListener('pagehide',()=>{
  openButton?.removeEventListener('click',onOpenClick,{capture:true});
  window.removeEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  document.removeEventListener('visibilitychange',onVisibility);
  coverObserver?.disconnect();timeline?.kill();
  clearTimeout(armTimer);clearTimeout(gsapRetryTimer);
},{once:true});
