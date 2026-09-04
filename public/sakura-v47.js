/* Sakura V4.7 — Save The Date cinematic background slideshow */
const section=document.querySelector('.scene-date');
if(section){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer: coarse)').matches;
  const lowPower=navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4);

  section.querySelector(':scope > .v47-slideshow')?.remove();
  const stage=document.createElement('div');
  stage.className='v47-slideshow';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v47-slide is-active" data-slide="0"></div>
    <div class="v47-slide" data-slide="1"></div>
    <div class="v47-decor"></div>
    <div class="v47-grade"></div>
    <div class="v47-slide-dots"><i class="is-active"></i><i></i></div>`;
  section.insertBefore(stage,section.firstChild);

  const slides=[...stage.querySelectorAll('.v47-slide')];
  const dots=[...stage.querySelectorAll('.v47-slide-dots i')];
  let index=0;
  let timer=0;
  let visible=false;

  function sync(next){
    const previous=index;
    index=(next+slides.length)%slides.length;
    slides.forEach((slide,i)=>{
      slide.classList.toggle('is-active',i===index);
      slide.classList.toggle('is-previous',i===previous && i!==index);
      if(i===index){
        /* restart Ken Burns every time this still becomes active */
        slide.style.animation='none';
        void slide.offsetWidth;
        slide.style.animation='';
      }
    });
    dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));
  }

  function stop(){
    clearInterval(timer);
    timer=0;
    section.classList.remove('v47-running');
  }

  function start(){
    stop();
    if(reduced || !visible || document.hidden)return;
    section.classList.add('v47-running');
    const delay=(lowPower||coarse)?7600:6400;
    timer=window.setInterval(()=>sync(index+1),delay);
  }

  const observer=new IntersectionObserver(entries=>{
    const entry=entries[0];
    visible=Boolean(entry?.isIntersecting && entry.intersectionRatio>=.16);
    if(visible)start();else stop();
  },{threshold:[0,.16,.35,.6],rootMargin:'8% 0px 8% 0px'});
  observer.observe(section);

  const onVisibility=()=>{if(document.hidden)stop();else if(visible)start()};
  document.addEventListener('visibilitychange',onVisibility);

  if(reduced){
    section.classList.add('v47-static');
    sync(0);
  }

  window.addEventListener('pagehide',()=>{
    stop();
    observer.disconnect();
    document.removeEventListener('visibilitychange',onVisibility);
  },{once:true});
}
