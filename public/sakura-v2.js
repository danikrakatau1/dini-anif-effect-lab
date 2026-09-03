const gsap = window.gsap;
const scene = document.querySelector('#sakuraV2');
const artwork = document.querySelector('#sakuraArtwork');
const guard = document.querySelector('#assetGuard');
const canvas = document.querySelector('#petalCanvas');
const ctx = canvas?.getContext('2d');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
let raf = 0;
let petals = [];
let w = 0;
let h = 0;
let dpr = 1;
let tiltX = 0;
let tiltY = 0;

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

function resizeCanvas(){
  if(!canvas || !ctx) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function newPetal(initial=false){
  const depth = Math.random();
  const sideDrift = (Math.random()-.5) * .24;
  return {
    x: Math.random()*w,
    y: initial ? Math.random()*h : -40-Math.random()*140,
    rx: 1.8 + depth*3.6,
    ry: 3.8 + depth*6.2,
    speed: .16 + depth*.48,
    drift: .08 + depth*.38,
    sideDrift,
    phase: Math.random()*Math.PI*2,
    rot: Math.random()*Math.PI*2,
    spin: (Math.random()-.5)*(.006 + depth*.011),
    alpha: .16 + depth*.42,
    wobble: .00028 + Math.random()*.00035,
    tint: Math.random()>.52 ? '#e7b1af' : (Math.random()>.5 ? '#f2d2c8' : '#edc1bd')
  };
}

function seedPetals(){
  const density = coarsePointer ? 115 : 90;
  const min = coarsePointer ? 8 : 10;
  const max = coarsePointer ? 13 : 18;
  petals = Array.from({length:Math.min(max,Math.max(min,Math.round(w/density)))},()=>newPetal(true));
}

function drawPetal(p){
  if(!ctx) return;
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.tint;
  ctx.beginPath();
  ctx.ellipse(0,0,p.rx,p.ry,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function tick(t){
  if(!ctx) return;
  ctx.clearRect(0,0,w,h);
  petals.forEach((p,i)=>{
    p.y += p.speed;
    p.x += Math.sin(t*p.wobble+p.phase)*p.drift + p.sideDrift;
    p.rot += p.spin;
    if(p.y>h+45 || p.x<-60 || p.x>w+60) petals[i] = newPetal(false);
    drawPetal(p);
  });
  raf = requestAnimationFrame(tick);
}

function intro(){
  if(reduced || !gsap) return;
  gsap.killTweensOf('.reveal-item');
  gsap.fromTo('.reveal-item',
    {opacity:0,y:18,filter:'blur(4px)'},
    {opacity:1,y:0,filter:'blur(0px)',duration:1.05,stagger:.13,ease:'power3.out',delay:.18}
  );
  gsap.fromTo('.artwork-stage',{scale:1.012},{scale:1,duration:1.8,ease:'power2.out'});
}

function applyParallax(x,y){
  if(!scene || reduced || scene.classList.contains('is-open') || scene.classList.contains('is-opening')) return;
  tiltX += (x-tiltX)*.22;
  tiltY += (y-tiltY)*.22;
  scene.style.setProperty('--parallax-x', `${tiltX}px`);
  scene.style.setProperty('--parallax-y', `${tiltY}px`);
  if(gsap){
    gsap.to('.ambient-light',{x:tiltX*.35,y:tiltY*.3,duration:1.35,ease:'power2.out',overwrite:'auto'});
  }
}

if(!coarsePointer){
  scene?.addEventListener('pointermove',e=>{
    const nx = (e.clientX/window.innerWidth-.5)*7;
    const ny = (e.clientY/window.innerHeight-.5)*5;
    applyParallax(nx,ny);
  });
  scene?.addEventListener('pointerleave',()=>applyParallax(0,0));
}

function openScene(){
  if(!scene || scene.classList.contains('is-open') || scene.classList.contains('is-opening')) return;
  scene.classList.add('is-opening');
  const panel = document.querySelector('#openedPanel');
  panel?.setAttribute('aria-hidden','false');

  if(reduced || !gsap){
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
  scene.classList.remove('is-open','is-opening');
  const panel = document.querySelector('#openedPanel');
  panel?.setAttribute('aria-hidden','true');

  if(!gsap){
    if(panel){panel.style.opacity='0';panel.style.visibility='hidden';}
    return;
  }

  gsap.set(panel,{opacity:0,visibility:'hidden'});
  gsap.set(scene,{yPercent:0,scale:1});
  gsap.set('#coverCopy',{opacity:1,y:0,scale:1,filter:'none'});
  gsap.set('.wedding-label,.guest-copy,.fine-rule,.couple-names,#openInvitation,.lab-state',{opacity:1,y:0,scale:1,filter:'none'});
  gsap.set('.artwork-stage',{clearProps:'scale,y'});
  gsap.set('.ambient-light',{clearProps:'opacity,scale,x,y'});
  gsap.set('.vintage-vignette',{clearProps:'opacity'});
  scene.style.setProperty('--parallax-x','0px');
  scene.style.setProperty('--parallax-y','0px');
  tiltX = 0;
  tiltY = 0;
  intro();
}

document.querySelector('#openInvitation')?.addEventListener('click',openScene);
document.querySelector('#resetScene')?.addEventListener('click',resetScene);
window.addEventListener('resize',()=>{resizeCanvas();seedPetals();});
window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
window.addEventListener('beforeunload',()=>window.scrollTo(0,0));

lockScroll();
resizeCanvas();
seedPetals();
if(!reduced) raf = requestAnimationFrame(tick);
intro();
