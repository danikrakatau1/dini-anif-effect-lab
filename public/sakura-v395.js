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
    <div class="v395-shimmer"><i class="v395-shimmer-bar" style="position:absolute;top:-18%;bottom:-18%;left:-34%;width:24%;background:linear-gradient(90deg,transparent,rgba(255,245,204,.82),transparent);transform:skewX(-18deg);filter:blur(2px)"></i></div>
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
  const shimmerBar=opening.querySelector('.v395-shimmer-bar');
  const panel=opening.querySelector(':scope > .inv-shell');
  const text=[...opening.querySelectorAll('.inv-eyebrow,.inv-title,.inv-rule,.inv-copy')];
  const petals=[...opening.querySelectorAll('.v395-petal')];

  opening.classList.remove('v395-complete','v395-playing');
  opening.dataset.v393Panel='waiting';
  gsap.killTweensOf([far,farImg,mid,midImg,nearTop,nearTopImg,nearBottom,nearBottomImg,haze,beam,veil,portal,shimmer,shimmerBar,panel,...text,...petals]);
  gsap.set(far,{clipPath:'inset(0 13% 0 13% round 36px)'});
  gsap.set(farImg,{scale:1.13,y:18,x:0});
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
  gsap.set(shimmerBar,{xPercent:0});
  gsap.set(panel,{opacity:0,y:30,scale:.945,filter:'blur(10px)'});
  gsap.set(text,{opacity:0,y:18,filter:'blur(6px)'});

  petals.forEach((petal,i)=>{
    const angle=-145+i*31;
    const radius=74+(i%4)*28;
    petal.dataset.x=String(Math.cos(angle*Math.PI/180)*radius);
    petal.dataset.y=String(Math.sin(angle*Math.PI/180)*radius-26);
    gsap.set(petal,{x:0,y:0,rotation:-60+i*19,scale:.55+(i%3)*.12,opacity:0});
  });
}

function burstPetals(){
  if(!opening || !gsap || reduceMotion) return;
  [...opening.querySelectorAll('.v395-petal')].forEach((petal,i)=>{
    const x=Number(petal.dataset.x||0),y=Number(petal.dataset.y||0);
    gsap.fromTo(petal,{x:0,y:10,rotation:-45+i*17,opacity:0,scale:.5},{x,y,rotation:160+i*34,opacity:.92,duration:.9+(i%3)*.12,ease:'power2.out',delay:i*.028,onComplete:()=>{
      gsap.to(petal,{y:y+62,x:x+(i%2?24:-18),rotation:'+=110',opacity:0,duration:.75,ease:'power1.in'});
    }});
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
  const shimmerBar=opening.querySelector('.v395-shimmer-bar');
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

  activeTimeline
    /* Beat 1 — portal world opens */
    .to(veil,{clipPath:'inset(0 0% 0 0%)',opacity:.2,duration:.72,ease:'power3.inOut'},0)
    .to(far,{clipPath:'inset(0 0% 0 0% round 0px)',duration:1.05,ease:'power4.out'},.03)
    .to(farImg,{scale:1.065,y:-5,duration:2.45,ease:'power2.inOut'},.02)
    .to(mid,{opacity:.7,duration:.65,ease:'power1.out'},.24)
    .to(midImg,{scale:1.075,y:4,duration:2.15,ease:'power2.out'},.18)

    /* Beat 2 — near plates cross at different speed */
    .to(nearTop,{opacity:.9,y:0,x:0,duration:1.02,ease:'power3.out'},.56)
    .to(nearTopImg,{scale:1.125,y:-14,x:4,duration:1.65,ease:'power2.out'},.5)
    .to(nearBottom,{opacity:.92,y:0,x:0,duration:1.05,ease:'power3.out'},.66)
    .to(nearBottomImg,{scale:1.115,y:3,x:-3,duration:1.7,ease:'power2.out'},.6)

    /* Beat 3 — hero light + petal burst */
    .to(haze,{opacity:.55,scale:1.05,duration:.8,ease:'power1.out'},.62)
    .to(beam,{opacity:.58,xPercent:145,duration:1.15,ease:'power2.inOut'},.9)
    .to(haze,{opacity:.22,duration:1.15,ease:'power1.inOut'},1.34)
    .add(burstPetals,1.18)

    /* Beat 4 — frame lands and gold line sweeps */
    .to(portal,{opacity:1,scale:1.025,y:0,duration:.72,ease:'back.out(1.8)'},1.32)
    .to(portal,{scale:1,duration:.28,ease:'power2.out'},1.98)
    .to(shimmer,{opacity:1,duration:.08},1.56)
    .to(shimmerBar,{xPercent:650,duration:.72,ease:'power2.inOut'},1.58)
    .to(shimmer,{opacity:0,duration:.22,ease:'power1.out'},2.22)
    .to(panel,{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.92,ease:'power3.out'},1.92)

    /* Beat 5 — readable text hierarchy */
    .to(eyebrow,{opacity:1,y:0,filter:'blur(0px)',duration:.48,ease:'power2.out'},2.28)
    .to(title,{opacity:1,y:0,filter:'blur(0px)',duration:.68,ease:'power3.out'},2.46)
    .to(rule,{opacity:1,y:0,filter:'blur(0px)',duration:.42,ease:'power2.out'},2.72)
    .to(copy,{opacity:1,y:0,filter:'blur(0px)',duration:.62,ease:'power2.out'},2.86)

    /* Beat 6 — settle, keep subtle life */
    .to(farImg,{scale:1.035,y:-4,duration:1.05,ease:'power2.out'},3.02)
    .to(midImg,{scale:1.045,y:0,duration:1.05,ease:'power2.out'},3.02)
    .to(nearTop,{opacity:.7,duration:.7,ease:'power1.out'},3.18)
    .to(nearBottom,{opacity:.78,duration:.7,ease:'power1.out'},3.18)
    .to(veil,{opacity:0,duration:.55,ease:'power1.out'},3.22);
}

function onOpened(event){
  /* Capture phase makes V3.9.5 the only opening timeline. */
  event.stopImmediatePropagation();
  playWowOpening();
}

function setupVisibilityGuard(){
  const onVisibility=()=>{if(activeTimeline) document.hidden ? activeTimeline.pause() : activeTimeline.resume()};
  document.addEventListener('visibilitychange',onVisibility);
  return ()=>document.removeEventListener('visibilitychange',onVisibility);
}

buildStage();
document.body.dataset.sakuraFinalCandidate='v3.9.5';
document.title='Sakura Vintage V3.9.5 WOW Cinematic · Dini Anif Effect Lab';
if(reduceMotion) setStaticState();
const cleanupVisibility=setupVisibilityGuard();
window.addEventListener('sakura:opened',onOpened,{capture:true});
window.addEventListener('pagehide',()=>{
  window.removeEventListener('sakura:opened',onOpened,{capture:true});
  activeTimeline?.kill();
  cleanupVisibility?.();
},{once:true});
