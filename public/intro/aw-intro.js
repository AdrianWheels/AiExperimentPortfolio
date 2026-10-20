/* Intro de marca · Adrián Wheels
 * Una rueda entra rodando y dibuja el monograma AW sin levantarse; luego aparece el nombre.
 * Sin dependencias. Se carga sincrona al principio de <body> para tapar la página desde el primer fotograma.
 * - Sale una vez por sesión (sessionStorage). ?intro=1 la fuerza.
 * - Clic, toque o tecla la saltan.
 * - Con «reducir movimiento» se ve el logo quieto un momento.
 * - Determinista: render(t) no tiene reloj dentro. window.__awIntro.seek(t) pinta un instante (pruebas).
 */
(function () {
  'use strict';
  var KEY = 'aw-intro-visto';
  var force = /[?&]intro=1\b/.test(location.search);
  try { if (!force && sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); } catch (e) {}
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Geometría limpia del monograma, reconstruida sobre el avatar de GitHub (el PNG solo sirvió de calco):
  // trazos de grosor constante, rectas y curvas ajustadas al eje del original. Pies y remate, cortados en recto.
  var A_PATH = 'M 91.6 310 L 130.5 192 Q 147.4 140.9 164.3 192 L 203.2 310'; // grosor 29
  var A_BAR = 'M 100 254 L 190 254';                                          // grosor 24
  var WAVE = 'M 199.7 310 L 218 234.6 C 223.2 213.3, 227.9 203.2, 242 203.2 C 279.3 203.2, 254.3 283.7, 312 283.7 C 335.5 283.7, 344.9 264.7, 354 232.2 L 372.8 165'; // grosor 24
  var CLIP = 'M0 0 H340 V189.5 H460 V293.5 H0 Z'; // suelo y=293.5; remate de la W en y=189.5
  // Ruta de la rueda (y de la máscara que revela el logo): el mismo eje, sin lo que queda bajo el suelo.
  var ROUTE = 'M 100.8 282 L 130.5 192 Q 147.4 140.9 164.3 192 L 195.3 286 L 205.5 286 L 218 234.6 C 223.2 213.3, 227.9 203.2, 242 203.2 C 279.3 203.2, 254.3 283.7, 312 283.7 C 335.5 283.7, 344.9 264.7, 354 232.2 L 365.2 192';
  var START = { x: 100.8, y: 282 };       // primer punto de ROUTE
  var R = 14.5;                           // radio de la rueda = medio grosor de la A
  var BOX = { x: 80, y: 148, w: 300, h: 222 }; // logo + nombre

  var D = 3.3; // duración total (s)
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function seg(t, a, b) { return clamp((t - a) / (b - a)); }
  function eio(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eout(x) { return 1 - Math.pow(1 - x, 3); }

  // Fuente del nombre: Outfit, solo las letras que usa.
  var font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300&text=ADRI%C3%81NWHELS&display=block';
  document.head.appendChild(font);

  var root = document.createElement('div');
  root.id = 'aw-intro';
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#000;cursor:pointer;' +
    'display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity .45s ease';
  var svg = el('svg', { width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid meet' }, root);
  var defs = el('defs', {}, svg);
  var mask = el('mask', { id: 'aw-intro-mask', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 460, height: 460 }, defs);
  el('rect', { x: 0, y: 0, width: 460, height: 460, fill: '#000' }, mask);
  var mMain = el('path', { d: ROUTE, fill: 'none', stroke: '#fff', 'stroke-width': 48, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mask);
  // La raya de la A va aparte, con su propia máscara: sale cuando la rueda ya ha terminado.
  var maskBar = el('mask', { id: 'aw-intro-mask-bar', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 460, height: 460 }, defs);
  el('rect', { x: 0, y: 0, width: 460, height: 460, fill: '#000' }, maskBar);
  var mBar = el('path', { d: A_BAR, fill: 'none', stroke: '#fff', 'stroke-width': 34, 'stroke-linecap': 'butt' }, maskBar);
  var clip = el('clipPath', { id: 'aw-intro-clip', clipPathUnits: 'userSpaceOnUse' }, defs);
  el('path', { d: CLIP }, clip);
  var logo = el('g', { 'clip-path': 'url(#aw-intro-clip)', mask: 'url(#aw-intro-mask)', fill: 'none', stroke: '#fff' }, svg);
  el('path', { d: A_PATH, 'stroke-width': 29, 'stroke-linejoin': 'miter', 'stroke-miterlimit': 10 }, logo);
  el('path', { d: WAVE, 'stroke-width': 24, 'stroke-linejoin': 'miter', 'stroke-miterlimit': 10 }, logo);
  el('path', { d: A_BAR, fill: 'none', stroke: '#fff', 'stroke-width': 24, mask: 'url(#aw-intro-mask-bar)' }, svg);
  var wheel = el('g', {}, svg);
  el('circle', { r: R, fill: '#fff' }, wheel);
  var spokes = el('g', {}, wheel);
  el('line', { x1: -R * .62, y1: 0, x2: R * .62, y2: 0, stroke: '#000', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, spokes);
  el('line', { x1: 0, y1: -R * .62, x2: 0, y2: R * .62, stroke: '#000', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, spokes);
  el('circle', { r: 2.8, fill: '#fff', stroke: '#000', 'stroke-width': 2 }, spokes);
  var name = el('text', { x: 230, y: 352, 'text-anchor': 'middle', fill: '#fff', 'font-family': 'Outfit, system-ui, sans-serif', 'font-weight': 300, 'font-size': 15.5 }, svg);
  name.textContent = 'ADRIÁN WHEELS';

  var L = 0, LB = 0;
  function fit() {
    // El bloque ocupa como mucho el 34 % del ancho (60 % en vertical) y el 44 % del alto.
    var a = (window.innerWidth || 1) / (window.innerHeight || 1);
    var vw = Math.max(BOX.w / (a < 1 ? 0.6 : 0.34), (BOX.h / 0.44) * a);
    var vh = vw / a;
    svg.setAttribute('viewBox', [BOX.x + BOX.w / 2 - vw / 2, BOX.y + BOX.h / 2 - vh / 2, vw, vh].join(' '));
  }

  function render(t) {
    var enter = eout(seg(t, 0, 0.5));
    var draw = eio(seg(t, 0.42, 1.6));
    var bar = eio(seg(t, 1.9, 2.25));
    mMain.style.strokeDashoffset = L * (1 - draw);
    mBar.style.strokeDashoffset = LB * (1 - bar);

    // La rueda: entra rodando por la izquierda hasta el pie de la A y luego corre por el eje.
    var p, run;
    if (t < 0.42) {
      var from = START.x - 260;
      p = { x: from + (START.x - from) * enter, y: START.y };
      run = (START.x - from) * enter;
    } else {
      p = mMain.getPointAtLength(L * draw);
      run = 260 + L * draw;
    }
    var gone = seg(t, 1.6, 1.95);
    var s = 1 - eio(gone);
    wheel.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ') scale(' + s + ')');
    spokes.setAttribute('transform', 'rotate(' + (run / R * 57.2958) + ')');
    wheel.style.opacity = s > 0.02 ? 1 : 0;

    var nt = eout(seg(t, 2.05, 2.65));
    name.style.opacity = nt;
    name.setAttribute('letter-spacing', (7 + 5 * (1 - nt)).toFixed(2));
  }

  function renderStatic() {
    mMain.style.strokeDashoffset = 0; mBar.style.strokeDashoffset = 0;
    wheel.style.opacity = 0; name.style.opacity = 1; name.setAttribute('letter-spacing', 7);
  }

  var start = null, raf = 0, done = false;
  var html = document.documentElement, prevOverflow = html.style.overflow;
  html.style.overflow = 'hidden';

  function finish(fast) {
    if (done) return; done = true;
    cancelAnimationFrame(raf);
    root.style.transition = 'opacity ' + (fast ? .25 : .45) + 's ease';
    root.style.opacity = '0';
    html.style.overflow = prevOverflow;
    setTimeout(function () { root.remove(); }, fast ? 280 : 480);
    ['keydown', 'pointerdown', 'wheel', 'touchstart'].forEach(function (ev) { removeEventListener(ev, skip, true); });
  }
  function skip() { finish(true); }
  ['keydown', 'pointerdown', 'wheel', 'touchstart'].forEach(function (ev) { addEventListener(ev, skip, { capture: true, passive: true }); });

  function tick(ts) {
    if (start === null) start = ts;
    var t = (ts - start) / 1000;
    render(Math.min(t, D));
    if (t >= D - 0.45) return finish(false);
    raf = requestAnimationFrame(tick);
  }

  function go() {
    document.body.insertBefore(root, document.body.firstChild);
    L = mMain.getTotalLength(); LB = mBar.getTotalLength();
    mMain.style.strokeDasharray = L; mBar.style.strokeDasharray = LB;
    fit(); addEventListener('resize', fit);
    if (reduce) { renderStatic(); setTimeout(function () { finish(false); }, 1100); return; }
    render(0);
    // Espera a la fuente del nombre como mucho 400 ms; la animación es lo que manda.
    var ready = document.fonts && document.fonts.load ? document.fonts.load('300 16px Outfit') : Promise.resolve();
    Promise.race([ready, new Promise(function (r) { setTimeout(r, 400); })]).then(function () {
      if (!done) raf = requestAnimationFrame(tick);
      // Red de seguridad: si el navegador no da fotogramas (pestaña en segundo plano), no dejar la página tapada.
      setTimeout(function () { finish(false); }, (D + 1.5) * 1000);
    });
  }

  window.__awIntro = {
    seek: function (t) { cancelAnimationFrame(raf); render(t); },
    finish: function () { finish(true); }
  };

  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
})();
