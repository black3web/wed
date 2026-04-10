/* ═══════════════════════════════════════
   ILYA — Canvas Background Engine
   Lissajous + Spirograph + Rosette shapes
   30fps capped, GPU-safe (transform/opacity only)
   ═══════════════════════════════════════ */
(function() {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  // ─── CONFIG ───
  const FPS = 30;
  const FRAME_MS = 1000 / FPS;
  const SHAPE_COUNT = 12;
  const STAR_COUNT = 90;

  let W, H, lastFrame = 0, t = 0;
  let shapes = [], stars = [];
  let gradCache = null;
  let needsResize = true;

  // ─── RESIZE ───
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    needsResize = false;
    buildGradient();
    buildStars();
    buildShapes();
  }

  function buildGradient() {
    gradCache = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.5, W*0.8);
    gradCache.addColorStop(0,   'rgba(30, 0, 5, 1)');
    gradCache.addColorStop(0.4, 'rgba(10, 0, 2, 1)');
    gradCache.addColorStop(1,   'rgba(0,  0, 0, 1)');
  }

  // ─── STARS ───
  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const size = Math.random() * 1.5 + 0.3;
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size,
        baseAlpha: Math.random() * 0.6 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
        shape: Math.floor(Math.random() * 3) // 0=circle, 1=diamond, 2=cross
      });
    }
  }

  function drawStar(s, time) {
    const alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(time * s.speed + s.phase));
    ctx.globalAlpha = alpha;

    if (s.shape === 0) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    } else if (s.shape === 1) {
      const r = s.size * 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - r);
      ctx.lineTo(s.x + r, s.y);
      ctx.lineTo(s.x, s.y + r);
      ctx.lineTo(s.x - r, s.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,80,80,0.8)';
      ctx.fill();
    } else {
      const r = s.size;
      ctx.beginPath();
      ctx.moveTo(s.x - r, s.y);
      ctx.lineTo(s.x + r, s.y);
      ctx.moveTo(s.x, s.y - r);
      ctx.lineTo(s.x, s.y + r);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ─── SHAPES ───
  const SHAPE_TYPES = ['lissajous', 'spirograph', 'rosette', 'harmonograph', 'hypotrochoid'];

  function buildShapes() {
    shapes = [];
    for (let i = 0; i < SHAPE_COUNT; i++) {
      const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
      shapes.push(createShape(type, i));
    }
  }

  function createShape(type, idx) {
    const side = Math.min(W, H);
    return {
      type,
      x: Math.random() * W,
      y: Math.random() * H,
      scale: side * (0.04 + Math.random() * 0.12),
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.004,
      driftX: (Math.random() - 0.5) * 0.12,
      driftY: (Math.random() - 0.5) * 0.12,
      alpha: 0.06 + Math.random() * 0.12,
      alphaPulse: Math.random() * 0.04,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.015,
      // Shape params
      a: 2 + Math.floor(Math.random() * 5),
      b: 2 + Math.floor(Math.random() * 5),
      k: 3 + Math.floor(Math.random() * 7),
      R: 0.5 + Math.random() * 0.3,
      r: 0.15 + Math.random() * 0.2,
      d: 0.6 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      color: idx % 3 === 0 ? '#ff0040' : idx % 3 === 1 ? '#990000' : '#ff3060',
      lineWidth: 0.4 + Math.random() * 0.6,
      points: 200 + Math.floor(Math.random() * 200)
    };
  }

  function getShapePath(s) {
    const pts = [];
    const n = s.points;

    if (s.type === 'lissajous') {
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 2;
        pts.push([
          Math.sin(s.a * t + s.phase) * s.scale,
          Math.sin(s.b * t) * s.scale
        ]);
      }
    } else if (s.type === 'spirograph') {
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 14;
        const R = s.scale, r = s.r * s.scale, d = s.d * s.scale;
        pts.push([
          (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t),
          (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t)
        ]);
      }
    } else if (s.type === 'rosette') {
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 2;
        const r = s.scale * Math.cos(s.k * t);
        pts.push([r * Math.cos(t), r * Math.sin(t)]);
      }
    } else if (s.type === 'harmonograph') {
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 6;
        pts.push([
          s.scale * Math.sin(s.a * t + s.phase) * Math.exp(-0.004 * i),
          s.scale * Math.sin(s.b * t) * Math.exp(-0.004 * i)
        ]);
      }
    } else { // hypotrochoid
      for (let i = 0; i <= n; i++) {
        const t = (i / n) * Math.PI * 2 * s.k;
        const R = s.scale, r = s.r * s.scale * 1.5, d = s.d * s.scale;
        pts.push([
          (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t),
          (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t)
        ]);
      }
    }
    return pts;
  }

  function drawShape(s, time) {
    const pts = getShapePath(s);
    const alpha = s.alpha + s.alphaPulse * Math.sin(time * s.pulseSpeed + s.pulsePhase);

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
      else ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();
    ctx.restore();
  }

  // ─── UPDATE SHAPES ───
  function updateShapes(dt) {
    for (const s of shapes) {
      s.angle += s.rotSpeed;
      s.x += s.driftX;
      s.y += s.driftY;

      // Wrap around
      if (s.x < -s.scale * 2) s.x = W + s.scale;
      if (s.x > W + s.scale * 2) s.x = -s.scale;
      if (s.y < -s.scale * 2) s.y = H + s.scale;
      if (s.y > H + s.scale * 2) s.y = -s.scale;
    }
  }

  // ─── RENDER ───
  function render(now) {
    requestAnimationFrame(render);

    const elapsed = now - lastFrame;
    if (elapsed < FRAME_MS) return;
    lastFrame = now - (elapsed % FRAME_MS);
    t += 1;

    const time = t * FRAME_MS / 1000;

    // Background
    ctx.fillStyle = gradCache || '#000';
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (const s of stars) drawStar(s, time);

    // Shapes
    updateShapes(FRAME_MS);
    for (const s of shapes) drawShape(s, time);

    // Vignette
    const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, W*0.9);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  // ─── INIT ───
  window.addEventListener('resize', () => { needsResize = true; resize(); });
  resize();
  requestAnimationFrame(render);

})();
