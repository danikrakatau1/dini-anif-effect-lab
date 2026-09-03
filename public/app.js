const gsap = window.gsap;
const scene = document.querySelector('#scene');
const canvas = document.querySelector('#petal-canvas');
const ctx = canvas.getContext('2d');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let petals = [];
let raf = 0;
let w = 0;
let h = 0;
let dpr = 1;

function resizeCanvas(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = Math.round(w*dpr);
  canvas.height = Math.round(h*dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr,0,0,dpr,0,0);
}

function makePetal(initial=false){
  return {
    x: Math.random()*w,
    y: initial ? Math.random()*h : -30-Math.random()*120,
    size: 4+Math.random()*8,
    speed: .28+Math.random()*.55,
    drift: .2+Math.random()*.55,
    phase: Math.random()*Math.PI*2,
    rot: Math.random()*Math.PI*2,
    spin: (Math.random()-.5)*.018,
    alpha: .35+Math.random()*.48,
    tint: Math.random()>.45 ? '#e9b7ba' : '#f3d6d2'
  };
}

function seedPetals(){
  petals = Array.from({length: Math.min(20, Math.max(12, Math.round(w/70)))},()=>makePetal(true));
}

function drawPetal(p){
  ctx.save();
  ctx.translate(p.x,p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha=p.alpha;
  ctx.fillStyle=p.tint;
  ctx.beginPath();
  ctx.ellipse(0,0,p.size*.55,p.size,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
}

function tick(t){
  ctx.clearRect(0,0,w,h);
  petals.forEach((p,i)=>{
    p.y += p.speed;
    p.x += Math.sin(t*.00055+p.phase)*p.drift;
    p.rot += p.spin;
    if(p.y>h+40 || p.x<-50 || p.x>w+50) petals[i]=makePetal();
    drawPetal(p);
  });
  raf=requestAnimationFrame(tick);
}

function intro(){
  if(reduced || !gsap) return;
  gsap.killTweensOf('.reveal-item');
  gsap.fromTo('.reveal-item',
    {opacity:0,y:24,filter:'blur(6px)'},
    {opacity:1,y:0,filter:'blur(0px)',duration:1.05,stagger:.16,ease:'power3.out',delay:.2}
  );
  gsap.fromTo('.sakura-top',{y:-10,scale:1.03},{y:0,scale:1,duration:2.1,ease:'power2.out'});
  gsap.fromTo('.florals',{y:22,scale:1.03},{y:0,scale:1,duration:2.2,ease:'power2.out'});
}

function setParallax(x,y){
  if(reduced || !gsap || scene.classList.contains('is-open')) return;
  document.querySelectorAll('[data-depth]').forEach(layer=>{
    const depth=Number(layer.dataset.depth||0);
    gsap.to(layer,{x:x*depth,y:y*depth,duration:1.15,ease:'power2.out',overwrite:'auto'});
  });
}

scene.addEventListener('pointermove',e=>{
  const nx=(e.clientX/window.innerWidth-.5)*24;
  const ny=(e.clientY/window.innerHeight-.5)*18;
  setParallax(nx,ny);
});
scene.addEventListener('pointerleave',()=>setParallax(0,0));

function openScene(){
  if(scene.classList.contains('is-open')) return;
  scene.classList.add('is-open');
  const panel=document.querySelector('#openedPanel');
  panel.setAttribute('aria-hidden','false');
  if(reduced || !gsap){panel.style.opacity=1;panel.style.visibility='visible';return;}
  const tl=gsap.timeline();
  tl.to('#openInvitation',{scale:.96,duration:.12})
    .to('.content',{opacity:0,y:-30,scale:.985,duration:.75,ease:'power2.inOut'},.12)
    .to('.landscape',{scale:1.055,duration:1.2,ease:'power2.inOut'},.12)
    .to('.sakura-top',{y:-40,opacity:.42,duration:1,ease:'power2.inOut'},.16)
    .to('.florals',{y:38,opacity:.55,duration:1,ease:'power2.inOut'},.16)
    .set(panel,{visibility:'visible'})
    .to(panel,{opacity:1,duration:.75,ease:'power2.out'},.56)
    .fromTo('#openedPanel > div',{opacity:0,y:24},{opacity:1,y:0,duration:.8,ease:'power3.out'},.72);
}

function resetScene(){
  scene.classList.remove('is-open');
  const panel=document.querySelector('#openedPanel');
  panel.setAttribute('aria-hidden','true');
  if(!gsap){panel.style.opacity=0;panel.style.visibility='hidden';return;}
  gsap.set(panel,{opacity:0,visibility:'hidden'});
  gsap.set('.content',{opacity:1,y:0,scale:1});
  gsap.set('.landscape',{scale:1});
  gsap.set('.sakura-top,.florals',{clearProps:'transform,opacity'});
  intro();
}

document.querySelector('#openInvitation')?.addEventListener('click',openScene);
document.querySelector('#resetScene')?.addEventListener('click',resetScene);
window.addEventListener('resize',()=>{resizeCanvas();seedPetals();});
window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});

resizeCanvas();
seedPetals();
if(!reduced) raf=requestAnimationFrame(tick);
intro();
