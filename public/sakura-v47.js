/* Sakura V4.7.2 — Save The Date cinematic background slideshow, smooth optical dissolve */
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
  const motion=new Map();
  const settleTimers=new Set();
  let index=0;
  let timer=0;
  let visible=false;
  let cycle=0;

  function clearSettleTimers(){
    settleTimers.forEach(clearTimeout);
    settleTimers.clear();
  }

  function startMotion(slide,variant=0){
    if(reduced || !slide?.animate)return;
    motion.get(slide)?.cancel();
    const alternate=(cycle+variant)%2===1;
    const from=alternate
      ? 'scale(1.035) translate3d(-0.28%,0.12%,0)'
      : 'scale(1.032) translate3d(0.24%,0.10%,0)';
    const to=alternate
      ? 'scale(1.086) translate3d(0.44%,-0.34%,0)'
      : 'scale(1.082) translate3d(-0.46%,-0.30%,0)';
    const animation=slide.animate(
      [{transform:from},{transform:to}],
      {
        duration:(lowPower||coarse)?11600:10600,
        easing:'cubic-bezier(.22,.61,.36,1)',
        fill:'forwards'
      }
    );
    motion.set(slide,animation);
  }

  function sync(next){
    const previous=index;
    const nextIndex=(next+slides.length)%slides.length;
    if(nextIndex===previous)return;

    const previousSlide=slides[previous];
    const nextSlide=slides[nextIndex];
    index=nextIndex;
    cycle+=1;

    /* Incoming still starts its slow camera move immediately; outgoing still keeps moving during dissolve. */
    nextSlide.classList.remove('is-previous');
    nextSlide.classList.add('is-active');
    previousSlide.classList.remove('is-active');
    previousSlide.classList.add('is-previous');
    startMotion(nextSlide,nextIndex);

    dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index));

    const settle=window.setTimeout(()=>{
      previousSlide.classList.remove('is-previous');
      const oldAnimation=motion.get(previousSlide);
      oldAnimation?.cancel();
      motion.delete(previousSlide);
      settleTimers.delete(settle);
    },2600);
    settleTimers.add(settle);
  }

  function stop(){
    clearInterval(timer);
    timer=0;
    section.classList.remove('v47-running');
    motion.forEach(animation=>animation.pause());
  }

  function start(){
    stop();
    if(reduced || !visible || document.hidden)return;
    section.classList.add('v47-running');
    const active=slides[index];
    const current=motion.get(active);
    if(current){
      try{current.play()}catch{}
    }else{
      startMotion(active,index);
    }
    const delay=(lowPower||coarse)?9000:8200;
    timer=window.setInterval(()=>sync(index+1),delay);
  }

  const observer=new IntersectionObserver(entries=>{
    const entry=entries[0];
    visible=Boolean(entry?.isIntersecting && entry.intersectionRatio>=.14);
    if(visible)start();else stop();
  },{threshold:[0,.14,.3,.55],rootMargin:'10% 0px 10% 0px'});
  observer.observe(section);

  const onVisibility=()=>{if(document.hidden)stop();else if(visible)start()};
  document.addEventListener('visibilitychange',onVisibility);

  if(reduced){
    section.classList.add('v47-static');
    slides.forEach((slide,i)=>slide.classList.toggle('is-active',i===0));
  }

  window.addEventListener('pagehide',()=>{
    stop();
    clearSettleTimers();
    motion.forEach(animation=>animation.cancel());
    motion.clear();
    observer.disconnect();
    document.removeEventListener('visibilitychange',onVisibility);
  },{once:true});
}
