/* ============================================================
   마곡베스트치과 — PORCELAIN & OAK Interactions (2026)
   헤더 · 리빌 · 카운트업 · 퍼널 점등 · 비포애프터 슬라이더
   플로팅 CTA · 맨위로 · 앵커
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
        toggle.classList.toggle('open', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open');
          toggle.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  /* ---- reveal (fade-up) ---- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal, .reveal-line');
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

  /* ---- 퍼널 스텝 점등 ---- */
  function initFunnel() {
    var steps = document.querySelectorAll('.f-step');
    if (!steps.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      steps.forEach(function (s) { s.classList.add('lit'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          setTimeout(function () { e.target.classList.add('lit'); },
            Array.prototype.indexOf.call(steps, e.target) * 120);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* ---- 비포·애프터 슬라이더 (.ba-slider) ---- */
  function initBaSlider() {
    document.querySelectorAll('.ba-slider').forEach(function (slider) {
      var handle = slider.querySelector('.handle');
      var afterWrap = slider.querySelector('.after-wrap');
      if (!handle || !afterWrap) return;
      var dragging = false;
      function move(clientX) {
        var r = slider.getBoundingClientRect();
        var pct = Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100));
        afterWrap.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
        handle.style.left = pct + '%';
      }
      move; // init default at 50 via CSS/inline
      handle.addEventListener('mousedown', function (e) { dragging = true; e.preventDefault(); });
      window.addEventListener('mouseup', function () { dragging = false; });
      window.addEventListener('mousemove', function (e) { if (dragging) move(e.clientX); });
      slider.addEventListener('touchstart', function (e) { move(e.touches[0].clientX); }, { passive: true });
      slider.addEventListener('touchmove', function (e) { move(e.touches[0].clientX); }, { passive: true });
      slider.addEventListener('click', function (e) { move(e.clientX); });
    });
  }

  /* ---- 스크롤 진행바 + 맨위로 버튼 ---- */
  function initScrollUx() {
    var bar = document.querySelector('.scroll-progress');
    var topBtn = document.getElementById('btn-top');
    var onScroll = function () {
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      }
      if (topBtn) topBtn.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (topBtn) {
      topBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ---- 스크램블 텍스트 ---- */
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
      if (a.id === 'btn-top') return;
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
    initReveal();
    initCountUp();
    initFunnel();
    initBaSlider();
    initScrollUx();
    initScramble();
    initAnchors();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
