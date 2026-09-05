/* Sakura V5.1 — Reference Rhythm Native
   Per-section motion choreography inspired by the reference experience.
   No shared slideshow, no external assets, no generated artwork. */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=matchMedia('(pointer: coarse)').matches;
const lowPower=Boolean(navigator.connection?.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4));
const main=document.querySelector('#invitationMain');
const date=document.querySelector('.scene-date');
const scenes=[...document.querySelectorAll('.scene-date,.scene-event,.scene-story,.scene-gallery,.scene-gift,.scene-rsvp,.scene-wishes,.scene-closing')];

let dateTimer=0;
let dateVisible=false;
let dateIndex=0;
let observer=null;
let stage=null;
let shots=[];

function clearDateTimer(){
  if(dateTimer){clearTimeout(dateTimer);dateTimer=0}
}

function buildDateStage(){
  if(!date)return;
  date.querySelector(':scope > .v51-date-stage')?.remove();
  stage=document.createElement('div');
  stage.className='v51-date-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML='<div class="v51-date-shot is-active" data-shot="a"></div><div class="v51-date-shot" data-shot="b"></div><div class="v51-date-grade"></div>';
  date.insertBefore(stage,date.firstChild);
  shots=[...stage.querySelectorAll('.v51-date-shot')];

  const img=new Image();
  img.decoding='async';
  img.src='/assets/Sakura-v45/sakura-background-color.jpg.jpg';
}

function swapDate(){
  if(shots.length!==2)return;
  const next=1-dateIndex;
  shots[next].classList.add('is-active');
  shots[dateIndex].classList.remove('is-active');
  dateIndex=next;
}

function scheduleDate(first=false){
  clearDateTimer();
  if(!dateVisible || document.hidden || reduced)return;
  const delay=first ? (lowPower||coarse?6200:5600) : (lowPower||coarse?9400:8600);
  dateTimer=setTimeout(()=>{
    if(!dateVisible || document.hidden)return;
    swapDate();
    scheduleDate(false);
  },delay);
}

function enterScene(scene){
  scenes.forEach(item=>item.classList.toggle('v51-active',item===scene));
  if(scene===date){
    dateVisible=true;
    scheduleDate(true);
  }
}

function leaveScene(scene){
  scene.classList.remove('v51-active');
  if(scene===date){
    dateVisible=false;
    clearDateTimer();
  }
}

function setupObserver(){
  if(!scenes.length)return;
  if(!('IntersectionObserver' in window)){
    scenes.forEach(scene=>enterScene(scene));
    return;
  }
  observer=new IntersectionObserver(entries=>{
    const visible=entries
      .filter(entry=>entry.isIntersecting && entry.intersectionRatio>=.14)
      .sort((a,b)=>b.intersectionRatio-a.intersectionRatio);

    if(visible[0])enterScene(visible[0].target);
    entries.forEach(entry=>{
      if(!entry.isIntersecting || entry.intersectionRatio<.06)leaveScene(entry.target);
    });
  },{threshold:[0,.06,.14,.28,.46,.64],rootMargin:'4% 0px 4% 0px'});
  scenes.forEach(scene=>observer.observe(scene));
}

function onVisibility(){
  if(document.hidden){
    clearDateTimer();
    return;
  }
  if(dateVisible)scheduleDate(false);
}

function destroy(){
  clearDateTimer();
  observer?.disconnect();
  document.removeEventListener('visibilitychange',onVisibility);
  stage?.remove();
  scenes.forEach(scene=>scene.classList.remove('v51-active'));
}

buildDateStage();
setupObserver();
document.addEventListener('visibilitychange',onVisibility);
window.addEventListener('pagehide',destroy,{once:true});

document.documentElement.dataset.sakuraInterior='v5.1-reference-rhythm';
window.__SAKURA_REFERENCE_RHYTHM={version:'v5.1',destroy};
