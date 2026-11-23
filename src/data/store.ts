/**
 * 남문안경 매장 사실 — 단일 소스(SSOT).
 * 본문·JSON-LD·푸터·llms.txt 가 모두 이 파일에서 값을 읽는다.
 * 확인되지 않은 값은 null 로 두면 화면과 구조화 데이터 어디에도 출력되지 않는다.
 * 출처: docs/specs/2026-11-06-namun-optical-site.md R1
 */

export const store = {
  name: '남문안경',
  alternateName: ['NAMMUN'], // 간판 영문 표기 (2019 매장 사진)
  founded: 1988,
  sameLocationSinceFounding: true, // 운영자 확인 2026-11-09: 개업 때부터 지금 자리
  optician: {
    name: '김용진',
    role: '대표 안경사',
    isFounder: true, // 운영자 확인 2026-11-09: 1988년 개업 때부터 운영
    careerYears: 40, // 운영자 확인 2026-11-23: 경력 40년 이상 → 화면엔 "40년 이상"
  },
  // 운영자 확인 2026-11-23: 대표 외에 젊은 감각의 직원들이 함께 근무
  staffNote: '젊은 감각의 직원들이 함께합니다',
  phone: '032-654-9540',
  phoneIntl: '+82-32-654-9540',
  address: {
    full: '경기도 부천시 소사구 경인로 212-1',
    short: '부천시 소사구 경인로 212-1',
    lot: '심곡본동 667-9',
    region: '경기도',
    locality: '부천시',
    district: '소사구',
    street: '경인로 212-1',
    postalCode: '14711' as string | null, // 도로명주소 조회(juso) 2026-11-23
  },
  geo: { lat: 37.4831924, lng: 126.7789727 },
  landmark: '부천자유시장 맞은편',
  hours: {
    // 운영자 확인 2026-11-09: 09:30–20:00, 연중무휴(공휴일 포함).
    // days 가 null 이면 JSON-LD openingHoursSpecification 을 출력하지 않는다.
    opens: '09:30',
    closes: '20:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as null | Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>,
    note: '연중무휴 (공휴일 포함)',
  },
  parking: { available: true, note: '주차 가능' }, // 운영자 확인 2026-11-23
  // 운영자 확인 2026-11-23: 안경테 기준이지만 화면엔 세부 조건 없이 "10,000원부터"만 노출(운영자 요청)
  priceFrom: 10000 as number | null,
  payment: ['카드', '현금영수증', '지역화폐(부천페이)', '제로페이'], // 운영자 확인 2026-11-23
  exam: ['자동굴절검사기', '양안시 검사'],
  examMinutes: '10~15분' as string | null, // 운영자 확인 2026-11-23: 검사 소요 시간
  aftercare: {
    // 운영자 확인 2026-11-23
    freeYears: 1, // 구입 후 1년 이내 무상 A/S
    lifetimeFree: ['피팅', '코받침 교체'],
  },
  brands: {
    // 대표 예시일 뿐 전체 목록이 아니다 — 화면에는 항상 "등 다수"를 함께 표기한다.
    lenses: [
      { name: 'ZEISS', ko: '자이스' },
      { name: 'HOYA', ko: '호야' },
      { name: 'SHOWA', ko: '쇼와' },
    ],
    frames: [
      { name: 'Salvatore Ferragamo', ko: '페레가모' },
      { name: 'Oakley', ko: '오클리' },
      { name: 'CAZAL', ko: '카잘' },
    ],
    // 운영자 확인 2026-11-23: 선글라스도 카잘·오클리·페레가모 등. 세부 모델은 전화 문의
    sunglasses: [
      { name: 'CAZAL', ko: '카잘' },
      { name: 'Oakley', ko: '오클리' },
      { name: 'Salvatore Ferragamo', ko: '페레가모' },
    ],
    // 운영자 확인 2026-11-23: 아큐브, 클리어원데이 등
    contactLenses: [
      { name: 'ACUVUE', ko: '아큐브' },
      { name: '클리어원데이', ko: '클리어원데이' },
    ],
  },
  transit: {
    subway: { station: '부천역', line: '수도권 전철 1호선', exit: '2번 출구', walkMin: 6, meters: 352 },
    bus: [
      { stop: '부천자유시장.심곡본1동행정복지센터', walkMin: 1, meters: 43 },
      { stop: '부천역남부광장', walkMin: 3, meters: 206 },
    ],
  },
  links: {
    naverPlace: 'https://map.naver.com/p/entry/place/15008513',
    naverPlaceMobile: 'https://m.place.naver.com/place/15008513/home',
    // 네이버 플레이스가 제공하는 길찾기 링크 원문 (place 데이터 routeUrl)
    naverDirections:
      'https://m.search.naver.com/search.naver?where=m&query=%EB%B9%A0%EB%A5%B8%EA%B8%B8%EC%B0%BE%EA%B8%B0&nso_path=placeType%5Eplace%3Bname%5E%3Baddress%5E%3Blatitude%5E%3Blongitude%5E%3Bcode%5E%7Ctype%5Eplace%3Bname%5E%EB%82%A8%EB%AC%B8%EC%95%88%EA%B2%BD%3Baddress%5E%3Bcode%5E15008513%3Blongitude%5E126.7789727%3Blatitude%5E37.4831924%7Cobjtype%5Epath%3Bby%5Epubtrans',
    naverBlog: 'https://blog.naver.com/southgate-',
    kakaoMap: 'https://map.kakao.com/link/map/%EB%82%A8%EB%AC%B8%EC%95%88%EA%B2%BD,37.4831924,126.7789727',
  },
  reviews: {
    source: '네이버 플레이스 방문자 리뷰',
    asOf: '2026-11-06',
    count: 178,
    rating: 4.52,
    keywords: [
      { label: '상품이 다양해요', count: 49 },
      { label: '친절해요', count: 46 },
      { label: '설명이 자세해요', count: 24 },
      { label: '가격이 합리적이에요', count: 24 },
      { label: '검안이 꼼꼼해요', count: 10 },
      { label: '추천을 잘해줘요', count: 10 }, // 네이버 플레이스 2026-11-06 수집
      { label: 'A/S가 세심해요', count: 9 },
    ],
    quotes: [
      { text: '15년 단골입니다. 항상 친절하시고 설명도 잘해주셔서 어머니 안경 맞춰드릴 때면 고민 없이 여길 가요.', date: '2025-10-04' },
      { text: '저희 가족 모두 남문에서 하고 있어요. 아빠가 안경 맞추고 왔어요.', date: '2025-11-20' },
      { text: '좋아요. 서울로 이사 가도 여기로 와요. 추천!', date: '2024-09-21' },
    ],
  },
} as const;

/** 개업 후 경과 연수 — 한국 시간 기준. ("개업 N년" 으로 표기, 서수 "N년째" 는 쓰지 않는다) */
export const yearsInBusiness = (now = new Date()) =>
  Number(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Seoul', year: 'numeric' }).format(now)) - store.founded;

/** 화면용 파생 문구 — 모든 페이지가 이 값을 쓴다(하드코딩 금지). */
const sub = store.transit.subway;
export const walkText = `${sub.station} ${sub.exit} 도보 약 ${sub.walkMin}분`;
export const walkTextLong = `${sub.line.replace('수도권 전철 ', '')} ${sub.station} ${sub.exit}에서 걸어서 약 ${sub.walkMin}분(${sub.meters}m)`;
export const nearestBus = store.transit.bus[0];
export const busText = `${nearestBus.stop} 정류장 도보 ${nearestBus.walkMin}분`;
export const parkingText = store.parking.available ? '주차 가능' : null;
export const priceText = store.priceFrom ? `${store.priceFrom.toLocaleString('ko-KR')}원부터` : null;

export const formatHours = () => `${store.hours.opens}–${store.hours.closes}`;

export const telHref = `tel:${store.phone.replace(/-/g, '')}`;

export const brandLine = (list: readonly { name: string; ko: string }[], sep = ' · ') =>
  `${list.map((b) => b.ko).join(sep)} 등`;

/** 브랜드·검사 표시 문구 — 화면 어디서든 이것만 쓴다. */
export const lensBrandsText = brandLine(store.brands.lenses, '·');
export const frameBrandsText = brandLine(store.brands.frames, '·');
export const sunglassBrandsText = brandLine(store.brands.sunglasses, '·');
export const contactLensText = brandLine(store.brands.contactLenses, '·');
export const examText = store.exam.join(' · ');
export const examTimeText = store.examMinutes ? `시력검사는 보통 ${store.examMinutes} 걸립니다` : null;
export const paymentText = store.payment.join(' · ');
export const careerText = `경력 ${store.optician.careerYears}년 이상`;
const ac = store.aftercare;
export const aftercareText = `구입 후 ${ac.freeYears}년 이내 무상 A/S, ${ac.lifetimeFree.join('·')}는 평생 무료`;
/** 진행 중 취급 품목 (운영자 확인). 아동 근시관리 렌즈는 사용자 요청으로 미노출. */
export const offerings = { progressive: true, contactLenses: true, myopiaControl: false } as const;
