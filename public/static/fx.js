/* ============================================================
   마곡베스트치과 — 2026 ADVANCED FX ENGINE
   WebGL 셰이더 히어로 배경 (마우스 반응 플로우 노이즈)
   의존성 0 · graceful degradation · prefers-reduced-motion 존중
   ============================================================ */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var canvas = document.getElementById('fx-canvas');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false })
    || canvas.getContext('experimental-webgl', { alpha: true });
  if (!gl) return; // WebGL 미지원 → CSS 배경만

  /* ---------- 셰이더 소스 ---------- */
  var VERT = [
    'attribute vec2 p;',
    'void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
  ].join('\n');

  // 도메인 워프 + fbm 노이즈 → 흐르는 잉크/오로라. 마우스 근처 글로우.
  var FRAG = [
    'precision highp float;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    'uniform vec2 u_mouse;',
    'uniform float u_mouseOn;',
    '',
    'float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }',
    'float noise(vec2 p){',
    '  vec2 i=floor(p), f=fract(p);',
    '  float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));',
    '  vec2 u=f*f*(3.0-2.0*f);',
    '  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;',
    '}',
    'float fbm(vec2 p){',
    '  float v=0.0, a=0.5;',
    '  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; }',
    '  return v;',
    '}',
    'void main(){',
    '  vec2 uv = gl_FragCoord.xy / u_res.xy;',
    '  vec2 p = uv;',
    '  p.x *= u_res.x / u_res.y;',
    '  float t = u_time * 0.05;',
    '  // 도메인 워프',
    '  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));',
    '  vec2 r = vec2(fbm(p + 3.0*q + vec2(1.7,9.2) + t*0.5), fbm(p + 3.0*q + vec2(8.3,2.8)));',
    '  float f = fbm(p + 2.5*r);',
    '  // 잉크 배경 + 절제된 라임/틸 흐름 (액센트는 마우스 근처만)',
    '  vec3 base = vec3(0.031, 0.035, 0.043);',
    '  vec3 ink  = vec3(0.07, 0.09, 0.11);',
    '  vec3 lime = vec3(0.78, 1.0, 0.30);',
    '  vec3 col = base;',
    '  col = mix(col, ink, smoothstep(0.30, 0.95, f));',
    '  // 마우스 라디얼 라임 글로우 (인터랙션 보상은 마우스에만)',
    '  vec2 m = u_mouse / u_res.xy; m.x *= u_res.x/u_res.y;',
    '  float d = distance(p, m);',
    '  col += lime * u_mouseOn * 0.16 * exp(-d*4.2) * smoothstep(0.2,0.8,f);',
    '  // 상단 비네팅(아래로 페이드아웃)',
    '  float vig = smoothstep(1.1, 0.05, uv.y);',
    '  col *= vig;',
    '  float alpha = clamp(0.12 + f*0.55, 0.0, 0.85) * vig;',
    '  gl_FragColor = vec4(col, alpha);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, VERT);
  var fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uMouse = gl.getUniformLocation(prog, 'u_mouse');
  var uMouseOn = gl.getUniformLocation(prog, 'u_mouseOn');

  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var mouse = { x: 0, y: 0, on: 0 };

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  var host = canvas.parentElement || window;
  host.addEventListener('mousemove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * dpr;
    mouse.y = (r.height - (e.clientY - r.top)) * dpr; // GL y 반전
    mouse.on += (1 - mouse.on) * 0.1;
  });
  host.addEventListener('mouseleave', function () { mouse.on = 0; });

  canvas.classList.add('ready');
  var start = performance.now();
  var running = true;
  // 화면 밖이면 일시정지 (성능)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      running = en[0].isIntersecting;
      if (running) requestAnimationFrame(frame);
    }, { threshold: 0 }).observe(canvas);
  }

  function frame(now) {
    if (!running) return;
    var t = (now - start) / 1000;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uMouseOn, mouse.on);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
