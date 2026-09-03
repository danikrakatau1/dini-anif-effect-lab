import { EffectEngine } from './effects/effect-engine.js';
import { revealEffect } from './effects/reveal.js';
import { floatEffect } from './effects/float.js';
import { createSparkleField } from './effects/sparkle.js';

const gsap = window.gsap;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const engine = new EffectEngine({ gsap });
engine
  .register('reveal', prefersReducedMotion ? () => {} : revealEffect)
  .register('float', prefersReducedMotion ? () => {} : floatEffect)
  .mount();

const sparkle = prefersReducedMotion
  ? { toggle() { return false; }, destroy() {} }
  : createSparkleField(document.querySelector('#sparkle-canvas'));

document.querySelector('#replay')?.addEventListener('click', () => {
  document.querySelectorAll('[data-effect="reveal"]').forEach((element) => {
    revealEffect(element, { gsap });
  });
});

document.querySelector('#toggle-sparkle')?.addEventListener('click', (event) => {
  const enabled = sparkle.toggle();
  event.currentTarget.textContent = enabled ? 'Hide sparkle' : 'Show sparkle';
});

window.addEventListener('pagehide', () => sparkle.destroy(), { once: true });
