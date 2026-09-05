/* Sakura V5.0.3 — static Date slideshow mount.
   Animation itself is CSS-only. */
const date=document.querySelector('#invitationMain .scene-date');
if(date){
  date.querySelector(':scope > .v503-date-stage')?.remove();
  date.querySelector(':scope > .v50-date-stage')?.remove();
  date.querySelector(':scope > .v492-date-stage')?.remove();
  date.querySelector(':scope > .v47-slideshow')?.remove();

  const stage=document.createElement('div');
  stage.className='v503-date-stage';
  stage.setAttribute('aria-hidden','true');
  stage.innerHTML=`
    <img class="v503-date-slide v503-date-slide--a" src="/assets/Sakura-v45/sakura-background-color.jpg.jpg" alt="" decoding="async" fetchpriority="high" draggable="false">
    <img class="v503-date-slide v503-date-slide--b" src="/assets/sakura-v2-landscape.png" alt="" decoding="async" draggable="false">
    <div class="v503-date-grade"></div>
  `;
  date.insertBefore(stage,date.firstChild);
  document.documentElement.dataset.sakuraDateSlideshow='v5.0.3-css-only';
}
