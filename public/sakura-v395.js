/* Sakura V3.9.5 — Opening WOW Cinematic behavior */
const gsap = window.gsap;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const opening = document.querySelector('.scene-opening');
const artworkSrc = '/assets/sakura-v2-landscape.png';
let activeTimeline = null;

function buildStage(){
  if(!opening || opening.querySelector(':scope > .v395-stage')) return;
  const stage=document.createElement('div');
  stage.className='v395-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v395-far"><img src="${artworkSrc}" alt="" decoding="async"></div>
    <div class="v395-mid"><img src="${artworkSrc}" alt="" decoding="async"></div>
    <div class="v395-near-top"><img src="${artworkSrc}" alt="" decoding="async"></div>
    <div class="v395-near-bottom"><img src="${artworkSrc}" alt="" decoding="async"></div>
    <div class="v395-haze"></div>
    <div class="v395-beam"></div>
    <div class="v395-veil"></div>
    <div class="v395-portal"></div>
    <div class="v395-shimmer"></div>
    <div class="v395-burst">${Array.from({length:10},()=>'<i class="v395-petal"></i>').join('')}</div>`;
  opening.insertBefore(stage,opening.firstChild);
}

function setStaticState(){
  if(!opening) return;
  opening.classList.add('v395-complete');
  opening.dataset.v393Panel='ready';
}

function resetOpening(){
  if(!opening || !gsap) return;
  activeTimeline?.kill();
  const far=opening.querySelector('.v395-far');
  const farImg=opening.querySelector('.v395-far img');
  const mid=opening.querySelector('.v395-mid');
  const midImg=opening.querySelector('.v395-mid img');
  const nearTop=opening.querySelector('.v395-near-top');
  const nearTopImg=opening.querySelector('.v395-near-top img');
  const nearBottom=opening.querySelector('.v395-near-bottom');
  const nearBottomImg=opening.querySelector('.v395-near-bottom img');
  const haze=opening.querySelector('.v395-haze');
  const beam=opening.querySelector('.v395-beam');
  const veil=opening.querySelector('.v395-veil');
  const portal=opening.querySelector('.v395-portal');
  const shimmer=opening.querySelector('.v395-shimmer');
  const panel=opening.querySelector(':scope > .inv-shell');
  const text=[...opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy')];
  const petals=[...opening.querySelectorAll('.v395-petal')];

  opening.classList.remove('v395-complete','v395-playing');
  opening.dataset.v393Panel='waiting';
  gsap.killTweensOf([far,farImg,mid,midImg,nearTop,nearTopImg,nearBottom,nearBottomImg,haze,beam,veil,portal,shimmer,panel,...text,...petals]);
  gsap.set(far,{clipPath:'inset(0 13% 0 13% round 36px)'});
  gsap.set(farImg,{scale:1.13,y:18,x:0,rotation:0});
  gsap.set(mid,{opacity:.42});
  gsap.set(midImg,{scale:1.12,y:30,x:0});
  gsap.set(nearTop,{opacity:0,y:-24,x:-8});
  gsap.set(nearTopImg,{scale:1.22,y:-34,x:0});
  gsap.set(nearBottom,{opacity:0,y:34,x:7});
  gsap.set(nearBottomImg,{scale:1.19,y:42,x:0});
  gsap.set(haze,{opacity:0,scale:.96});
  gsap.set(beam,{opacity:0,xPercent:-28});
  gsap.set(veil,{clipPath:'inset(0 50% 0 50%)',opacity:.96});
  gsap.set(portal,{opacity:0,scale:.86,y:12});
  gsap.set(shimmer,{opacity:0});
  gsap.set(shimmer.querySelector('::before'),{});
  gsap.set(panel,{opacity:0,y:30,scale:.945,filter:'blur(10px)'});
  gsap.set(text,{opacity:0,y:18,filter:'blur(6px)'});
  petals.forEach((petal,i)=>{
    const angle=-145+i*31;
    const radius=74+(i%4)*28;
    const x=Math.cos(angle*Math.PI/180)*radius;
    const y=Math.sin(angle*Math.PI/180)*radius-26;
    petal.dataset.x=String(x);
    petal.dataset.y=String(y);
    gsap.set(petal,{x:0,y:0,rotation:-60+i*19,scale:.55+(i%3)*.12,opacity:0});
  });
}

function burstPetals(){
  if(!opening || !gsap || reduceMotion) return;
  const petals=[...opening.querySelectorAll('.v395-petal')];
  petals.forEach((petal,i)=>{
    const x=Number(petal.dataset.x||0);
    const y=Number(petal.dataset.y||0);
    gsap.fromTo(petal,
      {x:0,y:10,rotation:-45+i*17,opacity:0,scale:.5},
      {x,y,rotation:160+i*34,opacity:.92,duration:.9+(i%3)*.12,ease:'power2.out',delay:i*.028,onComplete:()=>{
        gsap.to(petal,{y:y+62,x:x+(i%2?24:-18),rotation:'+=110',opacity:0,duration:.75,ease:'power1.in'});
      }}
    );
  });
}

function playWowOpening(){
  if(!opening) return;
  if(reduceMotion || !gsap){setStaticState();return}
  resetOpening();
  opening.classList.add('v395-playing');

  const far=opening.querySelector('.v395-far');
  const farImg=opening.querySelector('.v395-far img');
  const mid=opening.querySelector('.v395-mid');
  const midImg=opening.querySelector('.v395-mid img');
  const nearTop=opening.querySelector('.v395-near-top');
  const nearTopImg=opening.querySelector('.v395-near-top img');
  const nearBottom=opening.querySelector('.v395-near-bottom');
  const nearBottomImg=opening.querySelector('.v395-near-bottom img');
  const haze=opening.querySelector('.v395-haze');
  const beam=opening.querySelector('.v395-beam');
  const veil=opening.querySelector('.v395-veil');
  const portal=opening.querySelector('.v395-portal');
  const shimmer=opening.querySelector('.v395-shimmer');
  const shimmerBar=shimmer?.querySelector('::before');
  const panel=opening.querySelector(':scope > .inv-shell');
  const eyebrow=opening.querySelector('.inv-eyebrow');
  const title=opening.querySelector('.inv-title');
  const rule=opening.querySelector('.inv-rule');
  const copy=opening.querySelector('.inv-copy');

  activeTimeline=gsap.timeline({defaults:{overwrite:'auto'},onComplete:()=>{
    opening.classList.remove('v395-playing');
    opening.classList.add('v395-complete');
    opening.dataset.v393Panel='ready';
  }});

  /* Beat 1: scene opens like a portal, not a simple fade. */
  activeTimeline
    .to(veil,{clipPath:'inset(0 0% 0 0%)',opacity:.2,duration:.72,ease:'power3.inOut'},0)
    .to(far,{clipPath:'inset(0 0% 0 0% round 0px)',duration:1.05,ease:'power4.out'},.03)
    .to(farImg,{scale:1.065,y:-5,duration:2.45,ease:'power2.inOut'},.02)
    .to(mid,{opacity:.7,duration:.65,ease:'power1.out'},.24)
    .to(midImg,{scale:1.075,y:4,duration:2.15,ease:'power2.out'},.18)

  /* Beat 2: foreground crosses at different speeds to create 2.5D depth. */
    .to(nearTop,{opacity:.9,y:0,x:0,duration:1.02,ease:'power3.out'},.56)
    .to(nearTopImg,{scale:1.125,y:-14,x:4,duration:1.65,ease:'power2.out'},.5)
    .to(nearBottom,{opacity:.92,y:0,x:0,duration:1.05,ease:'power3.out'},.66)
    .to(nearBottomImg,{scale:1.115,y:3,x:-3,duration:1.7,ease:'power2.out'},.6)

  /* Beat 3: light crosses the scene just before the reveal hit. */
    .to(haze,{opacity:.55,scale:1.05,duration:.8,ease:'power1.out'},.62)
    .to(beam,{opacity:.58,xPercent:145,duration:1.15,ease:'power2.inOut'},.9)
    .to(haze,{opacity:.22,duration:1.15,ease:'power1.inOut'},1.34)
    .add(burstPetals,1.18)

  /* Beat 4: frame lands first, then panel follows. */
    .to(portal,{opacity:1,scale:1.025,y:0,duration:.72,ease:'back.out(1.8)'},1.32)
    .to(portal,{scale:1,duration:.28,ease:'power2.out'},1.98)
    .to(shimmer,{opacity:1,duration:.12},1.6)
    .to(shimmer,{opacity:0,duration:.65,ease:'power1.out'},2.05)
    .to(panel,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.92,ease:'power3.out'},1.92)

  /* Beat 5: text has a hierarchy instead of appearing all at once. */
    .to(eyebrow,{opacity:1,y:0,filter:'blur(0px)',duration:.48,ease:'power2.out'},2.28)
    .to(title,{opacity:1,y:0,filter:'blur(0px)',duration:.68,ease:'power3.out'},2.46)
    .to(rule,{opacity:1,y:0,filter:'blur(0px)',duration:.42,ease:'power2.out'},2.72)
    .to(copy,{opacity:1,y:0,filter:'blur(0px)',duration:.62,ease:'power2.out'},2.86)

  /* Beat 6: everything settles instead of freezing abruptly. */
    .to(farImg,{scale:1.035,y:-4,duration:1.05,ease:'power2.out'},3.02)
    .to(midImg,{scale:1.045,y:0,duration:1.05,ease:'power2.out'},3.02)
    .to(nearTop,{opacity:.7,duration:.7,ease:'power1.out'},3.18)
    .to(nearBottom,{opacity:.78,duration:.7,ease:'power1.out'},3.18)
    .to(veil,{opacity:0,duration:.55,ease:'power1.out'},3.22);
}

function setupVisibilityGuard(){
  const onVisibility=()=>{
    if(!activeTimeline) return;
    document.hidden ? activeTimeline.pause() : activeTimeline.resume();
  };
  document.addEventListener('visibilitychange',onVisibility);
  return ()=>document.removeEventListener('visibilitychange',onVisibility);
}

buildStage();
document.body.dataset.sakuraFinalCandidate='v3.9.5';
document.title='Sakura Vintage V3.9.5 WOW Cinematic · Dini Anif Effect Lab';
if(reduceMotion) setStaticState();
const cleanupVisibility=setupVisibilityGuard();
window.addEventListener('sakura:opened',playWowOpening);
window.addEventListener('pagehide',()=>{
  window.removeEventListener('sakura:opened',playWowOpening);
  activeTimeline?.kill();
  cleanupVisibility?.();
},{once:true});
