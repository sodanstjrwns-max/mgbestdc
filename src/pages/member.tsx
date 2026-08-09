// ============================================================
// 회원 — 회원가입 / 로그인 페이지 (After 사진 열람용)
// ============================================================
import { html } from 'hono/html'
import { CLINIC } from '../data/clinic'

const authShell = (title: string, sub: string, inner: ReturnType<typeof html>) => html`
  <section class="page-hero" data-ghost="MEMBER">
    <div class="container">
      <nav class="breadcrumb"><a href="/">홈</a><span class="sep">/</span><span>${title}</span></nav>
      <span class="eyebrow">MEMBER</span>
      <h1>${title}</h1>
      <p class="ph-sub">${sub}</p>
    </div>
  </section>
  <section class="pad">
    <div class="container" style="max-width:460px">${inner}</div>
  </section>
`

// ============================================================
// 회원가입
// ============================================================
export function SignupPage(redirect = '/cases') {
  return authShell(
    '회원가입',
    '가입 후 치료 전·후(After) 사진을 확인하실 수 있습니다.',
    html`
      <form id="signup-form" class="card reveal" style="padding:32px;display:grid;gap:14px" novalidate>
        <input type="hidden" name="redirect" value="${redirect}" />
        <div>
          <label for="su-name" style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:6px">이름</label>
          <input id="su-name" name="name" type="text" class="form-input" placeholder="홍길동" required autocomplete="name" />
        </div>
        <div>
          <label for="su-email" style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:6px">이메일</label>
          <input id="su-email" name="email" type="email" class="form-input" placeholder="example@email.com" required autocomplete="email" />
        </div>
        <div>
          <label for="su-pw" style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:6px">비밀번호 <span style="font-weight:400;color:var(--ink-3)">(8자 이상)</span></label>
          <input id="su-pw" name="password" type="password" class="form-input" placeholder="••••••••" required minlength="8" autocomplete="new-password" />
        </div>
        <div>
          <label for="su-pw2" style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:6px">비밀번호 확인</label>
          <input id="su-pw2" name="password2" type="password" class="form-input" placeholder="••••••••" required minlength="8" autocomplete="new-password" />
        </div>

        <div class="card" style="padding:14px 16px;background:var(--bg-1);border:1px solid var(--line-3);font-size:0.82rem;line-height:1.7;color:var(--ink-2)">
          <b>개인정보 수집·이용 동의 (필수)</b><br />
          · 수집 항목: 이름, 이메일, 비밀번호(암호화 저장)<br />
          · 수집 목적: 회원 식별 및 치료 전·후 사진 열람 서비스 제공<br />
          · 보유 기간: 회원 탈퇴 시까지 (탈퇴 요청 시 지체 없이 파기)<br />
          자세한 내용은 <a href="/privacy" target="_blank" style="color:var(--acc);font-weight:700">개인정보처리방침</a>을 확인해 주세요.
        </div>
        <label style="display:flex;align-items:center;gap:10px;font-size:0.88rem;cursor:pointer">
          <input type="checkbox" id="su-consent" name="consent" required style="width:18px;height:18px;accent-color:var(--brand)" />
          <span>개인정보 수집·이용에 동의합니다 <b style="color:var(--acc)">(필수)</b></span>
        </label>

        <p id="signup-msg" role="alert" style="display:none;font-size:0.85rem;font-weight:700;color:#D64545;margin:0"></p>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center"><i class="fa-solid fa-user-plus"></i> 가입하기</button>
        <p style="text-align:center;font-size:0.85rem;color:var(--ink-3);margin:0">이미 회원이신가요? <a href="/login?redirect=${encodeURIComponent(redirect)}" style="color:var(--acc);font-weight:700">로그인</a></p>
      </form>

      <script>
        (function () {
          var f = document.getElementById('signup-form');
          var msg = document.getElementById('signup-msg');
          function show(t) { msg.textContent = t; msg.style.display = 'block'; }
          f.addEventListener('submit', async function (e) {
            e.preventDefault();
            msg.style.display = 'none';
            var d = new FormData(f);
            if (d.get('password') !== d.get('password2')) return show('비밀번호가 서로 일치하지 않습니다.');
            if (String(d.get('password')).length < 8) return show('비밀번호는 8자 이상이어야 합니다.');
            if (!document.getElementById('su-consent').checked) return show('개인정보 수집·이용 동의가 필요합니다.');
            var btn = f.querySelector('button[type=submit]');
            btn.disabled = true;
            try {
              var res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: d.get('name'), email: d.get('email'), password: d.get('password'), consent: true })
              });
              var j = await res.json();
              if (j.ok) { location.href = d.get('redirect') || '/cases'; }
              else { show(j.error || '가입에 실패했습니다. 잠시 후 다시 시도해 주세요.'); btn.disabled = false; }
            } catch (err) { show('네트워크 오류가 발생했습니다.'); btn.disabled = false; }
          });
        })();
      </script>
    `
  )
}

// ============================================================
// 로그인
// ============================================================
export function LoginPage(redirect = '/cases') {
  return authShell(
    '로그인',
    '로그인하시면 치료 전·후(After) 사진을 확인하실 수 있습니다.',
    html`
      <form id="login-form" class="card reveal" style="padding:32px;display:grid;gap:14px" novalidate>
        <input type="hidden" name="redirect" value="${redirect}" />
        <div>
          <label for="li-email" style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:6px">이메일</label>
          <input id="li-email" name="email" type="email" class="form-input" placeholder="example@email.com" required autocomplete="email" />
        </div>
        <div>
          <label for="li-pw" style="display:block;font-size:0.85rem;font-weight:700;margin-bottom:6px">비밀번호</label>
          <input id="li-pw" name="password" type="password" class="form-input" placeholder="••••••••" required autocomplete="current-password" />
        </div>
        <p id="login-msg" role="alert" style="display:none;font-size:0.85rem;font-weight:700;color:#D64545;margin:0"></p>
        <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center"><i class="fa-solid fa-right-to-bracket"></i> 로그인</button>
        <p style="text-align:center;font-size:0.85rem;color:var(--ink-3);margin:0">아직 회원이 아니신가요? <a href="/signup?redirect=${encodeURIComponent(redirect)}" style="color:var(--acc);font-weight:700">회원가입</a></p>
      </form>

      <script>
        (function () {
          var f = document.getElementById('login-form');
          var msg = document.getElementById('login-msg');
          function show(t) { msg.textContent = t; msg.style.display = 'block'; }
          f.addEventListener('submit', async function (e) {
            e.preventDefault();
            msg.style.display = 'none';
            var d = new FormData(f);
            var btn = f.querySelector('button[type=submit]');
            btn.disabled = true;
            try {
              var res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: d.get('email'), password: d.get('password') })
              });
              var j = await res.json();
              if (j.ok) { location.href = d.get('redirect') || '/cases'; }
              else { show(j.error || '이메일 또는 비밀번호가 올바르지 않습니다.'); btn.disabled = false; }
            } catch (err) { show('네트워크 오류가 발생했습니다.'); btn.disabled = false; }
          });
        })();
      </script>
    `
  )
}
