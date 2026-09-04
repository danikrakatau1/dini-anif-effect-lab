/* Sakura V4.4.3 — LOCKED: Direct Master Video → Locked Name Frame → Final Name */
const systemReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const params=new URLSearchParams(location.search);
const reduceMotion=params.get('motion')==='reduced';
const opening=document.querySelector('.scene-opening');
const cover=document.querySelector('#sakuraV2');
const openButton=document.querySelector('#openInvitation');
const videoUrl='/assets/sakura-video/sakura-opening.mp4?v=443';

let started=false;
let completed=false;
let frameStarted=false;
let armTimer=0;
let fallbackTimer=0;
let coverObserver=null;
let assetPromise=null;
let video=null;
let stage=null;
let panel=null;
let frame=null;
let outer=null;
let inner=null;
let accent=null;
let title=null;
let frameTimeline=null;
let wasPlayingBeforeHide=false;

function mark(state){
  if(document.body)document.body.dataset.v443State=state;
  document.documentElement.dataset.sakuraOpeningEngine='v4.4.3';
  document.documentElement.dataset.systemReducedMotion=systemReducedMotion?'1':'0';
}

function suppressGlobalOpeningReveal(){
  if(!opening)return;
  panel=opening.querySelector(':scope > .inv-shell');
  panel?.removeAttribute('data-sakura-cascade');
  opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy').forEach(node=>node.removeAttribute('data-sakura-reveal'));
  opening.dataset.v44Exclusive='true';
}

function buildStage(){
  if(!opening)return;
  opening.querySelectorAll(':scope > .v394-opening-cinema,:scope > .v395-stage,:scope > .v396-stage,:scope > .v40-stage,:scope > .v41-stage,:scope > .v42-world-stage,:scope > .v43-stage,:scope > .v44-stage').forEach(node=>node.remove());

  stage=document.createElement('div');
  stage.className='v44-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v44-poster"></div>
    <video class="v44-video" muted playsinline preload="auto" disablepictureinpicture src="${videoUrl}"></video>
    <div class="v44-atmosphere"></div>`;
  opening.insertBefore(stage,opening.firstChild);

  video=stage.querySelector('.v44-video');
  panel=opening.querySelector(':scope > .inv-shell');
  title=opening.querySelector('.inv-title');

  if(panel){
    panel.querySelectorAll(':scope > .v42-name-frame,:scope > .v43-name-frame,:scope > .v443-name-frame').forEach(node=>node.remove());
    frame=document.createElement('div');
    frame.className='v443-name-frame';
    frame.setAttribute('aria-hidden','true');
    frame.innerHTML=`
      <svg viewBox="0 0 330 196" preserveAspectRatio="none">
        <path class="v443-frame-outer" d="M20 176 L20 72 C20 31 75 14 165 14 C255 14 310 31 310 72 L310 176 Q310 184 302 184 L28 184 Q20 184 20 176 Z"/>
        <path class="v443-frame-inner" d="M31 168 L31 75 C31 40 82 25 165 25 C248 25 299 40 299 75 L299 168 Q299 174 293 174 L37 174 Q31 174 31 168 Z"/>
        <path class="v443-frame-accent" d="M137 42 Q165 29 193 42 M146 158 Q165 168 184 158"/>
      </svg>`;
    panel.insertBefore(frame,panel.firstChild);
    outer=frame.querySelector('.v443-frame-outer');
    inner=frame.querySelector('.v443-frame-inner');
    accent=frame.querySelector('.v443-frame-accent');
  }

  resetFrameState();
  mark('stage-ready');
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

function resetFrameState(){
  if(!opening)return;
  opening.classList.remove('v443-frame-visible','v443-name-visible','v443-complete');
  frameTimeline?.kill();
  frameTimeline=null;
  if(panel){
    panel.style.opacity='0';
    panel.style.transform='translate3d(0,12px,0) scale(.965)';
  }
  if(frame)frame.style.opacity='0';
  primeStroke(outer);
  primeStroke(inner);
  primeStroke(accent);
  if(title){
    title.style.opacity='0';
    title.style.transform='translate3d(0,13px,0) scale(.965)';
    title.style.filter='blur(5px)';
  }
}

function setStaticFrame(){
  if(panel){panel.style.opacity='1';panel.style.transform='none'}
  if(frame)frame.style.opacity='1';
  [outer,inner,accent].forEach(showStroke);
  if(title){title.style.opacity='1';title.style.transform='none';title.style.filter='none'}
  opening?.classList.add('v443-frame-visible','v443-name-visible','v443-complete');
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
    console.warn('[Sakura V4.4.3] direct MP4 fallback:',error);
    mark('asset-fallback');
    return null;
  });
  return assetPromise;
}

function finish(){
  if(completed)return;
  completed=true;
  clearTimeout(fallbackTimer);
  opening?.classList.add('v443-frame-visible','v443-name-visible','v443-complete');
  opening?.classList.remove('v443-playing');
  if(opening)opening.dataset.v393Panel='ready';
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:.2}}));
  mark('complete');
}

function playFrameSequence(){
  if(frameStarted||!opening)return;
  frameStarted=true;
  mark('frame-start');

  if(reduceMotion){setStaticFrame();return}

  const gsap=window.gsap;
  if(!gsap||!panel||!frame||!title){
    setStaticFrame();
    return;
  }

  resetFrameState();
  frameStarted=true;
  gsap.killTweensOf([panel,frame,outer,inner,accent,title].filter(Boolean));
  gsap.set(panel,{opacity:0,y:12,scale:.965});
  gsap.set(frame,{opacity:0});
  gsap.set(title,{opacity:0,y:13,scale:.965,filter:'blur(5px)'});

  frameTimeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:finish});
  frameTimeline
    .to(panel,{opacity:1,y:0,scale:1,duration:.48,ease:'power3.out',onStart:()=>mark('frame-paper')},0)
    .to(frame,{opacity:1,duration:.08,onStart:()=>mark('frame-outer')},.42)
    .to(outer,{strokeDashoffset:0,duration:.72,ease:'power1.inOut'},.46)
    .to(inner,{strokeDashoffset:0,duration:.56,ease:'power1.inOut',onStart:()=>mark('frame-inner')},1.18)
    .to(accent,{strokeDashoffset:0,duration:.30,ease:'power1.inOut',onStart:()=>mark('frame-accent')},1.74)
    .call(()=>mark('frame-complete'),null,2.05)
    .to(title,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.80,ease:'power3.out',onStart:()=>mark('final-name')},2.27);
}

async function playVideo(){
  if(!opening)return;
  completed=false;
  frameStarted=false;
  resetFrameState();
  opening.classList.add('v443-playing');
  opening.dataset.v393Panel='waiting';
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  mark('starting-video');

  if(reduceMotion){
    setStaticFrame();
    return;
  }

  const readyVideo=await loadVideoAsset();
  if(!readyVideo){
    mark('poster-fallback');
    fallbackTimer=setTimeout(playFrameSequence,900);
    return;
  }

  clearTimeout(fallbackTimer);
  fallbackTimer=setTimeout(()=>{
    if(!frameStarted)playFrameSequence();
  },18000);

  try{
    readyVideo.pause();
    readyVideo.currentTime=0;
    readyVideo.muted=true;
    await readyVideo.play();
    mark('video-playing');
  }catch(error){
    console.warn('[Sakura V4.4.3] direct play fallback:',error);
    mark('play-fallback');
    fallbackTimer=setTimeout(playFrameSequence,900);
  }
}

function start(){
  if(started)return;
  started=true;
  playVideo();
}

function onVideoEnded(){
  mark('video-complete');
  playFrameSequence();
}

function onOpeningReveal(){start()}
function onOpened(){if(!started)start()}
function onOpenClick(){clearTimeout(armTimer);armTimer=setTimeout(start,420);mark('armed')}
function coverHasPassedReveal(){return Boolean((cover&&cover.classList.contains('is-open'))||document.body.classList.contains('cover-open'))}

function onVisibility(){
  if(document.hidden){
    if(video&&started&&!video.ended){
      wasPlayingBeforeHide=!video.paused;
      if(wasPlayingBeforeHide)video.pause();
    }
    frameTimeline?.pause();
  }else{
    if(video&&wasPlayingBeforeHide&&!video.ended){
      video.play().catch(()=>{});
      wasPlayingBeforeHide=false;
    }
    frameTimeline?.resume();
  }
}

suppressGlobalOpeningReveal();
buildStage();
window.__SAKURA_TARGET_VERSION='v4.4.3';
document.body.dataset.sakuraFinalCandidate='v4.4.3';
document.title='Sakura Vintage V4.4.3 Locked Name Frame · Dini Anif Effect Lab';
const labState=document.querySelector('.lab-state');
if(labState)labState.textContent='Sakura Vintage · V4.4.3 Locked Name Frame';

/* Preload the user-uploaded master MP4 while the cover is visible. */
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
  clearTimeout(armTimer);
  clearTimeout(fallbackTimer);
  coverObserver?.disconnect();
  frameTimeline?.kill();
  video?.pause();
  video?.removeEventListener('ended',onVideoEnded);
  openButton?.removeEventListener('click',onOpenClick,{capture:true});
  window.removeEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  document.removeEventListener('visibilitychange',onVisibility);
},{once:true});
