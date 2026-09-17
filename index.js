/* ══════════════════════════════════════════════════
   index.js — Oscar Escalante · Portfolio
   Índice:
   00. Helpers            05. Terminal del hero
   01. Año footer         06. Reveal on scroll
   02. Scroll: header + barra progreso   07. Scrollspy
   03. Título de pestaña animado         08. Menú móvil
   04. Lluvia digital (canvas)           09. Toast + easter egg
   ══════════════════════════════════════════════════ */

/* ═══ 00. HELPERS ═══ */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══ 01. AÑO DEL FOOTER ═══ */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ═══ 02. SCROLL: HEADER + BARRA DE PROGRESO ═══ */
const header = $('#site-header');
const bar    = $('#progress-bar');
function onScroll(){
  header?.classList.toggle('scrolled', scrollY > 8);
  if (bar){
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  }
}
onScroll();
addEventListener('scroll', onScroll, { passive: true });

/* ═══ 03. TÍTULO DE PESTAÑA ANIMADO (marquee) ═══ */
const BASE_TITLE = document.title;
const MARQUEE  = '  ⌈ ' + BASE_TITLE + ' ⌋  ';
let mi = 0, titleTimer = null;

function startMarquee(){
  stopMarquee();
  titleTimer = setInterval(() => {
    document.title = MARQUEE.slice(mi) + MARQUEE.slice(0, mi);
    mi = (mi + 1) % MARQUEE.length;
  }, 220);
}
function stopMarquee(){ if (titleTimer){ clearInterval(titleTimer); titleTimer = null; } }

if (!REDUCE){
  startMarquee();
  // Al cambiar de pestaña: mensaje de "hacker" + favicon avatar
  document.addEventListener('visibilitychange', () => {
    if (document.hidden){
      stopMarquee();
      document.title = '⚠ ACCESS GRANTED... come back';
    } else {
      startMarquee();
    }
  });
}

/* ═══ 04. LLUVIA DIGITAL (canvas, estilo hacker sutil) ═══ */
const canvas = $('#rain');
if (canvas && !REDUCE){
  const ctx    = canvas.getContext('2d');
  const CHARS  = 'アイウエオカキクケコサシスセソ01<>#$%&{}=+*';
  const FONT   = 14;
  let w, h, cols, drops, last = 0;

  function resize(){
    w = canvas.width  = innerWidth;
    h = canvas.height = innerHeight;
    cols  = Math.floor(w / FONT);
    drops = Array.from({ length: cols }, () => Math.random() * -80);
    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, 0, w, h);
  }
  resize();
  addEventListener('resize', resize);

  (function draw(t){
    requestAnimationFrame(draw);
    if (t - last < 55) return;          // ~18 fps: suficiente y ligero
    last = t;

    const hype = document.body.classList.contains('access-granted');
    ctx.fillStyle = 'rgba(10,13,18,.14)';               // estela
    ctx.fillRect(0, 0, w, h);
    ctx.font = FONT + 'px monospace';

    for (let i = 0; i < cols; i++){
      const ch = CHARS[Math.random() * CHARS.length | 0];
      ctx.fillStyle = Math.random() < .05
        ? 'rgba(190,255,242,.9)'                        // cabeza brillante
        : hype ? 'rgba(63,224,200,.9)' : 'rgba(63,224,200,.5)';
      ctx.fillText(ch, i * FONT, drops[i] * FONT);
      if (drops[i] * FONT > h && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    }
  })(0);
}

/* ═══ 05. TERMINAL DEL HERO: escribe comandos en bucle ═══ */
const termOut = $('#term-out');
const TERM_SCRIPT = [
  { cmd: 'whoami',
    out: ['<span class="t-ok">ethical_hacker</span> · web & api security'] },
  { cmd: 'cat mission.txt',
    out: ['&gt; current: Ethical Hacker @ NTT DATA',
          '&gt; since: feb 2026 — hunting logic flaws'] },
  { cmd: 'ls skills/',
    out: ['burp-suite/  python/  owasp-top10/',
          'idor/  xss/  apis/  reporting/'] },
  { cmd: './scan --targets',
    out: ['[OK] web apps   [OK] apis   [OK] auth flows',
          '[**] all targets authorized · labs & engagements'] }
];

if (termOut){
  if (REDUCE){
    // Sin movimiento: volcado estático completo
    termOut.innerHTML = TERM_SCRIPT.map(b =>
      `<span class="t-p">oscar@ntt-data:~$</span> <span class="t-cmd">${b.cmd}</span>\n` +
      b.out.join('\n')
    ).join('\n\n');
  } else {
    let block = 0;
    const PROMPT = '<span class="t-p">oscar@ntt-data:~$</span> ';

    function typeCommand(cmd, done){
      let i = 0;
      termOut.innerHTML += PROMPT;
      (function tick(){
        termOut.innerHTML = termOut.innerHTML.replace(/<span class="t-cmd">.*<\/span>$/, '') +
          `<span class="t-cmd">${cmd.slice(0, ++i)}</span>`;
        if (i < cmd.length) setTimeout(tick, 34 + Math.random() * 40);
        else done();
      })();
    }
    function printOut(lines, done){
      let i = 0;
      (function next(){
        if (i < lines.length){
          termOut.innerHTML += '\n' + lines[i++];
          setTimeout(next, 130);
        } else { termOut.innerHTML += '\n'; done(); }
      })();
    }
    function runBlock(){
      termOut.innerHTML = '';
      const b = TERM_SCRIPT[block];
      typeCommand(b.cmd, () => printOut(b.out, () => {
        block = (block + 1) % TERM_SCRIPT.length;
        setTimeout(runBlock, 1700);
      }));
    }
    runBlock();
  }
}

/* ═══ 06. REVEAL ON SCROLL ═══ */
if (!REDUCE && 'IntersectionObserver' in window){
  const ro = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting){ en.target.classList.add('in'); ro.unobserve(en.target); }
    });
  }, { threshold: .08 });
  $$('.reveal').forEach(el => ro.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('in'));
}

/* Efecto "decode" del nombre: se descifra solo al cargar */
const nameEl = $('[data-decode]');
if (nameEl && !REDUCE){
  const target  = nameEl.dataset.decode;
  const GLYPHS  = '!<>-_\\/[]{}=+*^?#01';
  let frame = 0;
  const TOTAL = 26;
  (function tick(){
    frame++;
    const p = frame / TOTAL;
    let out = '';
    for (let i = 0; i < target.length; i++){
      out += (p >= i / target.length + .25) ? target[i]
           : target[i] === ' ' ? ' '
           : GLYPHS[Math.random() * GLYPHS.length | 0];
    }
    nameEl.textContent = out;
    if (frame < TOTAL) setTimeout(tick, 34);
    else nameEl.textContent = target;
  })();
}

/* Rol rotativo con máquina de escribir */
const typedEl = $('#typed');
const ROLES = [
  'Ethical Hacker @ NTT DATA',
  'Web Pentester',
  'Bug Hunter',
  'AppSec · OWASP Top 10'
];
if (typedEl && !REDUCE){
  let ri = 0, ci = 0, deleting = false;
  (function type(){
    const word = ROLES[ri];
    ci += deleting ? -1 : 1;
    typedEl.textContent = word.slice(0, ci);
    let delay = deleting ? 38 : 72;
    if (!deleting && ci === word.length){ deleting = true; delay = 1900; }
    else if (deleting && ci === 0){ deleting = false; ri = (ri + 1) % ROLES.length; delay = 420; }
    setTimeout(type, delay);
  })();
}

/* ═══ 07. SCROLLSPY: link activo en el nav ═══ */
const navLinks = $$('.nav-menu a[href^="#"]');
const linkById = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
if ('IntersectionObserver' in window){
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting){
        navLinks.forEach(a => a.classList.remove('active'));
        linkById.get(en.target.id)?.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));
}

/* ═══ 08. MENÚ MÓVIL ═══ */
const toggleBtn = $('.nav-toggle');
const menu = $('#nav-menu');
function setMenu(open){
  if (!toggleBtn || !menu) return;
  toggleBtn.setAttribute('aria-expanded', String(open));
  toggleBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.classList.toggle('open', open);
}
toggleBtn?.addEventListener('click', () =>
  setMenu(toggleBtn.getAttribute('aria-expanded') !== 'true'));
 $$('.nav-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ═══ 09. TOAST + COPIAR EMAIL + EASTER EGG ═══ */
const toastEl = $('#toast');
let toastTimer;
function toast(msg){
  if (!toastEl) return alert(msg);
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

 $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(btn.dataset.copy); toast('Email copied ✓'); }
  catch { toast('Email: ' + btn.dataset.copy); }
}));

/* Easter egg: Konami code (↑↑↓↓←→←→BA) → modo "ACCESS GRANTED" */
const SEQ = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
let ki = 0;
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  ki = (k === SEQ[ki]) ? ki + 1 : (k === SEQ[0] ? 1 : 0);
  if (ki === SEQ.length){
    ki = 0;
    const on = document.body.classList.toggle('access-granted');
    toast(on ? 'ACCESS GRANTED — welcome, hacker.' : 'Access revoked.');
  }
});
