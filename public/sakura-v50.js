/* Sakura V5.0.2 — Tools Motion Engine Adapter + Guaranteed Date Slideshow
   Architecture transplanted from WeddingVisualEngine as an independent Dini runtime.
   Source tools repo remains read-only. */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const lowPower=Boolean(navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4));
const root=document.querySelector('#invitationMain');

class Timeline{
  constructor(){this.timers=new Set()}
  at(ms,callback){
    const timer=setTimeout(()=>{this.timers.delete(timer);callback?.()},Math.max(0,Number(ms)||0));
    this.timers.add(timer);
    return timer;
  }
  cancel(){this.timers.forEach(clearTimeout);this.timers.clear()}
}

function createSceneObserver(onEnter,onLeave){
  if(!('IntersectionObserver' in window)){
    return {observe(el){onEnter?.(el)},disconnect(){}};
  }
  return new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && entry.intersectionRatio>=.08) onEnter?.(entry.target,entry);
      else if(!entry.isIntersecting || entry.intersectionRatio<.02) onLeave?.(entry.target,entry);
    });
  },{threshold:[0,.02,.08,.22,.45],rootMargin:'12% 0px 12% 0px'});
}

class SakuraToolsMotionEngine{
  constructor(root){
    this.root=root;
    this.timeline=new Timeline();
    this.raf=0;
    this.pointer={x:0,y:0};
    this.activeScene=null;
    this.dateScene=null;
    this.dateStage=null;
    this.dateSlides=[];
    this.dateFront=0;
    this.dateSourceIndex=0;
    this.dateVisible=false;
    this.dateSwapBusy=false;
    this.dateCycleCount=0;
    this.sceneObserver=null;
    this.boundScroll=()=>{this.updateDateViewport();this.scheduleDecor()};
    this.boundResize=()=>{this.updateDateViewport();this.scheduleDecor()};
    this.boundPointer=e=>this.onPointer(e);
    this.boundVisibility=()=>this.onVisibility();
    this.assets={
      world:'/assets/Sakura-v45/sakura-background-color.jpg.jpg',
      glow:'/assets/Sakura-v45/sakura-name-frame-background.jpg',
      vintage:'/assets/sakura-v2-landscape.png'
    };
    this.dateSources=[this.assets.world,this.assets.glow,this.assets.vintage];
  }

  mount(){
    if(!this.root)return;
    this.cleanupLegacy();
    this.buildDate();
    this.buildLowerScenes();
    this.bindScenes();
    this.startDecorMotion();
    requestAnimationFrame(()=>this.updateDateViewport());
    setTimeout(()=>this.updateDateViewport(),450);
    document.documentElement.dataset.sakuraInterior='v5.0.2-tools-engine';
  }

  cleanupLegacy(){
    this.root.querySelectorAll('.v491-shared-stage,.v492-date-stage,.v49-scene-bg').forEach(node=>node.remove());
  }

  buildDate(){
    const scene=this.root.querySelector('.scene-date');
    if(!scene)return;
    this.dateScene=scene;
    scene.querySelector(':scope > .v50-date-stage')?.remove();

    const stage=document.createElement('div');
    stage.className='v50-date-stage';
    stage.setAttribute('aria-hidden','true');
    stage.innerHTML='<img class="v50-date-slide is-active" data-variant="a" alt="" decoding="async" draggable="false"><img class="v50-date-slide" data-variant="b" alt="" decoding="async" draggable="false"><div class="v50-date-grade"></div>';
    scene.insertBefore(stage,scene.firstChild);
    this.dateStage=stage;
    this.dateSlides=[...stage.querySelectorAll('.v50-date-slide')];

    this.dateSlides[0].src=this.dateSources[0];
    this.dateSlides[1].src=this.dateSources[1];
    this.dateSlides[0].dataset.sourceIndex='0';
    this.dateSlides[1].dataset.sourceIndex='1';

    const warm1=new Image();warm1.decoding='async';warm1.src=this.dateSources[1];
    const warm2=new Image();warm2.decoding='async';warm2.src=this.dateSources[2];
  }

  buildLowerScenes(){
    const mappings=[
      ['event',this.assets.world,'50% 46%'],
      ['story',this.assets.glow,'50% 44%'],
      ['gallery',this.assets.world,'50% 50%'],
      ['gift',this.assets.glow,'50% 42%'],
      ['rsvp',this.assets.world,'50% 48%'],
      ['wishes',this.assets.glow,'50% 44%'],
      ['closing',this.assets.world,'50% 52%']
    ];

    mappings.forEach(([name,src,pos])=>{
      const scene=this.root.querySelector(`.scene-${name}`);
      if(!scene)return;
      scene.querySelector(':scope > .v50-living-art')?.remove();
      const art=document.createElement('div');
      art.className='v50-living-art';
      art.setAttribute('aria-hidden','true');
      art.dataset.parallaxDepth=name==='gallery'?'0.10':name==='closing'?'0.12':'0.08';
      art.style.backgroundImage=`url('${src}')`;
      art.style.backgroundPosition=pos;
      scene.insertBefore(art,scene.firstChild);
    });
  }

  bindScenes(){
    /* Date uses direct viewport detection; lower scenes use observer. */
    const scenes=[...this.root.querySelectorAll('.scene-event,.scene-story,.scene-gallery,.scene-gift,.scene-rsvp,.scene-wishes,.scene-closing')];
    this.sceneObserver=createSceneObserver(
      scene=>this.enterScene(scene),
      scene=>this.leaveScene(scene)
    );
    scenes.forEach(scene=>this.sceneObserver.observe(scene));
  }

  enterScene(scene){
    if(this.activeScene && this.activeScene!==scene)this.activeScene.classList.remove('v50-active');
    this.activeScene=scene;
    scene.classList.add('v50-active');
    this.scheduleDecor();
  }

  leaveScene(scene){
    scene.classList.remove('v50-active');
    if(this.activeScene===scene)this.activeScene=null;
  }

  updateDateViewport(){
    if(!this.dateScene)return;
    const rect=this.dateScene.getBoundingClientRect();
    const vh=Math.max(window.innerHeight||document.documentElement.clientHeight||1,1);
    const near=rect.bottom>(-vh*.18) && rect.top<(vh*1.18);

    if(near && !this.dateVisible){
      this.dateVisible=true;
      this.dateScene.classList.add('v50-active','v50-date-running');
      this.dateCycleCount=0;
      this.scheduleDateSwap(true);
    } else if(!near && this.dateVisible){
      this.dateVisible=false;
      this.dateScene.classList.remove('v50-active','v50-date-running');
      this.timeline.cancel();
    }
  }

  scheduleDateSwap(first=false){
    this.timeline.cancel();
    if(!this.dateVisible || document.hidden || this.dateSlides.length!==2)return;
    const delay=first?950:(lowPower?5600:4400);
    this.timeline.at(delay,async()=>{
      if(!this.dateVisible || document.hidden)return;
      await this.swapDate();
      this.dateCycleCount+=1;
      if(this.dateVisible && !document.hidden)this.scheduleDateSwap(false);
    });
  }

  async swapDate(){
    if(this.dateSwapBusy || this.dateSlides.length!==2)return;
    this.dateSwapBusy=true;

    const incomingIndex=1-this.dateFront;
    const incoming=this.dateSlides[incomingIndex];
    const outgoing=this.dateSlides[this.dateFront];
    const nextSourceIndex=(this.dateSourceIndex+1)%this.dateSources.length;
    const nextSrc=this.dateSources[nextSourceIndex];

    try{
      const currentIndex=Number(incoming.dataset.sourceIndex||-1);
      if(currentIndex!==nextSourceIndex){
        incoming.src=nextSrc;
        incoming.dataset.sourceIndex=String(nextSourceIndex);
        try{await Promise.race([incoming.decode?.()||Promise.resolve(),new Promise(r=>setTimeout(r,700))])}catch{}
      }

      if(!this.dateVisible || document.hidden)return;

      incoming.dataset.variant=['a','b','c'][nextSourceIndex%3];
      incoming.style.zIndex='2';
      outgoing.style.zIndex='1';
      incoming.getBoundingClientRect();
      requestAnimationFrame(()=>{
        incoming.classList.add('is-active');
        outgoing.classList.remove('is-active');
      });

      this.dateFront=incomingIndex;
      this.dateSourceIndex=nextSourceIndex;
    } finally {
      this.dateSwapBusy=false;
    }
  }

  startDecorMotion(){
    addEventListener('scroll',this.boundScroll,{passive:true});
    addEventListener('resize',this.boundResize,{passive:true});
    if(!coarse && !lowPower)this.root.addEventListener('pointermove',this.boundPointer,{passive:true});
    document.addEventListener('visibilitychange',this.boundVisibility);
    this.scheduleDecor();
  }

  onPointer(event){
    const rect=this.root.getBoundingClientRect();
    this.pointer.x=((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*2;
    this.pointer.y=((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*2;
    this.scheduleDecor();
  }

  scheduleDecor(){
    if(this.raf || reduced)return;
    this.raf=requestAnimationFrame(()=>{
      this.raf=0;
      this.renderDecor();
    });
  }

  renderDecor(){
    const scene=this.activeScene;
    if(!scene)return;
    const art=scene.querySelector(':scope > .v50-living-art');
    if(!art)return;

    const rect=scene.getBoundingClientRect();
    const vh=Math.max(innerHeight,1);
    const center=(rect.top+rect.height/2)-vh/2;
    const scrollY=Math.max(-1,Math.min(1,center/Math.max(vh,1)));
    const depth=Number(art.dataset.parallaxDepth||.08);
    const px=(!coarse&&!lowPower?this.pointer.x*depth*18:0);
    const py=(-scrollY*depth*38)+(!coarse&&!lowPower?this.pointer.y*depth*7:0);
    const scale=lowPower?1.025:1.035+Math.max(0,1-Math.abs(scrollY))*.012;

    art.style.setProperty('--v50-parallax-x',`${px.toFixed(2)}px`);
    art.style.setProperty('--v50-parallax-y',`${py.toFixed(2)}px`);
    art.style.setProperty('--v50-parallax-scale',scale.toFixed(4));
  }

  onVisibility(){
    if(document.hidden){
      this.timeline.cancel();
      return;
    }
    this.updateDateViewport();
    if(this.dateVisible)this.scheduleDateSwap(true);
    this.scheduleDecor();
  }

  destroy(){
    this.timeline.cancel();
    this.sceneObserver?.disconnect();
    if(this.raf)cancelAnimationFrame(this.raf);
    removeEventListener('scroll',this.boundScroll);
    removeEventListener('resize',this.boundResize);
    this.root?.removeEventListener('pointermove',this.boundPointer);
    document.removeEventListener('visibilitychange',this.boundVisibility);
    this.root?.querySelectorAll('.v50-date-stage,.v50-living-art').forEach(node=>node.remove());
  }
}

const engine=root?new SakuraToolsMotionEngine(root):null;
engine?.mount();
window.__SAKURA_TOOLS_MOTION_ENGINE=engine;
window.addEventListener('pagehide',()=>engine?.destroy(),{once:true});
