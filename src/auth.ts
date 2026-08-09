// ============================================================
// 회원 인증 — Web Crypto 기반 (Cloudflare Workers 호환)
// PBKDF2-SHA256 비밀번호 해시 + HMAC 서명 세션 쿠키
// ============================================================

const SESSION_COOKIE = 'mb_session'
const SESSION_TTL = 60 * 60 * 24 * 30 // 30일
const DEFAULT_SESSION_SECRET = 'magok-dev-session-secret' // prod는 SESSION_SECRET 시크릿 사용

const enc = new TextEncoder()

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  [...new Uint8Array(buf as ArrayBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('')

const fromHex = (hex: string) => new Uint8Array((hex.match(/.{2}/g) || []).map((h) => parseInt(h, 16)))

// ---------- 비밀번호 해시 (PBKDF2-SHA256, 100k iterations) ----------
export async function hashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  )
  return { hash: toHex(bits), salt: toHex(salt) }
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const { hash } = await hashPassword(password, salt)
  // 상수 시간 비교
  if (hash.length !== expectedHash.length) return false
  let diff = 0
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  return diff === 0
}

// ---------- 세션 토큰: base64(payload).hex(hmac) ----------
async function hmacKey(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function createSessionToken(memberId: number, email: string, name: string, secret: string): Promise<string> {
  const payload = JSON.stringify({ id: memberId, email, name, exp: Math.floor(Date.now() / 1000) + SESSION_TTL })
  const b64 = btoa(unescape(encodeURIComponent(payload)))
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(b64))
  return `${b64}.${toHex(sig)}`
}

export type SessionUser = { id: number; email: string; name: string }

export async function verifySessionToken(token: string, secret: string): Promise<SessionUser | null> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot < 0) return null
    const b64 = token.slice(0, dot)
    const sigHex = token.slice(dot + 1)
    const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), fromHex(sigHex), enc.encode(b64))
    if (!ok) return null
    const payload = JSON.parse(decodeURIComponent(escape(atob(b64))))
    if (!payload?.id || !payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return { id: payload.id, email: payload.email || '', name: payload.name || '' }
  } catch {
    return null
  }
}

// ---------- Hono 컨텍스트 헬퍼 ----------
export function sessionSecret(c: any): string {
  return c.env?.SESSION_SECRET || DEFAULT_SESSION_SECRET
}

export async function getSessionUser(c: any): Promise<SessionUser | null> {
  const cookie = c.req.header('Cookie') || ''
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`))
  if (!m) return null
  return verifySessionToken(decodeURIComponent(m[1]), sessionSecret(c))
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_TTL}; HttpOnly; Secure; SameSite=Lax`
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
}

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)
