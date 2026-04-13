/* background.js — ILYA AI Platform Canvas */
(function() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, raf;
  let stars = [], nodes = [], orbs = [];
  const PI2 = Math.PI * 2;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initAll();
  }

  // ── Stars ──────────────────────────────────────────
  function initStars() {
    stars = [];
    const n = Math.min(Math.floor(W * H / 4800), 250);
    for (let i = 0; i < n; i++) {
      const type = Math.random();
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + .2,
        seed: Math.random() * PI2,
        speed: Math.random() * .012 + .004,
        color: type > .88 ? 'rgba(255,60,80,' : type > .75 ? 'rgba(255,160,160,' : 'rgba(255,255,255,',
        twinkle: type > .9,
        cross: type > .96,
      });
    }
  }

  function drawStars(t) {
    for (const s of stars) {
      const a = .25 + .75 * (.5 + .5 * Math.sin(t * s.speed + s.seed));
      if (s.cross) {
        // Cross / star shape
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.strokeStyle = s.color + (a * .8) + ')';
        ctx.lineWidth = .8;
        const sz = s.r * 3;
        ctx.beginPath(); ctx.moveTo(-sz,0); ctx.lineTo(sz,0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,-sz); ctx.lineTo(0,sz);  ctx.stroke();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, PI2);
        ctx.fillStyle = s.color + a + ')';
        ctx.fill();
        if (s.twinkle && a > .85) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, PI2);
          ctx.fillStyle = s.color + (a * .05) + ')';
          ctx.fill();
        }
      }
    }
  }

  // ── Nodes (neural network) ─────────────────────────
  function initNodes() {
    nodes = [];
    const n = Math.min(Math.floor(W / 130), 14);
    for (let i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - .5) * .4,
        vy: (Math.random() - .5) * .4,
        r: Math.random() * 2.5 + 1,
        phase: Math.random() * PI2,
      });
    }
  }

  function updateNodes() {
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      n.phase += .035;
    }
  }

  function drawNodes() {
    const D = 190;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < D) {
          const a = (1 - d / D) * .18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(220,20,60,${a})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      const pulse = .4 + .6 * (.5 + .5 * Math.sin(n.phase));
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * pulse, 0, PI2);
      ctx.fillStyle = `rgba(255,0,64,${.5 * pulse})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5 * pulse, 0, PI2);
      ctx.fillStyle = `rgba(220,20,60,${.04 * pulse})`;
      ctx.fill();
    }
  }

  // ── Orbiting diamond ──────────────────────────────
  function initOrbs() {
    orbs = [
      { cx: W * .85, cy: H * .12, a: 0, rx: 110, ry: 44, speed: .0008, dots: 3 },
      { cx: W * .14, cy: H * .88, a: 1.2, rx: 80, ry: 32, speed: -.0006, dots: 2 },
    ];
  }

  function drawOrbs(t) {
    for (const o of orbs) {
      o.a += o.speed;
      // Ring
      ctx.beginPath();
      ctx.ellipse(o.cx, o.cy, o.rx, o.ry, o.a * .3, 0, PI2);
      ctx.strokeStyle = 'rgba(139,0,0,.22)';
      ctx.lineWidth = .8;
      ctx.stroke();
      // Dots on ring
      for (let i = 0; i < o.dots; i++) {
        const angle = o.a + (i / o.dots) * PI2;
        const dx = Math.cos(angle) * o.rx;
        const dy = Math.sin(angle) * o.ry;
        const px = o.cx + Math.cos(o.a * .3) * dx - Math.sin(o.a * .3) * dy;
        const py = o.cy + Math.sin(o.a * .3) * dx + Math.cos(o.a * .3) * dy;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, PI2);
        ctx.fillStyle = 'rgba(255,0,64,.6)';
        ctx.fill();
      }
    }
  }

  // ── 3D perspective grid ───────────────────────────
  function drawGrid(t) {
    const horizon = H * .62;
    const vx = W / 2;
    const shift = (t * .04) % 60;
    ctx.strokeStyle = 'rgba(80,0,0,.05)';
    ctx.lineWidth = .5;
    // Lines from horizon to bottom
    for (let i = -14; i <= 14; i++) {
      ctx.beginPath();
      ctx.moveTo(vx + i * 44, horizon);
      ctx.lineTo(vx + i * 600, H + 100);
      ctx.stroke();
    }
    // Horizontal lines
    for (let d = 0; d < 9; d++) {
      const depth = d / 9;
      const y = horizon + (H - horizon + 100) * depth - shift * depth * 7;
      if (y < horizon || y > H + 5) continue;
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  // ── Nebula ────────────────────────────────────────
  function drawNebula(t) {
    const blobs = [
      { x: W * .08,  y: H * .18, r: 200, c: '139,0,0' },
      { x: W * .92,  y: H * .82, r: 240, c: '80,0,0'  },
      { x: W * .5,   y: H * .45, r: 160, c: '100,0,20' },
    ];
    for (const b of blobs) {
      const a = .022 + .01 * Math.sin(t * .0008 + b.x * .001);
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(${b.c},${a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, PI2);
      ctx.fill();
    }
  }

  // ── Draw floating diamond shapes ──────────────────
  function drawDiamonds(t) {
    const shapes = [
      { x: W*.2,  y: H*.3,  sz:18, rot: t*.0004, a:.08 },
      { x: W*.78, y: H*.6,  sz:12, rot:-t*.0006, a:.06 },
      { x: W*.55, y: H*.15, sz:22, rot: t*.0003, a:.07 },
      { x: W*.1,  y: H*.65, sz:14, rot:-t*.0005, a:.05 },
    ];
    for (const s of shapes) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.strokeStyle = `rgba(220,20,60,${s.a})`;
      ctx.lineWidth = .8;
      // Diamond
      ctx.beginPath();
      ctx.moveTo(0, -s.sz);
      ctx.lineTo(s.sz * .6, 0);
      ctx.lineTo(0, s.sz);
      ctx.lineTo(-s.sz * .6, 0);
      ctx.closePath();
      ctx.stroke();
      // Inner
      ctx.beginPath();
      ctx.moveTo(0, -s.sz * .5);
      ctx.lineTo(s.sz * .3, 0);
      ctx.lineTo(0, s.sz * .5);
      ctx.lineTo(-s.sz * .3, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  function initAll() { initStars(); initNodes(); initOrbs(); }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.hypot(W, H) * .7);
    g.addColorStop(0, '#0e0000');
    g.addColorStop(1, '#050000');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    drawNebula(t);
    drawGrid(t);
    drawDiamonds(t);
    drawOrbs(t);
    updateNodes();
    drawNodes();
    drawStars(t);
  }

  function loop(t) { draw(t); raf = requestAnimationFrame(loop); }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(loop);

  // Preloader particles
  const pp = document.getElementById('pre-particles');
  if (pp) {
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'pre-particle';
      const sz = Math.random() * 6 + 3;
      p.style.cssText = `
        width:${sz}px; height:${sz}px;
        left:${Math.random() * 100}%;
        bottom:-20px;
        animation-duration:${5 + Math.random() * 8}s;
        animation-delay:${Math.random() * 6}s;
        opacity:0;
      `;
      pp.appendChild(p);
    }
  }
})();
