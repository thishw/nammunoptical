# Feedback Ledger

> 자동 생성 (Spec 3 / W-007). validation·review에서 잡힌 결함 패턴 누적.
> 상한 50개, frequency·recency 기준 감쇠. 수동 편집 가능하나 형식 유지 필요.

| id | category | pattern | frequency | last_seen | severity |
| -- | -------- | ------- | --------- | --------- | -------- |
| F-001 | convention | 미확인 매장 사실(취급 품목·창업자·같은 자리)을 본문·FAQPage·JSON-LD·llms.txt에 단정 — 운영자 확인값만 출력, 나머지는 '전화 확인' | 1 | 2026-11-06 | high |
| F-002 | convention | 매장 사실 리터럴(전화·도보분·주차)을 SSOT 밖에 하드코딩 — 파생 문구 헬퍼로만 출력 | 1 | 2026-11-06 | medium |
| F-003 | architecture | 같은 FAQ를 여러 페이지에 FAQPage로 중복 마크업 — 겹치지 않게 한 곳만 | 1 | 2026-11-06 | medium |
| F-004 | test | 감사 스크립트가 목록 단위 브랜드 나열·meta/JSON-LD 금지어·영업시간을 놓침 — 블록+컨테이너, 전 출력면 검사 | 1 | 2026-11-06 | medium |
| F-005 | convention | aria-labelledby 에 공백 포함 id 사용 — 고정 slug id | 1 | 2026-11-06 | low |
