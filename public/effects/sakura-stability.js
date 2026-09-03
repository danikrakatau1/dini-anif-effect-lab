export function initSakuraStability(){
  const root=document.documentElement;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse=matchMedia('(pointer: coarse)').matches;
  const memory=Number(navigator.deviceMemory||8);
  const cores=Number(navigator.hardwareConcurrency||8);
  const saveData=Boolean(navigator.connection?.saveData);
  const lowPower=saveData||memory<=4||cores<=4;
  const disposers=[];
  let resizeTimer=0;
  let orientationTimer=0;

  root.classList.toggle('sakura-low-power',lowPower);
  root.classList.toggle('sakura-coarse-device',coarse);
  root.dataset.sakuraDeviceTier=lowPower?'low':'normal';

  const updateViewport=()=>{
    root.style.setProperty('--app-vh',`${window.innerHeight*.01}px`);
    root.style.setProperty('--app-vw',`${window.innerWidth*.01}px`);
    root.dataset.sakuraOrientation=innerWidth>innerHeight?'landscape':'portrait';
  };
  const onResize=()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(()=>{updateViewport();window.dispatchEvent(new CustomEvent('sakura:stable-resize'))},120);
  };
  const onOrientation=()=>{
    clearTimeout(orientationTimer);
    orientationTimer=setTimeout(()=>{updateViewport();window.dispatchEvent(new CustomEvent('sakura:orientation-ready'))},180);
  };
  addEventListener('resize',onResize,{passive:true});
  addEventListener('orientationchange',onOrientation,{passive:true});
  disposers.push(()=>removeEventListener('resize',onResize),()=>removeEventListener('orientationchange',onOrientation));

  const onVisibility=()=>root.classList.toggle('sakura-page-hidden',document.hidden);
  document.addEventListener('visibilitychange',onVisibility);
  disposers.push(()=>document.removeEventListener('visibilitychange',onVisibility));

  const onPageShow=e=>{if(e.persisted){root.classList.remove('sakura-page-hidden');updateViewport();window.dispatchEvent(new CustomEvent('sakura:resume'))}};
  addEventListener('pageshow',onPageShow);
  disposers.push(()=>removeEventListener('pageshow',onPageShow));

  if('connection' in navigator && navigator.connection?.addEventListener){
    const onConnection=()=>root.classList.toggle('sakura-save-data',Boolean(navigator.connection?.saveData));
    navigator.connection.addEventListener('change',onConnection);
    onConnection();
    disposers.push(()=>navigator.connection.removeEventListener('change',onConnection));
  }

  if(reduced)root.classList.add('sakura-reduced-motion');
  updateViewport();

  return {lowPower,coarse,reduced,destroy(){clearTimeout(resizeTimer);clearTimeout(orientationTimer);disposers.splice(0).forEach(fn=>fn())}};
}
