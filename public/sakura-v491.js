/* Sakura V4.9.1 — One shared slideshow engine for Date → Closing */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const main=document.querySelector('#invitationMain');
const scenes=[...document.querySelectorAll('.scene-date,.scene-event,.scene-story,.scene-gallery,.scene-gift,.scene-rsvp,.scene-wishes,.scene-closing')];
const assets=[
  '/assets/Sakura-v45/sakura-background-color.jpg.jpg',
  '/assets/Sakura-v45/sakura-name-frame-background.jpg',
  '/assets/sakura-v2-landscape.png'
];

if(main && scenes.length){
  document.querySelector('.v491-shared-stage')?.remove();

  const stage=document.createElement('div');
  stage.className='v491-shared-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML='<div class="v491-slide is-active"></div><div class="v491-slide"></div><div class="v491-tone"></div>';
  main.insertBefore(stage,main.firstChild);

  const layers=[...stage.querySelectorAll('.v491-slide')];
  let front=0;
  let assetIndex=0;
  let timer=0;
  let visible=false;
  const ratios=new Map(scenes.map(scene=>[scene,0]));

  /* Preload only three existing local assets. */
  assets.forEach(src=>{const img=new Image();img.decoding='async';img.src=src});
  layers[0].style.backgroundImage=`url('${assets[0]}')`;
  layers[1].style.backgroundImage=`url('${assets[1]}')`;

  function swap(){
    if(reduced || !visible || document.hidden)return;
    const back=1-front;
    assetIndex=(assetIndex+1)%assets.length;
    const incoming=layers[back];
    const outgoing=layers[front];

    incoming.style.transition='none';
    incoming.classList.remove('is-active');
    incoming.style.backgroundImage=`url('${assets[assetIndex]}')`;
    incoming.style.transform='translate3d(.18%,.12%,0) scale(1.012)';
    void incoming.offsetWidth;
    incoming.style.transition='';
    requestAnimationFrame(()=>{
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
    });
    front=back;
  }

  function stop(){
    clearInterval(timer);
    timer=0;
  }

  function start(){
    stop();
    if(reduced || !visible || document.hidden)return;
    timer=window.setInterval(swap,6800);
  }

  function refreshVisibility(){
    let bestScene=null;
    let bestRatio=0;
    ratios.forEach((ratio,scene)=>{
      if(ratio>bestRatio){bestRatio=ratio;bestScene=scene}
    });
    visible=bestRatio>.08;
    stage.classList.toggle('is-visible',visible);
    if(bestScene)stage.dataset.scene=bestScene.dataset.sakuraScene||'';
    if(visible)start();else stop();
  }

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>ratios.set(entry.target,entry.isIntersecting?entry.intersectionRatio:0));
    refreshVisibility();
  },{threshold:[0,.08,.18,.35,.55,.75],rootMargin:'5% 0px 5% 0px'});
  scenes.forEach(scene=>observer.observe(scene));

  function onVisibility(){
    if(document.hidden){stop();return}
    refreshVisibility();
  }
  document.addEventListener('visibilitychange',onVisibility);

  window.addEventListener('pagehide',()=>{
    stop();
    observer.disconnect();
    document.removeEventListener('visibilitychange',onVisibility);
    stage.remove();
  },{once:true});

  document.documentElement.dataset.sakuraInterior='v4.9.1-lite';
}
