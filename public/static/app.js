// ============================================================
// 마곡베스트치과의원 — 클라이언트 인터랙션
// GPU 가속(transform/opacity) 위주, prefers-reduced-motion 존중
// ============================================================
(function () {
  'use strict';

  // ---- 헤더 스크롤 상태 ----
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- 모바일 메뉴 ----
  const toggle = document.querySelector('.menu-toggle');
  const mnav = document.querySelector('.mobile-nav');
  if (toggle && mnav) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      mnav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mnav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mnav.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
  }

  // ---- 스크롤 reveal (Intersection Observer) ----
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  // ---- 숫자 카운트업 ----
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const dur = 1500;
      const start = performance.now();
      const isFloat = !Number.isInteger(target);
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
      };
      requestAnimationFrame(step);
    };
    if (!reduce && 'IntersectionObserver' in window) {
      const cio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              animate(e.target);
              cio.unobserve(e.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((el) => cio.observe(el));
    } else {
      counters.forEach((el) => {
        const t = parseFloat(el.dataset.count);
        el.textContent = Number.isInteger(t) ? t.toLocaleString() : t.toFixed(1);
      });
    }
  }

  // ---- 히어로 패럴랙스 (가벼운 transform) ----
  const orbs = document.querySelectorAll('.hero-orb');
  if (orbs.length && !reduce) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const y = window.scrollY;
            orbs.forEach((o, i) => {
              o.style.transform = `translateY(${y * (0.12 + i * 0.06)}px)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // ---- 비포/애프터 슬라이더 비교 ----
  document.querySelectorAll('[data-ba-slider]').forEach((slider) => {
    const handle = slider.querySelector('.ba-handle');
    const after = slider.querySelector('.ba-after');
    if (!handle || !after) return;
    const move = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      handle.style.left = pct + '%';
    };
    let dragging = false;
    slider.addEventListener('mousedown', () => (dragging = true));
    window.addEventListener('mouseup', () => (dragging = false));
    window.addEventListener('mousemove', (e) => dragging && move(e.clientX));
    slider.addEventListener('touchmove', (e) => move(e.touches[0].clientX), { passive: true });
  });

  console.log('%c마곡베스트치과의원', 'color:#1763E6;font-weight:800;font-size:14px', '— 환자 중심 진료');
})();
