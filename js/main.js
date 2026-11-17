/* ==========================================================
   Marrakech au coucher du soleil — interactions
   Aucun appel réseau : tout fonctionne hors ligne.
   ========================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  var sections = $$('main > section');
  var navLinks = $$('.nav__menu a');
  var nav = $('#nav');

  /* ---------- 1. Ouverture : portes de la médina ---------- */
  (function intro() {
    var el = $('#intro');
    if (!el) return;
    if (reduceMotion) { el.classList.add('is-gone'); return; }
    var opened = false;
    function open() {
      if (opened) return;
      opened = true;
      el.classList.add('is-opening');
      setTimeout(function () { el.classList.add('is-gone'); }, 1600);
    }
    el.addEventListener('click', open);
    document.addEventListener('keydown', open, { once: true });
    setTimeout(open, 1300);
  })();

  /* ---------- 2. Étoiles et braises du hero ---------- */
  (function sky() {
    var g = $('#hero-stars');
    if (g) {
      for (var i = 0; i < 110; i++) {
        var c = document.createElementNS(SVGNS, 'circle');
        var y = Math.pow(Math.random(), 1.6) * 420;
        c.setAttribute('cx', rand(0, 1600).toFixed(1));
        c.setAttribute('cy', y.toFixed(1));
        c.setAttribute('r', rand(.6, Math.random() < .1 ? 2.4 : 1.6).toFixed(2));
        c.style.setProperty('--tw', rand(2, 5.5).toFixed(2) + 's');
        c.style.setProperty('--td', (-rand(0, 5)).toFixed(2) + 's');
        c.style.setProperty('--o', (1 - y / 520).toFixed(2));
        c.style.opacity = (1 - y / 520).toFixed(2);
        g.appendChild(c);
      }
    }
    var box = $('#hero-embers');
    if (box && !reduceMotion) {
      for (var j = 0; j < 22; j++) {
        var e = document.createElement('span');
        var dur = rand(8, 15);
        e.className = 'ember';
        e.style.left = rand(30, 100).toFixed(1) + '%';
        e.style.setProperty('--size', rand(2, 5).toFixed(1) + 'px');
        e.style.setProperty('--dur', dur.toFixed(1) + 's');
        e.style.setProperty('--delay', (-rand(0, dur)).toFixed(1) + 's');
        e.style.setProperty('--drift', rand(-80, 80).toFixed(0) + 'px');
        box.appendChild(e);
      }
    }
  })();

  /* ---------- 3. Parallaxe du hero ---------- */
  var hero = $('.hero');
  var layers = $$('.hero__layer');
  var heroContent = $('.hero__content');
  var mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  function renderHero() {
    if (reduceMotion || !hero) return;
    var y = window.scrollY;
    var h = hero.offsetHeight;
    if (y > h * 1.1) return;
    curX += (mouseX - curX) * .08;
    curY += (mouseY - curY) * .08;
    layers.forEach(function (layer) {
      var d = parseFloat(layer.getAttribute('data-depth')) || 0;
      var px = curX * (0.6 - d) * -36;
      var py = y * d + curY * (0.6 - d) * -10;
      layer.style.transform = 'translate3d(' + px.toFixed(2) + 'px,' + py.toFixed(2) + 'px,0) scale(1.05)';
      layer.style.transformOrigin = '50% 100%';
    });
    if (heroContent) {
      var p = Math.min(y / (h * .75), 1);
      heroContent.style.opacity = (1 - p).toFixed(3);
      heroContent.style.transform = 'translate3d(0,' + (y * .3).toFixed(1) + 'px,0)';
    }
  }
  if (!reduceMotion && hero) {
    if (finePointer) {
      hero.addEventListener('pointermove', function (e) {
        mouseX = e.clientX / window.innerWidth - .5;
        mouseY = e.clientY / window.innerHeight - .5;
      });
    }
    (function loop() { renderHero(); requestAnimationFrame(loop); })();
  }

  /* ---------- 4. Navigation, progression, section active ---------- */
  var burger = $('#nav-burger');
  var menu = $('#nav-menu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    nav.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      nav.classList.toggle('menu-open', open);
    });
    navLinks.forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  function currentIndex() {
    var mark = window.innerHeight * .35;
    var idx = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= mark) idx = i;
    }
    return idx;
  }

  var progressBar = $('#progress-bar');
  var ticking = false;
  var lastIdx = -1;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(4) + ')';
    if (!sections.length) return;
    var idx = currentIndex();
    if (idx !== lastIdx) {
      lastIdx = idx;
      var id = sections[idx].id;
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
      updateHud(idx);
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* ---------- 5. Apparitions au défilement ---------- */
  var revealCallbacks = new Map();
  function onReveal(el, fn) { revealCallbacks.set(el, fn); }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      var fn = revealCallbacks.get(en.target);
      if (fn) { fn(en.target); revealCallbacks.delete(en.target); }
      io.unobserve(en.target);
    });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' }) : null;

  function observe(el) {
    if (io) io.observe(el);
    else { el.classList.add('is-visible'); var fn = revealCallbacks.get(el); if (fn) fn(el); }
  }

  /* ---------- 6. Compteurs ---------- */
  $$('[data-count]').forEach(function (el) {
    var fact = el.closest('[data-reveal]');
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion || !fact) return;
    var from = target > 100 ? target - 40 : 0;
    el.textContent = from;
    onReveal(fact, function () {
      var t0 = null;
      var dur = 1600;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (target - from) * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      setTimeout(function () { requestAnimationFrame(step); }, 250);
    });
  });

  /* ---------- 7. Emplacements photo (images/) ---------- */
  $$('[data-photo]').forEach(function (slot) {
    var img = $('img', slot);
    var art = $('.photo__art', slot);
    if (!img) return;
    function ok() { slot.classList.add('has-photo'); }
    function fail() {
      if (art && img.alt) { art.setAttribute('role', 'img'); art.setAttribute('aria-label', 'Illustration : ' + img.alt); art.removeAttribute('aria-hidden'); }
      img.remove();
    }
    if (img.complete) { if (img.naturalWidth > 0) ok(); else fail(); }
    else { img.addEventListener('load', ok); img.addEventListener('error', fail); }
  });

  /* ---------- 8. Cartes de Marrakech ---------- */
  $$('.place').forEach(function (card) {
    var openBtn = $('.place__open', card);
    var closeBtn = $('.place__close', card);
    var panel = $('.place__panel', card);
    function setOpen(open, fromKeyboard) {
      card.classList.toggle('is-open', open);
      openBtn.setAttribute('aria-expanded', String(open));
      if (open) { panel.removeAttribute('inert'); card.style.transform = ''; }
      else panel.setAttribute('inert', '');
      if (fromKeyboard) (open ? closeBtn : openBtn).focus({ preventScroll: true });
    }
    card.addEventListener('click', function (e) {
      if (panel.contains(e.target)) return;
      setOpen(true, e.detail === 0);
    });
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(false, e.detail === 0); });
    card.addEventListener('keydown', function (e) { if (e.key === 'Escape' && card.classList.contains('is-open')) { e.stopPropagation(); setOpen(false, true); } });

    if (finePointer && !reduceMotion) {
      card.addEventListener('pointermove', function (e) {
        if (card.classList.contains('is-open') || !card.classList.contains('is-visible')) return;
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5;
        var y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = 'rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg) translateZ(0)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    }
  });

  /* ---------- 9. Cartes retournables (cuisine) ---------- */
  $$('.flip').forEach(function (card) {
    var front = $('.flip__face--front', card);
    var back = $('.flip__face--back', card);
    card.addEventListener('click', function (e) {
      var flipped = !card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', flipped);
      (flipped ? front : back).setAttribute('inert', '');
      (flipped ? back : front).removeAttribute('inert');
      if (e.detail === 0) {
        var btn = $('.flip__btn', flipped ? back : front);
        if (btn) setTimeout(function () { btn.focus({ preventScroll: true }); }, 50);
      }
    });
  });

  /* ---------- 10. « Bonjour » en trois langues ---------- */
  (function hello() {
    var el = $('#hello-rotator');
    if (!el || reduceMotion) return;
    var words = ['bonjour', 'salam', 'azul'];
    var i = 0;
    setInterval(function () {
      el.classList.add('is-out');
      setTimeout(function () {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove('is-out');
      }, 350);
    }, 2400);
  })();

  /* ---------- 11. Confettis (football) ---------- */
  var confetti = (function () {
    var canvas = $('#confetti');
    if (!canvas || !canvas.getContext) return function () {};
    var ctx = canvas.getContext('2d');
    var parts = [];
    var running = false;
    var colors = ['#c1272d', '#006233', '#ffd27a', '#ffffff', '#f2a516'];
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', size);
    size();
    function tick() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      parts = parts.filter(function (p) { return p.y < window.innerHeight + 40 && p.life > 0; });
      parts.forEach(function (p) {
        p.vy += .22; p.vx *= .99; p.vy *= .99;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
        ctx.restore();
      });
      if (parts.length) requestAnimationFrame(tick);
      else { running = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    }
    return function burst() {
      if (reduceMotion) return;
      var W = window.innerWidth, H = window.innerHeight;
      [[W * .15, H], [W * .5, H], [W * .85, H]].forEach(function (o, k) {
        for (var i = 0; i < 70; i++) {
          var a = -Math.PI / 2 + rand(-.55, .55) + (k - 1) * .25;
          var v = rand(11, 21);
          parts.push({ x: o[0], y: o[1], vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: rand(6, 12), h: rand(8, 16), rot: rand(0, 6), vr: rand(-.25, .25), c: colors[(Math.random() * colors.length) | 0], round: Math.random() < .25, life: 260 });
        }
      });
      if (!running) { running = true; requestAnimationFrame(tick); }
    };
  })();
  window.MarocFX = { confetti: confetti };
  var celebrate = $('#celebrate');
  if (celebrate) celebrate.addEventListener('click', confetti);
  var footHero = $('.foot__hero');
  if (footHero) onReveal(footHero, function () { setTimeout(confetti, 600); });

  /* ---------- 12. Carte du voyage ---------- */
  (function map() {
    var dots = $('#map-dots');
    if (!dots) return;
    var X = function (lon) { return (lon + 170) * 4.35; };
    var Y = function (lat) { return (78 - lat) * 6.2; };
    // Contours très simplifiés [longitude, latitude]
    var lands = [
      // Amérique du Nord
      [[-165,63],[-166,68],[-156,71.5],[-141,69.5],[-128,70],[-115,69],[-100,68],[-95,72],[-85,70],[-80,73],[-70,70],[-62,66],[-62,58],[-56,52],[-60,47],[-66,45],[-70,43],[-71,41],[-74,40],[-76,35],[-81,31],[-80,26],[-82,25],[-82,27],[-84,30],[-89,30],[-94,29],[-97,26],[-97,21],[-94,18.3],[-91,18.5],[-90,21],[-87,21.5],[-88,16],[-84,15.8],[-83,15],[-83,10],[-80,9],[-77,8],[-80,7.5],[-86,11],[-88,13.5],[-92,14.5],[-100,16.5],[-105,20],[-106,23],[-110,24],[-112,29],[-115,31],[-117,32.5],[-120,34.5],[-122,37],[-124,40],[-124,46],[-124,49],[-128,51],[-132,55],[-137,58.5],[-142,60],[-148,60.5],[-152,59],[-158,57],[-162,55],[-165,60]],
      // Baie d’Hudson (trou)
      [[-95,58],[-90,57],[-82,55],[-79,52],[-79,57],[-77,62],[-85,64],[-90,64],[-94,61]],
      // Groenland
      [[-73,78],[-20,78],[-20,70],[-25,68],[-35,65],[-43,60],[-48,61],[-52,65],[-54,70],[-58,74]],
      // Islande
      [[-24,64],[-22,66.4],[-15,66.5],[-13.5,65],[-18,63.4]],
      // Cuba
      [[-85,22],[-80,23],[-74,20],[-78,20]],
      // Amérique du Sud (nord)
      [[-77,8],[-76,9],[-72,12],[-68,10.5],[-62,10.7],[-60,8]],
      // Europe
      [[-9,43],[-9,39],[-9,37],[-6,36],[-2,36.7],[0,38.5],[0.5,40.5],[3,42],[4,43.5],[7,43.5],[9,44.3],[12,44],[15,40],[16,38],[18,40],[14,42],[13,45.5],[15,45],[19,42],[20,40],[23,37],[26,40],[29,41],[28,43],[30,45.5],[33,46],[34,44.5],[36,45.3],[39,47],[42,45],[48,46],[55,45],[60,45],[60,70],[50,68],[44,68],[40,66],[34,69],[30,70],[25,71],[18,70],[13,67],[10,63],[5,61],[5,58],[8,58],[11,59],[12,56],[10,54],[9,57],[8,55],[8,54],[5,53],[3,51],[-1.5,49.5],[-4.5,48.5],[-2,47],[-1.5,46],[-1.5,44],[-2,43.4],[-8,43.7]],
      // Mer Baltique (trou)
      [[12,55],[18,55],[22,57],[24,59],[28,60],[22,61],[20,63],[23,65.5],[18,63],[17,60],[16,57],[14,56]],
      // Grande-Bretagne et Irlande
      [[-5.5,50],[1.5,51],[1.7,52.8],[0,53.5],[-1.5,55],[-2,57.5],[-4,58.6],[-5.5,58],[-5.6,56],[-4.8,54.8],[-3,54],[-4.5,53.2],[-5,51.7]],
      [[-10,51.6],[-6,52],[-6,54],[-7.5,55.3],[-10,54.2]],
      // Turquie et Moyen-Orient
      [[26,41],[28,36.5],[36,36.3],[36,37],[42,37],[48,38.5],[50,37],[54,37],[60,37],[60,45],[55,45],[48,46],[42,45],[41,41.5],[36,42],[29,41.2]],
      [[34,31],[36,36],[42,37],[48,30],[51,25],[56,26],[57,23],[59,22],[55,17],[52,16],[45,12.8],[43,13],[39,21],[35,28]],
      // Afrique (nord)
      [[-17,15],[-17,21],[-16,24],[-13,27.5],[-10,29.5],[-9.8,31.5],[-8.5,33.3],[-6,35.8],[-2,35.2],[3,36.8],[10,37.3],[11,35],[10,33.5],[15,32.3],[20,30.5],[20,32.5],[25,32],[30,31.3],[32,31.2],[34,29.5],[35,24],[37,21],[38.5,18],[43,12.5],[51,11.8],[48,8],[-13,8],[-13.5,9.5],[-15,11],[-16.5,12]]
    ];
    var morocco = [[-6,35.9],[-2,35.1],[-1.7,34.7],[-1.7,32.5],[-3.5,31.6],[-5,29.8],[-8.7,28.8],[-11.5,28.2],[-9.8,29.6],[-9.8,31.4],[-8.5,33.3],[-6.8,34.1]];
    function inside(px, py, poly) {
      var c = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = X(poly[i][0]), yi = Y(poly[i][1]), xj = X(poly[j][0]), yj = Y(poly[j][1]);
        if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c;
      }
      return c;
    }
    var frag = document.createDocumentFragment();
    var step = 11;
    for (var y = step / 2; y < 440; y += step) {
      for (var x = step / 2; x < 1000; x += step) {
        var n = 0;
        for (var k = 0; k < lands.length; k++) if (inside(x, y, lands[k])) n++;
        if (n % 2 === 1) {
          var c = document.createElementNS(SVGNS, 'circle');
          c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 2.6);
          if (inside(x, y, morocco)) c.setAttribute('class', 'is-ma');
          frag.appendChild(c);
        }
      }
    }
    dots.appendChild(frag);

    var r1 = $('#route-1'), r2 = $('#route-2'), plane = $('#plane');
    var steps = $$('.step');
    var L1 = r1.getTotalLength(), L2 = r2.getTotalLength();
    r1.style.setProperty('--len', L1); r2.style.setProperty('--len', L2);
    function setStep(n) { steps.forEach(function (s) { s.classList.toggle('is-active', +s.getAttribute('data-step') === n); }); }
    function place(path, len, p) {
      var a = path.getPointAtLength(len * p);
      var b = path.getPointAtLength(Math.min(len * p + 1, len));
      if (p >= 1) b = { x: a.x + (a.x - path.getPointAtLength(len - 1).x), y: a.y + (a.y - path.getPointAtLength(len - 1).y) };
      var ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      plane.setAttribute('transform', 'translate(' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
    }
    var anim = 0;
    function fly() {
      if (reduceMotion) {
        r1.style.strokeDashoffset = 0; r2.style.strokeDashoffset = 0; setStep(3); return;
      }
      var id = ++anim;
      var T1 = 3400, PAUSE = 900, T2 = 1700;
      var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
      r1.style.strokeDashoffset = L1; r2.style.strokeDashoffset = L2;
      plane.classList.add('is-flying');
      setStep(1);
      var t0 = null;
      function frame(t) {
        if (id !== anim) return;
        if (!t0) t0 = t;
        var e = t - t0;
        if (e < T1) {
          var p = ease(e / T1);
          r1.style.strokeDashoffset = L1 * (1 - p);
          place(r1, L1, p);
          if (p > .85) setStep(2);
        } else if (e < T1 + PAUSE) {
          r1.style.strokeDashoffset = 0;
          place(r1, L1, 1);
          setStep(2);
        } else if (e < T1 + PAUSE + T2) {
          var q = ease((e - T1 - PAUSE) / T2);
          r2.style.strokeDashoffset = L2 * (1 - q);
          place(r2, L2, q);
          if (q > .8) setStep(3);
        } else {
          r2.style.strokeDashoffset = 0;
          place(r2, L2, 1);
          setStep(3);
          return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    onReveal($('.trip__map'), function () { setTimeout(fly, 400); });
    var replay = $('#replay-flight');
    if (replay) replay.addEventListener('click', fly);
  })();

  /* Enregistrer les apparitions (après les rappels) */
  $$('[data-reveal]').forEach(observe);

  /* ---------- 13. Mode présentation ---------- */
  var root = document.documentElement;
  var presenting = false;
  var weFullscreened = false;
  var hud = $('#pres-hud'), hudCount = $('#pres-count'), hudTitle = $('#pres-title');
  var dotsBox = $('#pres-dots');
  var cursorTimer = 0;

  var canPresent = !!dotsBox && sections.length > 1;
  if (canPresent) sections.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.tabIndex = -1;
    b.setAttribute('aria-label', s.getAttribute('data-slide') || ('Section ' + (i + 1)));
    b.addEventListener('click', function () { goTo(i); });
    dotsBox.appendChild(b);
  });
  var dotBtns = canPresent ? $$('button', dotsBox) : [];

  function updateHud(idx) {
    if (!hud) return;
    hudCount.textContent = (idx + 1) + ' / ' + sections.length;
    hudTitle.textContent = sections[idx].getAttribute('data-slide') || '';
    dotBtns.forEach(function (b, i) { b.classList.toggle('is-active', i === idx); });
  }

  function scrollToY(y) {
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function offset() { return presenting ? 0 : nav.offsetHeight; }
  function goTo(i) {
    i = Math.max(0, Math.min(sections.length - 1, i));
    var top = sections[i].getBoundingClientRect().top + window.scrollY - (i === 0 ? 0 : offset());
    scrollToY(top);
  }
  function next() {
    var i = currentIndex();
    var r = sections[i].getBoundingClientRect();
    var vh = window.innerHeight;
    if (r.bottom > vh + 12) {
      scrollToY(window.scrollY + Math.min(vh * .85, r.bottom - vh));
    } else goTo(i + 1);
  }
  function prev() {
    var i = currentIndex();
    var r = sections[i].getBoundingClientRect();
    var vh = window.innerHeight;
    var top = r.top - offset();
    if (top < -12) scrollToY(window.scrollY + Math.max(-vh * .85, top));
    else goTo(i - 1);
  }

  function showCursorBriefly() {
    root.classList.remove('hide-cursor');
    clearTimeout(cursorTimer);
    if (presenting) cursorTimer = setTimeout(function () { root.classList.add('hide-cursor'); }, 2500);
  }

  function enterPresentation() {
    if (presenting || !canPresent) return;
    presenting = true;
    root.classList.add('is-presenting');
    closeMenu();
    updateHud(currentIndex());
    showCursorBriefly();
    var el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen().then(function () { weFullscreened = true; }).catch(function () {});
    }
    goTo(currentIndex());
  }
  function exitPresentation() {
    if (!presenting) return;
    presenting = false;
    root.classList.remove('is-presenting', 'hide-cursor');
    clearTimeout(cursorTimer);
    if (weFullscreened && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    weFullscreened = false;
  }
  document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && weFullscreened) { weFullscreened = false; exitPresentation(); }
  });
  $$('[data-present]').forEach(function (b) {
    b.addEventListener('click', function () { presenting ? exitPresentation() : enterPresentation(); });
  });
  document.addEventListener('mousemove', function () { if (presenting) showCursorBriefly(); });

  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var k = e.key;
    if (k === 'p' || k === 'P') { e.preventDefault(); presenting ? exitPresentation() : enterPresentation(); return; }
    if (k === 'Escape') {
      var openCard = $('.place.is-open');
      if (openCard) { $('.place__close', openCard).click(); return; }
      if (presenting) { e.preventDefault(); exitPresentation(); }
      closeMenu();
      return;
    }
    if (!canPresent) return;
    var fwd = k === 'ArrowRight' || (presenting && (k === 'PageDown' || (k === ' ' && !e.shiftKey)));
    var back = k === 'ArrowLeft' || (presenting && (k === 'PageUp' || (k === ' ' && e.shiftKey)));
    if (fwd) { e.preventDefault(); next(); }
    else if (back) { e.preventDefault(); prev(); }
    else if (presenting && k === 'Home') { e.preventDefault(); goTo(0); }
    else if (presenting && k === 'End') { e.preventDefault(); goTo(sections.length - 1); }
  });

  onScroll();
})();
