import { initSakuraEffects } from './effects/sakura-global.js';

const gsap = window.gsap;
const scene = document.querySelector('#sakuraV2');
const artwork = document.querySelector('#sakuraArtwork');
const guard = document.querySelector('#assetGuard');
const effects = initSakuraEffects(scene || document);

function lockScroll(){
  document.body.classList.add('cover-locked');
  document.body.classList.remove('cover-open');
}

function unlockScroll(){
  document.body.classList.remove('cover-locked');
  document.body.classList.add('cover-open');
}

function showAssetGuard(){
  if(guard) guard.hidden = false;
  scene?.classList.add('asset-missing');
}

artwork?.addEventListener('error', showAssetGuard, {once:true});
artwork?.addEventListener('load', ()=>{
  if(guard) guard.hidden = true;
  scene?.classList.remove('asset-missing');
}, {once:true});

function openScene(){
  if(!scene || scene.classList.contains('is-open') || scene.classList.contains('is-opening')) return;
  scene.classList.add('is-opening');
  effects.setPetalIntensity(.62);
  const panel = document.querySelector('#openedPanel');
  panel?.setAttribute('aria-hidden','false');

  if(effects.reduced || !gsap){
    scene.classList.remove('is-opening');
    scene.classList.add('is-open');
    unlockScroll();
    if(panel){panel.style.opacity='1';panel.style.visibility='visible';}
    return;
  }

  const tl = gsap.timeline({
    defaults:{overwrite:'auto'},
    onComplete(){
      scene.classList.remove('is-opening');
      scene.classList.add('is-open');
      unlockScroll();
    }
  });

  tl.to('#openInvitation',{scale:.965,duration:.12,ease:'power1.out'})
    .to('.wedding-label,.guest-copy,.fine-rule',{opacity:0,y:-12,filter:'blur(2px)',duration:.4,stagger:.035,ease:'power2.in'},.06)
    .to('.couple-names',{opacity:0,y:-18,scale:.982,filter:'blur(4px)',duration:.58,ease:'power2.inOut'},.1)
    .to('#openInvitation',{opacity:0,y:12,scale:.985,filter:'blur(3px)',duration:.42,ease:'power2.in'},.18)
    .to('.lab-state',{opacity:0,duration:.22},.08)
    .to('.artwork-stage',{scale:1.06,y:-10,duration:1.05,ease:'power2.inOut'},.1)
    .to('.ambient-light',{opacity:.44,scale:1.045,duration:.84,ease:'power2.inOut'},.16)
    .to('.vintage-vignette',{opacity:.82,duration:.62,ease:'power1.inOut'},.22)
    .to(scene,{yPercent:-4,scale:.992,duration:.72,ease:'power2.inOut'},.4)
    .set(panel,{visibility:'visible'},.48)
    .to(panel,{opacity:1,duration:.72,ease:'power2.out'},.48)
    .fromTo('.opened-inner',{opacity:0,y:22,filter:'blur(5px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.84,ease:'power3.out'},.64)
    .to(scene,{yPercent:0,scale:1,duration:.58,ease:'power2.out'},.78);
}

function resetScene(){
  if(!scene) return;
  lockScroll();
  effects.setPetalIntensity(1);
  effects.resetParallax();
  scene.classList.remove('is-open','is-opening');
  const panel = document.querySelector('#openedPanel');
  panel?.setAttribute('aria-hidden','true');

  if(!gsap){
    if(panel){panel.style.opacity='0';panel.style.visibility='hidden';}
    effects.playIntro();
    return;
  }

  gsap.set(panel,{opacity:0,visibility:'hidden'});
  gsap.set(scene,{yPercent:0,scale:1});
  gsap.set('#coverCopy',{opacity:1,y:0,scale:1,filter:'none'});
  gsap.set('.wedding-label,.guest-copy,.fine-rule,.couple-names,#openInvitation,.lab-state',{opacity:1,y:0,scale:1,filter:'none'});
  gsap.set('.artwork-stage',{clearProps:'scale,y'});
  gsap.set('.ambient-light',{clearProps:'opacity,scale,x,y'});
  gsap.set('.vintage-vignette',{clearProps:'opacity'});
  effects.playIntro();
}

document.querySelector('#openInvitation')?.addEventListener('click',openScene);
document.querySelector('#resetScene')?.addEventListener('click',resetScene);
window.addEventListener('beforeunload',()=>window.scrollTo(0,0));
window.addEventListener('pagehide',()=>effects.destroy(),{once:true});

lockScroll();
