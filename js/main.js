/* =========================================================
   CONFIG — paste your links here
   ========================================================= */
const SITE = {
  email: 'gupta05purab@gmail.com',
  linkedin: 'https://www.linkedin.com/in/purab-gupta/',
  github: 'https://github.com/GuptaPurab',
  leetcode: 'https://leetcode.com/u/thebtechbuild/',
  visitsEndpoint: '/api/visits',
};

/* ========================================================= */
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = () => matchMedia('(min-width: 810px)').matches;

// scrollbar width → CSS var so the 5-column grid matches the visible width
const setSbw = () => document.documentElement.style.setProperty('--sbw', `${innerWidth - document.documentElement.clientWidth}px`);
setSbw();

/* ---------- links ---------- */
function applyLinks() {
  $$('[data-link]').forEach(a => {
    const key = a.dataset.link;
    if (key === 'email') {
      a.href = `mailto:${SITE.email}`;
      if (!a.textContent.trim()) a.textContent = SITE.email.toUpperCase();
      return;
    }
    const url = SITE[key];
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = '#';
      a.title = `Add your ${key} URL in js/main.js`;
      a.addEventListener('click', e => e.preventDefault());
    }
  });
}

/* ---------- text splitting ---------- */
function splitChars(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  const line = document.createElement('span');
  line.className = 'split-line';
  line.setAttribute('aria-hidden', 'true');
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? ' ' : ch;
    line.appendChild(s);
  }
  el.textContent = '';
  el.appendChild(line);
  return $$('.char', el);
}

function splitWords(el) {
  const build = (node, target) => {
    node.childNodes.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) target.appendChild(document.createTextNode(' '));
          else {
            const w = document.createElement('span');
            w.className = 'word';
            w.textContent = part;
            target.appendChild(w);
          }
        });
      } else if (n.nodeType === 1) {
        const clone = n.cloneNode(false);
        build(n, clone);
        target.appendChild(clone);
      }
    });
  };
  const frag = document.createDocumentFragment();
  build(el, frag);
  el.textContent = '';
  el.appendChild(frag);
  return $$('.word', el);
}

/* ---------- fit text to its box ---------- */
function fit(el) {
  el.style.fontSize = '100px';
  const range = document.createRange();
  range.selectNodeContents(el);
  const contentW = range.getBoundingClientRect().width;
  const boxW = el.clientWidth;
  if (contentW > 0 && boxW > 0) el.style.fontSize = `${(99.4 * boxW) / contentW}px`;
}
const fitAll = () => $$('[data-fit]').forEach(fit);

/* ---------- scramble ---------- */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+';
function scramble(el, duration = 0.9) {
  const final = el.dataset.text || (el.dataset.text = el.textContent);
  const start = performance.now();
  cancelAnimationFrame(el._raf);
  const tick = now => {
    const p = Math.min((now - start) / (duration * 1000), 1);
    const reveal = Math.floor(p * final.length);
    let out = '';
    for (let i = 0; i < final.length; i++) {
      const c = final[i];
      if (i < reveal || c === ' ' || c === ',' || c === '·') out += c;
      else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) el._raf = requestAnimationFrame(tick);
    else el.textContent = final;
  };
  el._raf = requestAnimationFrame(tick);
}

/* ---------- hero title colour sweep (white → peach toward the end) ---------- */
function tintHeroWords(words) {
  const title = $('.hero__title');
  const w = title.clientWidth;
  const tops = [...new Set(words.map(x => x.offsetTop))].sort((a, b) => a - b);
  const peach = [255, 180, 138];
  words.forEach(word => {
    const line = tops.indexOf(word.offsetTop);
    const lineFactor = line === tops.length - 1 ? 1 : 0.35;
    const t = Math.max(0, Math.min(1, ((word.offsetLeft + word.offsetWidth / 2) / w - 0.5) / 0.5)) * lineFactor;
    const c = peach.map(v => Math.round(255 + (v - 255) * t));
    word.style.color = `rgb(${c.join(',')})`;
  });
}

/* =========================================================
   SMOOTH SCROLL
   ========================================================= */
let lenis = null;
if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

// anchor links
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2 && id !== '#top') return;
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: target === 0 ? 0 : target.getBoundingClientRect().top + scrollY, behavior: 'smooth' });
  });
});

/* ---------- nav hide / show ---------- */
const nav = $('[data-nav]');
let lastY = 0;
const onScroll = y => {
  const down = y > lastY;
  nav.classList.toggle('is-hidden', down && y > 140 && !document.body.classList.contains('menu-open'));
  lastY = y;
};
if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
else addEventListener('scroll', () => onScroll(scrollY), { passive: true });

/* ---------- mobile menu ---------- */
const burger = $('[data-burger]');
const menu = $('[data-menu]');
function closeMenu() {
  if (!menu.classList.contains('is-open')) return;
  menu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
  lenis && lenis.start();
}
burger.addEventListener('click', () => {
  const open = !menu.classList.contains('is-open');
  if (!open) return closeMenu();
  menu.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
  lenis && lenis.stop();
});

/* =========================================================
   BUILD
   ========================================================= */
applyLinks();

const splits = new Map();
$$('[data-split="chars"]').forEach(el => splits.set(el, splitChars(el)));
$$('[data-split="words"]').forEach(el => splits.set(el, splitWords(el)));
const scrubWords = new Map();
$$('[data-scrub]').forEach(el => scrubWords.set(el, splitWords(el)));

fitAll();

const heroName = $('.hero__name');
const heroWords = splits.get($('.hero__title'));
tintHeroWords(heroWords);

/* =========================================================
   INTRO
   ========================================================= */
function intro() {
  const loader = $('.loader');
  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
    onComplete: () => {
      loader.remove();
    },
  });

  gsap.set(splits.get(heroName), { yPercent: 115 });
  gsap.set('.hero .lines span', { scaleY: 0 });
  gsap.set(heroWords, { opacity: 0, yPercent: 40, filter: 'blur(10px)' });
  gsap.set('.hero__meta .label, .nav .label', { opacity: 0 });
  gsap.set('.hero__glow', { opacity: 0, yPercent: 18 });

  if (reduceMotion) {
    gsap.set([splits.get(heroName), heroWords, '.hero .lines span', '.hero__meta .label', '.nav .label', '.hero__glow'], { clearProps: 'all' });
    loader.remove();
    document.body.classList.remove('is-loading');
    return;
  }

  tl.to('.loader__glow', { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, 0.15)
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, 0.7)
    .add(() => {
      document.body.classList.remove('is-loading');
      lenis && lenis.start();
    }, 1.2)
    .to('.hero__glow', { opacity: 1, yPercent: 0, duration: 2.2, ease: 'power3.out' }, 0.95)
    .to('.hero .lines span', { scaleY: 1, duration: 1.6, stagger: 0.08, ease: 'expo.inOut' }, 0.9)
    .to(splits.get(heroName), { yPercent: 0, duration: 1.5, stagger: 0.035 }, 1.05)
    .to(heroWords, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.3, stagger: 0.045 }, 1.35)
    .add(() => {
      $$('.nav .label').forEach((el, i) => {
        gsap.to(el, { opacity: 1, duration: 0.3, delay: i * 0.06 });
        setTimeout(() => scramble(el, 0.7), i * 60);
      });
    }, 1.3)
    .add(() => {
      $$('.hero__meta .label').forEach((el, i) => {
        gsap.to(el, { opacity: 1, duration: 0.3, delay: i * 0.12 });
        setTimeout(() => scramble(el, 0.9), i * 120);
      });
    }, 1.8);
}

/* =========================================================
   SCROLL ANIMATIONS
   ========================================================= */
function scrollAnimations() {
  if (reduceMotion) {
    $$('[data-count]').forEach(el => (el.textContent = formatCount(el, +el.dataset.count)));
    return;
  }

  // nav turns black while it sits over the white "Selected Works" section
  ScrollTrigger.create({
    trigger: '.works',
    start: 'top 18px',
    end: 'bottom 18px',
    onToggle: self => nav.classList.toggle('on-light', self.isActive),
  });

  // the bottom blur dissolves at the very end so the footer (and counter) stay crisp
  gsap.to('.edge-blur', {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'bottom bottom+=160', end: 'bottom bottom', scrub: true },
  });

  // hero: name drifts up faster than the page, glow rises
  gsap.to(heroName, {
    yPercent: -55,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('.hero__glow', {
    yPercent: -22,
    scale: 1.15,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // big section titles — character rise
  $$('.big[data-split="chars"]').forEach(el => {
    gsap.from(splits.get(el), {
      yPercent: 110,
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.03,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
    });
  });

  // label rows — scramble in
  $$('.labels').forEach(row => {
    const labels = $$('.label', row);
    gsap.set(labels, { opacity: 0 });
    ScrollTrigger.create({
      trigger: row,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        labels.forEach((l, i) => {
          gsap.to(l, { opacity: 1, duration: 0.2, delay: i * 0.08 });
          setTimeout(() => scramble(l, 0.8), i * 80);
        }),
    });
  });

  // works
  $$('[data-work]').forEach(work => {
    const media = $('.work__media', work);
    const img = $('img', media);
    gsap.fromTo(media, { clipPath: 'inset(14% 10% 14% 10% round 7px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 7px)',
      ease: 'none',
      scrollTrigger: { trigger: work, start: 'top 95%', end: 'top 35%', scrub: true },
    });
    gsap.fromTo(img, { scale: 1.3 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: { trigger: work, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    const info = $$('.work__top > *, .work__bottom > *, .work__meta > div', work).filter(n => !n.classList.contains('work__meta'));
    gsap.from(info, {
      opacity: 0,
      y: 24,
      filter: 'blur(6px)',
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.06,
      scrollTrigger: { trigger: work, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
  });

  // gallery parallax
  $$('.gallery__col').forEach(col => {
    const dir = +col.dataset.speed;
    gsap.fromTo(col, { y: dir > 0 ? '6vw' : '-8vw' }, {
      y: dir > 0 ? '-16vw' : '14vw',
      ease: 'none',
      scrollTrigger: { trigger: '.gallery', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // services rows
  $$('.svc__row').forEach(row => {
    gsap.from(row.children, {
      opacity: 0,
      y: 30,
      filter: 'blur(8px)',
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.05,
      scrollTrigger: { trigger: row, start: 'top 92%', toggleActions: 'play none none reverse' },
    });
  });

  // scroll-scrubbed word reveal (process, about paragraphs)
  scrubWords.forEach((words, el) => {
    gsap.fromTo(words, { opacity: 0.16 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 88%', end: 'bottom 58%', scrub: 0.6 },
    });
  });

  // process numbers
  gsap.from('.process__num', {
    opacity: 0,
    yPercent: 100,
    stagger: 0.12,
    duration: 1,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.process', start: 'top 85%', toggleActions: 'play none none reverse' },
  });

  // counters
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () =>
        gsap.to(obj, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = formatCount(el, obj.v)) }),
    });
  });

  // medium headings — word blur-in
  $$('.h-md[data-split="words"]').forEach(el => {
    gsap.from(splits.get(el), {
      opacity: 0,
      yPercent: 35,
      filter: 'blur(10px)',
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.07,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  });

  // about polaroid — slides over the sticky title while rotating
  gsap.fromTo('[data-polaroid]', { rotate: -9, y: 120 }, {
    rotate: 5,
    y: -160,
    ease: 'none',
    scrollTrigger: { trigger: '[data-polaroid]', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // projects
  $$('[data-proj]').forEach((p, i) => {
    gsap.from(p.children, {
      opacity: 0,
      y: 50,
      filter: 'blur(10px)',
      duration: 1.3,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: p, start: 'top 80%', toggleActions: 'play none none reverse' },
    });
    gsap.fromTo($('.polaroid', p), { rotate: i % 2 ? 10 : -10 }, {
      rotate: i % 2 ? 3 : -3,
      ease: 'none',
      scrollTrigger: { trigger: p, start: 'top bottom', end: 'center center', scrub: true },
    });
  });

  // contact button rises in
  gsap.from('.glass-btn', {
    yPercent: 40,
    opacity: 0,
    scale: 0.92,
    filter: 'blur(14px)',
    duration: 1.4,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.contact__cta', start: 'top 90%', toggleActions: 'play none none reverse' },
  });

  // footer
  gsap.from('.footer__name', {
    yPercent: 30,
    opacity: 0,
    duration: 1.3,
    ease: 'expo.out',
    scrollTrigger: { trigger: '.footer', start: 'top 80%', toggleActions: 'play none none reverse' },
  });

  // column lines on dark sections grow in
  $$('section:not(.hero) .lines, .footer .lines').forEach(l => {
    gsap.from($$('span', l), {
      scaleY: 0,
      duration: 1.6,
      ease: 'expo.inOut',
      stagger: 0.08,
      scrollTrigger: { trigger: l.parentElement, start: 'top 85%' },
    });
  });
}

function formatCount(el, v) {
  const d = +(el.dataset.decimals || 0);
  return v.toFixed(d) + (el.dataset.suffix || '');
}

/* ---------- hover scramble on footer links ---------- */
$$('[data-scramble-hover], .nav .label').forEach(el => el.addEventListener('mouseenter', () => scramble(el, 0.5)));

/* ---------- magnetic button ---------- */
$$('[data-magnetic]').forEach(btn => {
  if (reduceMotion) return;
  const label = $('span', btn);
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / r.width;
    const y = (e.clientY - r.top - r.height / 2) / r.height;
    gsap.to(btn, { x: x * 40, y: y * 30, rotateX: -y * 6, rotateY: x * 6, duration: 0.8, ease: 'power3.out', transformPerspective: 900 });
    gsap.to(label, { x: x * 24, y: y * 16, duration: 0.8, ease: 'power3.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to([btn, label], { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)' });
  });
});

/* =========================================================
   VISITOR COUNTER
   ========================================================= */
async function visitorCounter() {
  const wrap = $('[data-visits]');
  const out = $('[data-visits-count]');
  const params = new URLSearchParams(location.search);
  let count = null;

  if (params.has('visits-demo')) count = 12847;
  else {
    let counted = false;
    try { counted = sessionStorage.getItem('pg-visit') === '1'; } catch {}
    try {
      const res = await fetch(SITE.visitsEndpoint, { method: counted ? 'GET' : 'POST', cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.count !== 'number') return;
      count = data.count;
      try { sessionStorage.setItem('pg-visit', '1'); } catch {}
    } catch {
      return; // not deployed / offline — keep the counter hidden
    }
  }

  const digits = String(count).padStart(6, '0').split('');
  out.textContent = '';
  out.setAttribute('aria-label', String(count));
  const cols = digits.map(() => {
    const d = document.createElement('span');
    d.className = 'd';
    const strip = document.createElement('span');
    strip.innerHTML = '0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9';
    d.appendChild(strip);
    out.appendChild(d);
    return strip;
  });
  wrap.hidden = false;

  const roll = () => cols.forEach((s, i) => {
    s.style.transitionDelay = `${i * 0.08}s`;
    s.style.transform = `translateY(-${+digits[i] * 1.8}em)`;
  });
  ScrollTrigger.create({ trigger: wrap, start: 'top bottom', once: true, onEnter: roll });
  ScrollTrigger.refresh();
}

/* =========================================================
   BOOT
   ========================================================= */
const boot = () => {
  fitAll();
  tintHeroWords(heroWords);
  intro();
  scrollAnimations();
  visitorCounter();
  ScrollTrigger.refresh();
};

(document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]) : Promise.resolve()).then(boot);

let rT;
addEventListener('resize', () => {
  clearTimeout(rT);
  rT = setTimeout(() => {
    setSbw();
    fitAll();
    tintHeroWords(heroWords);
    ScrollTrigger.refresh();
  }, 150);
});
