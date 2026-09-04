/* Sakura V4.5.2 — Rich Vintage Color → Champagne Frame → Signature Name */
const params=new URLSearchParams(location.search);
const reduceMotion=params.get('motion')==='reduced';
const opening=document.querySelector('.scene-opening');
const cover=document.querySelector('#sakuraV2');
const openButton=document.querySelector('#openInvitation');
const videoUrl='/assets/Sakura-v45/sakura-opening-color.mp4.mp4?v=452';

let started=false;
let completed=false;
let finalStarted=false;
let armTimer=0;
let fallbackTimer=0;
let coverObserver=null;
let assetPromise=null;
let video=null;
let stage=null;
let nameBg=null;
let edgeShade=null;
let centerBloom=null;
let grain=null;
let border=null;
let outer=null;
let inner=null;
let crest=null;
let goldSweep=null;
let title=null;
let finalTimeline=null;
let wasPlayingBeforeHide=false;

function mark(state){
  if(document.body)document.body.dataset.v452State=state;
  document.documentElement.dataset.sakuraOpeningEngine='v4.5.2';
}

function suppressGlobalOpeningReveal(){
  if(!opening)return;
  const panel=opening.querySelector(':scope > .inv-shell');
  panel?.removeAttribute('data-sakura-cascade');
  opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy').forEach(node=>node.removeAttribute('data-sakura-reveal'));
  opening.dataset.v45Exclusive='true';
}

function buildStage(){
  if(!opening)return;
  opening.querySelectorAll(':scope > .v394-opening-cinema,:scope > .v395-stage,:scope > .v396-stage,:scope > .v40-stage,:scope > .v41-stage,:scope > .v42-world-stage,:scope > .v43-stage,:scope > .v44-stage,:scope > .v45-stage').forEach(node=>node.remove());

  stage=document.createElement('div');
  stage.className='v45-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v45-poster"></div>
    <video class="v45-video" muted playsinline preload="auto" disablepictureinpicture src="${videoUrl}"></video>
    <div class="v45-name-bg"></div>
    <div class="v451-edge-shade"></div>
    <div class="v451-center-bloom"></div>
    <div class="v45-atmosphere"></div>
    <div class="v451-grain"></div>
    <div class="v45-border">
      <svg viewBox="0 0 356 720" preserveAspectRatio="none" aria-hidden="true">
        <path class="v45-border-outer" d="M28 690 L28 154 C28 72 88 42 178 42 C268 42 328 72 328 154 L328 690 Q328 704 314 704 L42 704 Q28 704 28 690 Z"/>
        <path class="v45-border-inner" d="M40 681 L40 160 C40 88 96 55 178 55 C260 55 316 88 316 160 L316 681 Q316 692 305 692 L51 692 Q40 692 40 681 Z"/>
      </svg>
    </div>
    <div class="v45-crest"></div>
    <div class="v451-gold-sweep"></div>`;
  opening.insertBefore(stage,opening.firstChild);

  video=stage.querySelector('.v45-video');
  nameBg=stage.querySelector('.v45-name-bg');
  edgeShade=stage.querySelector('.v451-edge-shade');
  centerBloom=stage.querySelector('.v451-center-bloom');
  grain=stage.querySelector('.v451-grain');
  border=stage.querySelector('.v45-border');
  outer=stage.querySelector('.v45-border-outer');
  inner=stage.querySelector('.v45-border-inner');
  crest=stage.querySelector('.v45-crest');
  goldSweep=stage.querySelector('.v451-gold-sweep');
  title=opening.querySelector('.inv-title');
  resetFinalState();
  mark('stage-ready');
}

function primeStroke(path){
  if(!path)return;
  let length=0;
  try{length=path.getTotalLength()}catch{}
  if(!Number.isFinite(length)||length<=0)length=1600;
  path.style.strokeDasharray=String(length);
  path.style.strokeDashoffset=String(length);
}

function showStroke(path){
  if(!path)return;
  path.style.strokeDasharray='none';
  path.style.strokeDashoffset='0';
}

function resetFinalState(){
  if(!opening)return;
  opening.classList.remove('v45-final-bg','v45-frame-visible','v45-name-visible','v45-complete','v451-luxury-settle');
  finalTimeline?.kill();
  finalTimeline=null;
  if(nameBg){
    nameBg.style.opacity='0';
    nameBg.style.transform='scale(1.018)';
    nameBg.style.filter='saturate(1.12) contrast(1.035) brightness(.992)';
  }
  if(edgeShade)edgeShade.style.opacity='0';
  if(centerBloom)centerBloom.style.opacity='0';
  if(grain)grain.style.opacity='0';
  if(border)border.style.opacity='0';
  if(crest){crest.style.opacity='0';crest.style.transform='translateX(-50%) scale(.72) rotate(45deg)'}
  if(goldSweep){goldSweep.style.opacity='0';goldSweep.style.transform='translate3d(0,0,0)'}
  primeStroke(outer);
  primeStroke(inner);
  if(title){
    title.style.opacity='0';
    title.style.transform='translate3d(0,9px,0) scale(.985)';
    title.style.filter='blur(3.5px)';
    title.style.letterSpacing='.055em';
  }
}

function setStaticFinal(){
  if(nameBg){
    nameBg.style.opacity='1';
    nameBg.style.transform='scale(1)';
    nameBg.style.filter='saturate(1.12) contrast(1.035) brightness(.992)';
  }
  if(edgeShade)edgeShade.style.opacity='1';
  if(centerBloom)centerBloom.style.opacity='1';
  if(grain)grain.style.opacity='.10';
  if(border)border.style.opacity='1';
  [outer,inner].forEach(showStroke);
  if(crest){crest.style.opacity='1';crest.style.transform='translateX(-50%) scale(1) rotate(45deg)'}
  if(title){title.style.opacity='1';title.style.transform='none';title.style.filter='none';title.style.letterSpacing='-.025em'}
  opening?.classList.add('v45-final-bg','v451-luxury-settle','v45-frame-visible','v45-name-visible','v45-complete');
  finish();
}

function loadVideoAsset(){
  if(assetPromise)return assetPromise;
  assetPromise=(async()=>{
    if(!video)throw new Error('video-stage-missing');
    mark('asset-loading');
    video.muted=true;
    video.playsInline=true;
    video.preload='auto';
    await new Promise((resolve,reject)=>{
      if(video.readyState>=2){resolve();return}
      const ready=()=>{cleanup();resolve()};
      const fail=()=>{cleanup();reject(new Error('video-decode-failed'))};
      const cleanup=()=>{
        video.removeEventListener('loadeddata',ready);
        video.removeEventListener('error',fail);
      };
      video.addEventListener('loadeddata',ready,{once:true});
      video.addEventListener('error',fail,{once:true});
      video.load();
    });
    video.classList.add('is-ready');
    stage?.classList.add('is-video-ready');
    mark('asset-ready');
    return video;
  })().catch(error=>{
    console.warn('[Sakura V4.5.2] color video fallback:',error);
    mark('asset-fallback');
    return null;
  });
  return assetPromise;
}

function finish(){
  if(completed)return;
  completed=true;
  clearTimeout(fallbackTimer);
  opening?.classList.add('v45-final-bg','v451-luxury-settle','v45-frame-visible','v45-name-visible','v45-complete');
  opening?.classList.remove('v45-playing');
  if(opening)opening.dataset.v393Panel='ready';
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:.14}}));
  mark('complete');
}

function playFinalSequence(){
  if(finalStarted||!opening)return;
  finalStarted=true;
  mark('ceremonial-hold');

  if(reduceMotion){setStaticFinal();return}
  const gsap=window.gsap;
  if(!gsap||!nameBg||!border||!title){setStaticFinal();return}

  resetFinalState();
  finalStarted=true;
  const moving=[nameBg,edgeShade,centerBloom,grain,border,outer,inner,crest,goldSweep,title].filter(Boolean);
  gsap.killTweensOf(moving);
  gsap.set(nameBg,{opacity:0,scale:1.018,filter:'saturate(1.12) contrast(1.035) brightness(.992)'});
  gsap.set(edgeShade,{opacity:0});
  gsap.set(centerBloom,{opacity:0,scale:.985});
  gsap.set(grain,{opacity:0});
  gsap.set(border,{opacity:0});
  gsap.set(crest,{opacity:0,scale:.72,rotation:45,xPercent:-50,transformOrigin:'50% 50%'});
  gsap.set(goldSweep,{opacity:0,xPercent:0});
  gsap.set(title,{opacity:0,y:9,scale:.985,filter:'blur(3.5px)',letterSpacing:'.055em'});

  finalTimeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:finish});
  finalTimeline
    .call(()=>mark('final-world'),null,.28)
    .to(nameBg,{opacity:1,scale:1,duration:.88,ease:'sine.inOut',onComplete:()=>opening.classList.add('v45-final-bg')},.34)
    .to(edgeShade,{opacity:1,duration:.82,ease:'sine.out'},.48)
    .to(centerBloom,{opacity:1,scale:1,duration:.90,ease:'sine.out'},.56)
    .to(grain,{opacity:.10,duration:.58,ease:'sine.out',onComplete:()=>opening.classList.add('v451-luxury-settle')},.78)
    .to(border,{opacity:1,duration:.10,onStart:()=>mark('frame-maroon')},1.18)
    .to(outer,{strokeDashoffset:0,duration:.92,ease:'power1.inOut'},1.24)
    .to(inner,{strokeDashoffset:0,duration:.68,ease:'power1.inOut',onStart:()=>mark('frame-champagne')},2.20)
    .to(crest,{opacity:1,scale:1,rotation:45,duration:.42,ease:'back.out(1.35)',onStart:()=>mark('jewel-mark')},2.94)
    .call(()=>{opening.classList.add('v45-frame-visible');mark('frame-complete')},null,3.34)
    .to(goldSweep,{opacity:.72,duration:.08,ease:'none',onStart:()=>mark('gold-sweep')},3.42)
    .to(goldSweep,{xPercent:122,duration:.66,ease:'power2.inOut'},3.45)
    .to(goldSweep,{opacity:0,duration:.16,ease:'sine.out'},4.05)
    .call(()=>mark('name-breath'),null,4.28)
    .to(title,{
      opacity:1,
      y:0,
      scale:1,
      filter:'blur(0px)',
      letterSpacing:'-.025em',
      duration:.96,
      ease:'power3.out',
      onStart:()=>mark('final-name'),
      onComplete:()=>opening.classList.add('v45-name-visible')
    },4.52);
}

async function playVideo(){
  if(!opening)return;
  completed=false;
  finalStarted=false;
  resetFinalState();
  opening.classList.add('v45-playing');
  opening.dataset.v393Panel='waiting';
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  mark('starting-video');

  if(reduceMotion){setStaticFinal();return}

  const readyVideo=await loadVideoAsset();
  if(!readyVideo){
    fallbackTimer=setTimeout(playFinalSequence,800);
    return;
  }

  clearTimeout(fallbackTimer);
  fallbackTimer=setTimeout(()=>{if(!finalStarted)playFinalSequence()},16000);

  try{
    readyVideo.pause();
    readyVideo.currentTime=0;
    readyVideo.muted=true;
    await readyVideo.play();
    mark('video-playing');
  }catch(error){
    console.warn('[Sakura V4.5.2] play fallback:',error);
    fallbackTimer=setTimeout(playFinalSequence,800);
  }
}

function start(){if(started)return;started=true;playVideo()}
function onVideoEnded(){mark('video-complete');playFinalSequence()}
function onOpeningReveal(){start()}
function onOpened(){if(!started)start()}
function onOpenClick(){clearTimeout(armTimer);armTimer=setTimeout(start,420);mark('armed')}
function coverHasPassedReveal(){return Boolean((cover&&cover.classList.contains('is-open'))||document.body.classList.contains('cover-open'))}

function onVisibility(){
  if(document.hidden){
    if(video&&started&&!video.ended){wasPlayingBeforeHide=!video.paused;if(wasPlayingBeforeHide)video.pause()}
    finalTimeline?.pause();
  }else{
    if(video&&wasPlayingBeforeHide&&!video.ended){video.play().catch(()=>{});wasPlayingBeforeHide=false}
    finalTimeline?.resume();
  }
}

suppressGlobalOpeningReveal();
buildStage();
window.__SAKURA_TARGET_VERSION='v4.5.2';
document.documentElement.dataset.forceV45Motion='1';
document.body.dataset.sakuraFinalCandidate='v4.5.2';
document.title='Sakura Vintage V4.5.2 Rich Color Luxury · Dini Anif Effect Lab';
const labState=document.querySelector('.lab-state');
if(labState)labState.textContent='Sakura Vintage · V4.5.2 Rich Color Luxury';

if(!reduceMotion)loadVideoAsset();
video?.addEventListener('ended',onVideoEnded);
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
  clearTimeout(armTimer);clearTimeout(fallbackTimer);
  coverObserver?.disconnect();
  finalTimeline?.kill();
  video?.pause();
  video?.removeEventListener('ended',onVideoEnded);
  openButton?.removeEventListener('click',onOpenClick,{capture:true});
  window.removeEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  document.removeEventListener('visibilitychange',onVisibility);
},{once:true});
