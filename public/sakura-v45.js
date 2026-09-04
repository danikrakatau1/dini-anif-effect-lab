/* Sakura V4.5 — Color Master Video → Color Frame Background → Locked V4.1.2 Frame → Final Name */
const params=new URLSearchParams(location.search);
const reduceMotion=params.get('motion')==='reduced';
const opening=document.querySelector('.scene-opening');
const cover=document.querySelector('#sakuraV2');
const openButton=document.querySelector('#openInvitation');
const videoUrl='/assets/Sakura-v45/sakura-opening-color.mp4.mp4?v=450';

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
let border=null;
let outer=null;
let inner=null;
let crest=null;
let title=null;
let finalTimeline=null;
let wasPlayingBeforeHide=false;

function mark(state){
  if(document.body)document.body.dataset.v45State=state;
  document.documentElement.dataset.sakuraOpeningEngine='v4.5';
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
    <div class="v45-atmosphere"></div>
    <div class="v45-border">
      <svg viewBox="0 0 356 720" preserveAspectRatio="none" aria-hidden="true">
        <path class="v45-border-outer" d="M28 690 L28 154 C28 72 88 42 178 42 C268 42 328 72 328 154 L328 690 Q328 704 314 704 L42 704 Q28 704 28 690 Z"/>
        <path class="v45-border-inner" d="M40 681 L40 160 C40 88 96 55 178 55 C260 55 316 88 316 160 L316 681 Q316 692 305 692 L51 692 Q40 692 40 681 Z"/>
      </svg>
    </div>
    <div class="v45-crest"></div>`;
  opening.insertBefore(stage,opening.firstChild);

  video=stage.querySelector('.v45-video');
  nameBg=stage.querySelector('.v45-name-bg');
  border=stage.querySelector('.v45-border');
  outer=stage.querySelector('.v45-border-outer');
  inner=stage.querySelector('.v45-border-inner');
  crest=stage.querySelector('.v45-crest');
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
  opening.classList.remove('v45-final-bg','v45-frame-visible','v45-name-visible','v45-complete');
  finalTimeline?.kill();
  finalTimeline=null;
  if(nameBg){nameBg.style.opacity='0';nameBg.style.transform='scale(1.012)'}
  if(border)border.style.opacity='0';
  if(crest){crest.style.opacity='0';crest.style.transform='translateX(-50%) scale(.5) rotate(45deg)'}
  primeStroke(outer);
  primeStroke(inner);
  if(title){
    title.style.opacity='0';
    title.style.transform='translate3d(0,11px,0) scale(.97)';
    title.style.filter='blur(5px)';
  }
}

function setStaticFinal(){
  if(nameBg){nameBg.style.opacity='1';nameBg.style.transform='scale(1)'}
  if(border)border.style.opacity='1';
  [outer,inner].forEach(showStroke);
  if(crest){crest.style.opacity='1';crest.style.transform='translateX(-50%) scale(1) rotate(45deg)'}
  if(title){title.style.opacity='1';title.style.transform='none';title.style.filter='none'}
  opening?.classList.add('v45-final-bg','v45-frame-visible','v45-name-visible','v45-complete');
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
    console.warn('[Sakura V4.5] color video fallback:',error);
    mark('asset-fallback');
    return null;
  });
  return assetPromise;
}

function finish(){
  if(completed)return;
  completed=true;
  clearTimeout(fallbackTimer);
  opening?.classList.add('v45-final-bg','v45-frame-visible','v45-name-visible','v45-complete');
  opening?.classList.remove('v45-playing');
  if(opening)opening.dataset.v393Panel='ready';
  window.dispatchEvent(new CustomEvent('sakura:petals-resume',{detail:{intensity:.18}}));
  mark('complete');
}

function playFinalSequence(){
  if(finalStarted||!opening)return;
  finalStarted=true;
  mark('final-background');

  if(reduceMotion){setStaticFinal();return}
  const gsap=window.gsap;
  if(!gsap||!nameBg||!border||!title){setStaticFinal();return}

  resetFinalState();
  finalStarted=true;
  gsap.killTweensOf([nameBg,border,outer,inner,crest,title].filter(Boolean));
  gsap.set(nameBg,{opacity:0,scale:1.012});
  gsap.set(border,{opacity:0});
  gsap.set(crest,{opacity:0,scale:.5,rotation:45,xPercent:-50,transformOrigin:'50% 50%'});
  gsap.set(title,{opacity:0,y:11,scale:.97,filter:'blur(5px)'});

  finalTimeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:finish});
  finalTimeline
    /* Color still replaces the video ending softly, giving the frame its intended glow background. */
    .to(nameBg,{opacity:1,scale:1,duration:.72,ease:'sine.inOut',onStart:()=>opening.classList.add('v45-final-bg')},0)
    .to(border,{opacity:1,duration:.08,onStart:()=>mark('frame-outer')},.62)
    /* Exact V4.1.2 thin SVG draw rhythm: maroon first, gold second. */
    .to(outer,{strokeDashoffset:0,duration:.82,ease:'power1.inOut'},.68)
    .to(inner,{strokeDashoffset:0,duration:.66,ease:'power1.inOut',onStart:()=>mark('frame-inner')},1.52)
    .to(crest,{opacity:1,scale:1,rotation:45,duration:.40,ease:'back.out(1.45)',onStart:()=>mark('crest')},2.22)
    .call(()=>{opening.classList.add('v45-frame-visible');mark('frame-complete')},null,2.60)
    /* Locked climax: name is the last new visual element. */
    .to(title,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.84,ease:'power3.out',onStart:()=>{opening.classList.add('v45-name-visible');mark('final-name')}},2.92);
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
    console.warn('[Sakura V4.5] play fallback:',error);
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
window.__SAKURA_TARGET_VERSION='v4.5';
document.documentElement.dataset.forceV45Motion='1';
document.body.dataset.sakuraFinalCandidate='v4.5';
document.title='Sakura Vintage V4.5 Color Master · Dini Anif Effect Lab';
const labState=document.querySelector('.lab-state');
if(labState)labState.textContent='Sakura Vintage · V4.5 Color Master';

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
