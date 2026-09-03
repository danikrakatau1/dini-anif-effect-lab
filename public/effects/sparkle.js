export function createSparkleField(canvas) {
  if (!canvas) return { toggle() {}, destroy() {} };

  const ctx = canvas.getContext('2d');
  const particles = [];
  let enabled = true;
  let frame = 0;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    particles.length = 0;
    const count = Math.min(56, Math.max(22, Math.floor(width / 22)));

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.7 + 0.4,
        a: Math.random() * 0.55 + 0.15,
        speed: Math.random() * 0.12 + 0.03,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(time = 0) {
    ctx.clearRect(0, 0, width, height);

    if (enabled) {
      for (const p of particles) {
        const alpha = p.a * (0.55 + Math.sin(time * 0.0015 + p.phase) * 0.45);
        p.y -= p.speed;
        if (p.y < -8) p.y = height + 8;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
        ctx.fill();
      }
    }

    frame = requestAnimationFrame(draw);
  }

  function handleResize() {
    resize();
    seed();
  }

  resize();
  seed();
  window.addEventListener('resize', handleResize, { passive: true });
  frame = requestAnimationFrame(draw);

  return {
    toggle() {
      enabled = !enabled;
      return enabled;
    },
    destroy() {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      ctx.clearRect(0, 0, width, height);
    }
  };
}
