/* ============================================================
   마곡베스트치과 — 2026 INTERACTION ENGINE
   Lenis smooth scroll · GSAP ScrollTrigger · 커스텀 커서
   캔버스 파티클 히어로 · 키네틱 타이포 · 가로 스크롤
   마그네틱 버튼 · 3D 틸트 · 카운트업 · 퍼널 타임라인
   ============================================================ */
(function () {
  'use strict';

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  /* ---------------------------------------------------------
     1. Lenis 스무스 스크롤
  --------------------------------------------------------- */
  let lenis = null;
  function initLenis() {
    if (reduceMotion || typeof window.Lenis === 'undefined') return;
    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (hasST) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    }
    // 앵커 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const id = a.getAttribute('href');
        if (id && id.length > 1) {
          const el = document.querySelector(id);
          if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -90 }); }
        }
      });
    });
  }

  /* ---------------------------------------------------------
     2. 커스텀 커서
  --------------------------------------------------------- */
  function initCursor() {
    if (isTouch) return;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    loop();
    const hoverSel = 'a, button, .btn, .glass-card, .chip, .doc-card, .tilt, [data-cursor="hover"]';
    document.querySelectorAll(hoverSel).forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hover'); dot.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); dot.classList.remove('hover'); });
    });
    document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { dot.style.opacity = '1'; ring.style.opacity = '1'; });
  }

  /* ---------------------------------------------------------
     3. 캔버스 파티클 히어로 (마우스 인터랙티브)
  --------------------------------------------------------- */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, particles = [];
    let mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function build() {
      const count = Math.min(110, Math.floor((w * h) / 14000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.6,
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // 마우스 반발
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const f = (120 - dist) / 120;
          p.x += (dx / dist) * f * 2.2;
          p.y += (dy / dist) * f * 2.2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(91,180,255,0.7)';
        ctx.fill();
      }
      // 연결선
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(46,125,255,' + (0.14 * (1 - d / 130)) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', function () { mouse.x = -9999; mouse.y = -9999; });
    resize(); draw();
  }

  /* ---------------------------------------------------------
     4. 키네틱 타이포그래피 (글자 단위 split + 등장)
  --------------------------------------------------------- */
  function splitChars() {
    document.querySelectorAll('[data-split]').forEach(function (el) {
      if (el.dataset.splitDone) return;
      const text = el.textContent;
      el.textContent = '';
      el.setAttribute('aria-label', text);
      text.split('').forEach(function (ch) {
        const span = document.createElement('span');
        span.className = 'char';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = ch === ' ' ? '\u00A0' : ch;
        el.appendChild(span);
      });
      el.dataset.splitDone = '1';
    });
  }
  function animateKinetic() {
    if (!hasGSAP) {
      document.querySelectorAll('[data-split] .char').forEach(function (c) { c.style.opacity = '1'; c.style.transform = 'none'; });
      return;
    }
    document.querySelectorAll('[data-split]').forEach(function (el) {
      const chars = el.querySelectorAll('.char');
      if (reduceMotion) { window.gsap.set(chars, { opacity: 1, y: 0 }); return; }
      const tween = {
        opacity: 0, yPercent: 120, rotateX: -40,
        duration: 0.85, ease: 'power4.out', stagger: 0.022,
      };
      if (hasST && el.dataset.splitScroll) {
        window.gsap.from(chars, Object.assign({}, tween, {
          scrollTrigger: { trigger: el, start: 'top 85%' },
        }));
      } else {
        window.gsap.from(chars, Object.assign({}, tween, { delay: parseFloat(el.dataset.splitDelay || '0.2') }));
      }
    });
  }

  /* ---------------------------------------------------------
     5. reveal (스크롤 등장) — IntersectionObserver
  --------------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('in'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---------------------------------------------------------
     6. 카운트업
  --------------------------------------------------------- */
  function initCountUp() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    function run(el) {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.indexOf('.') > -1) ? 1 : 0;
      const dur = 1600; const start = performance.now();
      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------------------------------------------------------
     7. 가로 스크롤 (sticky horizontal)
  --------------------------------------------------------- */
  function initHorizontalScroll() {
    if (!hasST || reduceMotion) {
      // 폴백: 일반 세로 스택
      document.querySelectorAll('.h-scroll-pin').forEach(function (pin) {
        pin.style.height = 'auto'; pin.style.overflow = 'visible'; pin.style.display = 'block';
        const track = pin.querySelector('.h-scroll-track');
        if (track) { track.style.flexDirection = 'column'; track.style.transform = 'none'; }
      });
      return;
    }
    document.querySelectorAll('.h-scroll-wrap').forEach(function (wrap) {
      const pin = wrap.querySelector('.h-scroll-pin');
      const track = wrap.querySelector('.h-scroll-track');
      const bar = wrap.querySelector('.h-progress-bar');
      if (!pin || !track) return;
      const getScroll = function () { return track.scrollWidth - window.innerWidth + 80; };
      const tween = window.gsap.to(track, {
        x: function () { return -getScroll(); },
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: function () { return '+=' + getScroll(); },
          scrub: 1,
          pin: pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { if (bar) bar.style.width = (self.progress * 100) + '%'; },
        },
      });
    });
  }

  /* ---------------------------------------------------------
     8. 퍼널 타임라인 활성화
  --------------------------------------------------------- */
  function initFunnel() {
    const steps = document.querySelectorAll('.f-step');
    if (!steps.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      steps.forEach(function (s) { s.classList.add('in'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); } });
    }, { threshold: 0.6 });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---------------------------------------------------------
     9. 마그네틱 버튼
  --------------------------------------------------------- */
  function initMagnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.btn, [data-magnetic]').forEach(function (el) {
      const strength = 0.35;
      el.addEventListener('mousemove', function (e) {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * strength + 'px,' + y * strength + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = 'translate(0,0)'; });
    });
  }

  /* ---------------------------------------------------------
     10. 3D 틸트 카드
  --------------------------------------------------------- */
  function initTilt() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (px * 9) + 'deg) rotateX(' + (-py * 9) + 'deg) translateZ(8px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateZ(0)';
      });
    });
  }

  /* ---------------------------------------------------------
     11. 헤더 스크롤 상태 + 모바일 메뉴
  --------------------------------------------------------- */
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = function () {
        if (window.scrollY > 30) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.mobile-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        const open = nav.classList.toggle('open');
        toggle.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open'); toggle.classList.remove('active'); document.body.style.overflow = '';
        });
      });
    }
  }

  /* ---------------------------------------------------------
     12. 비포&애프터 슬라이더 (있으면)
  --------------------------------------------------------- */
  function initBeforeAfter() {
    document.querySelectorAll('.ba-card').forEach(function (card) {
      const handle = card.querySelector('.ba-handle');
      const after = card.querySelector('.ba-after');
      if (!handle || !after) return;
      let dragging = false;
      function move(clientX) {
        const r = card.getBoundingClientRect();
        let pct = ((clientX - r.left) / r.width) * 100;
        pct = Math.max(0, Math.min(100, pct));
        after.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        handle.style.left = pct + '%';
      }
      handle.addEventListener('mousedown', function () { dragging = true; });
      window.addEventListener('mouseup', function () { dragging = false; });
      window.addEventListener('mousemove', function (e) { if (dragging) move(e.clientX); });
      card.addEventListener('touchmove', function (e) { move(e.touches[0].clientX); }, { passive: true });
    });
  }

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  function init() {
    splitChars();
    initLenis();
    initCursor();
    initHeader();
    initHeroCanvas();
    initReveal();
    initCountUp();
    initFunnel();
    initMagnetic();
    initTilt();
    initBeforeAfter();
    // GSAP 의존 작업은 약간 지연 (CDN 로드 완료 보장)
    requestAnimationFrame(function () {
      animateKinetic();
      initHorizontalScroll();
      if (hasST) window.ScrollTrigger.refresh();
    });
    console.log('%c마곡베스트치과 · 2026 Engine ready', 'color:#5BB4FF;font-weight:bold');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', function () { if (hasST) window.ScrollTrigger.refresh(); });
})();
