/* Sakura V4.9.2 — Natural lightweight interior motion */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Remove old shared experiment if a cached V4.9.1 created it first. */
document.querySelector('.v491-shared-stage')?.remove();

/* SAVE THE DATE: the only true background slideshow. */
const date=document.querySelector('.scene-date');
let dateTimer=0;
let dateObserver=null;
let dateVisible=false;

if(date){
  date.querySelector(':scope > .v492-date-stage')?.remove();
  const stage=document.createElement('div');
  stage.className='v492-date-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v492-date-slide is-active"></div>
    <div class="v492-date-slide"></div>
    <div class="v492-date-grade"></div>`;
  date.insertBefore(stage,date.firstChild);

  const slides=[...stage.querySelectorAll('.v492-date-slide')];
  const assets=[
    '/assets/Sakura-v45/sakura-background-color.jpg.jpg',
    '/assets/Sakura-v45/sakura-name-frame-background.jpg'
  ];
  slides[0].style.backgroundImage=`url('${assets[0]}')`;
  slides[1].style.backgroundImage=`url('${assets[1]}')`;
  assets.forEach(src=>{const img=new Image();img.decoding='async';img.src=src});

  let front=0;
  let assetIndex=0;

  function swapDate(){
    if(reduced || !dateVisible || document.hidden)return;
    const back=1-front;
    assetIndex=(assetIndex+1)%assets.length;
    const incoming=slides[back];
    const outgoing=slides[front];
    incoming.style.backgroundImage=`url('${assets[assetIndex]}')`;
    incoming.classList.add('is-active');
    outgoing.classList.remove('is-active');
    front=back;
  }

  function stopDate(){clearInterval(dateTimer);dateTimer=0}
  function startDate(){
    stopDate();
    if(reduced || !dateVisible || document.hidden)return;
    dateTimer=setInterval(swapDate,6200);
  }

  dateObserver=new IntersectionObserver(entries=>{
    const entry=entries[0];
    dateVisible=Boolean(entry?.isIntersecting && entry.intersectionRatio>=.10);
    if(dateVisible)startDate();else stopDate();
  },{threshold:[0,.1,.25,.5],rootMargin:'8% 0px 8% 0px'});
  dateObserver.observe(date);
}

/* LOWER SECTIONS: one local artwork each; only the visible section drifts. */
const lower=[...document.querySelectorAll('.scene-event,.scene-story,.scene-gallery,.scene-gift,.scene-rsvp,.scene-wishes,.scene-closing')];
let lowerObserver=null;
if(lower.length){
  lowerObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      entry.target.classList.toggle('v492-active',Boolean(entry.isIntersecting && entry.intersectionRatio>=.18));
    });
  },{threshold:[0,.18,.4,.65],rootMargin:'6% 0px 6% 0px'});
  lower.forEach(section=>lowerObserver.observe(section));
}

function onVisibility(){
  if(document.hidden){
    clearInterval(dateTimer);dateTimer=0;
  }else if(dateVisible && !reduced){
    clearInterval(dateTimer);
    dateTimer=setInterval(()=>{
      const active=date?.querySelectorAll('.v492-date-slide');
      if(active?.length===2){
        /* trigger through the same local closure behavior by restarting page-local timer naturally */
        active[0].dispatchEvent(new Event('v492-noop'));
      }
    },6200);
    /* Replace noop timer immediately with a fresh observer-driven cycle. */
    clearInterval(dateTimer);dateTimer=0;
    dateObserver?.unobserve(date);
    dateObserver?.observe(date);
  }
}
document.addEventListener('visibilitychange',onVisibility);

document.documentElement.dataset.sakuraInterior='v4.9.2-natural';

window.addEventListener('pagehide',()=>{
  clearInterval(dateTimer);
  dateObserver?.disconnect();
  lowerObserver?.disconnect();
  document.removeEventListener('visibilitychange',onVisibility);
},{once:true});
