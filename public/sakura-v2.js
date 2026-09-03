import { initSakuraEffects } from './effects/sakura-global.js';

const gsap = window.gsap;
const scene = document.querySelector('#sakuraV2');
const artwork = document.querySelector('#sakuraArtwork');
const guard = document.querySelector('#assetGuard');
const invitation = document.querySelector('#invitationMain');
const effects = initSakuraEffects(document);

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

function finishOpen(){
  scene?.classList.remove('is-opening');
  scene?.classList.add('is-open','is-dismissed');
  invitation?.setAttribute('aria-hidden','false');
  effects.setPetalIntensity(.55);
  unlockScroll();
  window.scrollTo(0,0);
}

function openScene(){
  if(!scene || scene.classList.contains('is-open') || scene.classList.contains('is-opening')) return;
  scene.classList.add('is-opening');
  effects.setPetalIntensity(.72);

  if(effects.reduced || !gsap){
    scene.style.display='none';
    finishOpen();
    return;
  }

  const tl = gsap.timeline({defaults:{overwrite:'auto'},onComplete:finishOpen});
  tl.to('#openInvitation',{scale:.96,duration:.12,ease:'power1.out'})
    .to('.wedding-label,.guest-copy,.fine-rule',{opacity:0,y:-13,filter:'blur(2px)',duration:.4,stagger:.035,ease:'power2.in'},.06)
    .to('.couple-names',{opacity:0,y:-19,scale:.98,filter:'blur(4px)',duration:.58,ease:'power2.inOut'},.1)
    .to('#openInvitation',{opacity:0,y:14,scale:.98,filter:'blur(3px)',duration:.4,ease:'power2.in'},.18)
    .to('.lab-state',{opacity:0,duration:.24},.08)
    .to('.artwork-stage',{scale:1.065,y:-12,duration:1.08,ease:'power2.inOut'},.1)
    .to('.ambient-light',{opacity:.42,scale:1.05,duration:.88,ease:'power2.inOut'},.15)
    .to('.vintage-vignette',{opacity:.76,duration:.7,ease:'power1.inOut'},.2)
    .to(scene,{yPercent:-100,opacity:.18,duration:1.25,ease:'power3.inOut'},.48);
}

function setupCopyDemo(){
  document.querySelectorAll('.copy-demo').forEach(button=>{
    button.addEventListener('click',async()=>{
      const original=button.textContent;
      try{await navigator.clipboard?.writeText('000000000000')}catch{}
      button.textContent='Tersalin ✓';
      if(gsap) gsap.fromTo(button,{scale:.96},{scale:1,duration:.36,ease:'back.out(2)'});
      window.setTimeout(()=>button.textContent=original,1800);
    });
  });
}

document.querySelector('#openInvitation')?.addEventListener('click',openScene);
window.addEventListener('beforeunload',()=>window.scrollTo(0,0));
window.addEventListener('pagehide',()=>effects.destroy(),{once:true});

setupCopyDemo();
invitation?.setAttribute('aria-hidden','true');
lockScroll();
