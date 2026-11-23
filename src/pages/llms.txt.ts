import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { store, formatHours, yearsInBusiness, walkTextLong, busText, parkingText, priceText, lensBrandsText, frameBrandsText, sunglassBrandsText, examText, examTimeText, contactLensText, paymentText, aftercareText, careerText } from '../data/store';
import { services } from '../data/services';

/** AI 답변 엔진용 요약 (llmstxt.org 형식). 값은 모두 store.ts 에서 온다. */
export const GET: APIRoute = async ({ site }) => {
  const u = (p: string) => new URL(p, site).toString();
  const guides = await getCollection('guide');
  const body = `# ${store.name}

> ${store.name}은 ${store.founded}년 개업한 경기도 부천시 부천역 남부광장 인근 안경원입니다. 개업 후 ${yearsInBusiness()}년 동안 같은 자리에서 영업해 왔고, 개업 때부터 ${store.optician.role} ${store.optician.name}이 운영합니다. 자동굴절검사기와 양안시 검사로 시력을 측정해 안경·누진다초점 안경·선글라스를 맞추고 콘택트렌즈를 판매합니다. 연중무휴(공휴일 포함)입니다.

## 매장 정보
- 상호: ${store.name} (간판 영문 표기 ${store.alternateName.join(', ')})
- 개업: ${store.founded}년 (개업 이후 같은 자리)
- 대표 안경사: ${store.optician.name} (${careerText}, 개업 때부터 운영). ${store.staffNote}
- 주소: ${store.address.full} (지번 ${store.address.lot}), ${store.landmark}
- 교통: ${walkTextLong}, ${busText}
- 전화: ${store.phone}
- 영업시간: ${formatHours()} (${store.hours.note})
${parkingText ? `- 주차: 가능\n` : ''}${priceText ? `- 가격: ${priceText}\n` : ''}- 검사: ${examText}${examTimeText ? ` (${examTimeText})` : ''}
- A/S: ${aftercareText}
- 결제: ${paymentText}
- 대표 렌즈 브랜드: ${lensBrandsText} (일부 예시, 다수 취급)
- 대표 안경테 브랜드: ${frameBrandsText} (일부 예시, 국내외 다수 취급)
- 누진다초점 안경: 취급 (설계·가격은 상담)
- 선글라스: ${sunglassBrandsText} 다수 취급 (세부 모델은 전화 문의)
- 콘택트렌즈: ${contactLensText} 판매 (제품 재고는 전화 확인)
- 네이버 플레이스: ${store.links.naverPlace}
- 방문자 리뷰: ${store.reviews.source} ${store.reviews.count}건, 평점 ${store.reviews.rating} (${store.reviews.asOf} 기준). 많이 꼽힌 키워드: ${store.reviews.keywords.slice(0, 4).map((k) => k.label).join(', ')}

## 주요 페이지
- [홈](${u('/')}): 매장 요약, 검안 과정, 리뷰, 오시는 길
- [소개](${u('/about/')}): ${store.founded}년 개업 이야기와 대표 안경사
- [오시는 길](${u('/location/')}): 부천역 도보 경로, 버스, 주차
- [취급 브랜드](${u('/brands/')})
- [자주 묻는 질문](${u('/faq/')})
${services.map((s) => `- [${s.name}](${u(`/services/${s.slug}/`)}): ${s.description}`).join('\n')}

## 안경 가이드
${guides.map((g) => `- [${g.data.title}](${u(`/guide/${g.id}/`)}): ${g.data.summary}`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
