SYSTEMA DE TAPAS, PARA OCULTAR LOS PUZLES 

<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Tapa con bisagra en Canvas 2D</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0; height: 100vh; display: grid; place-items: center;
      background: radial-gradient(1200px 600px at 60% 20%, #1b2230, #0e1218 60%, #0a0d12 100%);
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif;
      color: #cfd6e3;
    }
    .wrap { text-align: center; }
    canvas { display: block; image-rendering: crisp-edges; }
    .ui { margin-top: 12px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
    button, input[type="range"] {
      background: #202734; color: #d5dbe7; border: 1px solid #11151b;
      padding: 8px 12px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,.35);
    }
    input[type="range"]{ width: 240px; accent-color: #79ffd6; }
    button:hover { filter: brightness(1.1); }
    .hint { opacity: .8; font-size: .95rem; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="wrap">
    <canvas id="c" width="540" height="360" aria-label="Demo de tapa con bisagra"></canvas>
    <div class="ui">
      <button id="btnClose">Cerrar</button>
      <button id="btnOpen">Abrir</button>
      <button id="btnDetach">Descolgar</button>
      <button id="btnReset">Reset</button>
      <input id="slider" type="range" min="0" max="100" step="1" value="0" aria-label="Ángulo de apertura" />
    </div>
    <div class="hint">Arrastra para abrir. "Descolgar" hace que la tapa se suelte y caiga al fondo (2D). Cuando traspasa el borde inferior desaparece. Reset para volver al inicio.</div>
  </div>

  <script>
  (function(){
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    const W = canvas.width, H = canvas.height;

    // Panel base
    const panel = { x: 90, y: 60, w: 360, h: 220, r: 14 };

    // Estado de la tapa (0 = cerrada, 100 = abierta)
    let angleTarget = 0; // porcentaje 0..100
    let angle = 0;       // valor actual animado

    // Caída 2D: cuerpo libre cuando la tapa se descuelga
    let detached = false;
    const body = { x: 0, y: 0, angle: 0, vx: 0, vy: 0, va: 0, alive: false };
    const G = 120; // px/s^2

    // reloj
    let lastTime = performance.now();

    // Interacción
    let dragging = false; let startY = 0; let startAngle = 0;

    // Controles
    const btnOpen = document.getElementById('btnOpen');
    const btnClose = document.getElementById('btnClose');
    const btnDetach = document.getElementById('btnDetach');
    const btnReset = document.getElementById('btnReset');
    const slider = document.getElementById('slider');

    btnOpen.addEventListener('click', ()=> { if (detached && !body.alive) return; detached=false; setAngleTarget(100); });
    btnClose.addEventListener('click', ()=> { if (detached && !body.alive) return; detached=false; setAngleTarget(0); });
    btnDetach.addEventListener('click', ()=> detachNow());
    btnReset.addEventListener('click', ()=> resetAll());
    slider.addEventListener('input', (e) => { if (detached && !body.alive) return; detached=false; setAngleTarget(parseFloat(e.target.value)); });

    // Teclado global (una sola vez, sin duplicados)
    window.addEventListener('keydown', (e)=>{
      if (detached && !body.alive) { if (e.key.toLowerCase()==='r') resetAll(); return; }
      if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); detached=false; setAngleTarget(angleTarget > 50 ? 0 : 100); }
      if (e.key === 'ArrowUp'){ detached=false; setAngleTarget(clamp(angleTarget + 5, 0, 100)); }
      if (e.key === 'ArrowDown'){ detached=false; setAngleTarget(clamp(angleTarget - 5, 0, 100)); }
      if (e.key.toLowerCase() === 'd'){ detachNow(); }
      if (e.key.toLowerCase() === 'r'){ resetAll(); }
    });

    // Pointer
    canvas.addEventListener('pointerdown', e => {
      if (detached && !body.alive) return; // tapa desaparecida, ignora
      canvas.setPointerCapture(e.pointerId);
      dragging = true; startY = e.clientY; startAngle = angleTarget;
    });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      const next = clamp(startAngle + dy / 2, 0, 110);
      setAngleTarget(map110to100(next));
    });
    function map110to100(v){ return (Math.max(0, Math.min(110, v)) / 110) * 100; }
    canvas.addEventListener('pointerup', () => { dragging = false; snap(); });
    canvas.addEventListener('pointercancel', () => { dragging = false; snap(); });

    function setAngleTarget(v){ angleTarget = clamp(v, 0, 100); slider.value = String(Math.round(angleTarget)); }
    function snap(){ setAngleTarget(angleTarget >= 60 ? 100 : 0); }

    function resetAll(){
      detached = false; body.alive = false;
      angle = 0; angleTarget = 0; slider.value = '0';
    }

    function detachNow(){
      if (detached) return;
      // centro de la tapa en mundo
      const rad = (mapAngle(angle)/100) * (Math.PI/2);
      const cx = panel.x + panel.w/2; const hy = panel.y;
      const relX = 0; const relY = panel.h/2;
      const worldX = cx + (relX * Math.cos(-rad) - relY * Math.sin(-rad));
      const worldY = hy + (relX * Math.sin(-rad) + relY * Math.cos(-rad));
      body.x = worldX; body.y = worldY;
      body.angle = -rad;
      body.vx = 20 * Math.sin(rad);
      body.vy = 0;
      body.va = 0.6 * (Math.random() < 0.5 ? -1 : 1);
      body.alive = true;
      detached = true;
    }

    // Dibujo principal
    function draw(){
      ctx.clearRect(0,0,W,H);

      // Fondo
      const gbg = ctx.createRadialGradient(W*0.6, H*0.25, 40, W*0.6, H*0.25, 500);
      gbg.addColorStop(0, '#1c2330');
      gbg.addColorStop(1, '#0a0e14');
      ctx.fillStyle = gbg; ctx.fillRect(0,0,W,H);

      // Chasis del panel
      roundedRect(panel.x-10, panel.y-10, panel.w+20, panel.h+20, 18);
      ctx.fillStyle = '#12161d'; ctx.fill();
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12;
      roundedRect(panel.x, panel.y, panel.w, panel.h, panel.r);
      const g = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y+panel.h);
      g.addColorStop(0, '#242b36'); g.addColorStop(.55, '#1f2530'); g.addColorStop(1, '#181d26');
      ctx.fillStyle = g; ctx.fill();
      ctx.shadowColor = 'transparent';

      // Interior
      drawGuts();

      // Tapa
      const deg = mapAngle(angle);
      if (detached) {
        if (body.alive) {
          drawDetachedLid();
        }
      } else {
        drawLid(deg);
      }

      requestAnimationFrame(step);
    }

    function step(){
      const now = performance.now();
      let dt = (now - lastTime) / 1000; if (!isFinite(dt) || dt <= 0) dt = 1/60; if (dt > 0.05) dt = 0.05;
      lastTime = now;

      if (!detached && angleTarget >= 99 && angle > 98 && !dragging) {
        detachNow();
      }

      if (detached && body.alive) {
        body.vy += G * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.angle += body.va * dt;
        body.va *= 0.999;
        if (body.y - (panel.h/2) > H + 40) {
          body.alive = false;
        }
      } else {
        const t = 0.12;
        angle += (angleTarget - angle) * t;
      }
      draw();
    }

    function mapAngle(a){ return a; }

    function drawGuts(){
      const pad = 16;
      ctx.save();
      ctx.beginPath(); roundedRect(panel.x, panel.y, panel.w, panel.h, panel.r); ctx.clip();
      let bg = ctx.createRadialGradient(panel.x+panel.w*0.3, panel.y+panel.h*0.7, 20, panel.x+panel.w*0.3, panel.y+panel.h*0.7, 260);
      bg.addColorStop(0,'rgba(98, 202, 255, .12)'); bg.addColorStop(1,'transparent');
      ctx.fillStyle = bg; ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
      ctx.fillStyle = '#2b3240';
      ctx.fillRect(panel.x+pad, panel.y+pad, 120, 46);
      ctx.fillRect(panel.x+pad, panel.y+pad+56, 180, 36);
      ctx.fillRect(panel.x+panel.w- pad - 140, panel.y+pad+8, 140, 32);
      drawCable(panel.x+30, panel.y+140, panel.x+panel.w-40, panel.y+160);
      drawCable(panel.x+60, panel.y+170, panel.x+panel.w-60, panel.y+195);
      ctx.fillStyle = 'rgba(205,214,227,.9)';
      ctx.font = '600 14px system-ui, Segoe UI';
      ctx.fillText('Cableado interno', panel.x+pad, panel.y+panel.h-pad);
      ctx.restore();
    }

    function drawCable(x1,y1,x2,y2){
      ctx.save();
      ctx.lineWidth = 4; ctx.strokeStyle = '#77f5d6';
      ctx.beginPath();
      const cx1 = x1 + 80, cy1 = y1 - 30;
      const cx2 = x2 - 80, cy2 = y2 + 30;
      ctx.moveTo(x1,y1); ctx.bezierCurveTo(cx1,cy1, cx2,cy2, x2,y2);
      ctx.stroke();
      ctx.restore();
    }

    function drawLid(deg){
      const cx = panel.x + panel.w/2; const hy = panel.y;
      const openness = clamp(deg/100, 0, 1);
      const drop = 10 + 40*openness; const blur = 18 + 28*openness; const alpha = .25 + .3*openness;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,' + alpha + ')';
      ctx.shadowBlur = blur; ctx.shadowOffsetY = drop;
      ctx.translate(cx, hy);
      ctx.rotate(-deg * Math.PI/180);
      ctx.translate(-panel.w/2, 0);
      paintLid(panel.w, panel.h, panel.r, openness);
      ctx.restore();
      ctx.save();
      roundedRect(panel.x + panel.w*0.09, panel.y-6, panel.w*0.82, 12, 6);
      const hg = ctx.createLinearGradient(panel.x, panel.y-6, panel.x, panel.y+6);
      hg.addColorStop(0, '#0d1116'); hg.addColorStop(1, '#1b212b');
      ctx.fillStyle = hg; ctx.fill();
      ctx.restore();
    }

    function drawDetachedLid(){
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.35)';
      ctx.shadowBlur = 16; ctx.shadowOffsetY = 10;
      ctx.translate(body.x, body.y);
      ctx.rotate(body.angle);
      ctx.translate(-panel.w/2, -panel.h/2);
      paintLid(panel.w, panel.h, panel.r, 1);
      ctx.restore();
    }

    function paintLid(w,h,r, openness){
      roundedRect(0, 0, w, h, r);
      const skin = ctx.createLinearGradient(0,0, 0, h);
      skin.addColorStop(0, '#3b4353'); skin.addColorStop(.6, '#2e3543'); skin.addColorStop(1, '#242a36');
      ctx.fillStyle = skin; ctx.fill();
      ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(15,19,24,.9)'; ctx.stroke();
      roundedRect(8,8, w-16, h-16, 10);
      ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1; ctx.stroke();
      drawScrew(10,10); drawScrew(w-22, 10); drawScrew(10, h-22); drawScrew(w-22, h-22);
      ctx.fillStyle = 'rgba(220,228,240,.9)'; ctx.font = 'bold 12px system-ui, Segoe UI';
      ctx.fillText(openness>0.5 ? 'ABIERTO' : 'CERRADO', w-88, h-12);
    }

    function drawScrew(x,y){
      ctx.save();
      ctx.translate(x,y);
      ctx.beginPath(); ctx.arc(6,6,6,0,Math.PI*2);
      const g = ctx.createRadialGradient(4,4,2,6,6,6);
      g.addColorStop(0, '#c7ccd6'); g.addColorStop(.6, '#7a8392'); g.addColorStop(1, '#4a505a');
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(2,6); ctx.lineTo(10,6);
      ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }

    function roundedRect(x,y,w,h,r){
      const rr = Math.min(r, w/2, h/2);
      ctx.beginPath();
      ctx.moveTo(x+rr, y);
      ctx.arcTo(x+w, y, x+w, y+h, rr);
      ctx.arcTo(x+w, y+h, x, y+h, rr);
      ctx.arcTo(x, y+h, x, y, rr);
      ctx.arcTo(x, y, x+w, y, rr);
      ctx.closePath();
    }

    function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

    // Kickoff
    draw();
  })();
  </script>
</body>
</html>