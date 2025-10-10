Mejorado el sistema de tocar el "morse" es necesario hacer una adaptacion de lo que tenemos. Comprendelo bien y luego aplica un ejemplo similar a esto. 

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>One-Lane Guitar Mini — Horizontal (teclas 1-4)</title>
  <style>
    :root {
      --bg: #0c0e12;
      --lane: #121826;
      --text: #e6e6e6;
      --good: #34d399;
      --bad: #f87171;
      --warn: #fbbf24;
    }
    html, body { height: 100%; margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
    .wrap { max-width: 980px; margin: 16px auto; padding: 0 12px; display: grid; grid-template-columns: 660px 1fr; gap: 16px; }
    canvas { background: #0b0f17; border: 1px solid #223; border-radius: 8px; display: block; }
    h1 { margin: 0 0 8px; font-size: 18px; opacity: .9; }
    .panel { background: #0f1420; border: 1px solid #1f2a44; border-radius: 10px; padding: 12px; }
    .row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    button, select, label { background: #111827; color: var(--text); border: 1px solid #263145; border-radius: 8px; padding: 6px 10px; font-size: 14px; }
    button { cursor: pointer; }
    button:disabled { opacity: .6; cursor: not-allowed; }
    #stats { font-variant-numeric: tabular-nums; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px 16px; margin-top: 8px; }
    #stats div { background: #0c1220; border: 1px solid #1f2a44; padding: 6px 8px; border-radius: 8px; }
    #last, #expected, #keyfeed { margin-top: 8px; padding: 6px 8px; border-radius: 8px; background: #0c1220; border: 1px solid #1f2a44; }
    .good { color: var(--good); }
    .bad { color: var(--bad); }
    .hint { opacity: .8; font-size: 12px; }
    .kbd { display: inline-block; border: 1px solid #344155; border-radius: 6px; padding: 2px 6px; margin: 0 2px; background: #0b1220; }
  </style>
</head>
<body>
  <div class="wrap">
    <div>
      <h1>One‑Lane Guitar Mini — Horizontal</h1>
      <canvas id="game" width="640" height="360"></canvas>
    </div>
    <div class="panel">
      <div class="row" style="margin-bottom:8px">
        <button id="playBtn">Play</button>
        <button id="pauseBtn">Pause</button>
        <button id="resetBtn">Reset</button>
        <label style="margin-left:auto; display:flex; align-items:center; gap:6px">
          <input type="checkbox" id="autoplayToggle" /> Autoplay
        </label>
      </div>
      <div class="row" style="margin-bottom:8px">
        <label>Velocidad
          <select id="speedSel">
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </label>
      </div>
      <div id="stats"></div>
      <div id="last"></div>
      <div id="expected"></div>
      <div id="keyfeed"></div>
      <p class="hint">Teclado: <span class="kbd">1</span> Círculo, <span class="kbd">2</span> Cuadrado, <span class="kbd">3</span> Triángulo, <span class="kbd">4</span> Diamante. <span class="kbd">Espacio</span> Play/Pause, <span class="kbd">R</span> Reset.</p>
    </div>
  </div>

  <script>
  (function(){
    "use strict";

    // Config por defecto
    const FALL_TIME_MS = 2000;
    const HIT_WINDOW_MS = 320;
    const MISS_GRACE_MS = 150;
    const PERFECT_MS = 80;
    const GOOD_MS = 150;

    // Mapeo a números (1..4). Si quieres usar 5 para otra cosa, se puede añadir.
    const KEY_TO_KIND = { "Digit1":0, "Digit2":1, "Digit3":2, "Digit4":3 };
    const KIND_META = [
      { name:"Círculo", color:"#60a5fa", draw:(ctx,x,y,r)=>{ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); } },
      { name:"Cuadrado", color:"#34d399", draw:(ctx,x,y,r)=>{ ctx.beginPath(); ctx.rect(x-r,y-r,r*2,r*2); ctx.fill(); } },
      { name:"Triángulo", color:"#f472b6", draw:(ctx,x,y,r)=>{ ctx.beginPath(); ctx.moveTo(x, y-r); ctx.lineTo(x+r, y+r); ctx.lineTo(x-r, y+r); ctx.closePath(); ctx.fill(); } },
      { name:"Diamante", color:"#f59e0b", draw:(ctx,x,y,r)=>{ ctx.beginPath(); ctx.moveTo(x, y-r); ctx.lineTo(x+r, y); ctx.lineTo(x, y+r); ctx.lineTo(x-r, y); ctx.closePath(); ctx.fill(); } },
    ];

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const nowMs = () => performance.now();

    class Engine {
      constructor(canvas, ui) {
        this.c = canvas;
        this.ctx = canvas.getContext("2d");
        this.ui = ui;
        this.resetState();
        this._raf = null;
        this.bindControls();
        this.renderStatic();
      }

      resetState() {
        this.speed = 0.25;
        this.isPlaying = false;
        this.startedAt = 0;
        this.pauseAt = 0;
        this.autoplay = false;

        // Geometría horizontal
        this.w = this.c.width; this.h = this.c.height;
        this.laneY = this.h * 0.5;    // carril horizontal centrado
        this.hitX  = this.w * 0.82;   // impacto hacia la derecha
        this.noteR = 18;

        // chart/progreso
        this.chart = [];
        this.idxNext = 0;

        // puntuación
        this.score = 0; this.combo = 0; this.maxCombo = 0;
        this.counts = { perfect:0, good:0, ok:0, miss:0 };
        this.keyFeed = [];
        this.lastStr = "";

        this.updateHUD();
      }

      setChart(chartArray) {
        this.chart = chartArray.map(n => ({ t:n.t, kind:n.kind, state:"pending" }));
        this.idxNext = 0;
      }

      play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        const now = nowMs();
        if (!this.startedAt) this.startedAt = now; else if (this.pauseAt) { const paused = now - this.pauseAt; this.startedAt += paused; this.pauseAt = 0; }
        this.loop();
      }

      pause() { if (!this.isPlaying) return; this.isPlaying = false; this.pauseAt = nowMs(); if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; this.updateHUD(); }

      reset() {
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = null;
        const saved = this.chart.map(n => ({ t:n.t, kind:n.kind }));
        this.resetState();
        this.setChart(saved);
        this.renderStatic();
      }

      setSpeed(mult) { this.speed = mult; this.updateHUD(); }
      setAutoplay(v) { this.autoplay = !!v; this.updateHUD(); }
      expectedNote() { return this.chart[this.idxNext] || null; }

      onKey(kind) {
        const n = this.expectedNote(); if (!n) return;
        if (kind !== n.kind) {
          this.keyFeedPush(`${this.keyCharForKind(kind)}≠${this.keyCharForKind(n.kind)}`, false);
          this.failAndRestart(`Tecla equivocada (${this.keyCharForKind(kind)} por ${this.keyCharForKind(n.kind)})`);
          return;
        }
        const dt = this.gameNow() - n.t; const a = Math.abs(dt);
        if (a <= HIT_WINDOW_MS) this.registerHit(n, dt);
        else {
          const timing = dt < 0 ? `temprano ${Math.round(-dt)}ms` : `tarde ${Math.round(dt)}ms`;
          this.keyFeedPush(`${this.keyCharForKind(kind)} (${timing})`, false);
          this.failAndRestart(`Fuera de ventana: ${timing}`);
        }
      }

      autoHit() { if (!this.autoplay) return; const n = this.expectedNote(); if (!n) return; const dt = this.gameNow() - n.t; if (Math.abs(dt) <= HIT_WINDOW_MS) this.registerHit(n, dt); }

      registerHit(n, dt) {
        n.state = "hit";
        const a = Math.abs(dt);
        let label = "Ok", add = 100; this.counts.ok++;
        if (a <= PERFECT_MS) { label = "Perfect"; add = 300; this.counts.perfect++; }
        else if (a <= GOOD_MS) { label = "Good"; add = 200; this.counts.good++; }
        this.score += add + Math.floor(this.combo * 1.5);
        this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.lastStr = `${label} (${Math.round(a)} ms)`;
        this.keyFeedPush(`${this.keyCharForKind(n.kind)} ✓`, true);
        this.idxNext++;
        if (this.idxNext >= this.chart.length) { this.isPlaying = false; if (this._raf) cancelAnimationFrame(this._raf); this._raf = null; this.lastStr = `Secuencia completada. GG.`; }
        this.updateHUD();
      }

      failAndRestart(reason) {
        const n = this.expectedNote(); if (n && n.state === "pending") { n.state = "miss"; this.counts.miss++; }
        this.combo = 0; this.lastStr = `Fallo: ${reason}. Reinicio.`;
        this.chart = this.chart.map(x => ({ t:x.t, kind:x.kind, state:"pending" }));
        this.idxNext = 0; this.startedAt = nowMs();
        if (!this.isPlaying) { this.isPlaying = true; this.loop(); }
        this.updateHUD();
      }

      keyCharForKind(kind) { return kind === 0 ? "1" : kind === 1 ? "2" : kind === 2 ? "3" : "4"; }
      keyFeedPush(text, ok) { this.keyFeed.unshift({ text, ok, at: nowMs() }); if (this.keyFeed.length > 8) this.keyFeed.pop(); this.updateFeed(); }
      gameNow() { if (!this.startedAt) return 0; return (nowMs() - this.startedAt) * this.speed; }

      loop() {
        if (!this.isPlaying) return;
        const ctx = this.ctx, w = this.w, h = this.h;
        ctx.clearRect(0,0,w,h);
        this.renderLane();

        const gNow = this.gameNow();
        for (let i=0; i<this.chart.length; i++) {
          const n = this.chart[i]; if (n.state === "hit") continue;
          const appearAt = n.t - FALL_TIME_MS; if (appearAt > gNow) continue;
          const prog = clamp((gNow - appearAt) / FALL_TIME_MS, 0, 1);
          const marginL = this.w * 0.02;
          const x = marginL + prog * (this.hitX - marginL);
          const meta = KIND_META[n.kind];
          ctx.globalAlpha = n.state === "miss" ? 0.25 : 1;
          ctx.fillStyle = meta.color; meta.draw(ctx, x, this.laneY, this.noteR);
          ctx.globalAlpha = 1;
        }

        // Ghost en la zona de impacto
        const next = this.expectedNote();
        if (next) { ctx.globalAlpha = 0.35; ctx.fillStyle = KIND_META[next.kind].color; KIND_META[next.kind].draw(ctx, this.hitX, this.laneY, this.noteR*1.05); ctx.globalAlpha = 1; }

        // Autoplay + Miss por timeout
        this.autoHit();
        const n = this.expectedNote();
        if (n) {
          const dt = gNow - n.t;
          if (dt > HIT_WINDOW_MS + MISS_GRACE_MS) {
            this.keyFeedPush(`${this.keyCharForKind(n.kind)} (miss ${Math.round(dt - HIT_WINDOW_MS)}ms)`, false);
            this.failAndRestart("Se pasó la ventana");
          }
        }

        this._raf = requestAnimationFrame(() => this.loop());
      }

      renderLane() {
        const ctx = this.ctx, w = this.w, h = this.h;
        // carril horizontal
        const laneH = 28;
        ctx.fillStyle = "#121826";
        ctx.fillRect(0, this.laneY - laneH/2, w, laneH);

        // líneas de regla verticales
        ctx.strokeStyle = "#21314a"; ctx.lineWidth = 1; ctx.setLineDash([4, 10]);
        ctx.beginPath();
        for (let x = 0; x < w; x += 40) { ctx.moveTo(x, this.laneY - laneH/2 - 10); ctx.lineTo(x, this.laneY + laneH/2 + 10); }
        ctx.stroke(); ctx.setLineDash([]);

        // zona de impacto
        ctx.strokeStyle = "#475569"; ctx.lineWidth = 3;
        ctx.strokeRect(this.hitX - 22, this.laneY - laneH, 44, laneH*2);
      }

      renderStatic() { const ctx = this.ctx; ctx.clearRect(0,0,this.w,this.h); this.renderLane(); this.updateHUD(); }

      updateHUD() {
        const sEl = this.ui.stats;
        const totalHits = this.counts.perfect + this.counts.good + this.counts.ok;
        const acc = totalHits ? Math.round(((this.counts.perfect*1 + this.counts.good*0.7 + this.counts.ok*0.4) / totalHits) * 100) : 0;
        sEl.innerHTML = `
          <div>Score: <strong>${this.score}</strong></div>
          <div>Combo: <strong>${this.combo}</strong> (Max: ${this.maxCombo})</div>
          <div>Accuracy: <strong>${acc}%</strong></div>
          <div>Velocidad: <strong>${this.speed}x</strong></div>
          <div>Perfect: ${this.counts.perfect}</div>
          <div>Good: ${this.counts.good}</div>
          <div>Ok: ${this.counts.ok}</div>
        `;
        this.ui.last.textContent = this.lastStr ? `Último: ${this.lastStr}` : "Último: —";
        const n = this.expectedNote();
        if (n) { const key = this.keyCharForKind(n.kind); const name = KIND_META[n.kind].name; this.ui.expected.innerHTML = `Esperada: <strong>${key}</strong> (${name})`; }
        else { this.ui.expected.textContent = "Esperada: — (completado)"; }
        this.updateFeed();
      }

      updateFeed() { this.ui.keyfeed.innerHTML = "Pulsaciones: " + this.keyFeed.map(x => `<span class=\"${x.ok ? 'good':'bad'}\">${x.text}</span>`).join(" · "); }

      bindControls() {
        this.ui.playBtn.addEventListener('click', () => this.play());
        this.ui.pauseBtn.addEventListener('click', () => this.pause());
        this.ui.resetBtn.addEventListener('click', () => this.reset());
        this.ui.autoplayToggle.addEventListener('change', (e) => this.setAutoplay(e.target.checked));
        this.ui.speedSel.addEventListener('change', (e) => this.setSpeed(parseFloat(e.target.value)));
        window.addEventListener('keydown', (ev) => {
          if (ev.repeat) return;
          if (ev.code === 'Space') { ev.preventDefault(); this.isPlaying ? this.pause() : this.play(); return; }
          if (ev.code === 'KeyR') { this.reset(); return; }
          const kind = KEY_TO_KIND[ev.code]; if (kind !== undefined) this.onKey(kind);
        });
      }
    }

    // Boot
    const canvas = document.getElementById('game');
    const engine = new Engine(canvas, {
      stats: document.getElementById('stats'),
      last: document.getElementById('last'),
      expected: document.getElementById('expected'),
      keyfeed: document.getElementById('keyfeed'),
      playBtn: document.getElementById('playBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      resetBtn: document.getElementById('resetBtn'),
      autoplayToggle: document.getElementById('autoplayToggle'),
      speedSel: document.getElementById('speedSel'),
    });

    // Chart demo (5 notas, misma secuencia)
    const demoChart = [
      { t:1500, kind:0 },
      { t:2300, kind:1 },
      { t:3100, kind:2 },
      { t:3900, kind:3 },
      { t:4700, kind:0 },
    ];

    // API pública
    window.EngineAPI = {
      setChart: (arr) => engine.setChart(arr),
      play: () => engine.play(),
      pause: () => engine.pause(),
      reset: () => engine.reset(),
      setSpeed: (m) => { engine.setSpeed(m); document.getElementById('speedSel').value = String(m); },
      setAutoplay: (b) => { engine.setAutoplay(!!b); document.getElementById('autoplayToggle').checked = !!b; },
    };

    // Init
    engine.setChart(demoChart);
    document.getElementById('speedSel').value = '0.25';
    document.getElementById('autoplayToggle').checked = false;
  })();
  </script>
</body>
</html>
