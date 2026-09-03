const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

export function initSakuraEffects(root=document){
  const scope=root instanceof Element?root:document;
  const host=scope instanceof Element?scope:document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer: coarse)').matches;
  const saveData=Boolean(navigator.connection?.saveData);
  const gsap=window.gsap;
  const disposers=[];
  let revealObserver=null;
  let ambientObserver=null;
  let petalController=null;
  let tiltX=0,tiltY=0;

  document.documentElement.classList.add('sakura-fx-ready');

  const revealItems=[...scope.querySelectorAll('[data-sakura-reveal]')];
  const introItems=[...scope.querySelectorAll('[data-sakura-intro]')];
  [...scope.querySelectorAll('[data-sakura-cascade]')].forEach(group=>{
    [...group.children].forEach((el,i)=>el.style.setProperty('--sakura-index',i));
  });

  function reveal(el){el.classList.add('is-revealed')}
  function resetReveal(el){el.classList.remove('is-revealed')}
  function playIntro(){
    introItems.forEach((el,i)=>{
      resetReveal(el);
      el.style.setProperty('--sakura-delay',`${120+i*105}ms`);
    });
    requestAnimationFrame(()=>introItems.forEach(reveal));
  }

  if(reduced){[...introItems,...revealItems].forEach(reveal)}else{
    revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        reveal(entry.target);
        revealObserver.unobserve(entry.target);
      });
    },{threshold:.18,rootMargin:'0px 0px -8% 0px'});
    revealItems.forEach(el=>revealObserver.observe(el));
    playIntro();
  }

  const ambientItems=[...scope.querySelectorAll('[data-sakura-ambient]')];
  if(ambientItems.length){
    ambientObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
      entry.target.classList.toggle('is-sakura-active',entry.isIntersecting);
    }),{threshold:.2,rootMargin:'15% 0px 15% 0px'});
    ambientItems.forEach(el=>ambientObserver.observe(el));
  }

  const parallaxRoot=scope.matches?.('[data-sakura-parallax-root]')?scope:scope.querySelector('[data-sakura-parallax-root]');
  function resetParallax(){
    tiltX=0;tiltY=0;
    parallaxRoot?.style.setProperty('--parallax-x','0px');
    parallaxRoot?.style.setProperty('--parallax-y','0px');
    if(gsap)gsap.to(scope.querySelectorAll('.ambient-light'),{x:0,y:0,duration:.8,ease:'power2.out',overwrite:'auto'});
  }
  if(parallaxRoot&&!reduced&&!coarse){
    const move=e=>{
      if(parallaxRoot.classList.contains('is-opening')||parallaxRoot.classList.contains('is-open'))return;
      const nx=(e.clientX/innerWidth-.5)*7;
      const ny=(e.clientY/innerHeight-.5)*5;
      tiltX+=(nx-tiltX)*.22;tiltY+=(ny-tiltY)*.22;
      parallaxRoot.style.setProperty('--parallax-x',`${tiltX}px`);
      parallaxRoot.style.setProperty('--parallax-y',`${tiltY}px`);
      if(gsap)gsap.to(scope.querySelectorAll('.ambient-light'),{x:tiltX*.35,y:tiltY*.3,duration:1.25,ease:'power2.out',overwrite:'auto'});
    };
    parallaxRoot.addEventListener('pointermove',move);
    parallaxRoot.addEventListener('pointerleave',resetParallax);
    disposers.push(()=>{parallaxRoot.removeEventListener('pointermove',move);parallaxRoot.removeEventListener('pointerleave',resetParallax)});
  }

  const canvas=scope.querySelector('[data-sakura-petals]');
  if(canvas&&canvas.getContext){
    const ctx=canvas.getContext('2d',{alpha:true});
    let w=0,h=0,dpr=1,raf=0,petals=[],intensity=1,paused=false;
    const palette=['#e7b1af','#f2d2c8','#edc1bd','#f6ded4'];
    function makePetal(initial=false){
      const depth=Math.random();
      return {x:Math.random()*w,y:initial?Math.random()*h:-40-Math.random()*150,rx:1.5+depth*3.8,ry:3.2+depth*6.5,speed:.13+depth*.48,drift:.07+depth*.4,side:(Math.random()-.5)*.24,phase:Math.random()*Math.PI*2,rot:Math.random()*Math.PI*2,spin:(Math.random()-.5)*(.005+depth*.012),alpha:.13+depth*.43,wobble:.00025+Math.random()*.00038,tint:palette[Math.floor(Math.random()*palette.length)]};
    }
    function targetCount(){
      const base=coarse?Math.round(w/150):Math.round(w/100);
      if(saveData)return clamp(Math.round(base*intensity),3,6);
      return clamp(Math.round(base*intensity),coarse?4:7,coarse?8:16);
    }
    function seed(){petals=Array.from({length:targetCount()},()=>makePetal(true))}
    function resize(){
      dpr=Math.min(devicePixelRatio||1,coarse?1.25:1.75);
      w=innerWidth;h=innerHeight;
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);seed();
    }
    function draw(p){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=p.alpha;ctx.fillStyle=p.tint;ctx.beginPath();ctx.ellipse(0,0,p.rx,p.ry,0,0,Math.PI*2);ctx.fill();ctx.restore()}
    function tick(t){
      if(paused)return;
      ctx.clearRect(0,0,w,h);
      petals.forEach((p,i)=>{p.y+=p.speed;p.x+=Math.sin(t*p.wobble+p.phase)*p.drift+p.side;p.rot+=p.spin;if(p.y>h+50||p.x<-70||p.x>w+70)petals[i]=makePetal(false);draw(p)});
      raf=requestAnimationFrame(tick);
    }
    const onResize=()=>resize();window.addEventListener('resize',onResize);resize();if(!reduced)raf=requestAnimationFrame(tick);
    petalController={
      setIntensity(value){intensity=clamp(Number(value)||1,.25,1.4);seed()},
      pause(){if(paused)return;paused=true;cancelAnimationFrame(raf)},
      resume(){if(reduced||!paused)return;paused=false;raf=requestAnimationFrame(tick)},
      destroy(){cancelAnimationFrame(raf);window.removeEventListener('resize',onResize);ctx.clearRect(0,0,w,h)}
    };
    disposers.push(()=>petalController.destroy());
  }

  function pause(){host.classList.add('sakura-fx-paused');petalController?.pause()}
  function resume(){host.classList.remove('sakura-fx-paused');petalController?.resume()}
  const visibility=()=>document.hidden?pause():resume();document.addEventListener('visibilitychange',visibility);disposers.push(()=>document.removeEventListener('visibilitychange',visibility));
  const pausePetals=()=>petalController?.pause();
  const resumePetals=e=>{petalController?.setIntensity(e?.detail?.intensity??.45);petalController?.resume()};
  window.addEventListener('sakura:petals-pause',pausePetals);
  window.addEventListener('sakura:petals-resume',resumePetals);
  disposers.push(()=>{window.removeEventListener('sakura:petals-pause',pausePetals);window.removeEventListener('sakura:petals-resume',resumePetals)});

  return {reduced,coarse,playIntro,resetParallax,setPetalIntensity:v=>petalController?.setIntensity(v),pause,resume,destroy(){revealObserver?.disconnect();ambientObserver?.disconnect();disposers.splice(0).forEach(fn=>fn())}};
}
