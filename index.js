/* ============================================================
   Vanilla JS — sin dependencias. Todo respeta reduced-motion.
   ============================================================ */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Año del footer ---------- */
 $('#year').textContent = new Date().getFullYear();

/* ---------- Header: borde al hacer scroll ---------- */
const header = $('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

/* ---------- Menú móvil ---------- */
const toggleBtn = $('.nav-toggle');
const menu = $('#nav-menu');

function setMenu(open){
  toggleBtn.setAttribute('aria-expanded', String(open));
  toggleBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.classList.toggle('open', open);
}
toggleBtn.addEventListener('click', () =>
  setMenu(toggleBtn.getAttribute('aria-expanded') !== 'true')
);
 $$('.nav-menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') setMenu(false);
});

/* ---------- Scrollspy: link activo según sección visible ---------- */
const navLinks = $$('.nav-menu a[href^="#"]');
const linkById = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting){
      navLinks.forEach(a => a.classList.remove('active'));
      linkById.get(en.target.id)?.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
 $$('main section[id]').forEach(s => spy.observe(s));

/* ---------- Reveal on scroll (omitido si reduced-motion) ---------- */
if (!REDUCE){
  const ro = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting){ en.target.classList.add('in'); ro.unobserve(en.target); }
    });
  }, { threshold: 0.08 });
  $$('.reveal').forEach(el => ro.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('in'));
}

/* ============================================================
   Repeater del hero — panel interactivo estilo Burp
   ============================================================ */
const VIEWS = {
  whoami: {
    req: 'GET /whoami HTTP/2\nHost: oscar.escalante\nUser-Agent: visitor/1.0',
    status: '200 OK',
    res: `{
  "name": "Oscar Escalante",
  "role": "Ethical Hacker",
  "team": "AppSec @ NTT DATA",
  "since": "2026-02",
  "focus": ["web", "api", "appsec"],
  "motto": "break it before they do"
}`
  },
  focus: {
    req: 'GET /vulnerabilities HTTP/2\nHost: oscar.escalante\nAccept: application/json',
    status: '200 OK',
    res: `{
  "primary": ["business logic", "access control / IDOR"],
  "also_hunting": ["XSS", "auth & session flaws"],
  "owasp_top_10": true,
  "scanner_output_only": false
}`
  },
  stack: {
    req: 'GET /toolkit HTTP/2\nHost: oscar.escalante\nAccept: application/json',
    status: '200 OK',
    res: `{
  "daily_driver": "Burp Suite Pro",
  "tools": ["Repeater", "Intruder", "Autorize", "ffuf"],
  "scripting": ["Python", "Bash"],
  "method": "manual-first"
}`
  },
  contact: {
    req: 'POST /contact HTTP/2\nHost: oscar.escalante\nContent-Type: application/json',
    status: '201 Created',
    res: `{
  "github": "Philosopher-Man",
  "email": "open on the page",
  "open_to": ["appsec roles", "ctf teams", "write-up feedback"],
  "response_time": "< 24h"
}`
  }
};

const reqEl    = $('#rep-req');
const outEl    = $('#rep-out');
const statusEl = $('#rep-status');
const tabs     = $$('.rep-tabs [role="tab"]');
let typeTimer  = null;

/* Resaltado simple de JSON (contenido propio, no input de usuario) */
function highlight(text){
  return text
    .replace(/"([^"]+)":\s?"([^"]*)"/g,
      '<span class="j-key">"$1":</span> <span class="j-str">"$2"</span>')
    .replace(/: (\d+|true|false)/g, ': <span class="j-num">$1</span>');
}

function stopTyping(){
  if (typeTimer){ clearTimeout(typeTimer); typeTimer = null; }
}

function renderView(key){
  const v = VIEWS[key];
  if (!v) return;
  stopTyping();
  reqEl.textContent = v.req;
  statusEl.textContent = v.status;

  if (REDUCE){                       // sin animación: volcado instantáneo
    outEl.innerHTML = highlight(v.res);
    return;
  }
  outEl.textContent = '';
  let i = 0;
  (function step(){
    i += 1 + Math.floor(Math.random() * 3);   // ritmo natural, 1-3 chars por tick
    outEl.textContent = v.res.slice(0, i);
    if (i < v.res.length){
      typeTimer = setTimeout(step, 12);
    } else {
      outEl.innerHTML = highlight(v.res);     // resaltado al terminar
    }
  })();
}

function selectTab(tab){
  tabs.forEach(t => {
    const sel = t === tab;
    t.setAttribute('aria-selected', String(sel));
    t.tabIndex = sel ? 0 : -1;
  });
  renderView(tab.dataset.view);
}

tabs.forEach(t => t.addEventListener('click', () => selectTab(t)));

/* Navegación por teclado en el tablist (flechas + Home/End) */
 $('.rep-tabs').addEventListener('keydown', e => {
  const idx = tabs.indexOf(document.activeElement);
  if (idx === -1) return;
  let next = null;
  if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
  if (e.key === 'ArrowLeft')  next = (idx - 1 + tabs.length) % tabs.length;
  if (e.key === 'Home')       next = 0;
  if (e.key === 'End')        next = tabs.length - 1;
  if (next !== null){
    e.preventDefault();
    tabs[next].focus();
    selectTab(tabs[next]);
  }
});

renderView('whoami');

/* ============================================================
   Copiar email + toast (nada de alert())
   ============================================================ */
const toastEl = $('#toast');
let toastTimer;
function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

 $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  const val = btn.dataset.copy;
  try {
    await navigator.clipboard.writeText(val);
    toast('Email copied to clipboard');
  } catch {
    // Fallback para contextos sin Clipboard API
    const ta = document.createElement('textarea');
    ta.value = val;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Email copied to clipboard'); }
    catch { toast('Copy failed — email: ' + val); }
    ta.remove();
  }
}));
