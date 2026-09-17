/* ══════════════════════════════════════════════════
   index.js — Oscar Escalante · Portfolio
   Cada módulo es independiente (try/catch): si uno
   falla, el resto de la página sigue funcionando.
   ══════════════════════════════════════════════════ */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const safe = fn => { try { fn(); } catch (e) { console.warn('[fx]', e); } };

/* ═══ 01 · Año del footer ═══ */
safe(() => {
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
});

/* ═══ 02 · Header + barra de progreso de scroll ═══ */
safe(() => {
  const header = $('#site-header');
  const bar = $('#progress-bar');
  const onScroll = () => {
    header?.classList.toggle('scrolled', scrollY > 8);
    if (bar){
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? (scrollY / max) : 0})`;
    }
  };
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
});

/* ═══ 03 · Título de pestaña (marquee simple, sin caracteres raros) ═══ */
safe(() => {
  if (REDUCE) return;
  const BASE = document.title;
  const SPIN = BASE + '   ·   ';
  let i = 0;
  let timer = setInterval(step, 280);
  function step(){
    document.title = SPIN.slice(i) + SPIN.slice(0, i);
    i = (i + 1) % SPIN.length;
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden){
      clearInterval(timer); timer = null;
      document.title = '· session paused — Oscar Escalante';
    } else if (!timer){
      document.title = BASE;
      timer = setInterval(step, 280);
    }
  });
});

/* ═══ 04 · Lluvia digital (canvas) ═══ */
safe(() => {
  const canvas = $('#rain');
  if (!canvas || REDUCE) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const CHARS = 'アイウエオカキクケコサシスセソ01<>#$%&{}=+*';
  const FONT = 14;
  let w, h, cols, drops, last = 0;

  function resize(){
    w = canvas.width  = innerWidth;
    h = canvas.height = innerHeight;
    cols = Math.max(1, Math.floor(w / FONT));
    drops = Array.from({ length: cols }, () => Math.random() * -80);
  }
  resize();
  addEventListener('resize', resize);

  (function draw(t){
    requestAnimationFrame(draw);
    if (t - last < 55) return;              // ~18 fps, ligero
    last = t;
    const hype = document.body.classList.contains('access-granted');
    ctx.fillStyle = 'rgba(10,13,18,.14)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = FONT + 'px monospace';
    for (let i = 0; i < cols; i++){
      const ch = CHARS[Math.random() * CHARS.length | 0];
      ctx.fillStyle = Math.random() < .05
        ? 'rgba(190,255,242,.9)'
        : hype ? 'rgba(63,224,200,.9)' : 'rgba(63,224,200,.5)';
      ctx.fillText(ch, i * FONT, drops[i] * FONT);
      if (drops[i] * FONT > h && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    }
  })(0);
});

/* ═══ 05 · Terminal del hero
   El HTML ya trae el contenido estático: si no hay JS o hay
   reduced-motion, la terminal NUNCA se ve vacía ni rota. ═══ */
safe(() => {
  const out = $('#term-out');
  if (!out || REDUCE) return;

  const BLOCKS = [
    { cmd: 'whoami',
      out: ['<span class="t-ok">oscar escalante — ethical hacker</span>'] },
    { cmd: 'cat focus.txt',
      out: ['web security testing · OWASP WSTG',
            'DAST analysis · risk assessment',
            'reporting with evidence &amp; mitigation'] },
    { cmd: 'ls tools/',
      out: ['burp-suite/  nmap/  wireshark/  metasploit/',
            'ffuf/  gobuster/  python/  bash/'] },
    { cmd: './status',
      out: ['<span class="t-ok">[ok]</span> eJPTv2',
            '<span class="t-ok">[~~]</span> CWES (HTB) · BSCP (PortSwigger)',
            '<span class="t-ok">[+]</span> tryhackme top 5% — practice on'] }
  ];
  const PROMPT = '<span class="t-p">oscar@lab:~$</span> ';
  let bi = 0;

  function typeCmd(cmd, cb){
    const line = document.createElement('span');
    line.innerHTML = PROMPT;
    const c = document.createElement('span');
    c.className = 't-cmd';
    line.appendChild(c);
    out.appendChild(line);
    let i = 0;
    (function tick(){
      c.textContent = cmd.slice(0, ++i);
      if (i < cmd.length) setTimeout(tick, 30 + Math.random() * 45);
      else cb();
    })();
  }
  function addOut(html, cb){
    out.insertAdjacentHTML('beforeend', '\n' + html);
    setTimeout(cb, 130);
  }
  function runBlock(){
    out.textContent = '';
    const b = BLOCKS[bi];
    typeCmd(b.cmd, () => {
      let i = 0;
      (function next(){
        if (i < b.out.length) addOut(b.out[i++], next);
        else { bi = (bi + 1) % BLOCKS.length; setTimeout(runBlock, 2100); }
      })();
    });
  }
  setTimeout(runBlock, 900);
});

/* ═══ 06 · Reveal on scroll ═══ */
safe(() => {
  const els = $$('.reveal');
  if (REDUCE || !('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const ro = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting){ en.target.classList.add('in'); ro.unobserve(en.target); }
    });
  }, { threshold: .08 });
  els.forEach(el => ro.observe(el));
});

/* ═══ 07 · Decode del nombre ═══ */
safe(() => {
  const el = $('[data-decode]');
  if (!el || REDUCE) return;
  const target = el.dataset.decode;
  const GLYPHS = '!<>-_\\/[]{}=+*^?#01';
  let frame = 0;
  const TOTAL = 26;
  (function tick(){
    frame++;
    const p = frame / TOTAL;
    let s = '';
    for (let i = 0; i < target.length; i++){
      s += (p >= i / target.length + .25) ? target[i]
         : target[i] === ' ' ? ' '
         : GLYPHS[Math.random() * GLYPHS.length | 0];
    }
    el.textContent = s;
    if (frame < TOTAL) setTimeout(tick, 34);
    else el.textContent = target;
  })();
});

/* ═══ 08 · Línea rotativa (qué hace, sin humo) ═══ */
safe(() => {
  const el = $('#typed');
  if (!el || REDUCE) return;
  const ROLES = [
    'web security testing · OWASP WSTG',
    'DAST & risk assessment',
    'access control · IDOR · APIs',
    'clear reporting, evidence-first'
  ];
  let ri = 0, ci = 0, del = false;
  (function type(){
    const word = ROLES[ri];
    ci += del ? -1 : 1;
    el.textContent = word.slice(0, ci);
    let d = del ? 34 : 66;
    if (!del && ci === word.length){ del = true; d = 2000; }
    else if (del && ci === 0){ del = false; ri = (ri + 1) % ROLES.length; d = 400; }
    setTimeout(type, d);
  })();
});

/* ═══ 09 · Scrollspy ═══ */
safe(() => {
  const links = $$('.nav-menu a[href^="#"]');
  const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  if (!('IntersectionObserver' in window)) return;
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting){
        links.forEach(a => a.classList.remove('active'));
        byId.get(en.target.id)?.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));
});

/* ═══ 10 · Menú móvil ═══ */
safe(() => {
  const btn = $('.nav-toggle'), menu = $('#nav-menu');
  if (!btn || !menu) return;
  const set = open => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  $$('.nav-menu a').forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
});

/* ═══ 11 · Toast + copiar email ═══ */
safe(() => {
  const toastEl = $('#toast');
  let tt;
  const toast = msg => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(tt);
    tt = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const val = btn.dataset.copy;
    try { await navigator.clipboard.writeText(val); toast('Email copied ✓'); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = val; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast('Email copied ✓'); }
      catch { toast('Email: ' + val); }
      ta.remove();
    }
  }));
});

/* ═══ 12 · Easter egg: Konami code (↑↑↓↓←→←→BA) ═══ */
safe(() => {
  const SEQ = ['arrowup','arrowup','arrowdown','arrowdown','arrowleft','arrowright','arrowleft','arrowright','b','a'];
  let ki = 0;
  addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase();
    ki = (k === SEQ[ki]) ? ki + 1 : (k === SEQ[0] ? 1 : 0);
    if (ki === SEQ.length){
      ki = 0;
      const on = document.body.classList.toggle('access-granted');
      const t = $('#toast');
      if (t){
        t.textContent = on ? 'ACCESS GRANTED — practice mode' : 'session restored';
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2600);
      }
    }
  });
});
