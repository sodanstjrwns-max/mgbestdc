import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { computeContentDates } from './scripts/content-dates.mjs'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

// 정적 자산 캐시버스팅: 파일 내용 해시를 ?v= 로 (고정 ?v=1 로 라이브 디자인이 깨졌던 교훈 — 2026-10)
const assetHash = (p: string) => createHash('sha256').update(readFileSync(new URL(p, import.meta.url))).digest('hex').slice(0, 10)

export default defineConfig({
  define: {
    // 사이트맵 lastmod = 콘텐츠 실제 수정 커밋 날짜 (폴백 src/data/content-dates.fallback.json)
    __CONTENT_DATES__: JSON.stringify(computeContentDates()),
    // 메인 스크롤 몰입 연출 (public/static/immersive.*)
    __PM_VER__: JSON.stringify({ js: assetHash('./public/static/immersive.js'), css: assetHash('./public/static/immersive.css') }),
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
