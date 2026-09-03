const gsap = window.gsap;
const scene = document.querySelector('#sakuraV2');
const artwork = document.querySelector('#sakuraArtwork');
const guard = document.querySelector('#assetGuard');
const canvas = document.querySelector('#petalCanvas');
const ctx = canvas?.getContext('2d');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf = 0;
let petals = [];
let w = 0;
let h = 0;
let dpr = 1;

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
  return {
    x: Math.random()*w,
    y: initial ? Math.random()*h : -30-Math.random()*120,
    rx: 2.2+Math.random()*3.4,
    ry: 4.5+Math.random()*5.8,
    speed: .2+Math.random()*.42,
    drift: .12+Math.random()*.42,
    phase: Math.random()*Math.PI*2,
    rot: Math.random()*Math.PI*2,
    spin: (Math.random()-.5)*.012,
    alpha: .22+Math.random()*.36,
    tint: Math.random()>.5 ? '#e8b9b4' : '#f1d4c8'
  };
}

function seedPetals(){
  petals = Array.from({length:Math.min(16,Math.max(9,Math.round(w/95)))},()=>newPetal(true));
}

function drawPetal(p){
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
    p.x += Math.sin(t*.00042+p.phase)*p.drift;
    p.rot += p.spin;
    if(p.y>h+30 || p.x<-40 || p.x>w+40) petals[i] = newPetal(false);
    drawPetal(p);
  });
  raf = requestAnimationFrame(tick);
}

function intro(){
  if(reduced || !gsap) return;
  gsap.fromTo('.reveal-item',
    {opacity:0,y:22,filter:'blur(5px)'},
    {opacity:1,y:0,filter:'blur(0px)',duration:1,stagger:.14,ease:'power3.out',delay:.2}
  );
}

function setParallax(x,y){
  if(reduced || !gsap || scene?.classList.contains('is-open')) return;
  document.querySelectorAll('[data-depth]').forEach(layer=>{
    const depth = Number(layer.dataset.depth || 0);
    gsap.to(layer,{x:x*depth,y:y*depth,duration:1.2,ease:'power2.out',overwrite:'auto'});
  });
}

scene?.addEventListener('pointermove',e=>{
  const nx = (e.clientX/window.innerWidth-.5)*18;
  const ny = (e.clientY/window.innerHeight-.5)*14;
  setParallax(nx,ny);
});
scene?.addEventListener('pointerleave',()=>setParallax(0,0));

function openScene(){
  if(!scene || scene.classList.contains('is-open')) return;
  scene.classList.add('is-open');
  const panel = document.querySelector('#openedPanel');
  panel?.setAttribute('aria-hidden','false');
  if(reduced || !gsap){
    if(panel){panel.style.opacity='1';panel.style.visibility='visible';}
    return;
  }
  const tl = gsap.timeline();
  tl.to('#openInvitation',{scale:.975,duration:.12})
    .to('#coverCopy',{opacity:0,y:-24,scale:.99,duration:.72,ease:'power2.inOut'},.1)
    .to('.artwork-stage',{scale:1.035,duration:1.15,ease:'power2.inOut'},.12)
    .to('.ambient-light',{opacity:.6,duration:.8},.2)
    .set(panel,{visibility:'visible'})
    .to(panel,{opacity:1,duration:.7,ease:'power2.out'},.54)
    .fromTo('.opened-inner',{opacity:0,y:22},{opacity:1,y:0,duration:.78,ease:'power3.out'},.7);
}

function resetScene(){
  if(!scene) return;
  scene.classList.remove('is-open');
  const panel = document.querySelector('#openedPanel');
  panel?.setAttribute('aria-hidden','true');
  if(!gsap){
    if(panel){panel.style.opacity='0';panel.style.visibility='hidden';}
    return;
  }
  gsap.set(panel,{opacity:0,visibility:'hidden'});
  gsap.set('#coverCopy',{opacity:1,y:0,scale:1});
  gsap.set('.artwork-stage',{clearProps:'scale'});
  gsap.set('.ambient-light',{clearProps:'opacity'});
  intro();
}

document.querySelector('#openInvitation')?.addEventListener('click',openScene);
document.querySelector('#resetScene')?.addEventListener('click',resetScene);
window.addEventListener('resize',()=>{resizeCanvas();seedPetals();});
window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});

resizeCanvas();
seedPetals();
if(!reduced) raf = requestAnimationFrame(tick);
intro();
