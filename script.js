(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Tema claro / oscuro ─────────────────────────────────── */
  var themeToggle = document.getElementById('themeToggle');
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('pra-theme', t); } catch (e) {}
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', t === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      themeToggle.innerHTML = t === 'dark' ? '<i class="fas fa-music" aria-hidden="true"></i>'
                                           : '<i class="fas fa-moon" aria-hidden="true"></i>';
    }
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'dark';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  /* ── Navbar: sombra al scrollear ─────────────────────────── */
  var navbar = document.getElementById('navbar');
  function onScroll() {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Navbar mobile ───────────────────────────────────────── */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ── Scroll suave forzado en la MISMA pestaña ──────────────
     Intercepta todos los links internos (#seccion), cancela el
     comportamiento por defecto y desliza suavemente. Así el menú
     nunca abre otra pestaña. ─────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id.length <= 1) return; // ignora href="#"
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      // Actualiza la URL con el # sin saltar bruscamente
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* ── Ecualizador decorativo del hero ─────────────────────── */
  var heroEq = document.getElementById('heroEq');
  if (heroEq) {
    var bars = 36;
    for (var i = 0; i < bars; i++) {
      var b = document.createElement('span');
      b.style.animationDelay = (-Math.random() * 1.2).toFixed(2) + 's';
      b.style.animationDuration = (0.7 + Math.random() * 0.9).toFixed(2) + 's';
      b.style.height = (15 + Math.random() * 85).toFixed(0) + '%';
      heroEq.appendChild(b);
    }
  }

  /* ── Partículas del hero (canvas) ────────────────────────── */
  var canvas = document.getElementById('heroParticles');
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H, raf;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    function spawn() {
      particles = [];
      var n = Math.min(70, Math.floor(W / 22));
      for (var i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.4,
          vy: -(Math.random() * 0.35 + 0.08),
          vx: (Math.random() - 0.5) * 0.2,
          a: Math.random() * 0.5 + 0.12,
          warm: Math.random() > 0.45
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
        if (p.x < -6) p.x = W + 6;
        if (p.x > W + 6) p.x = -6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.warm ? 'rgba(217,123,79,' + p.a + ')' : 'rgba(232,220,200,' + p.a * 0.6 + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    resize(); spawn(); tick();
    window.addEventListener('resize', function () { resize(); spawn(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else tick();
    });
  }

  /* ── Mockup DAW: formas de onda ──────────────────────────── */
  document.querySelectorAll('.waveform').forEach(function (wf) {
    var seed = parseInt(wf.dataset.track || '1', 10);
    var n = 64;
    for (var i = 0; i < n; i++) {
      var bar = document.createElement('i');
      var t = i / n;
      var env = Math.sin(t * Math.PI) * 0.75 + 0.25;
      var h = env * (0.35 + 0.6 * Math.abs(Math.sin(i * 0.9 + seed * 1.7) * Math.cos(i * 0.37 + seed)));
      bar.style.height = Math.max(6, Math.round(h * 100)) + '%';
      bar.style.setProperty('--i', i);
      wf.appendChild(bar);
    }
  });

  /* ── Mockup DAW: piano roll ──────────────────────────────── */
  var pianoRoll = document.getElementById('pianoRoll');
  if (pianoRoll) {
    // Patrón musical sencillo (notas: fila, compás, duración en fracción de ancho)
    var pattern = [
      [10, 0, 1], [12, 1, 1], [14, 2, 1.5], [12, 3.5, .5],
      [10, 4, 1], [7, 5, 1], [9, 6, 2],
      [10, 8, 1], [12, 9, 1], [14, 10, 1], [17, 11, 1],
      [15, 12, 1.5], [14, 13.5, .5], [12, 14, 2],
      [5, 4, 1], [3, 8, 1], [7, 12, 1], [2, 14, 2]
    ];
    var rows = 18;
    pattern.forEach(function (note, idx) {
      var el = document.createElement('div');
      el.className = 'piano-note';
      el.style.top = ((note[0] / rows) * 100) + '%';
      el.style.left = ((note[1] / 16) * 100) + '%';
      el.style.width = ((note[2] / 16) * 100 - 0.5) + '%';
      el.style.height = (100 / rows - 2) + '%';
      el.style.setProperty('--d', (idx * 0.23 % 2.4).toFixed(2));
      pianoRoll.appendChild(el);
    });
  }

  /* ── Mockup DAW: tabs de vistas ──────────────────────────── */
  var dawTabs = document.querySelectorAll('.daw-tab');
  dawTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var view = tab.dataset.view;
      dawTabs.forEach(function (t) {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      document.querySelectorAll('[data-view-panel]').forEach(function (panel) {
        panel.classList.toggle('active', panel.dataset.viewPanel === view);
      });
    });
  });

  /* ── Mockup DAW: transporte (play + reloj + VU) ──────────── */
  var playBtn = document.getElementById('playBtn');
  var dawMockup = document.getElementById('dawMockup');
  var transportTime = document.getElementById('transportTime');
  var vuBars = document.querySelectorAll('.vu-bar');
  var playing = false;
  var seconds = 154; // 00:02:34
  var clockTimer = null, vuTimer = null;

  function fmtTime(s) {
    var m = Math.floor(s / 60), sec = s % 60;
    return '00:' + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }
  function vuTick() {
    vuBars.forEach(function (bar, i) {
      var base = 25 + Math.sin(Date.now() / 260 + i * 1.9) * 12;
      var jitter = Math.random() * 38;
      bar.style.height = Math.min(96, Math.max(8, base + jitter)) + '%';
    });
  }
  function setPlaying(state) {
    playing = state;
    if (dawMockup) dawMockup.classList.toggle('playing', state);
    if (playBtn) {
      playBtn.innerHTML = state ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
      playBtn.setAttribute('aria-pressed', String(state));
      playBtn.setAttribute('aria-label', state ? 'Pausar' : 'Reproducir');
    }
    clearInterval(clockTimer);
    clearInterval(vuTimer);
    if (state) {
      clockTimer = setInterval(function () {
        seconds = (seconds + 1) % 3600;
        if (transportTime) transportTime.textContent = fmtTime(seconds);
      }, 1000);
      vuTimer = setInterval(vuTick, 160);
    } else {
      vuBars.forEach(function (bar) { bar.style.height = '30%'; });
    }
  }
  if (playBtn) {
    playBtn.addEventListener('click', function () { setPlaying(!playing); });
  }
  if (transportTime) transportTime.textContent = fmtTime(seconds);

  /* ── Video placeholder del tutorial ──────────────────────── */
  var videoPlaceholder = document.getElementById('videoPlaceholder');
  if (videoPlaceholder) {
    var startVideo = function () { videoPlaceholder.classList.add('playing'); };
    videoPlaceholder.addEventListener('click', function (e) {
      if (!videoPlaceholder.classList.contains('playing')) startVideo();
    });
    videoPlaceholder.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && !videoPlaceholder.classList.contains('playing')) {
        e.preventDefault();
        startVideo();
      }
    });
  }

  /* ── Capítulos: resaltado al hacer click ─────────────────── */
  document.querySelectorAll('.chapter-item').forEach(function (item) {
    item.addEventListener('click', function () {
      document.querySelectorAll('.chapter-item').forEach(function (c) {
        c.style.background = '';
      });
      item.style.background = 'var(--accent-soft)';
      if (videoPlaceholder) {
        videoPlaceholder.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'center' });
      }
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });

  /* ── Showcase de capturas (tabs) ─────────────────────────── */
  var shots = [
    { src: 'IMAGENES/arrange.png', alt: 'Vista Arrange con pistas de guitarra, batería y voces', title: 'Arrange',            desc: 'La vista principal: organizá tus pistas de audio y MIDI en la línea de tiempo.' },
    { src: 'IMAGENES/mixer.png',   alt: 'Consola de mezcla con EQ, compresor, delay y reverb',    title: 'Mixer',               desc: 'EQ, compresión, delay y reverb por canal, con fader y medidores en tiempo real.' },
    { src: 'IMAGENES/splash.png',  alt: 'Pantalla de inicio de Penny Royal Audio',                title: 'Pantalla de inicio',  desc: 'La pantalla de carga que ves cada vez que abrís el programa.' },
    { src: 'IMAGENES/themes.png',  alt: 'Cuatro temas visuales del programa: In Utero, Cappuccino Frappe, Studio Grey y OLED Black', title: 'Temas', desc: 'Elegí el tema que más te guste: In Utero, Cappuccino Frappe, Studio Grey u OLED Black.' }
  ];
  var shotTabs = document.querySelectorAll('.showcase-tab');
  var stage = document.getElementById('showcaseStage');
  var stageImg = document.getElementById('showcaseImg');
  var shotTitle = document.getElementById('showcaseTitle');
  var shotDesc = document.getElementById('showcaseDesc');
  var shotIndex = 0;

  function setShot(i, instant) {
    if (!stageImg || shots.length === 0) return;
    shotIndex = (i + shots.length) % shots.length;
    var s = shots[shotIndex];
    shotTabs.forEach(function (t) {
      var active = parseInt(t.dataset.shot, 10) === shotIndex;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    if (instant || prefersReduced) {
      stageImg.src = s.src; stageImg.alt = s.alt;
      if (shotTitle) shotTitle.textContent = s.title;
      if (shotDesc) shotDesc.textContent = s.desc;
      if (stage) stage.setAttribute('aria-label', 'Ampliar captura de ' + s.title);
    } else {
      // Fundido suave al cambiar de imagen
      stageImg.classList.add('switching');
      setTimeout(function () {
        stageImg.src = s.src; stageImg.alt = s.alt;
        if (shotTitle) shotTitle.textContent = s.title;
        if (shotDesc) shotDesc.textContent = s.desc;
        if (stage) stage.setAttribute('aria-label', 'Ampliar captura de ' + s.title);
        stageImg.classList.remove('switching');
      }, 220);
    }
  }
  shotTabs.forEach(function (tab) {
    tab.addEventListener('click', function () { setShot(parseInt(tab.dataset.shot, 10)); });
  });
  setShot(0, true);

  /* ── Lightbox ────────────────────────────────────────────── */
  var lightbox = document.getElementById('lightbox');
  var lbContent = document.getElementById('lightboxContent');
  var lbCaption = document.getElementById('lightboxCaption');
  var lbClose = document.getElementById('lightboxClose');
  var lbPrev = document.getElementById('lightboxPrev');
  var lbNext = document.getElementById('lightboxNext');

  function renderLightbox() {
    var s = shots[shotIndex];
    if (!lbContent || !s) return;
    lbContent.innerHTML = '';
    var big = document.createElement('img');
    big.src = s.src;
    big.alt = s.alt;
    lbContent.appendChild(big);
    if (lbCaption) lbCaption.textContent = s.title + ' — ' + s.desc;
  }
  function openLightbox() {
    if (!lightbox) return;
    renderLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (stage) {
    stage.addEventListener('click', openLightbox);
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(); }
    });
  }
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { setShot(shotIndex - 1); renderLightbox(); });
  if (lbNext) lbNext.addEventListener('click', function () { setShot(shotIndex + 1); renderLightbox(); });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') { setShot(shotIndex - 1); renderLightbox(); }
      if (e.key === 'ArrowRight') { setShot(shotIndex + 1); renderLightbox(); }
    });
  }

  /* ── FAQ acordeón ────────────────────────────────────────── */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // Cerrar los demás
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').style.maxHeight = '0';
        }
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : '0';
    });
  });

  /* ── Animación de entrada (reveal) ───────────────────────── */
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll(
      '.section-header, .why-card, .feature-card, .step-card, .download-card, ' +
      '.github-banner, .roadmap-item, .pedal-banner, .faq-item, .community-inner, ' +
      '.hero-visual, .showcase'
    );
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ── Año dinámico en el footer ───────────────────────────── */
  document.querySelectorAll('.footer-bottom p').forEach(function () {});

})();