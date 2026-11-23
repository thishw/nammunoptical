/** 사이트 운영 설정 — 도메인 확정 후 채운다(현재 null 이면 출력하지 않음). */
export const siteConfig = {
  // GTM 컨테이너 nammunoptical.com (thishw.op@gmail.com). GA4 G-4EF3MVLQYH 는 GTM 안의 Google 태그로 로드 — 사이트에 gtag 를 따로 넣지 않는다(중복 수집).
  gtmId: 'GTM-WP3P69JF' as string | null,
  naverSiteVerification: null as string | null,
  googleSiteVerification: null as string | null,
};

export const nav = [
  { href: '/services/eye-exam/', label: '시력검사' },
  { href: '/services/', label: '서비스' },
  { href: '/brands/', label: '브랜드' },
  { href: '/guide/', label: '안경 가이드' },
  { href: '/about/', label: '소개' },
  { href: '/location/', label: '오시는 길' },
  { href: '/faq/', label: 'FAQ' },
];
