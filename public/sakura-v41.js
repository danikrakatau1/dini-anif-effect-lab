/* Sakura V4.1.2 — Reference Timing Calibration + strict one-by-one reveal */
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
  if(document.body)document.body.dataset.v41State=state;
  document.documentElement.dataset.sakuraOpeningEngine='v4.1.2';
  document.documentElement.dataset.systemReducedMotion=systemReducedMotion?'1':'0';
}

function suppressGlobalOpeningReveal(){
  if(!opening)return;
  const panel=opening.querySelector(':scope > .inv-shell');
  panel?.removeAttribute('data-sakura-cascade');
  opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy').forEach(node=>node.removeAttribute('data-sakura-reveal'));
  opening.dataset.v41Exclusive='true';
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
    <div class="v41-border">
      <svg viewBox="0 0 356 720" preserveAspectRatio="none" aria-hidden="true">
        <path class="v41-border-outer" d="M28 690 L28 154 C28 72 88 42 178 42 C268 42 328 72 328 154 L328 690 Q328 704 314 704 L42 704 Q28 704 28 690 Z"/>
        <path class="v41-border-inner" d="M40 681 L40 160 C40 88 96 55 178 55 C260 55 316 88 316 160 L316 681 Q316 692 305 692 L51 692 Q40 692 40 681 Z"/>
      </svg>
    </div>
    <div class="v41-crest"></div>`;
  opening.insertBefore(stage,opening.firstChild);
  mark('ready');
}

function primeStroke(path){
  if(!path)return 0;
  let length=0;
  try{length=path.getTotalLength()}catch{}
  if(!Number.isFinite(length)||length<=0)length=1600;
  path.style.strokeDasharray=String(length);
  path.style.strokeDashoffset=String(length);
  return length;
}

function setStatic(){
  if(!opening)return;
  opening.classList.add('v41-complete');
  opening.dataset.v393Panel='ready';
  opening.querySelectorAll('.v41-border path').forEach(path=>{path.style.strokeDasharray='none';path.style.strokeDashoffset='0'});
  mark('reduced-static');
}

function prepare(){
  gsap=window.gsap||gsap;
  if(!opening||!gsap)return null;
  timeline?.kill();
  const far=opening.querySelector('.v40-far'),farImg=far?.querySelector('img');
  const mid=opening.querySelector('.v40-mid');
  const branches=opening.querySelector('.v40-branches');
  const floral=opening.querySelector('.v40-floral');
  const atmosphere=opening.querySelector('.v40-atmosphere');
  const slit=opening.querySelector('.v41-slit');
  const border=opening.querySelector('.v41-border');
  const outerPath=opening.querySelector('.v41-border-outer');
  const innerPath=opening.querySelector('.v41-border-inner');
  const crest=opening.querySelector('.v41-crest');
  const panel=opening.querySelector(':scope > .inv-shell');
  const eyebrow=opening.querySelector('.inv-eyebrow');
  const title=opening.querySelector('.inv-title');
  const rule=opening.querySelector('.inv-rule');
  const copy=opening.querySelector('.inv-copy');
  const moving=[farImg,mid,branches,floral,atmosphere,slit,border,outerPath,innerPath,crest,panel,eyebrow,title,rule,copy].filter(Boolean);

  opening.classList.remove('v40-playing','v40-complete','v41-complete');
  opening.classList.add('v41-playing');
  opening.dataset.v393Panel='waiting';
  document.documentElement.classList.add('v41-intro-active');
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  gsap.killTweensOf(moving);

  [farImg,mid,branches,floral,panel,border].forEach(el=>{if(el)el.style.willChange='transform,opacity,clip-path'});
  gsap.set(farImg,{scale:1.2,y:-22,x:0,transformOrigin:'50% 50%'});
  gsap.set(mid,{opacity:0,y:15,scale:1.08});
  gsap.set(branches,{opacity:0,x:16,y:-18,scale:1.065});
  gsap.set(floral,{opacity:0,y:28,scale:1.055});
  gsap.set(atmosphere,{opacity:0});
  gsap.set(slit,{opacity:0,height:0});
  gsap.set(panel,{opacity:0,clipPath:'inset(0 49.8% 0 49.8% round 42px)'});
  gsap.set(border,{opacity:0});
  primeStroke(outerPath);primeStroke(innerPath);
  gsap.set(crest,{opacity:0,scale:.5,rotation:45,xPercent:-50,transformOrigin:'50% 50%'});
  gsap.set([eyebrow,title,rule,copy],{opacity:0,y:12});
  mark('prepared');

  return{farImg,mid,branches,floral,atmosphere,slit,border,outerPath,innerPath,crest,panel,eyebrow,title,rule,copy};
}

function settle(p){
  opening.classList.remove('v41-playing');
  opening.classList.add('v41-complete');
  opening.dataset.v393Panel='ready';
  document.documentElement.classList.remove('v41-intro-active');
  [p.farImg,p.mid,p.branches,p.floral,p.panel,p.border].forEach(el=>{if(el)el.style.willChange='auto'});
  if(p.slit)p.slit.style.visibility='hidden';
  if(p.outerPath)p.outerPath.style.strokeDashoffset='0';
  if(p.innerPath)p.innerPath.style.strokeDashoffset='0';
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
  const speed=fast ? .94 : 1;
  mark('playing-world');

  timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>settle(p)});
  timeline
    .to(p.farImg,{scale:1,y:0,duration:2.3*speed,ease:'power2.inOut',onStart:()=>mark('world')},0)
    .to(p.mid,{opacity:.4,y:0,scale:1,duration:.62*speed,ease:'power2.out'},.42)
    .to(p.branches,{opacity:.47,x:0,y:0,scale:1,duration:.68*speed,ease:'power2.out'},.94)
    .to(p.floral,{opacity:.53,y:0,scale:1,duration:.7*speed,ease:'power2.out'},1.48)
    .to(p.atmosphere,{opacity:.15,duration:.58*speed,ease:'sine.out'},1.82)
    .call(()=>mark('world-hold'),null,2.3)
    .to(p.slit,{opacity:1,height:'60%',duration:.6*speed,ease:'power2.out',onStart:()=>mark('slit')},2.58)
    .call(()=>mark('slit-hold'),null,3.2)
    .to(p.panel,{opacity:1,clipPath:'inset(0 0% 0 0% round 42px)',duration:.82*speed,ease:'power3.inOut',onStart:()=>mark('panel')},3.4)
    .to(p.slit,{opacity:0,duration:.22*speed,ease:'power1.out'},4.08)
    .to(p.border,{opacity:1,duration:.08,onStart:()=>mark('border-outer')},4.34)
    .to(p.outerPath,{strokeDashoffset:0,duration:.78*speed,ease:'power1.inOut'},4.38)
    .to(p.innerPath,{strokeDashoffset:0,duration:.6*speed,ease:'power1.inOut',onStart:()=>mark('border-inner')},5.24)
    .to(p.crest,{opacity:1,scale:1,rotation:45,duration:.42*speed,ease:'back.out(1.6)',onStart:()=>mark('crest')},5.98)
    .to(p.eyebrow,{opacity:1,y:0,duration:.32*speed,ease:'power2.out',onStart:()=>mark('eyebrow')},6.5)
    .to(p.title,{opacity:1,y:0,duration:.48*speed,ease:'power3.out',onStart:()=>mark('title')},7.0)
    .to(p.rule,{opacity:1,y:0,duration:.3*speed,ease:'power2.out',onStart:()=>mark('divider')},7.68)
    .to(p.copy,{opacity:1,y:0,duration:.5*speed,ease:'power2.out',onStart:()=>mark('copy')},8.2)
    .to(p.atmosphere,{opacity:.09,duration:.36*speed,ease:'sine.out'},8.82);
}

function start(){if(started)return;started=true;mark('starting');play()}
function onOpeningReveal(){start()}
function onOpened(){if(!started)start()}
function onOpenClick(){clearTimeout(armTimer);armTimer=setTimeout(start,420);mark('armed')}
function onVisibility(){if(!timeline)return;document.hidden?timeline.pause():timeline.resume()}
function coverHasPassedReveal(){return Boolean(cover?.classList.contains('is-opening')||cover?.classList.contains('is-open')||document.body.classList.contains('cover-open'))}

suppressGlobalOpeningReveal();
buildStage();
window.__SAKURA_TARGET_VERSION='v4.1.2';
document.body.dataset.sakuraFinalCandidate='v4.1.2';
document.title='Sakura Vintage V4.1.2 Reference Timing Calibration · Dini Anif Effect Lab';
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
