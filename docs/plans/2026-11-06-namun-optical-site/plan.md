---
title: "남문안경 공식 홈페이지 (SEO/GEO 정적 사이트)"
status: in-progress
created: 2026-11-06
size: large
---

## 요구사항

스펙: `docs/specs/2026-11-06-namun-optical-site.md` (승인 2026-11-06)

- 매장 사실은 스펙 R1 표가 원천. `src/data/store.ts` 한 곳에만 둔다 `[confirmed: 사용자/네이버 플레이스]`
- 대표 브랜드는 "등 다수" 표기 필수 `[confirmed: 사용자 "이것만 있다는 식으로 하지 마"]`
- 매장 소유 이미지 사용 승인 `[confirmed: 사용자]` — 고객 블로그 사진은 범위 밖
- 도메인 미정 → `SITE_URL` 은 설정값 하나(`astro.config.mjs` `site`)로 두고 2026-11-23 `https://nammunoptical.com` 확정 `[confirmed: 사용자]`
- 자격 인벤토리: 로컬 파일 쓰기·npm 설치 가능 / GitHub 원격·도메인·서치콘솔·GTM 계정 없음 → 배포 워크플로 파일만 작성, 실제 배포 안 함

## 결정

- 영업시간: "09:30–20:00" 만 확인, 요일·휴무 미확인 → 본문엔 "09:30–20:00 (휴무일은 전화 확인)", JSON-LD `openingHoursSpecification` 은 `store.hours.days` 가 확인되기 전까지 출력하지 않음 (스펙 R1 규칙, P1 기본값 — 사용자에게 재확인)
- "10,000원부터" 대상 품목 미확인 → "안경 10,000원부터" 로만 표기, `priceRange: "₩10,000~"`
- 기술 스택: Astro `7.4.2` 고정(2주 이상 경과 버전), `@astrojs/sitemap 3.7.4`, `@astrojs/rss 4.0.19`. 폰트는 Pretendard CDN(jsdelivr, 버전 고정) — P3 자율
- 스톡 사진: 라이선스 검증 비용 대비 효과 낮음 → 1차는 선형 SVG 일러스트 + 매장 사진(플레이스 업체 사진, 거리뷰)으로 구성, 실사 슬롯 교체 가능 구조 — P2

## 구현 계획

1. **스캐폴드** — `package.json`, `astro.config.mjs`(site, trailingSlash: always, sitemap), `tsconfig.json`, `.gitignore`
2. **데이터 SSOT** — `src/data/store.ts`(R1), `src/data/faq.ts`, `src/data/services.ts`, `src/lib/schema.ts`(Optician/WebSite/Breadcrumb/FAQPage/Article/Person JSON-LD 생성, null 필드 생략)
3. **디자인 시스템** — `src/styles/global.css`(토큰: 화이트/웜그레이/딥그린, 17px 본문, 모바일 우선), `layouts/Base.astro`(head 메타·OG·canonical·JSON-LD, 헤더, 푸터, 모바일 하단 고정 바)
4. **컴포넌트** — Hero, FactBlock, ServiceCards, ExamSteps, BrandList, ReviewKeywords, LocationBlock, FaqList, Breadcrumbs, GuideCard
5. **페이지** — `/`, `/about/`, `/services/{eye-exam,progressive,kids,contact-lens,sunglasses}/`, `/brands/`, `/location/`, `/faq/`, `/guide/` + 8편, `404`
6. **가이드 콘텐츠 8편** — `src/content/guide/*.md`, 일반 지식 조사 후 출처 frontmatter `sources[]` 로 하단 표기
7. **GEO 부가물** — `llms.txt`(store.ts 로 생성하는 endpoint), `robots.txt`, `rss.xml`(가이드)
8. **이미지** — 플레이스 업체 사진·거리뷰 다운로드 → `public/images/`, SVG 일러스트, favicon, OG 이미지
9. **검증 스크립트** — `scripts/audit_site.py`(scanday 이식 + NAP 정합 검사: 모든 HTML 의 전화/주소 문자열이 store.ts 값과 일치, 브랜드 문구에 "등"/"다수" 동반)
10. **배포 워크플로** — `.github/workflows/deploy.yml`(GitHub Pages, build → audit → deploy), README

## 완료 조건

- `npm ci` 또는 `npm install` (exit 0)
- `npm run build` (exit 0)
- `python3 scripts/audit_site.py dist` (exit 0) — 링크/앵커, h1=1, canonical, title·description 고유, JSON-LD 파싱, img alt, sitemap↔페이지, NAP 정합, 브랜드 "등" 표기, 금지 표현(최고/1위/No.1) 0건
- 수동 attest: 390px·데스크톱 스크린샷 확인

## 검증 결과

실행일 2026-11-06 (fresh run)

| 명령 | rc |
|---|---|
| `npm install --no-audit --no-fund` | 0 |
| `npm run build` (21 pages) | 0 |
| `python3 scripts/audit_site.py dist` → `[audit] PASS` | 0 |
| checklist `status` (C1–C3 passes) | 0 |

- 감사 스크립트 음성 테스트: 위반 7종(목록 단위 브랜드 나열·"등록" 오인·meta 금지어·Disallow /·영업시간 불일치·noindex canonical·다른 전화번호) 주입 → 7건 모두 FAIL 로 검출(rc 1)
- 반응형: 320·390px 에서 7개 페이지 가로 넘침 0 (lens-index 표는 표 내부 가로 스크롤 — 의도)
- T-security: Critical/High/Medium 0, Low 5 → L-2(권한 job 분리)·L-3(폰트 self-host)·L-4(iframe referrer) 반영, L-1(액션 SHA 고정)·L-5(noreferrer) 미반영
- T-review 1차(2 배치): CONDITIONAL — HIGH 6(미확인 사실 단정·실명 바이라인·founder 등) → 수정
- T-review 2차(재확인): CONDITIONAL — HIGH 6 중 3 완전 해소, 표현만 바뀐 잔존 4건 지적 → 수정 후 title·description·FAQPage·llms.txt 문장 단위 육안 확인
- **미충족**: 2차 수정분에 대한 3차 독립 리뷰는 돌리지 않음 → 판정 기준([ACCEPT]) 형식상 미충족
- 운영자 확인 대기(스펙 미결 1–9) 항목이 남아 status 는 in-progress 유지

### 2026-11-09 운영자 확인 반영

- 스펙 "운영자 확인 (2026-11-09)" 표 1–9 반영. `npm run build` rc 0, `python3 scripts/audit_site.py dist` PASS rc 0, 320px 5개 페이지 가로 넘침 0
- 남은 확인: 선글라스 브랜드(7), "1만원부터" 기준 품목(8) — 대기

### 2026-11-23 운영자 확인 반영

- 스펙 "운영자 확인 (2026-11-23)" 반영(선글라스·가격·우편번호·주차·결제·콘택트렌즈·검사 시간·A/S·경력·직원). 감사 스크립트 브랜드 검사 그룹에 sunglasses·contactLenses 추가
- `npm run build` rc 0, `python3 scripts/audit_site.py dist` PASS rc 0
- 남은 것: 실사 사진 보강, 지번(667-9 vs 667-12) 확인, 3차 리뷰, 보안 L-1/L-5, 배포 관련 후속
- 2026-11-23 후속: 지번 667-9·우편번호 14711 운영자 확정(네이버 플레이스와 일치), 블로그 매장 사진 9장 반영(/gallery/), 보안 L-1(액션 SHA 고정) 해소, 공개·GA4·GSC·Bing 완료. 남은 것: 네이버 소유확인(CAPTCHA)·다음 인증(PIN), 3차 리뷰, L-5

### 2026-11-24 3차 독립 리뷰 반영

- 3차 리뷰: CONDITIONAL (HIGH 0 · MEDIUM 4 · LOW 10) → 전부 반영
  - 사진 촬영연도 표기(2019 외관), 옛 간판 사진의 '이 간판을 찾아오세요' 제거
  - 같은 의미 FAQ 의 FAQPage 중복 제거(`QA.schema=false`), 누진 적응 기간 2~3주로 통일
  - 가이드 md 꼬리말 매장 리터럴 제거 → `guide/[slug].astro` 매장 안내 박스(store.ts) + 감사 스크립트 검사(음성 테스트 검출 확인)
  - 조사 `phoneEuro`, 어린아이, 문장 다듬기, llms 괄호, 서비스 description 콘택트렌즈 '등', 클리어원데이 설명, 가격 카드 스크린리더
- 보안 L-5: target=_blank 에 noopener noreferrer + 감사 검사
- `npm run build` rc 0, `audit_site.py` PASS, 390px 가로 넘침 0
