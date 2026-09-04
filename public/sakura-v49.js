/* Sakura V4.9 — Interior Living Background Engine
   Motion grammar inspired by the supplied reference HTML; all assets are local Sakura artwork. */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const lowPower=navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4);

const configs=[
  {scene:'event',mode:'fade',delay:8800,first:'world',second:'glow'},
  {scene:'story',mode:'slide',delay:7600,first:'glow',second:'world'},
  {scene:'gallery',mode:'fade',delay:9200,first:'world',second:'glow'},
  {scene:'gift',mode:'fade',delay:9600,first:'glow',second:'world'},
  {scene:'rsvp',mode:'slide',delay:7800,first:'world',second:'glow'},
  {scene:'wishes',mode:'slide',delay:8200,first:'glow',second:'world'},
  {scene:'closing',mode:'fade',delay:10200,first:'world',second:'glow'}
];

const controllers=[];

function build(config){
  const section=document.querySelector(`.scene-${config.scene}`);
  if(!section)return null;
  section.querySelector(':scope > .v49-scene-bg')?.remove();

  const stage=document.createElement('div');
  stage.className=`v49-scene-bg v49-mode-${config.mode}`;
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <div class="v49-bg-layer is-active" data-art="${config.first}" data-index="0"></div>
    <div class="v49-bg-layer" data-art="${config.second}" data-index="1"></div>
    <div class="v49-scene-grade"></div>`;
  section.insertBefore(stage,section.firstChild);

  const layers=[...stage.querySelectorAll('.v49-bg-layer')];
  const motion=new Map();
  const settleTimers=new Set();
  let index=0;
  let timer=0;
  let visible=false;
  let cycle=0;

  function clearSettle(){
    settleTimers.forEach(clearTimeout);
    settleTimers.clear();
  }

  function animateLayer(layer,incoming=false){
    if(reduced || !layer?.animate)return;
    motion.get(layer)?.cancel();
    const alt=(cycle+Number(layer.dataset.index||0))%2===1;
    let frames;

    if(config.mode==='slide'){
      /* Reference has slide_left + Ken Burns; keep it subtle so it reads as camera motion, not a card swipe. */
      const from=alt
        ? 'translate3d(2.2%,0,0) scale(1.055)'
        : 'translate3d(1.7%,.18%,0) scale(1.048)';
      const to=alt
        ? 'translate3d(-2.4%,-.32%,0) scale(1.095)'
        : 'translate3d(-2.0%,-.28%,0) scale(1.088)';
      frames=[{transform:from},{transform:to}];
    }else{
      const from=alt
        ? 'translate3d(-.28%,.16%,0) scale(1.040)'
        : 'translate3d(.24%,.12%,0) scale(1.038)';
      const to=alt
        ? 'translate3d(.42%,-.34%,0) scale(1.088)'
        : 'translate3d(-.44%,-.30%,0) scale(1.084)';
      frames=[{transform:from},{transform:to}];
    }

    const duration=(config.mode==='slide' ? (coarse||lowPower?12400:11600) : (coarse||lowPower?13600:12600));
    const animation=layer.animate(frames,{
      duration,
      easing:'cubic-bezier(.22,.61,.36,1)',
      fill:'forwards'
    });
    motion.set(layer,animation);

    if(!incoming && !visible){
      try{animation.pause()}catch{}
    }
  }

  function sync(next){
    const previous=index;
    const nextIndex=(next+layers.length)%layers.length;
    if(nextIndex===previous)return;

    const outgoing=layers[previous];
    const incoming=layers[nextIndex];
    index=nextIndex;
    cycle+=1;

    incoming.classList.remove('is-previous');
    incoming.classList.add('is-active');
    outgoing.classList.remove('is-active');
    outgoing.classList.add('is-previous');
    animateLayer(incoming,true);

    const settleDelay=config.mode==='fade'?3600:2900;
    const settle=window.setTimeout(()=>{
      outgoing.classList.remove('is-previous');
      const old=motion.get(outgoing);
      old?.cancel();
      motion.delete(outgoing);
      settleTimers.delete(settle);
    },settleDelay);
    settleTimers.add(settle);
  }

  function stop(){
    clearInterval(timer);
    timer=0;
    motion.forEach(animation=>{try{animation.pause()}catch{}});
  }

  function start(){
    stop();
    if(reduced || !visible || document.hidden)return;
    const active=layers[index];
    const current=motion.get(active);
    if(current){try{current.play()}catch{}}
    else animateLayer(active,true);

    const delay=config.delay+(coarse||lowPower?1200:0);
    timer=window.setInterval(()=>sync(index+1),delay);
  }

  function setVisible(value){
    visible=value;
    if(visible)start();else stop();
  }

  if(reduced){
    layers.forEach((layer,i)=>layer.classList.toggle('is-active',i===0));
  }else{
    animateLayer(layers[0],true);
  }

  return {section,setVisible,start,stop,destroy(){
    stop();
    clearSettle();
    motion.forEach(animation=>animation.cancel());
    motion.clear();
    stage.remove();
  }};
}

configs.forEach(config=>{
  const controller=build(config);
  if(controller)controllers.push(controller);
});

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    const controller=controllers.find(item=>item.section===entry.target);
    if(!controller)return;
    controller.setVisible(Boolean(entry.isIntersecting && entry.intersectionRatio>=.12));
  });
},{threshold:[0,.12,.28,.52],rootMargin:'12% 0px 12% 0px'});
controllers.forEach(controller=>observer.observe(controller.section));

const onVisibility=()=>{
  controllers.forEach(controller=>{
    if(document.hidden)controller.stop();
    else{
      const rect=controller.section.getBoundingClientRect();
      const visible=rect.bottom>-(innerHeight*.12) && rect.top<innerHeight*1.12;
      controller.setVisible(visible);
    }
  });
};
document.addEventListener('visibilitychange',onVisibility);

window.addEventListener('pagehide',()=>{
  observer.disconnect();
  document.removeEventListener('visibilitychange',onVisibility);
  controllers.forEach(controller=>controller.destroy());
},{once:true});
