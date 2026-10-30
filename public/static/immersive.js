/* ============================================================
   마곡베스트치과 메인 — 스크롤 몰입 연출 (PORCELAIN MOTION, 2026-10-30)
   GSAP 3.12.5 ScrollTrigger + Lenis 1.1.13 (홈에서만 로드)
   - 글은 모두 HTML 그대로 — 움직임만 더한다 (크롤러·AEO·JS 꺼짐 영향 없음)
   - 동작 줄이기 사용자에게는 아무것도 하지 않는다 (app.js 기본 등장만)
   - 관성 스크롤은 마우스·트랙패드(pointer: fine)에서만, 터치는 기본 스크롤
   - 등장은 화면에 들어올 때 한 번, 빠르게 지나치거나 앵커로 건너뛰어도 반드시 끝까지 재생
   - app.js 의 .reveal / .reveal-wipe 를 넘겨받아 효과가 겹치지 않게 한다
   - 모티프: "틀은 그대로, 안의 사진이 열린다" — 포슬린 액자 안에서 조리개처럼 열리는 사진,
     히어로 줄 올림(lineUp)을 섹션 제목까지 잇는 줄 단위 등장, 사파이어 가는 선이 그어지는 리듬
   ============================================================ */
(function () {
  'use strict';
  if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.gsap || !window.ScrollTrigger) return; // CDN 실패 → app.js 기본 등장이 그대로 동작
  if (!document.querySelector('main .hero')) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var root = document.documentElement;
  var mobile = matchMedia('(max-width: 720px)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return gsap.utils.toArray((c || document).querySelectorAll(s)); };

  // ── 기존 등장 효과 넘겨받기: 클래스만 떼면 CSS 초기값(opacity 0)·transition 이 사라진다
  var formerReveal = $$('main .reveal, main .reveal-wipe');
  formerReveal.forEach(function (el) {
    el.classList.remove('reveal', 'reveal-wipe', 'reveal-d1', 'reveal-d2', 'reveal-d3', 'in');
  });
  root.classList.add('pm');

  // ── 1) 관성 스크롤 — 마우스·트랙패드만
  var lenis = null;
  if (fine && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // 모바일 메뉴(좁은 창)·메가 메뉴 안 스크롤은 Lenis 가 가로채지 않게
    $$('.mobile-nav, .mega').forEach(function (n) { n.setAttribute('data-lenis-prevent', ''); });
    var mnav = $('.mobile-nav');
    if (mnav && window.MutationObserver) {
      new MutationObserver(function () { mnav.classList.contains('open') ? lenis.stop() : lenis.start(); })
        .observe(mnav, { attributes: true, attributeFilter: ['class'] });
    }
    // 앵커·맨 위로: app.js 의 네이티브 smooth 대신 Lenis 로 (캡처 단계에서 먼저 받는다)
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      var id = a.getAttribute('href');
      if (a.id === 'btn-top' || id === '#') { e.preventDefault(); e.stopPropagation(); lenis.scrollTo(0); return; }
      var target = id.length > 1 && document.querySelector(id);
      if (!target) return;
      e.preventDefault(); e.stopPropagation();
      lenis.scrollTo(target, { offset: -90 });
      if (history.pushState) history.pushState(null, '', id);
    }, true);
  }

  // ── 등장 도우미: 한 번 재생 + 끝 보장 + 끝나면 인라인 값 정리
  var claimed = [];
  function claim(list) { gsap.utils.toArray(list).forEach(function (el) { claimed.push(el); }); }
  function isClaimed(el) { return claimed.some(function (c) { return c === el || c.contains(el) || el.contains(c); }); }
  var END = { opacity: 1, x: 0, y: 0, xPercent: 0, yPercent: 0, rotate: 0, scale: 1 };
  var CLEAR = { clipPath: 'clipPath', backgroundSize: 'backgroundSize', opacity: 'opacity' };
  var pending = [];

  function play(p) {
    if (p.played) return;
    p.played = true;
    p.tw.play();
    // 탭이 숨겨져 프레임이 멈춰도 끝 상태 보장
    setTimeout(function () { if (p.tw.progress() < 1) p.tw.progress(1); }, (p.tw.totalDuration() + 0.8) * 1000);
  }
  // 빠른 스크롤·앵커 점프·스크롤 끝에서 이미 지나친 것은 즉시 재생
  function sweep() {
    var vh = window.innerHeight;
    pending.forEach(function (p) {
      if (!p.played && p.trigger.getBoundingClientRect().top < vh * 0.94) play(p);
    });
  }

  // style.css 의 모바일 터치 영역 규칙 `section div > a[style]`(≤720px: padding·margin·display 변경)이
  // GSAP 인라인 style 때문에 카드 링크에 걸려 높이가 바뀌는 것을 막는다 — 지금 계산값을 변수로 붙잡아 두고,
  // 끝나면 style 속성을 통째로 없애 원래 규칙으로 돌아간다 (immersive.css 의 a[data-pm-a] 참조)
  function pinBox(el) {
    if (el.tagName !== 'A' || el.hasAttribute('style') || !el.matches('section div > a')) return;
    var cs = getComputedStyle(el); // 살아 있는 객체 — 속성을 바꾸기 전에 값부터 떠 둔다
    var pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' ');
    var mar = [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(' ');
    var disp = cs.display;
    el.style.setProperty('--pm-p', pad);
    el.style.setProperty('--pm-m', mar);
    el.style.setProperty('--pm-d', disp);
    el.setAttribute('data-pm-a', '');
  }
  function unpinBox(el) {
    if (!el.hasAttribute('data-pm-a')) return;
    ['--pm-p', '--pm-m', '--pm-d'].forEach(function (k) { el.style.removeProperty(k); });
    el.removeAttribute('data-pm-a');
    if (!el.getAttribute('style')) el.removeAttribute('style');
  }

  function enter(targets, from, opt) {
    opt = opt || {};
    var els = targets ? gsap.utils.toArray(targets).filter(Boolean) : [];
    if (!els.length) return null;
    els.forEach(pinBox);
    claim(els);
    var to = { paused: true, duration: opt.duration || 1.1, ease: opt.ease || 'expo.out', stagger: opt.stagger || 0, delay: opt.delay || 0 };
    var clear = ['transition'];
    Object.keys(from).forEach(function (k) {
      to[k] = opt.to && k in opt.to ? opt.to[k] : END[k];
      clear.push(CLEAR[k] || (k.indexOf('--') === 0 ? k : 'transform'));
    });
    to.onStart = function () { gsap.set(els, { transition: 'none' }); };
    to.onComplete = function () {
      gsap.set(els, { clearProps: clear.join(',') });
      els.forEach(function (el) { unpinBox(el); if (el.getAttribute('style') === '') el.removeAttribute('style'); });
    };
    var tw = gsap.fromTo(els, from, to);
    var p = { tw: tw, trigger: opt.trigger || els[0], played: false };
    pending.push(p);
    ScrollTrigger.create({ trigger: p.trigger, start: opt.start || 'top 88%', once: true, onEnter: function () { play(p); } });
    return tw;
  }

  // 긴 목록: 카드마다 자기 위치에서, 같은 줄은 열 순서대로 살짝 늦게
  function enterEach(items, from, opt) {
    opt = opt || {};
    var cols = opt.cols || 1;
    items.forEach(function (el, i) {
      enter(el, from, { duration: opt.duration, ease: opt.ease, delay: (i % cols) * (opt.gap || 0.08), trigger: el, start: opt.start || 'top 92%' });
    });
  }
  function colCount(grid) {
    return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
  }
  function scrub(target, from, to, st) {
    claim(target);
    return gsap.fromTo(target, from, Object.assign({ ease: 'none', scrollTrigger: Object.assign({ scrub: true }, st) }, to));
  }

  // ── 제목 줄 나누기: <br> 기준 줄마다 마스크 — 히어로 h1 의 줄 올림을 섹션 제목까지 잇는다
  // 줄 나눔 뒤 높이·줄바꿈 위치가 달라지면 원래대로 되돌리고 통째 등장(마스크 + 위로)으로 대신한다
  // 글자마다 몇 번째 줄인지 — 줄 나눔 전후 줄바꿈 위치가 같은지 비교용
  function lineSig(h) {
    var w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), sig = '', last = null, line = 0, r = document.createRange();
    while (w.nextNode()) {
      var t = w.currentNode;
      for (var i = 0; i < t.length; i++) {
        if (/\s/.test(t.data[i])) continue;
        r.setStart(t, i); r.setEnd(t, i + 1);
        var rc = r.getClientRects()[0];
        if (!rc) continue;
        if (last !== null && rc.top - last > 6) line++;
        if (last === null || rc.top - last > 6) last = rc.top;
        sig += line;
      }
    }
    return sig;
  }
  // 줄 마스크(.pm-ln)가 안에서 다시 줄바꿈됐는지 — 변형(transform)과 무관한 레이아웃 높이로 판단
  function wrapsInside(h) {
    var lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * 1.3;
    return $$('.pm-ln', h).some(function (ln) { return ln.offsetHeight > lh * 1.6; });
  }
  function unwrapLines(h) {
    $$('.pm-ln', h).forEach(function (ln) {
      var li = ln.firstChild;
      while (li && li.firstChild) h.insertBefore(li.firstChild, ln);
      ln.remove();
    });
  }
  function splitLines(h) {
    var before = h.getBoundingClientRect().height;
    var sigBefore = lineSig(h);
    var original = Array.prototype.slice.call(h.childNodes);
    var groups = [[]];
    original.forEach(function (n) {
      if (n.nodeName === 'BR') groups.push(n, []);
      else groups[groups.length - 1].push(n);
    });
    var segs = groups.filter(function (g) { return Array.isArray(g) && g.map(function (n) { return n.textContent; }).join('').trim(); }).length;
    // <br> 로 나뉜 줄이 화면에서도 한 줄씩일 때만 (긴 줄이 다시 접히는 좁은 화면은 통째 등장)
    if (!segs || sigBefore.length && +sigBefore.charAt(sigBefore.length - 1) + 1 !== segs) return null;
    var frag = document.createDocumentFragment();
    var inners = [];
    groups.forEach(function (g) {
      if (!Array.isArray(g)) { frag.appendChild(g); return; }
      var text = g.map(function (n) { return n.textContent; }).join('');
      if (!text.trim()) { g.forEach(function (n) { frag.appendChild(n); }); return; }
      var ln = document.createElement('span'); ln.className = 'pm-ln';
      var li = document.createElement('span'); li.className = 'pm-li';
      g.forEach(function (n) { li.appendChild(n); });
      ln.appendChild(li); frag.appendChild(ln); inners.push(li);
    });
    h.appendChild(frag);
    // 높이나 줄바꿈 위치가 하나라도 달라지면 되돌린다 (제목 줄바꿈은 원래 그대로가 원칙)
    if (Math.abs(h.getBoundingClientRect().height - before) > 1.5 || lineSig(h) !== sigBefore || wrapsInside(h)) {
      unwrapLines(h);
      return null;
    }
    return inners;
  }
  var splits = [];
  function riseTitle(h, opt) {
    opt = opt || {};
    var lines = splitLines(h);
    var fallback = function () { return enter(h, { y: 28, opacity: 0 }, { delay: opt.delay, trigger: opt.trigger || h, start: opt.start }); };
    if (!lines) return fallback();
    var tw = enter(lines, { yPercent: 108 }, { duration: 1.25, ease: 'expo.out', stagger: 0.12, delay: opt.delay || 0.06, trigger: opt.trigger || h, start: opt.start });
    splits.push({ h: h, tw: tw, fallback: fallback });
    return tw;
  }
  // 글꼴이 늦게 바뀌어 줄 마스크 안에서 다시 접히면 나눔을 풀고 원래 줄바꿈으로 (아직 안 나왔으면 통째 등장으로)
  function recheckSplits() {
    splits = splits.filter(function (sp) {
      if (!wrapsInside(sp.h)) return true;
      var p = pending.filter(function (x) { return x.tw === sp.tw; })[0];
      var wasPlayed = p && p.played;
      if (p) p.played = true;
      sp.tw.kill();
      unwrapLines(sp.h);
      if (!wasPlayed) sp.fallback();
      return false;
    });
  }

  // 문장 낱말을 인라인 span 으로 (inline — 줄바꿈·높이 그대로)
  function splitWordsInline(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var parts = node.textContent.split(/(\s+)/);
      if (!node.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      parts.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
        var w = document.createElement('span'); w.className = 'pm-wd'; w.textContent = p;
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return el.querySelectorAll('.pm-wd');
  }

  // ── 섹션 머리(.sec-head): 라벨은 선이 그어지듯 옆에서, 제목은 줄마다 마스크에서, 리드는 뒤따라
  $$('main .sec-head').forEach(function (head) {
    var h2 = $('h2', head);
    var label = $('.label', head);
    if (label) enter(label, { x: -18, opacity: 0 }, { duration: 0.9, trigger: head, start: 'top 90%' });
    if (h2) riseTitle(h2, { trigger: head, start: 'top 90%', delay: 0.08 });
    var lead = $('.section-lead', head);
    if (lead) enter(lead, { y: 22, opacity: 0 }, { delay: 0.3, trigger: head, start: 'top 90%' });
  });

  // ── 히어로: 내려가면 사진이 포슬린 액자 안으로 물러나고, 두 줄 제목은 서로 다른 속도로 (깊이)
  var hero = $('.hero');
  var heroST = { trigger: hero, start: 0, end: 'bottom top' };
  var heroBg = $('.hero-bg', hero);
  if (heroBg) scrub(heroBg, { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
    { clipPath: mobile ? 'inset(2% 3% 0% 3% round 22px)' : 'inset(5% 4% 0% 4% round 40px)' }, heroST);
  var hl = $$('.hero h1 .l');
  if (hl[0]) scrub(hl[0], { y: 0 }, { y: mobile ? -46 : -120 }, heroST);
  if (hl[1]) scrub(hl[1], { y: 0 }, { y: mobile ? -22 : -56 }, heroST);
  var hm = $('.hero-meta', hero);
  if (hm) scrub(hm, { y: 0, opacity: 1 }, { y: mobile ? -40 : -140, opacity: 0 }, heroST);
  var hf = $('.hero-foot > div:first-child', hero);
  if (hf) scrub(hf, { y: 0, opacity: 1 }, { y: mobile ? -16 : -34, opacity: 0.25 }, heroST);
  var hi = $('.hero-info', hero);
  if (hi) scrub(hi, { y: 0, opacity: 1 }, { y: mobile ? 10 : 46, opacity: 0.3 }, heroST);

  // ── 핵심 지표: 위쪽 사파이어 선이 왼쪽에서 그어지고, 칸이 차례로 (카운트업은 app.js 그대로)
  var strip = $('.fact-strip');
  if (strip) {
    enter(strip, { '--pm-bar': 0 }, { to: { '--pm-bar': 1 }, duration: 1.6, ease: 'power3.inOut', trigger: strip, start: 'top 92%' });
    enter($$('.fact', strip), { y: 18, opacity: 0 }, { stagger: 0.1, delay: 0.15, trigger: strip, start: 'top 92%' });
  }

  // ── 진료 철학: 제목 줄 올림 + 리드 문장이 스크롤 따라 한 낱말씩 또렷해짐
  var creedLabel = $('.creed-head .label');
  if (creedLabel) enter(creedLabel, { x: -18, opacity: 0 }, { duration: 0.9 });
  var creedH = $('.creed-headline');
  if (creedH) riseTitle(creedH);
  var creedLead = $('.creed-lead');
  if (creedLead) {
    claim(creedLead);
    creedLead.classList.add('pm-read');
    gsap.fromTo(splitWordsInline(creedLead), { opacity: 0.16 }, { opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: creedLead, start: 'top 88%', end: 'bottom 62%', scrub: true } });
  }
  // 진료 원칙 사진: 액자는 그대로, 안의 영상이 조리개처럼 열림
  var pfPhoto = $('.pf-photo');
  var pfMedia = pfPhoto && $('video, img', pfPhoto);
  if (pfMedia) {
    claim(pfPhoto);
    scrub(pfMedia, { clipPath: 'inset(16% 14% 16% 14% round 160px)', scale: 1.22 },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', scale: 1 }, { trigger: pfPhoto, start: 'top 95%', end: 'center 52%' });
  }
  var pfItems = $$('.pf-list .pf-item');
  if (pfItems.length) {
    if (mobile) enterEach(pfItems, { y: 26, opacity: 0 });
    else enter(pfItems, { x: 44, opacity: 0 }, { stagger: 0.13, duration: 1.2, trigger: $('.pf-list'), start: 'top 80%' });
  }

  // ── 마곡 진료 카드 6장: 대각선 물결로 올라오고, 사진은 아래에서 위로 걷힘
  var acGrid = $('#magok-cards .area-card-grid');
  if (acGrid) {
    var cards = $$('.area-card', acGrid);
    var cols = colCount(acGrid);
    cards.forEach(function (c, i) {
      var delay = ((i % cols) + Math.floor(i / cols)) * 0.07;
      var start = mobile ? 'top 94%' : 'top 90%';
      var trig = mobile ? c : acGrid;
      enter(c, { y: 46, opacity: 0 }, { delay: mobile ? (i % cols) * 0.08 : delay, trigger: trig, start: start });
      var img = $('.ac-img img', c);
      if (img) enter(img, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.16 }, { to: { clipPath: 'inset(0% 0% 0% 0%)' },
        duration: 1.3, ease: 'expo.inOut', delay: (mobile ? (i % cols) * 0.08 : delay) + 0.05, trigger: trig, start: start });
    });
  }

  // ── 중점 진료 3장: 넓은 화면에선 세 장이 서로 다른 속도로 올라와 한 줄에 맞춰짐(깊이), 사진은 안에서 천천히 당겨짐
  var coreGrid = $('.core-photo-grid');
  if (coreGrid) {
    var cores = $$('.core-photo-card', coreGrid);
    if (colCount(coreGrid) >= 3) {
      var lift = [150, 40, 240];
      cores.forEach(function (c, i) {
        scrub(c, { translate: '0px ' + lift[i % 3] + 'px' }, { translate: '0px 0px' }, { trigger: coreGrid, start: 'top bottom', end: 'top 38%' });
      });
    } else {
      enterEach(cores, { y: 54, opacity: 0 }, { cols: colCount(coreGrid), duration: 1.2 });
    }
    cores.forEach(function (c) {
      var img = $('.cpc-img img', c);
      // CSS 변수로 움직여 카드 호버 확대(transform)와 겹치지 않게
      if (img) gsap.fromTo(img, { '--pm-s': 1.18, '--pm-ty': '-4%' }, { '--pm-s': 1.1, '--pm-ty': '4%', ease: 'none',
        scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // ── 전체 진료 색인: 위쪽 굵은 선이 그어지고, 행이 왼쪽부터 차례로 펼쳐짐(색인 넘기듯)
  var txIndex = $('.tx-index');
  if (txIndex) {
    enter(txIndex, { '--pm-rule': 0 }, { to: { '--pm-rule': 1 }, duration: 1.4, ease: 'power3.inOut', start: 'top 90%' });
    enter($$('.tx-row', txIndex), { clipPath: 'inset(0% 100% 0% 0%)' }, { to: { clipPath: 'inset(0% 0% 0% 0%)' },
      duration: 1.1, ease: 'power3.inOut', stagger: 0.08, delay: 0.2, trigger: txIndex, start: 'top 90%' });
  }

  // ── 진료과목 상세 카드: 자기 자리에서, 같은 줄은 왼쪽부터
  var proc = $('.proc-grid');
  if (proc) enterEach($$('.proc-card', proc), { y: 30, opacity: 0 }, { cols: colCount(proc), duration: 1 });

  // ── 대표원장: 인용 부호가 천천히 떠오르고, '손이 좋다' 강조어에 형광펜이 그어짐, 아치 사진은 아래에서 걷힘
  var dq = $('.doctor-quote');
  if (dq) {
    enter(dq, { y: 30, opacity: 0 }, { duration: 1.2 });
    gsap.fromTo(dq, { '--pm-q': '0px' }, { '--pm-q': '-26px', ease: 'none',
      scrollTrigger: { trigger: dq, start: 'top bottom', end: 'bottom 30%', scrub: true } });
    var ems = $$('em', dq);
    if (ems.length) enter(ems, { backgroundSize: '0% 100%' }, { to: { backgroundSize: '100% 100%' }, duration: 1.1, ease: 'power2.inOut', stagger: 0.35, delay: 0.55, trigger: dq, start: 'top 80%' });
  }
  var dFeature = $('.doctor-feature');
  if (dFeature) {
    var dText = dFeature.firstElementChild;
    var dParts = [$('.doctor-note', dText), $('.doctor-sign', dText)].filter(Boolean);
    if (dParts.length) enter(dParts, { y: 22, opacity: 0 }, { stagger: 0.1, trigger: dParts[0], start: 'top 92%' });
    var creds = $$('.cred-item', dText);
    if (creds.length) enter(creds, { x: -22, opacity: 0 }, { stagger: 0.07, trigger: creds[0], start: 'top 94%' });
    var dBtns = dText ? $$(':scope > div:last-child > a', dText) : [];
    if (dBtns.length) enter(dBtns, { y: 16, opacity: 0 }, { stagger: 0.08, trigger: dBtns[0], start: 'top 96%' });
    var dPhoto = $('.doctor-photo', dFeature);
    var dImg = dPhoto && $('img', dPhoto);
    if (dImg) {
      claim(dPhoto);
      enter(dImg, { clipPath: 'inset(100% 0% 0% 0%)' }, { to: { clipPath: 'inset(0% 0% 0% 0%)' }, duration: 1.5, ease: 'expo.inOut', trigger: dPhoto, start: 'top 85%' });
      gsap.fromTo(dImg, { scale: 1.14, translate: '0px -5%' }, { scale: 1.14, translate: '0px 5%', ease: 'none',
        scrollTrigger: { trigger: dPhoto, start: 'top bottom', end: 'bottom top', scrub: true } });
      var lab = $('.ph-label', dPhoto);
      if (lab) enter(lab, { y: 20, opacity: 0 }, { delay: 0.7, trigger: dPhoto, start: 'top 85%' });
    }
  }

  // ── 치료사례 카드
  var ba = $('.ba-grid');
  if (ba) enterEach($$('.ba-card', ba), { y: 40, opacity: 0 }, { cols: colCount(ba), duration: 1.15, gap: 0.1 });

  // ── 치료 그 이후(영상 밴드): 남색 액자는 그대로, 영상이 가운데 가는 틈에서 위아래로 열림 + 글 줄 올림
  var band = $('.life-band');
  if (band) {
    claim(band);
    var lbImg = $('.lb-img', band);
    if (lbImg) scrub(lbImg, { clipPath: 'inset(42% 0% 42% 0%)', scale: 1.2 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
      { trigger: band, start: 'top 96%', end: 'center 50%' });
    var lbBody = $('.lb-body', band);
    if (lbBody) {
      var lbH = $('h2', lbBody);
      enter($('.eyebrow', lbBody), { x: -18, opacity: 0 }, { duration: 0.9, trigger: band, start: 'top 55%' });
      if (lbH) riseTitle(lbH, { trigger: band, start: 'top 55%', delay: 0.12 });
      enter([$('p', lbBody), $('.btn', lbBody)].filter(Boolean), { y: 20, opacity: 0 }, { stagger: 0.12, delay: 0.4, trigger: band, start: 'top 55%' });
    }
  }

  // ── 진료 과정: 행이 차례로 들어오고, 스크롤 위치에 맞춰 지금 단계가 사파이어로 켜지며 지난 단계엔 선이 그어짐
  var jRows = $$('.journey .journey-row');
  if (jRows.length) {
    enterEach(jRows, { x: -26, opacity: 0 }, { duration: 1 });
    var setStep = function (idx) {
      jRows.forEach(function (r, i) { r.classList.toggle('pm-on', i === idx); r.classList.toggle('pm-done', i < idx); });
    };
    ScrollTrigger.create({ trigger: $('.journey'), start: 'top 62%', end: 'bottom 48%',
      onUpdate: function (self) { setStep(Math.min(jRows.length - 1, Math.floor(self.progress * jRows.length))); },
      onLeave: function () { setStep(jRows.length); },
      onLeaveBack: function () { setStep(-1); } });
  }

  // ── 자주 묻는 질문: 질문 상자가 차례로, Q 표식이 살짝 커지며 자리 잡음
  var faqs = $$('.faq-list .faq-item');
  if (faqs.length) {
    enterEach(faqs, { y: 22, opacity: 0 }, { duration: 0.9 });
    faqs.forEach(function (f) {
      var q = $('.q-ico', f);
      if (q) enter(q, { scale: 0.4, opacity: 0 }, { duration: 0.8, ease: 'back.out(2)', delay: 0.15, trigger: f, start: 'top 92%' });
    });
  }

  // ── 지역 안내 버튼: 왼쪽부터 촘촘히 놓임
  var local = $('#local-section');
  if (local) {
    var chips = $$('.container > div:last-child > a.btn', local);
    if (chips.length > 2) enter(chips, { y: 14, scale: 0.92, opacity: 0 }, { duration: 0.8, ease: 'power3.out', stagger: 0.05, trigger: chips[0], start: 'top 94%' });
  }

  // ── 예약 안내: 남색 밴드가 올라오고, 뒤쪽 빛 번짐 두 개가 스크롤 따라 서로 반대로 흐름
  var cta = $('.cta-band');
  if (cta) {
    enter(cta, { y: 50, opacity: 0 }, { duration: 1.3, start: 'top 92%' });
    gsap.fromTo(cta, { '--pm-g1': '-70px', '--pm-g2': '-50px' }, { '--pm-g1': '70px', '--pm-g2': '60px', ease: 'none',
      scrollTrigger: { trigger: cta, start: 'top bottom', end: 'bottom top', scrub: true } });
    var ctaH = $('h2', cta);
    if (ctaH) riseTitle(ctaH, { trigger: cta, start: 'top 80%', delay: 0.25 });
    enter([$('.label', cta), $('p', cta)].filter(Boolean), { y: 16, opacity: 0 }, { stagger: 0.1, delay: 0.2, trigger: cta, start: 'top 80%' });
    enter($$('.cta-actions > a', cta), { y: 18, opacity: 0 }, { stagger: 0.1, delay: 0.5, trigger: cta, start: 'top 80%' });
  }

  // ── 나머지: 넘겨받은 .reveal 중 아직 연출이 없는 블록은 기본 등장(아래에서 살짝)
  formerReveal.forEach(function (el) {
    if (isClaimed(el) || el.closest('.hero')) return;
    if (el.getBoundingClientRect().height < 4) return;
    enter(el, { y: 28, opacity: 0 }, { duration: 1.1, trigger: el, start: 'top 92%' });
  });

  // FAQ 를 펼치면 아래 위치가 바뀌므로 다시 계산
  $$('main details').forEach(function (d) { d.addEventListener('toggle', function () { ScrollTrigger.refresh(); }); });

  // ── 끝 보장: 스크롤이 멈출 때·새로 계산될 때·앵커 이동 뒤 지나친 등장을 모두 재생
  ScrollTrigger.addEventListener('scrollEnd', sweep);
  ScrollTrigger.addEventListener('refresh', sweep);
  window.addEventListener('hashchange', function () { setTimeout(sweep, 60); });
  // 주소에 #앵커가 있으면 레이아웃·글꼴 계산이 끝난 뒤 그 자리로 다시 맞춘다
  // (ScrollTrigger 첫 계산·글꼴 교체로 높이가 바뀌어 브라우저의 앵커 이동이 어긋나는 것 방지 — 사용자가 먼저 움직이면 손대지 않음)
  var userMoved = false;
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, function () { userMoved = true; }, { passive: true, once: true });
  });
  function jumpToHash() {
    var id = location.hash;
    if (userMoved || !id || id.length < 2) return;
    var t = null;
    try { t = document.querySelector(decodeURIComponent(id)); } catch (e) { return; }
    if (!t) return;
    var y = Math.round(t.getBoundingClientRect().top + window.scrollY);
    if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: 'instant' });
  }
  function settle() { recheckSplits(); ScrollTrigger.refresh(); jumpToHash(); ScrollTrigger.update(); sweep(); }
  window.addEventListener('load', settle);
  // 글꼴 교체·늦은 이미지로 문서 높이가 바뀌면 트리거 위치를 다시 계산 (+ 앵커 자리 재조정)
  if (window.ResizeObserver) {
    var lastH = 0, rt = 0;
    new ResizeObserver(function () {
      var h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(rt);
      rt = setTimeout(settle, 150);
    }).observe(document.body);
  }
  sweep();
})();
