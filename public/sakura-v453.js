/* Sakura V4.5.3 — Name plaque DOM layer only. Core V4.5.2 video engine remains owner. */
const opening=document.querySelector('.scene-opening');
const shell=opening?.querySelector(':scope > .inv-shell');

if(opening&&shell){
  shell.querySelectorAll(':scope > .v453-plaque,:scope > .v453-jewel,:scope > .v453-jewel-line,:scope > .v453-name-glint').forEach(node=>node.remove());

  const plaque=document.createElement('div');
  plaque.className='v453-plaque';
  plaque.setAttribute('aria-hidden','true');

  const jewelLine=document.createElement('div');
  jewelLine.className='v453-jewel-line';
  jewelLine.setAttribute('aria-hidden','true');

  const jewel=document.createElement('div');
  jewel.className='v453-jewel';
  jewel.setAttribute('aria-hidden','true');

  const glint=document.createElement('div');
  glint.className='v453-name-glint';
  glint.setAttribute('aria-hidden','true');

  shell.insertBefore(plaque,shell.firstChild);
  shell.insertBefore(jewelLine,shell.firstChild.nextSibling);
  shell.insertBefore(jewel,shell.firstChild.nextSibling.nextSibling);
  shell.appendChild(glint);

  document.documentElement.dataset.sakuraNamePlaque='v4.5.3';
}
