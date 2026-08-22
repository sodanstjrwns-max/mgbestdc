// ============================================================
// 마곡베스트치과의원 — 관리자 CMS
// 탭: 예약문의 / 공지사항 / 건강칼럼 / 비포애프터
// 에디터: Toast UI Editor (WYSIWYG·한국어) + R2 이미지 업로드
// ============================================================
import { html, raw } from 'hono/html'
import { esc, type DbPost, type DbCase } from './cms'

const fmtDT = (d: string) => (d || '').slice(0, 16).replace('T', ' ')

// ------------------------------------------------------------
// 관리자 전용 셸 (사이트 레이아웃과 분리 — 가볍고 빠르게)
// ------------------------------------------------------------
export function AdminShell(title: string, adminKey: string, active: string, body: any) {
  const tabs = [
    { id: 'reservations', name: '예약 문의', icon: 'fa-calendar-check', href: '/admin' },
    { id: 'notice', name: '공지사항', icon: 'fa-bullhorn', href: '/admin/posts?type=notice' },
    { id: 'column', name: '건강칼럼', icon: 'fa-pen-nib', href: '/admin/posts?type=column' },
    { id: 'cases', name: '비포애프터', icon: 'fa-images', href: '/admin/cases' }
  ]
  return html`<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>${title} | 마곡베스트치과 관리자</title>
<link rel="icon" type="image/png" href="/static/img/favicon.png" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.2/css/all.min.css" />
<link rel="stylesheet" href="https://uicdn.toast.com/editor/latest/toastui-editor.min.css" />
<style>
:root{--brand:#0C5B9D;--brand-2:#00B4E5;--ink:#0F1B2D;--ink-2:#3D4A5F;--ink-3:#74829C;--line:#E3E9F2;--bg:#F5F8FC;--r:14px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Pretendard Variable',Pretendard,-apple-system,sans-serif;background:var(--bg);color:var(--ink);font-size:15px;line-height:1.6}
a{color:inherit;text-decoration:none}
.adm-top{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid var(--line);padding:0 24px;display:flex;align-items:center;gap:24px;height:60px}
.adm-logo{font-weight:800;font-size:1.02rem;color:var(--brand);display:flex;align-items:center;gap:8px;white-space:nowrap}
.adm-tabs{display:flex;gap:4px;overflow-x:auto;flex:1}
.adm-tab{padding:8px 16px;border-radius:10px;font-weight:600;color:var(--ink-3);white-space:nowrap;display:flex;align-items:center;gap:8px;font-size:0.92rem}
.adm-tab:hover{background:var(--bg);color:var(--ink)}
.adm-tab.on{background:var(--brand);color:#fff}
.adm-site{font-size:0.85rem;color:var(--ink-3);white-space:nowrap}
.adm-wrap{max-width:1180px;margin:0 auto;padding:32px 24px 80px}
.adm-head{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:24px}
.adm-head h1{font-size:1.5rem;font-weight:800}
.adm-head .sub{color:var(--ink-3);font-size:0.88rem;margin-top:2px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:10px;font-weight:700;font-size:0.9rem;cursor:pointer;border:1px solid var(--line);background:#fff;color:var(--ink-2);transition:all .18s}
.btn:hover{border-color:var(--brand);color:var(--brand)}
.btn-primary{background:var(--brand);border-color:var(--brand);color:#fff}
.btn-primary:hover{background:#1149A8;color:#fff}
.btn-danger{color:#DC2626}
.btn-danger:hover{border-color:#DC2626;background:#FEF2F2;color:#DC2626}
.btn-sm{padding:6px 12px;font-size:0.82rem;border-radius:8px}
.card{background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}
table{width:100%;border-collapse:collapse;font-size:0.9rem}
th{background:var(--bg);text-align:left;padding:12px 16px;font-weight:700;color:var(--ink-2);white-space:nowrap}
td{padding:12px 16px;border-top:1px solid var(--line);vertical-align:middle}
tr:hover td{background:#FAFCFF}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:99px;font-size:0.76rem;font-weight:700}
.b-pub{background:#EAF6EE;color:#16A34A}.b-draft{background:#F1F3F7;color:#74829C}.b-pin{background:#EAF1FD;color:#0C5B9D}
.form-row{margin-bottom:18px}
.form-row label{display:block;font-weight:700;font-size:0.88rem;margin-bottom:7px;color:var(--ink-2)}
.inp{width:100%;padding:11px 14px;border:1px solid var(--line);border-radius:10px;font:inherit;font-size:0.93rem;background:#fff;transition:border .18s}
.inp:focus{outline:none;border-color:var(--brand);box-shadow:0 0 0 3px rgba(22,86,200,.1)}
textarea.inp{resize:vertical;min-height:80px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.hint{font-size:0.8rem;color:var(--ink-3);margin-top:5px}
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(80px);background:var(--ink);color:#fff;padding:13px 26px;border-radius:12px;font-weight:600;font-size:0.9rem;opacity:0;transition:all .3s;z-index:99;box-shadow:0 8px 30px rgba(0,0,0,.25)}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast.err{background:#DC2626}
.up-box{border:2px dashed var(--line);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all .2s;background:#FAFCFF;position:relative;min-height:150px;display:grid;place-items:center}
.up-box:hover{border-color:var(--brand)}
.up-box img{max-width:100%;max-height:180px;border-radius:8px;object-fit:contain}
.up-box .ph{color:var(--ink-3);font-size:0.85rem}
.up-box .ph i{font-size:1.6rem;display:block;margin-bottom:8px;opacity:.5}
.empty{padding:60px 20px;text-align:center;color:var(--ink-3)}
.empty i{font-size:2rem;display:block;margin-bottom:12px;opacity:.35}
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.stat{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:18px 20px}
.stat .n{font-size:1.6rem;font-weight:800;color:var(--brand)}
.stat .l{font-size:0.82rem;color:var(--ink-3);font-weight:600}
.toastui-editor-defaultUI{border-radius:12px;border-color:var(--line)!important}
.toastui-editor-toolbar{border-radius:12px 12px 0 0}
@media(max-width:820px){.grid-2,.grid-3,.stat-row{grid-template-columns:1fr}.adm-wrap{padding:20px 14px 60px}.adm-site{display:none}}
</style>
</head>
<body>
<header class="adm-top">
  <a class="adm-logo" href="/admin?key=${encodeURIComponent(adminKey)}"><i class="fa-solid fa-tooth"></i> 마곡베스트 관리자</a>
  <nav class="adm-tabs">
    ${raw(
      tabs
        .map((t) => {
          const sep = t.href.includes('?') ? '&' : '?'
          return `<a class="adm-tab${active === t.id ? ' on' : ''}" href="${t.href}${sep}key=${encodeURIComponent(adminKey)}"><i class="fa-solid ${t.icon}"></i> ${t.name}</a>`
        })
        .join('')
    )}
  </nav>
  <a class="adm-site" href="/" target="_blank">사이트 보기 <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
</header>
<main class="adm-wrap">${body}</main>
<div class="toast" id="toast"></div>
<script>
const ADMIN_KEY = ${raw(JSON.stringify(adminKey))};
function toast(msg, isErr){ const t=document.getElementById('toast'); t.textContent=msg; t.className='toast show'+(isErr?' err':''); setTimeout(()=>t.classList.remove('show'), 2600); }
async function api(path, opts){ const url = path + (path.includes('?')?'&':'?') + 'key=' + encodeURIComponent(ADMIN_KEY); const res = await fetch(url, opts); return res.json(); }
</script>
</body>
</html>`
}

// ------------------------------------------------------------
// 게시글 목록 (공지/칼럼 공용)
// ------------------------------------------------------------
export function AdminPostList(type: string, rows: DbPost[], adminKey: string) {
  const isNotice = type === 'notice'
  const label = isNotice ? '공지사항' : '건강칼럼'
  const k = encodeURIComponent(adminKey)
  return html`
    <div class="adm-head">
      <div>
        <h1>${label} 관리</h1>
        <div class="sub">총 ${rows.length}건 · 발행된 글만 사이트에 노출됩니다.</div>
      </div>
      <a class="btn btn-primary" href="/admin/posts/new?type=${type}&key=${k}"><i class="fa-solid fa-plus"></i> 새 ${label} 쓰기</a>
    </div>
    <div class="card" style="overflow-x:auto">
      <table style="min-width:760px">
        <thead><tr><th style="width:56px">#</th><th>제목</th>${raw(isNotice ? '<th style="width:80px">고정</th>' : '<th style="width:110px">분류</th>')}<th style="width:90px">상태</th><th style="width:70px">조회</th><th style="width:140px">등록일</th><th style="width:170px">작업</th></tr></thead>
        <tbody>
          ${rows.length === 0 ? html`<tr><td colspan="7"><div class="empty"><i class="fa-regular fa-folder-open"></i>아직 작성된 ${label}이(가) 없습니다.<br/>오른쪽 위 버튼으로 첫 글을 작성해 보세요.</div></td></tr>` : ''}
          ${raw(
            rows
              .map(
                (p) => `
            <tr>
              <td style="color:var(--ink-3)">${p.id}</td>
              <td><a href="/admin/posts/${p.id}/edit?key=${k}" style="font-weight:700;color:var(--brand)">${esc(p.title)}</a></td>
              ${isNotice ? `<td>${p.pinned ? '<span class="badge b-pin"><i class="fa-solid fa-thumbtack"></i> 고정</span>' : '-'}</td>` : `<td>${esc(p.category || '-')}</td>`}
              <td>${p.status === 'published' ? '<span class="badge b-pub">발행됨</span>' : '<span class="badge b-draft">임시저장</span>'}</td>
              <td style="color:var(--ink-3)">${p.views}</td>
              <td style="color:var(--ink-3);white-space:nowrap">${fmtDT(p.created_at)}</td>
              <td style="white-space:nowrap">
                <a class="btn btn-sm" href="/admin/posts/${p.id}/edit?key=${k}"><i class="fa-solid fa-pen"></i> 수정</a>
                <button class="btn btn-sm btn-danger" onclick="delPost(${p.id})"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>`
              )
              .join('')
          )}
        </tbody>
      </table>
    </div>
    <script>
      async function delPost(id){
        if(!confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) return;
        const j = await api('/api/admin/posts/'+id, { method:'DELETE' });
        if(j.ok){ toast('삭제되었습니다'); setTimeout(()=>location.reload(), 600); } else toast('삭제 실패: '+(j.error||''), true);
      }
    </script>
  `
}

// ------------------------------------------------------------
// 게시글 에디터 (Toast UI) — 신규/수정 공용
// ------------------------------------------------------------
export function AdminPostEditor(type: string, post: DbPost | null, adminKey: string) {
  const isNotice = type === 'notice'
  const label = isNotice ? '공지사항' : '건강칼럼'
  const k = encodeURIComponent(adminKey)
  // 카테고리 = 진료 토픽 기준 (BLOG_CATEGORIES와 동일 — 진료↔칼럼 토픽 허브 자동 연결)
  const CATS = ['임플란트', '충치·신경치료', '심미치료', '교정', '턱관절', '잇몸치료', '보철치료', '발치·사랑니', '예방·검진', '병원소식']
  return html`
    <div class="adm-head">
      <div>
        <h1>${post ? `${label} 수정` : `새 ${label} 쓰기`}</h1>
        <div class="sub">이미지는 에디터에 드래그하거나 붙여넣기(Ctrl+V)로 바로 업로드됩니다.</div>
      </div>
      <a class="btn" href="/admin/posts?type=${type}&key=${k}"><i class="fa-solid fa-list"></i> 목록</a>
    </div>

    <div class="card" style="padding:26px">
      <div class="form-row">
        <label>제목 <span style="color:#DC2626">*</span></label>
        <input class="inp" id="f-title" placeholder="${isNotice ? '예: 8월 여름휴가 진료 일정 안내' : '예: 임플란트 후 첫 일주일, 이것만 지키세요'}" value="${post ? esc(post.title) : ''}" style="font-size:1.05rem;font-weight:700" />
      </div>

      <div class="grid-2">
        <div class="form-row">
          <label>URL 주소(슬러그)</label>
          <input class="inp" id="f-slug" placeholder="비워두면 자동 생성" value="${post ? esc(post.slug) : ''}" />
          <div class="hint">영문·숫자·하이픈만. 예: summer-schedule-2026</div>
        </div>
        ${
          isNotice
            ? html`<div class="form-row">
                <label>상단 고정</label>
                <label style="display:flex;align-items:center;gap:10px;padding:11px 14px;border:1px solid var(--line);border-radius:10px;cursor:pointer;font-weight:600;font-size:0.9rem;color:var(--ink-2)">
                  <input type="checkbox" id="f-pinned" ${post?.pinned ? 'checked' : ''} style="width:17px;height:17px;accent-color:var(--brand)" /> 목록 맨 위에 고정합니다
                </label>
              </div>`
            : html`<div class="form-row">
                <label>분류</label>
                <select class="inp" id="f-category">
                  ${raw(CATS.map((c) => `<option value="${c}" ${post?.category === c ? 'selected' : ''}>${c}</option>`).join(''))}
                </select>
              </div>`
        }
      </div>

      <div class="form-row">
        <label>요약 (검색·목록 노출용)</label>
        <textarea class="inp" id="f-excerpt" rows="2" placeholder="검색 결과와 목록에 표시될 1~2문장 요약 (150자 내외)">${post ? esc(post.excerpt) : ''}</textarea>
      </div>

      <div class="form-row">
        <label>본문 <span style="color:#DC2626">*</span></label>
        <div id="editor"></div>
      </div>

      <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:26px;padding-top:22px;border-top:1px solid var(--line)">
        <div style="display:flex;gap:10px">
          <button class="btn" onclick="save('draft')"><i class="fa-regular fa-floppy-disk"></i> 임시저장</button>
          ${post && post.status === 'published' ? html`<a class="btn" href="${isNotice ? '/notice/' : '/blog/'}${esc(post.slug)}" target="_blank"><i class="fa-solid fa-eye"></i> 사이트에서 보기</a>` : ''}
        </div>
        <button class="btn btn-primary" style="padding:12px 32px" onclick="save('published')"><i class="fa-solid fa-paper-plane"></i> ${post?.status === 'published' ? '수정 발행' : '발행하기'}</button>
      </div>
    </div>

    <script src="https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js"></script>
    <script src="https://uicdn.toast.com/editor/latest/i18n/ko-kr.min.js"></script>
    <script>
      const POST_ID = ${post ? post.id : 'null'};
      const POST_TYPE = ${raw(JSON.stringify(type))};
      const editor = new toastui.Editor({
        el: document.querySelector('#editor'),
        height: '560px',
        initialEditType: 'wysiwyg',
        previewStyle: 'vertical',
        language: 'ko-KR',
        placeholder: '본문을 입력하세요. 사진은 드래그하거나 붙여넣으면 자동 업로드됩니다.',
        initialValue: '',
        usageStatistics: false,
        toolbarItems: [
          ['heading','bold','italic','strike'],
          ['hr','quote'],
          ['ul','ol','indent','outdent'],
          ['table','image','link'],
          ['code','codeblock'],
          ['scrollSync']
        ],
        hooks: {
          async addImageBlobHook(blob, callback) {
            try {
              if (blob.size > 8 * 1024 * 1024) { toast('이미지는 8MB 이하만 업로드할 수 있습니다', true); return; }
              const fd = new FormData();
              fd.append('file', blob);
              const res = await fetch('/api/admin/upload?key=' + encodeURIComponent(ADMIN_KEY), { method: 'POST', body: fd });
              const j = await res.json();
              if (j.ok) { callback(j.url, blob.name || '이미지'); toast('이미지가 업로드되었습니다'); }
              else toast('업로드 실패: ' + (j.error || ''), true);
            } catch(e) { toast('업로드 중 오류가 발생했습니다', true); }
          }
        }
      });
      ${post ? raw(`editor.setHTML(${JSON.stringify(post.content_html).replace(/</g, '\\u003c')});`) : ''}

      // 본문 이미지에 width/height 자동 주입 — 레이아웃 이동(CLS) 방지
      async function injectImgSizes(htmlStr) {
        const tmp = document.createElement('div'); tmp.innerHTML = htmlStr;
        const imgs = Array.from(tmp.querySelectorAll('img'));
        await Promise.all(imgs.map(img => new Promise((resolve) => {
          if (img.getAttribute('width') && img.getAttribute('height')) return resolve();
          const probe = new Image();
          const done = () => { if (probe.naturalWidth) { img.setAttribute('width', probe.naturalWidth); img.setAttribute('height', probe.naturalHeight); } resolve(); };
          probe.onload = done; probe.onerror = () => resolve();
          probe.src = img.getAttribute('src');
          setTimeout(resolve, 4000);
        })));
        return tmp.innerHTML;
      }

      let saving = false;
      async function save(status) {
        if (saving) return;
        const title = document.getElementById('f-title').value.trim();
        if (!title) { toast('제목을 입력해 주세요', true); document.getElementById('f-title').focus(); return; }
        const contentHtml = await injectImgSizes(editor.getHTML());
        if (status === 'published' && (!contentHtml || contentHtml === '<p><br></p>')) { toast('본문을 입력해 주세요', true); return; }
        saving = true;
        const payload = {
          id: POST_ID,
          type: POST_TYPE,
          title,
          slug: document.getElementById('f-slug').value.trim(),
          excerpt: document.getElementById('f-excerpt').value.trim(),
          content_html: contentHtml,
          category: document.getElementById('f-category') ? document.getElementById('f-category').value : '',
          pinned: document.getElementById('f-pinned') && document.getElementById('f-pinned').checked ? 1 : 0,
          status
        };
        try {
          const j = await api('/api/admin/posts', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
          if (j.ok) {
            toast(status === 'published' ? '발행되었습니다 🎉' : '임시저장되었습니다');
            if (!POST_ID) setTimeout(()=> location.href = '/admin/posts/' + j.id + '/edit?key=' + encodeURIComponent(ADMIN_KEY), 800);
          } else toast('저장 실패: ' + (j.error || ''), true);
        } catch(e) { toast('저장 중 오류가 발생했습니다', true); }
        saving = false;
      }

      // Ctrl+S 저장
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(POST_ID ? (${raw(JSON.stringify(post?.status || 'draft'))} === 'published' ? 'published' : 'draft') : 'draft'); }
      });
    </script>
  `
}

// ------------------------------------------------------------
// 비포애프터 목록 + 등록 폼
// ------------------------------------------------------------
export function AdminCases(rows: DbCase[], adminKey: string) {
  const k = encodeURIComponent(adminKey)
  // 카테고리 = 진료 토픽 기준 (진료↔사례 토픽 허브 자동 연결)
  const CATS = ['임플란트', '충치·신경치료', '심미치료', '교정', '턱관절', '잇몸치료', '보철치료', '발치·사랑니', '예방·검진']
  return html`
    <div class="adm-head">
      <div>
        <h1>비포·애프터 관리</h1>
        <div class="sub">총 ${rows.length}건 · 의료광고법에 따라 After 사진은 사이트에서 블러 처리되며 "회원가입 시 확인 가능" 안내가 표시됩니다.</div>
      </div>
      <button class="btn btn-primary" onclick="openForm()"><i class="fa-solid fa-plus"></i> 새 사례 등록</button>
    </div>

    <!-- 등록/수정 폼 -->
    <div class="card" id="case-form" style="padding:26px;margin-bottom:24px;display:none">
      <h2 style="font-size:1.1rem;font-weight:800;margin-bottom:18px" id="cf-title">새 사례 등록</h2>
      <input type="hidden" id="c-id" />
      <div class="grid-2">
        <div class="form-row">
          <label>사례 제목 <span style="color:#DC2626">*</span></label>
          <input class="inp" id="c-title" placeholder="예: 상악 어금니 임플란트 식립 사례" />
        </div>
        <div class="form-row">
          <label>진료 분류</label>
          <select class="inp" id="c-category">${raw(CATS.map((c) => `<option value="${c}">${c}</option>`).join(''))}</select>
        </div>
      </div>
      <div class="grid-3">
        <div class="form-row"><label>연령대</label><input class="inp" id="c-age" placeholder="예: 50대" /></div>
        <div class="form-row"><label>성별</label><select class="inp" id="c-gender"><option value="">선택 안 함</option><option>남성</option><option>여성</option></select></div>
        <div class="form-row"><label>지역</label><input class="inp" id="c-area" placeholder="예: 마곡동" /></div>
      </div>
      <div class="form-row">
        <label>치료 설명</label>
        <textarea class="inp" id="c-desc" rows="3" placeholder="치료 과정 요약. '치료 결과는 개인차가 있을 수 있습니다' 문구는 페이지에 자동 표시됩니다."></textarea>
      </div>
      <div class="grid-2">
        <div class="form-row">
          <label>Before 사진</label>
          <div class="up-box" onclick="document.getElementById('c-before-file').click()" id="c-before-box"><span class="ph"><i class="fa-solid fa-cloud-arrow-up"></i>클릭해서 업로드</span></div>
          <input type="file" id="c-before-file" accept="image/*" style="display:none" onchange="upCase(this,'before')" />
          <input type="hidden" id="c-before" />
        </div>
        <div class="form-row">
          <label>After 사진 <span style="font-weight:400;color:var(--ink-3)">(사이트에는 블러 처리 노출)</span></label>
          <div class="up-box" onclick="document.getElementById('c-after-file').click()" id="c-after-box"><span class="ph"><i class="fa-solid fa-cloud-arrow-up"></i>클릭해서 업로드</span></div>
          <input type="file" id="c-after-file" accept="image/*" style="display:none" onchange="upCase(this,'after')" />
          <input type="hidden" id="c-after" />
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px">
        <button class="btn" onclick="closeForm()">취소</button>
        <button class="btn" onclick="saveCase('draft')"><i class="fa-regular fa-floppy-disk"></i> 임시저장</button>
        <button class="btn btn-primary" onclick="saveCase('published')"><i class="fa-solid fa-paper-plane"></i> 발행하기</button>
      </div>
    </div>

    <div class="card" style="overflow-x:auto">
      <table style="min-width:820px">
        <thead><tr><th style="width:56px">#</th><th style="width:120px">사진</th><th>제목</th><th style="width:110px">분류</th><th style="width:130px">환자정보</th><th style="width:90px">상태</th><th style="width:170px">작업</th></tr></thead>
        <tbody>
          ${rows.length === 0 ? html`<tr><td colspan="7"><div class="empty"><i class="fa-regular fa-images"></i>등록된 사례가 없습니다.<br/>위 버튼으로 첫 사례를 등록해 보세요.</div></td></tr>` : ''}
          ${raw(
            rows
              .map(
                (c) => `
            <tr>
              <td style="color:var(--ink-3)">${c.id}</td>
              <td>${c.before_img ? `<img src="/media/${esc(c.before_img)}" style="width:84px;height:56px;object-fit:cover;border-radius:8px;border:1px solid var(--line)" />` : '<span style="color:var(--ink-3);font-size:0.8rem">사진 없음</span>'}</td>
              <td style="font-weight:700">${esc(c.title)}</td>
              <td>${esc(c.category)}</td>
              <td style="color:var(--ink-3);font-size:0.84rem">${[c.age_group, c.gender, c.area].filter(Boolean).map(esc).join(' · ') || '-'}</td>
              <td>${c.status === 'published' ? '<span class="badge b-pub">발행됨</span>' : '<span class="badge b-draft">임시저장</span>'}</td>
              <td style="white-space:nowrap">
                <button class="btn btn-sm" onclick='editCase(${JSON.stringify(JSON.stringify(c)).replace(/'/g, '&#39;').replace(/</g, '\\u003c')})'><i class="fa-solid fa-pen"></i> 수정</button>
                <button class="btn btn-sm btn-danger" onclick="delCase(${c.id})"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>`
              )
              .join('')
          )}
        </tbody>
      </table>
    </div>

    <script>
      function openForm(){ document.getElementById('case-form').style.display='block'; window.scrollTo({top:0,behavior:'smooth'}); }
      function closeForm(){ document.getElementById('case-form').style.display='none'; resetForm(); }
      function resetForm(){
        ['c-id','c-title','c-age','c-area','c-desc','c-before','c-after'].forEach(id=>document.getElementById(id).value='');
        document.getElementById('c-gender').value=''; document.getElementById('c-category').selectedIndex=0;
        document.getElementById('c-before-box').innerHTML='<span class="ph"><i class="fa-solid fa-cloud-arrow-up"></i>클릭해서 업로드</span>';
        document.getElementById('c-after-box').innerHTML='<span class="ph"><i class="fa-solid fa-cloud-arrow-up"></i>클릭해서 업로드</span>';
        document.getElementById('cf-title').textContent='새 사례 등록';
      }
      async function upCase(input, which){
        const f = input.files[0]; if(!f) return;
        if (f.size > 8*1024*1024) { toast('이미지는 8MB 이하만 가능합니다', true); return; }
        const box = document.getElementById('c-'+which+'-box');
        box.innerHTML = '<span class="ph"><i class="fa-solid fa-spinner fa-spin"></i>업로드 중...</span>';
        const fd = new FormData(); fd.append('file', f);
        const res = await fetch('/api/admin/upload?key='+encodeURIComponent(ADMIN_KEY), { method:'POST', body: fd });
        const j = await res.json();
        if(j.ok){ document.getElementById('c-'+which).value = j.key; box.innerHTML = '<img src="'+j.url+'" />'; toast('업로드 완료'); }
        else { box.innerHTML='<span class="ph"><i class="fa-solid fa-cloud-arrow-up"></i>클릭해서 업로드</span>'; toast('업로드 실패: '+(j.error||''), true); }
      }
      function editCase(json){
        const c = JSON.parse(json);
        openForm();
        document.getElementById('cf-title').textContent='사례 수정 (#'+c.id+')';
        document.getElementById('c-id').value=c.id;
        document.getElementById('c-title').value=c.title;
        document.getElementById('c-category').value=c.category;
        document.getElementById('c-age').value=c.age_group||'';
        document.getElementById('c-gender').value=c.gender||'';
        document.getElementById('c-area').value=c.area||'';
        document.getElementById('c-desc').value=c.description||'';
        document.getElementById('c-before').value=c.before_img||'';
        document.getElementById('c-after').value=c.after_img||'';
        if(c.before_img) document.getElementById('c-before-box').innerHTML='<img src="/media/'+c.before_img+'" />';
        if(c.after_img) document.getElementById('c-after-box').innerHTML='<img src="/media/'+c.after_img+'" />';
      }
      async function saveCase(status){
        const title = document.getElementById('c-title').value.trim();
        if(!title){ toast('사례 제목을 입력해 주세요', true); return; }
        const payload = {
          id: document.getElementById('c-id').value ? Number(document.getElementById('c-id').value) : null,
          title,
          category: document.getElementById('c-category').value,
          age_group: document.getElementById('c-age').value.trim(),
          gender: document.getElementById('c-gender').value,
          area: document.getElementById('c-area').value.trim(),
          description: document.getElementById('c-desc').value.trim(),
          before_img: document.getElementById('c-before').value,
          after_img: document.getElementById('c-after').value,
          status
        };
        const j = await api('/api/admin/cases', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if(j.ok){ toast(status==='published'?'발행되었습니다 🎉':'임시저장되었습니다'); setTimeout(()=>location.reload(), 700); }
        else toast('저장 실패: '+(j.error||''), true);
      }
      async function delCase(id){
        if(!confirm('정말 삭제하시겠습니까?')) return;
        const j = await api('/api/admin/cases/'+id, { method:'DELETE' });
        if(j.ok){ toast('삭제되었습니다'); setTimeout(()=>location.reload(), 600); } else toast('삭제 실패', true);
      }
    </script>
  `
}

// ------------------------------------------------------------
// 예약 문의 탭 (기존 기능 이식)
// ------------------------------------------------------------
export function AdminReservations(rows: any[], dbError: string, counts: { posts: number; columns: number; cases: number }) {
  const STATUS_LABEL: Record<string, string> = { new: '신규', contacted: '연락완료', done: '예약확정', canceled: '취소' }
  const STATUS_COLOR: Record<string, string> = { new: '#0C5B9D', contacted: '#00B4E5', done: '#16A34A', canceled: '#9CA3AF' }
  const newCnt = rows.filter((r) => r.status === 'new').length
  return html`
    <div class="stat-row">
      <div class="stat"><div class="n">${newCnt}</div><div class="l">신규 예약 문의</div></div>
      <div class="stat"><div class="n">${counts.posts}</div><div class="l">발행된 공지사항</div></div>
      <div class="stat"><div class="n">${counts.columns}</div><div class="l">발행된 칼럼</div></div>
      <div class="stat"><div class="n">${counts.cases}</div><div class="l">발행된 진료사례</div></div>
    </div>

    <div class="adm-head">
      <div><h1>예약 문의 관리</h1><div class="sub">총 ${rows.length}건 (최근 200건)</div></div>
    </div>
    ${dbError ? html`<div class="card" style="padding:18px;margin-bottom:18px;color:#DC2626"><i class="fa-solid fa-triangle-exclamation"></i> ${dbError}</div>` : ''}
    <div class="card" style="overflow-x:auto">
      <table style="min-width:760px">
        <thead><tr><th>#</th><th>접수일시</th><th>이름</th><th>연락처</th><th>희망 진료</th><th>문의 내용</th><th>상태</th></tr></thead>
        <tbody>
          ${rows.length === 0 && !dbError ? html`<tr><td colspan="7"><div class="empty"><i class="fa-regular fa-calendar"></i>아직 접수된 예약 문의가 없습니다.</div></td></tr>` : ''}
          ${raw(
            rows
              .map(
                (r: any) => `
            <tr>
              <td style="color:var(--ink-3)">${r.id}</td>
              <td style="white-space:nowrap">${esc(r.created_at)}</td>
              <td style="font-weight:700">${esc(r.name)}</td>
              <td><a href="tel:${esc(r.phone)}" style="color:var(--brand);font-weight:600">${esc(r.phone)}</a></td>
              <td>${esc(r.treatment || '-')}</td>
              <td style="max-width:280px">${esc(r.message || '-')}</td>
              <td>
                <select onchange="updateStatus(${r.id}, this.value)" style="padding:6px 10px;border-radius:8px;border:1px solid var(--line);font-weight:600;font-family:inherit;color:${STATUS_COLOR[r.status] || '#333'}">
                  ${['new', 'contacted', 'done', 'canceled'].map((s) => `<option value="${s}" ${r.status === s ? 'selected' : ''}>${STATUS_LABEL[s]}</option>`).join('')}
                </select>
              </td>
            </tr>`
              )
              .join('')
          )}
        </tbody>
      </table>
    </div>
    <script>
      async function updateStatus(id, status) {
        const j = await api('/api/admin/reservation/' + id + '/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
        if (j.ok) toast('상태가 변경되었습니다'); else toast('상태 변경 실패: ' + (j.error || ''), true);
      }
    </script>
  `
}
