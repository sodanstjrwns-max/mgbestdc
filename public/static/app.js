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
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
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




  /* ---- 스크롤 진행바 + 맨위로 버튼 ---- */
  function initScrollUx() {
    var bar = document.querySelector('.scroll-progress');
    // CSS scroll() 타임라인 지원 시 네이티브 애니메이션 사용 → JS 폭 갱신 스킵
    if (bar && CSS.supports && CSS.supports('animation-timeline: scroll()')) bar = null;
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


  /* ---- 진료 색인: 커서 팔로우 이미지 프리뷰 (lerp) ---- */
  function initTxPreview() {
    var index = document.querySelector('[data-tx-index]');
    if (!index || reduceMotion) return;
    if (window.matchMedia('(hover: none)').matches) return;

    var rows = index.querySelectorAll('.tx-row[data-preview]');
    if (!rows.length) return;

    var box = document.createElement('div');
    box.className = 'tx-preview';
    var imgs = {};
    rows.forEach(function (r) {
      var src = r.dataset.preview;
      if (!imgs[src]) {
        var im = document.createElement('img');
        im.src = src; im.alt = '';
        box.appendChild(im);
        imgs[src] = im;
      }
    });
    document.body.appendChild(box);

    var mx = 0, my = 0, cx = 0, cy = 0, raf = null, visible = false;
    function loop() {
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      box.style.transform = '';
      box.style.left = (cx + 28) + 'px';
      box.style.top = (cy - 90) + 'px';
      raf = requestAnimationFrame(loop);
    }
    index.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    rows.forEach(function (r) {
      r.addEventListener('mouseenter', function () {
        Object.keys(imgs).forEach(function (k) { imgs[k].classList.toggle('on', k === r.dataset.preview); });
        if (!visible) {
          visible = true;
          cx = mx; cy = my;
          box.classList.add('show');
          if (!raf) raf = requestAnimationFrame(loop);
        }
      });
    });
    index.addEventListener('mouseleave', function () {
      visible = false;
      box.classList.remove('show');
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }

  /* ---- 히어로 패럴랙스 (스크롤 연동) ---- */
  function initParallax() {
    var bg = document.querySelector('.hero-bg img');
    var hero = document.querySelector('.hero');
    if (!bg || !hero || reduceMotion) return;
    var ticking = false;
    function update() {
      var y = window.scrollY;
      var h = hero.offsetHeight;
      if (y < h) {
        bg.style.setProperty('--py', (y * 0.28) + 'px');
        bg.classList.add('parallax');
      }
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* ---- 마그네틱 버튼 (주요 CTA만, 미세하게) ---- */
  function initMagnetic() {
    if (reduceMotion || window.matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.btn-primary, .btn-white').forEach(function (btn) {
      var strength = 10;
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * strength;
        var y = ((e.clientY - r.top) / r.height - 0.5) * strength;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        btn.style.transform = '';
        setTimeout(function () { btn.style.transition = ''; }, 400);
      });
    });
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
    initScrollUx();
    initAnchors();
    initTxPreview();
    initParallax();
    initMagnetic();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
