import { store, formatHours, lensBrandsText, frameBrandsText, sunglassBrandsText, examText, examTimeText, parkingText, priceText, contactLensText, paymentText, aftercareText, careerText } from './store';
import type { QA } from './services';

/** 매장 공통 FAQ — 본문과 FAQPage JSON-LD 가 같은 배열을 쓴다. */
export const storeFaq: QA[] = [
  {
    q: '남문안경은 어디에 있나요?',
    a: `${store.address.full}(${store.address.lot})에 있습니다. ${store.transit.subway.station} ${store.transit.subway.exit}에서 걸어서 약 ${store.transit.subway.walkMin}분, ${store.landmark}입니다.`,
  },
  {
    q: '영업시간은 어떻게 되나요?',
    a: `매일 ${formatHours()}에 운영합니다. 쉬는 날 없이 공휴일에도 문을 엽니다.`,
  },
  {
    q: '공휴일이나 명절에도 문을 여나요?',
    a: `네, 남문안경은 연중무휴로 공휴일에도 ${formatHours()}에 운영합니다.`,
  },
  ...(parkingText
    ? [{ q: '주차할 수 있나요?', a: '네, 주차가 가능합니다.' }]
    : []),
  ...(priceText
    ? [{ q: '안경 가격은 얼마부터인가요?', a: `${priceText} 있습니다. 테와 렌즈 종류, 도수에 따라 가격이 달라지므로 매장에서 예산에 맞춰 안내해 드립니다.` }]
    : []),
  {
    q: '어떤 결제 수단을 쓸 수 있나요?',
    a: `${paymentText} 모두 가능합니다.`,
  },
  {
    q: '어떤 브랜드를 취급하나요?',
    a: `대표적으로 렌즈는 ${lensBrandsText}, 안경테는 ${frameBrandsText} 국내외 여러 브랜드를 갖추고 있습니다. 선글라스는 ${sunglassBrandsText}, 콘택트렌즈는 ${contactLensText}을 판매합니다. 세부 모델과 재고는 방문 전 ${store.phone}로 문의해 주세요.`,
  },
  {
    q: '시력검사는 어떻게 하나요?',
    a: `${examText.split(' · ')[0]}로 굴절 상태를 측정하고, 교정시력 확인과 양안시 검사를 거쳐 처방값을 정합니다.${examTimeText ? ` ${examTimeText}.` : ''} ${store.founded}년 개업 때부터 ${careerText}의 ${store.optician.name} 대표 안경사가 운영하고 있습니다.`,
  },
  {
    q: '안경 A/S는 어떻게 되나요?',
    a: `남문안경에서 맞춘 안경은 ${aftercareText}입니다. 착용하다 불편하면 안경을 가지고 들러 주세요.`,
  },
  {
    q: '다른 곳에서 산 안경도 수리나 피팅을 받을 수 있나요?',
    a: '안경을 가지고 오시면 상태를 보고 피팅·수리 가능 여부를 안내해 드립니다. 부품이 필요한 수리는 테에 따라 가능 여부가 다릅니다.',
  },
  {
    q: '방문 전에 연락해야 하나요?',
    a: `방문 시간을 맞추거나 대기 없이 상담받고 싶으시면 방문 전 ${store.phone}로 전화해 주세요.`,
  },
];
