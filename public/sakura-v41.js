/* Sakura V4.4.2 — LOCKED: Direct User MP4 Master → Transparent Final Name */
const systemReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const params=new URLSearchParams(location.search);
const reduceMotion=params.get('motion')==='reduced';
const opening=document.querySelector('.scene-opening');
const cover=document.querySelector('#sakuraV2');
const openButton=document.querySelector('#openInvitation');
const videoUrl='/assets/sakura-video/sakura-opening.mp4?v=442';
const finalNameAt=8.65;
let started=false;
let nameShown=false;
let completed=false;
let armTimer=0;
let fallbackTimer=0;
let coverObserver=null;
let assetPromise=null;
let video=null;
let stage=null;
let title=null;
let wasPlayingBeforeHide=false;

function mark(state){
  if(document.body)document.body.dataset.v44State=state;
  document.documentElement.dataset.sakuraOpeningEngine='v4.4.2';
  document.documentElement.dataset.systemReducedMotion=systemReducedMotion?'1':'0';
}

function suppressGlobalOpeningReveal(){
  if(!opening)return;
  const panel=opening.querySelector(':scope > .inv-shell');
  if(panel)panel.removeAttribute('data-sakura-cascade');
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
  title=opening.querySelector('.inv-title');
  mark('stage-ready');
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
    console.warn('[Sakura V4.4.2] direct MP4 fallback:',error);
    mark('asset-fallback');
    return null;
  });
  return assetPromise;
}

function revealName(){
  if(nameShown||!opening||!title)return;
  nameShown=true;
  mark('final-name');
  const gsap=window.gsap;
  if(gsap){
    gsap.killTweensOf(title);
    gsap.fromTo(
      title,
      {opacity:0,y:14,scale:.94,filter:'blur(7px)'},
      {opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.86,ease:'power3.out',onStart:()=>opening.classList.add('v44-name-visible')}
    );
  }else{
    opening.classList.add('v44-name-visible');
  }
}

function finish(){
  if(completed)return;
  completed=true;
  clearTimeout(fallbackTimer);
  revealName();
  opening?.classList.add('v44-complete');
  opening?.classList.remove('v44-playing');
  if(opening)opening.dataset.v393Panel='ready';
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:.2}}));
  mark('complete');
}

function onVideoProgress(){
  if(!video)return;
  const duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:10;
  const trigger=Math.min(finalNameAt,Math.max(0,duration-.9));
  if(video.currentTime>=trigger)revealName();
}

async function playVideo(){
  if(!opening)return;
  opening.classList.remove('v43-playing','v43-complete','v44-complete','v44-name-visible');
  opening.classList.add('v44-playing');
  opening.dataset.v393Panel='waiting';
  window.dispatchEvent(new CustomEvent('sakura:petals-pause'));
  mark('starting-video');

  if(reduceMotion){
    revealName();
    finish();
    return;
  }

  const readyVideo=await loadVideoAsset();
  if(!readyVideo){
    mark('poster-fallback-playing');
    fallbackTimer=setTimeout(finish,1200);
    return;
  }

  clearTimeout(fallbackTimer);
  fallbackTimer=setTimeout(()=>{
    if(!nameShown)revealName();
    if(!video||video.error)finish();
  },14000);

  try{
    readyVideo.pause();
    readyVideo.currentTime=0;
    readyVideo.muted=true;
    await readyVideo.play();
    mark('video-playing');
  }catch(error){
    console.warn('[Sakura V4.4.2] direct play fallback:',error);
    mark('play-fallback');
  }
}

function start(){
  if(started)return;
  started=true;
  playVideo();
}

function onOpeningReveal(){start()}
function onOpened(){if(!started)start()}
function onOpenClick(){clearTimeout(armTimer);armTimer=setTimeout(start,420);mark('armed')}
function coverHasPassedReveal(){return Boolean((cover&&cover.classList.contains('is-open'))||document.body.classList.contains('cover-open'))}

function onVisibility(){
  if(!video||!started)return;
  if(document.hidden){
    wasPlayingBeforeHide=!video.paused&&!video.ended;
    if(wasPlayingBeforeHide)video.pause();
  }else if(wasPlayingBeforeHide&&!video.ended){
    video.play().catch(()=>{});
    wasPlayingBeforeHide=false;
  }
}

suppressGlobalOpeningReveal();
buildStage();
window.__SAKURA_TARGET_VERSION='v4.4.2';
document.body.dataset.sakuraFinalCandidate='v4.4.2';
document.title='Sakura Vintage V4.4.2 Direct Master Video · Dini Anif Effect Lab';
const labState=document.querySelector('.lab-state');
if(labState)labState.textContent='Sakura Vintage · V4.4.2 Direct Master Video';

/* Start direct browser preload while cover is still visible. */
if(!reduceMotion)loadVideoAsset();

video?.addEventListener('timeupdate',onVideoProgress);
video?.addEventListener('ended',finish);
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
  video?.pause();
  video?.removeEventListener('timeupdate',onVideoProgress);
  video?.removeEventListener('ended',finish);
  openButton?.removeEventListener('click',onOpenClick,{capture:true});
  window.removeEventListener('sakura:opening-reveal',onOpeningReveal,{capture:true});
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  document.removeEventListener('visibilitychange',onVisibility);
},{once:true});
