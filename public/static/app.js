/* ============================================================
   마곡베스트치과 — DARK EDITORIAL Interactions (2026)
   헤더 · 마스크 리빌 · 카운트업 · 퍼널 스크롤드로우
   커스텀 커서 · 마그네틱 · 비포애프터 · 앵커
   ============================================================ */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- 헤더 스크롤 상태 + 모바일 메뉴 ---- */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('scrolled', window.scrollY > 16);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open');
          toggle.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ---- 키네틱 마스크 리빌 (line by line) ---- */
  function initRevealLines() {
    var lines = document.querySelectorAll('.reveal-line');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      lines.forEach(function (l) { l.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    lines.forEach(function (l) { io.observe(l); });
  }

  /* ---- 일반 reveal (fade-up) ---- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (i) { i.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (i) { io.observe(i); });
  }

  /* ---- 카운트업 ---- */
  function initCountUp() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    function run(el) {
      var raw = el.dataset.count;
      var target = parseFloat(raw);
      var dec = raw.indexOf('.') > -1 ? 1 : 0;
      var dur = 1600, start = performance.now();
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toFixed(dec);
      }
      requestAnimationFrame(step);
    }
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = n.dataset.count; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---- 퍼널 타임라인 + 스크롤 드로우 라인 ---- */
  function initFunnel() {
    var timeline = document.querySelector('.funnel-timeline');
    var steps = document.querySelectorAll('.f-step');
    if (!steps.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      steps.forEach(function (s) { s.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.5 });
    steps.forEach(function (s) { io.observe(s); });

    if (timeline) {
      var onScroll = function () {
        var r = timeline.getBoundingClientRect();
        var vh = window.innerHeight;
        var prog = (vh * 0.6 - r.top) / r.height;
        prog = Math.max(0, Math.min(1, prog));
        timeline.style.setProperty('--draw', (prog * 100) + '%');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---- 커스텀 커서 (포인터 기기) ---- */
  function initCursor() {
    if (reduceMotion || window.matchMedia('(hover: none)').matches || window.innerWidth < 900) return;
    var dot = document.createElement('div');
    var ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('cursor-active');
    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('a, button, .core-row, .chip, summary, [data-magnetic], [data-tilt]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hover'); dot.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); dot.classList.remove('hover'); });
    });
  }

  /* ---- 마그네틱 버튼 ---- */
  function initMagnetic() {
    if (reduceMotion || window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * 0.25 + 'px,' + y * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---- 비포·애프터 슬라이더 ---- */
  function initBeforeAfter() {
    document.querySelectorAll('.ba-card').forEach(function (card) {
      var handle = card.querySelector('.ba-handle');
      var after = card.querySelector('.ba-after');
      if (!handle || !after) return;
      var dragging = false;
      function move(clientX) {
        var r = card.getBoundingClientRect();
        var pct = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
        after.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
        handle.style.left = pct + '%';
      }
      handle.addEventListener('mousedown', function () { dragging = true; });
      window.addEventListener('mouseup', function () { dragging = false; });
      window.addEventListener('mousemove', function (e) { if (dragging) move(e.clientX); });
      card.addEventListener('touchmove', function (e) { move(e.touches[0].clientX); }, { passive: true });
    });
  }

  /* ---- 글자단위 스플릿 키네틱 리빌 ---- */
  function initSplitText() {
    var els = document.querySelectorAll('[data-split]');
    if (!els.length) return;
    els.forEach(function (el) {
      var text = el.textContent;
      el.setAttribute('aria-label', text);
      el.innerHTML = '';
      var frag = document.createDocumentFragment();
      text.split('').forEach(function (ch, i) {
        var s = document.createElement('span');
        s.className = 'split-ch';
        s.textContent = ch === ' ' ? '\u00A0' : ch;
        s.style.transitionDelay = (i * 0.028) + 's';
        s.setAttribute('aria-hidden', 'true');
        frag.appendChild(s);
      });
      el.appendChild(frag);
    });
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- 스포트라이트 호버 (커서 따라가는 라디얼 글로우) ---- */
  function initSpotlight() {
    if (window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('[data-spotlight]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ---- 3D 틸트 (포인터 반응) ---- */
  function initTilt() {
    if (reduceMotion || window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (px * 7) + 'deg) rotateX(' + (-py * 7) + 'deg)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
      });
    });
  }

  /* ---- 패럴랙스 (스크롤 연동) ---- */
  function initParallax() {
    if (reduceMotion) return;
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var speed = parseFloat(el.dataset.parallax) || 0.15;
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-center * speed) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---- 스크롤 진행바 ---- */
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- 스크램블 텍스트 (모노 라벨 디코드 효과) ---- */
  function initScramble() {
    var els = document.querySelectorAll('[data-scramble]');
    if (!els.length) return;
    var chars = '!<>-_\\/[]{}=+*^?#________';
    function run(el) {
      var target = el.dataset.scramble;
      var len = target.length;
      var frame = 0;
      var dur = 36;
      function tick() {
        var out = '';
        for (var i = 0; i < len; i++) {
          if (i < (frame / dur) * len) out += target[i];
          else out += chars[Math.floor(Math.random() * chars.length)];
        }
        el.textContent = out;
        frame++;
        if (frame <= dur) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      tick();
    }
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.textContent = e.dataset.scramble; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- 부드러운 앵커 스크롤 ---- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id && id.length > 1) {
          var el = document.querySelector(id);
          if (el) {
            e.preventDefault();
            var y = el.getBoundingClientRect().top + window.scrollY - 90;
            window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
          }
        }
      });
    });
  }

  function init() {
    initHeader();
    initRevealLines();
    initSplitText();
    initReveal();
    initCountUp();
    initFunnel();
    initCursor();
    initMagnetic();
    initSpotlight();
    initTilt();
    initParallax();
    initScrollProgress();
    initScramble();
    initBeforeAfter();
    initAnchors();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
