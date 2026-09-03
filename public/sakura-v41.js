/* Sakura V4.3 — LOCKED: Single-Camera World Reveal → Name Frame → Final Name */
let gsap=window.gsap;
const systemReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const params=new URLSearchParams(location.search);
const reduceMotion=params.get('motion')==='reduced';
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
  if(document.body)document.body.dataset.v43State=state;
  document.documentElement.dataset.sakuraOpeningEngine='v4.3';
  document.documentElement.dataset.systemReducedMotion=systemReducedMotion?'1':'0';
}

function suppressGlobalOpeningReveal(){
  if(!opening)return;
  const panel=opening.querySelector(':scope > .inv-shell');
  if(panel)panel.removeAttribute('data-sakura-cascade');
  opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy').forEach(node=>node.removeAttribute('data-sakura-reveal'));
  opening.dataset.v43Exclusive='true';
}

function buildStage(){
  if(!opening)return;
  opening.querySelectorAll(':scope > .v394-opening-cinema,:scope > .v395-stage,:scope > .v396-stage,:scope > .v40-stage,:scope > .v41-stage,:scope > .v42-world-stage,:scope > .v43-stage').forEach(node=>node.remove());

  const stage=document.createElement('div');
  stage.className='v43-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v43-world"><img src="${artworkSrc}" alt="" decoding="async" fetchpriority="high"></div>
    <div class="v43-atmosphere"></div>`;
  opening.insertBefore(stage,opening.firstChild);

  const panel=opening.querySelector(':scope > .inv-shell');
  if(panel){
    panel.querySelectorAll(':scope > .v42-name-frame,:scope > .v43-name-frame').forEach(node=>node.remove());
    const frame=document.createElement('div');
    frame.className='v43-name-frame';
    frame.setAttribute('aria-hidden','true');
    frame.innerHTML=`
      <svg viewBox="0 0 330 196" preserveAspectRatio="none">
        <path class="v43-frame-outer" d="M20 176 L20 72 C20 31 75 14 165 14 C255 14 310 31 310 72 L310 176 Q310 184 302 184 L28 184 Q20 184 20 176 Z"/>
        <path class="v43-frame-inner" d="M31 168 L31 75 C31 40 82 25 165 25 C248 25 299 40 299 75 L299 168 Q299 174 293 174 L37 174 Q31 174 31 168 Z"/>
        <path class="v43-frame-accent" d="M137 42 Q165 29 193 42 M146 158 Q165 168 184 158"/>
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

function setStatic(){
  if(!opening)return;
  const image=opening.querySelector('.v43-world img');
  if(image){image.style.transform='translate3d(0,0,0) scale(1)';image.style.filter='none'}
  const panel=opening.querySelector(':scope > .inv-shell');
  if(panel){panel.style.opacity='1';panel.style.transform='none'}
  const frame=opening.querySelector('.v43-name-frame');if(frame)frame.style.opacity='1';
  opening.querySelectorAll('.v43-name-frame path').forEach(showStroke);
  const title=opening.querySelector('.inv-title');
  if(title){title.style.opacity='1';title.style.transform='none';title.style.filter='none'}
  opening.classList.add('v43-complete');
  opening.dataset.v393Panel='ready';
  mark('reduced-static');
}

function prepare(){
  gsap=window.gsap||gsap;
  if(!opening||!gsap)return null;
  if(timeline)timeline.kill();

  const image=opening.querySelector('.v43-world img');
  const atmosphere=opening.querySelector('.v43-atmosphere');
  const panel=opening.querySelector(':scope > .inv-shell');
  const frame=opening.querySelector('.v43-name-frame');
  const outer=opening.querySelector('.v43-frame-outer');
  const inner=opening.querySelector('.v43-frame-inner');
  const accent=opening.querySelector('.v43-frame-accent');
  const title=opening.querySelector('.inv-title');
  const moving=[image,atmosphere,panel,frame,outer,inner,accent,title].filter(Boolean);

  opening.classList.remove('v40-playing','v40-complete','v41-playing','v41-complete','v42-playing','v42-complete','v43-complete');
  opening.classList.add('v43-playing');
  opening.dataset.v393Panel='waiting';
  document.documentElement.classList.add('v43-intro-active');
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  gsap.killTweensOf(moving);

  gsap.set(image,{scale:1.46,xPercent:-1.6,yPercent:7.5,transformOrigin:'50% 42%',filter:'saturate(.96) contrast(1.015) brightness(1.015)'});
  gsap.set(atmosphere,{opacity:0});
  gsap.set(panel,{opacity:0,y:18,scale:.95});
  gsap.set(frame,{opacity:0});
  primeStroke(outer);primeStroke(inner);primeStroke(accent);
  gsap.set(title,{opacity:0,y:16,scale:.95,filter:'blur(6px)'});
  mark('prepared');

  return{image,atmosphere,panel,frame,outer,inner,accent,title};
}

function settle(p){
  opening.classList.remove('v43-playing');
  opening.classList.add('v43-complete');
  opening.dataset.v393Panel='ready';
  document.documentElement.classList.remove('v43-intro-active');
  [p.image,p.panel,p.frame,p.title].forEach(el=>{if(el)el.style.willChange='auto'});
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:.22}}));
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
  mark('camera-start');

  timeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>settle(p)});
  timeline
    /* ONE CONTINUOUS CAMERA SHOT. No cropped zones, no independent artwork pieces. */
    .to(p.image,{scale:1.34,xPercent:-.9,yPercent:5.2,duration:1.35,ease:'sine.inOut',onStart:()=>mark('camera-canopy')},0)
    .to(p.image,{scale:1.22,xPercent:-.25,yPercent:3.2,duration:1.4,ease:'sine.inOut',onStart:()=>mark('camera-fuji')},1.35)
    .to(p.image,{scale:1.11,xPercent:.15,yPercent:1.5,duration:1.4,ease:'sine.inOut',onStart:()=>mark('camera-landscape')},2.75)
    .to(p.image,{scale:1.035,xPercent:0,yPercent:.45,duration:1.25,ease:'sine.inOut',onStart:()=>mark('camera-floral')},4.15)
    .to(p.image,{scale:1,xPercent:0,yPercent:0,duration:.85,ease:'power2.out',onStart:()=>mark('world-settle')},5.4)
    .to(p.atmosphere,{opacity:.09,duration:.8,ease:'sine.inOut'},4.9)
    .call(()=>mark('world-complete'),null,6.28)

    /* Clean breath on the complete world before the name frame appears. */
    .call(()=>mark('world-hold'),null,6.72)

    /* LOCKED NAME FRAME. */
    .to(p.panel,{opacity:1,y:0,scale:1,duration:.72,ease:'power3.out',onStart:()=>mark('frame-paper')},7.0)
    .to(p.frame,{opacity:1,duration:.08,onStart:()=>mark('frame-outer')},7.62)
    .to(p.outer,{strokeDashoffset:0,duration:.8,ease:'power1.inOut'},7.66)
    .to(p.inner,{strokeDashoffset:0,duration:.64,ease:'power1.inOut',onStart:()=>mark('frame-inner')},8.5)
    .to(p.accent,{strokeDashoffset:0,duration:.38,ease:'power1.inOut',onStart:()=>mark('frame-accent')},9.18)
    .call(()=>mark('frame-complete'),null,9.58)

    /* FINAL REVEAL — Faqih & Dini remains the last new element. */
    .to(p.title,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.94,ease:'power3.out',onStart:()=>mark('final-name')},9.9)
    .to(p.atmosphere,{opacity:.055,duration:.45,ease:'sine.out'},10.68);
}

function start(){if(started)return;started=true;mark('starting');play()}
function onOpeningReveal(){start()}
function onOpened(){if(!started)start()}
function onOpenClick(){clearTimeout(armTimer);armTimer=setTimeout(start,420);mark('armed')}
function onVisibility(){if(!timeline)return;document.hidden?timeline.pause():timeline.resume()}
function coverHasPassedReveal(){return Boolean((cover&&cover.classList.contains('is-open'))||document.body.classList.contains('cover-open'))}

suppressGlobalOpeningReveal();
buildStage();
window.__SAKURA_TARGET_VERSION='v4.3';
document.body.dataset.sakuraFinalCandidate='v4.3';
document.title='Sakura Vintage V4.3 Single-Camera Reveal · Dini Anif Effect Lab';
const labState=document.querySelector('.lab-state');if(labState)labState.textContent='Sakura Vintage · V4.3 Single-Camera Reveal';
if(reduceMotion)setStatic();

if(openButton)openButton.addEventListener('click',onOpenClick,{capture:true});
window.addEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
window.addEventListener('sakura:opened',onOpened,{capture:true});
document.addEventListener('visibilitychange',onVisibility);

if(cover){
  coverObserver=new MutationObserver(()=>{if(!started&&coverHasPassedReveal())start()});
  coverObserver.observe(cover,{attributes:true,attributeFilter:['class']});
}
if(coverHasPassedReveal())requestAnimationFrame(start);

window.addEventListener('pagehide',()=>{
  if(openButton)openButton.removeEventListener('click',onOpenClick,{capture:true});
  window.removeEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  document.removeEventListener('visibilitychange',onVisibility);
  if(coverObserver)coverObserver.disconnect();
  if(timeline)timeline.kill();
  clearTimeout(armTimer);clearTimeout(gsapRetryTimer);
},{once:true});
