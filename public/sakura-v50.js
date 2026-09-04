/* Sakura V5.0 — Tools Motion Engine Adapter
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
      if(entry.isIntersecting && entry.intersectionRatio>=.18) onEnter?.(entry.target,entry);
      else if(!entry.isIntersecting || entry.intersectionRatio<.08) onLeave?.(entry.target,entry);
    });
  },{threshold:[0,.08,.18,.36,.55],rootMargin:'8% 0px 8% 0px'});
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
    this.dateAssetIndex=0;
    this.dateVisible=false;
    this.sceneObserver=null;
    this.boundScroll=()=>this.scheduleDecor();
    this.boundPointer=e=>this.onPointer(e);
    this.boundVisibility=()=>this.onVisibility();
    this.assets={
      world:'/assets/Sakura-v45/sakura-background-color.jpg.jpg',
      glow:'/assets/Sakura-v45/sakura-name-frame-background.jpg'
    };
  }

  mount(){
    if(!this.root)return;
    this.cleanupLegacy();
    this.buildDate();
    this.buildLowerScenes();
    this.bindScenes();
    this.startDecorMotion();
    document.documentElement.dataset.sakuraInterior='v5.0-tools-engine';
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
    stage.innerHTML='<div class="v50-date-slide is-active" data-variant="a"></div><div class="v50-date-slide" data-variant="b"></div><div class="v50-date-grade"></div>';
    scene.insertBefore(stage,scene.firstChild);
    this.dateStage=stage;
    this.dateSlides=[...stage.querySelectorAll('.v50-date-slide')];

    const urls=[this.assets.world,this.assets.glow];
    this.dateSlides[0].style.backgroundImage=`url('${urls[0]}')`;
    this.dateSlides[1].style.backgroundImage=`url('${urls[1]}')`;
    urls.forEach(src=>{const img=new Image();img.decoding='async';img.src=src});
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
    const scenes=[...this.root.querySelectorAll('.scene-date,.scene-event,.scene-story,.scene-gallery,.scene-gift,.scene-rsvp,.scene-wishes,.scene-closing')];
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
    if(scene===this.dateScene){
      this.dateVisible=true;
      this.scheduleDateSwap();
    }
    this.scheduleDecor();
  }

  leaveScene(scene){
    scene.classList.remove('v50-active');
    if(scene===this.dateScene){
      this.dateVisible=false;
      this.timeline.cancel();
    }
    if(this.activeScene===scene)this.activeScene=null;
  }

  scheduleDateSwap(){
    this.timeline.cancel();
    if(reduced || !this.dateVisible || document.hidden || this.dateSlides.length!==2)return;
    const delay=lowPower?8200:7600;
    this.timeline.at(delay,()=>{
      if(!this.dateVisible || document.hidden)return;
      this.swapDate();
      this.scheduleDateSwap();
    });
  }

  swapDate(){
    const incomingIndex=1-this.dateFront;
    const incoming=this.dateSlides[incomingIndex];
    const outgoing=this.dateSlides[this.dateFront];
    if(!incoming||!outgoing)return;

    this.dateAssetIndex=(this.dateAssetIndex+1)%2;
    const src=this.dateAssetIndex===0?this.assets.world:this.assets.glow;
    incoming.style.backgroundImage=`url('${src}')`;
    incoming.dataset.variant=incoming.dataset.variant==='a'?'b':'a';

    requestAnimationFrame(()=>{
      incoming.classList.add('is-active');
      outgoing.classList.remove('is-active');
    });
    this.dateFront=incomingIndex;
  }

  startDecorMotion(){
    addEventListener('scroll',this.boundScroll,{passive:true});
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
    if(!scene || scene===this.dateScene)return;
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
    if(this.dateVisible)this.scheduleDateSwap();
    this.scheduleDecor();
  }

  destroy(){
    this.timeline.cancel();
    this.sceneObserver?.disconnect();
    if(this.raf)cancelAnimationFrame(this.raf);
    removeEventListener('scroll',this.boundScroll);
    this.root?.removeEventListener('pointermove',this.boundPointer);
    document.removeEventListener('visibilitychange',this.boundVisibility);
    this.root?.querySelectorAll('.v50-date-stage,.v50-living-art').forEach(node=>node.remove());
  }
}

const engine=root?new SakuraToolsMotionEngine(root):null;
engine?.mount();
window.__SAKURA_TOOLS_MOTION_ENGINE=engine;
window.addEventListener('pagehide',()=>engine?.destroy(),{once:true});
