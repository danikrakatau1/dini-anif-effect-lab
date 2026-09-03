export function floatEffect(element, { gsap }) {
  if (!gsap) return;

  gsap.to(element, {
    y: -10,
    rotation: 0.35,
    duration: 3.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });
}
