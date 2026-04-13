/* background.js — ILYA Platform Canvas Animation */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], nodes = [], connections = [], hexes = [], animFrame;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    init();
  }

  // ── Stars ──────────────────────────────────────────────────────────────────
  function initStars() {
    stars = [];
    const count = Math.min(Math.floor((W * H) / 5000), 220);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:    Math.random() * W,
        y:    Math.random() * H,
        r:    Math.random() * 1.6 + 0.3,
        base: Math.random(),
        speed:Math.random() * 0.015 + 0.005,
        color: Math.random() > 0.85
          ? `rgba(255,60,80,`
          : Math.random() > 0.7
          ? `rgba(255,150,150,`
          : `rgba(255,255,255,`,
      });
    }
  }

  function drawStars(t) {
    for (const s of stars) {
      const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.base * Math.PI * 2));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + alpha + ')';
      ctx.fill();
    }
  }

  // ── Neural Network Nodes ──────────────────────────────────────────────────
  function initNodes() {
    nodes = [];
    const count = Math.min(Math.floor(W / 120), 14);
    for (let i = 0; i < count; i++) {
      nodes.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r:  Math.random() * 2.5 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  function updateNodes() {
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.pulse += 0.04;
    }
  }

  function drawNodes(t) {
    const MAX_DIST = 180;
    // connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(220,20,60,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    // node dots
    for (const n of nodes) {
      const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(n.pulse));
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,0,64,${0.4 * pulse})`;
      ctx.fill();
      // glow ring
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,20,60,${0.04 * pulse})`;
      ctx.fill();
    }
  }

  // ── Orbital Rings ─────────────────────────────────────────────────────────
  function drawOrbits(t) {
    const cx = W * 0.85, cy = H * 0.15;
    const rings = [
      { rx: 90, ry: 40, angle: t * 0.003, color: 'rgba(139,0,0,' },
      { rx: 140, ry: 60, angle: -t * 0.002, color: 'rgba(180,0,0,' },
      { rx: 200, ry: 85, angle: t * 0.0015, color: 'rgba(100,0,0,' },
    ];
    for (const ring of rings) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, ring.rx, ring.ry, ring.angle, 0, Math.PI * 2);
      ctx.strokeStyle = ring.color + '0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // dot on orbit
      const dotX = cx + Math.cos(ring.angle * 3) * ring.rx;
      const dotY = cy + Math.sin(ring.angle * 3) * ring.ry;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,0,64,0.6)';
      ctx.fill();
    }
  }

  // ── Grid Lines ────────────────────────────────────────────────────────────
  function drawGrid(t) {
    const spacing = 80;
    const shift = (t * 0.05) % spacing;
    ctx.strokeStyle = 'rgba(100,0,0,0.04)';
    ctx.lineWidth = 0.5;

    // Perspective-like grid at bottom
    const horizon = H * 0.6;
    const vanishX = W / 2;

    for (let i = -20; i <= 20; i++) {
      const startX = vanishX + i * spacing;
      ctx.beginPath();
      ctx.moveTo(startX, horizon);
      ctx.lineTo(vanishX + i * spacing * 8, H + 200);
      ctx.stroke();
    }
    for (let d = 0; d < 8; d++) {
      const depth = d / 8;
      const y = horizon + (H - horizon + 200) * depth - shift * depth * 8;
      if (y > H) continue;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  // ── Nebula Blobs ──────────────────────────────────────────────────────────
  function drawNebula(t) {
    const blobs = [
      { x: W * 0.1,  y: H * 0.2, r: 180, color: [139,0,0] },
      { x: W * 0.9,  y: H * 0.8, r: 220, color: [80,0,0] },
      { x: W * 0.5,  y: H * 0.5, r: 150, color: [100,0,20] },
    ];
    for (const b of blobs) {
      const alpha = 0.025 + 0.01 * Math.sin(t * 0.001 + b.x);
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, `rgba(${b.color},${alpha})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  function init() { initStars(); initNodes(); }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // Base gradient fill
    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.8);
    bg.addColorStop(0, '#0f0000');
    bg.addColorStop(1, '#050000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawNebula(t);
    drawGrid(t);
    drawOrbits(t);
    updateNodes();
    drawNodes(t);
    drawStars(t);
  }

  function loop(t) {
    draw(t);
    animFrame = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);
})();
