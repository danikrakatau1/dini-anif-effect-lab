export function revealEffect(element, { gsap }) {
  if (!gsap) return;

  gsap.fromTo(
    element,
    { autoAlpha: 0, y: 28, filter: 'blur(8px)' },
    {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power3.out'
    }
  );
}
