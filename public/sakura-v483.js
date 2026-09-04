/* Sakura V4.8.3 — Smooth section handoff */
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const palette={
  couple:'rgba(251,243,233,.92)',
  date:'rgba(229,199,177,.80)',
  event:'rgba(217,165,145,.74)',
  story:'rgba(224,190,180,.72)',
  gallery:'rgba(180,116,111,.68)',
  gift:'rgba(210,166,119,.70)',
  rsvp:'rgba(225,190,169,.74)',
  wishes:'rgba(210,159,157,.72)',
  closing:'rgba(158,94,99,.66)'
};

const sections=[...document.querySelectorAll('[data-sakura-scene]')]
  .filter(section=>section.dataset.sakuraScene!=='opening');

sections.forEach(section=>{
  section.querySelector(':scope > .v483-seam')?.remove();
  const seam=document.createElement('div');
  seam.className='v483-seam';
  seam.setAttribute('aria-hidden','true');
  seam.style.setProperty('--v483-seam',palette[section.dataset.sakuraScene]||'rgba(250,240,224,.72)');
  section.insertBefore(seam,section.firstChild);
});

if(!reduced && sections.length){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const section=entry.target;
      const seam=section.querySelector(':scope > .v483-seam');
      if(!seam)return;
      const ratio=Math.max(0,Math.min(1,entry.intersectionRatio));
      seam.style.opacity=String(.56 + ratio*.38);
      seam.style.transform=`translate3d(0,${(-1 + (1-ratio)*6).toFixed(2)}px,0)`;
    });
  },{threshold:[0,.12,.25,.4,.6,.8,1],rootMargin:'7% 0px 7% 0px'});
  sections.forEach(section=>observer.observe(section));
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}

document.documentElement.dataset.sakuraTransition='v4.8.3';
