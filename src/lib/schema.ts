/**
 * store.ts → schema.org JSON-LD. 값이 null 인 필드는 출력하지 않는다.
 * 리뷰 평점(AggregateRating)은 넣지 않는다 — 매장이 직접 게재한 리뷰 마크업은 구글 정책상 부적격.
 */
import { store, walkText, yearsInBusiness, aftercareText } from '../data/store';
import type { QA } from '../data/services';

export const abs = (site: URL | string, path = '/') => new URL(path, site).toString();

const ids = (site: URL | string) => ({
  business: abs(site, '/#optician'),
  website: abs(site, '/#website'),
  person: abs(site, '/about/#optician-kim'),
});

export function opticianSchema(site: URL | string, image: string) {
  const id = ids(site);
  const hours = store.hours.days
    ? {
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: store.hours.days,
            opens: store.hours.opens,
            closes: store.hours.closes,
          },
        ],
      }
    : {};
  return {
    '@type': 'Optician',
    '@id': id.business,
    name: store.name,
    alternateName: store.alternateName,
    url: abs(site, '/'),
    image,
    telephone: store.phoneIntl,
    foundingDate: String(store.founded),
    ...(store.optician.isFounder ? { founder: { '@id': id.person } } : {}),
    employee: { '@id': id.person },
    ...(store.priceFrom ? { priceRange: `₩${store.priceFrom.toLocaleString('ko-KR')}~` } : {}),
    paymentAccepted: store.payment.join(', '),
    currenciesAccepted: 'KRW',
    description: `${store.name}은 ${store.founded}년 개업 후 ${yearsInBusiness()}년 동안 같은 자리를 지켜 온 부천역 남부광장 앞 안경원입니다. 개업 때부터 ${store.optician.role} ${store.optician.name}이 운영하며, 자동굴절검사기와 양안시 검사로 시력을 측정해 안경·누진다초점·선글라스를 맞추고 콘택트렌즈를 판매합니다. ${aftercareText}. ${store.hours.opens}–${store.hours.closes} ${store.hours.note} 영업, ${walkText}, ${store.landmark}에 있습니다.`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address.street,
      addressLocality: `${store.address.locality} ${store.address.district}`,
      addressRegion: store.address.region,
      ...(store.address.postalCode ? { postalCode: store.address.postalCode } : {}),
      addressCountry: 'KR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: store.geo.lat, longitude: store.geo.lng },
    hasMap: store.links.naverPlace,
    sameAs: [store.links.naverPlace, store.links.naverBlog],
    areaServed: [
      { '@type': 'City', name: '부천시' },
      { '@type': 'AdministrativeArea', name: '부천시 소사구' },
      { '@type': 'AdministrativeArea', name: '심곡본동' },
      { '@type': 'Place', name: '부천역' },
    ],
    amenityFeature: [{ '@type': 'LocationFeatureSpecification', name: '주차', value: store.parking.available }],
    knowsAbout: ['시력검사', '양안시 검사', '안경 피팅', '안경 렌즈', '누진다초점 렌즈', '선글라스', '콘택트렌즈'],
    ...hours,
  };
}

export function websiteSchema(site: URL | string) {
  const id = ids(site);
  return {
    '@type': 'WebSite',
    '@id': id.website,
    url: abs(site, '/'),
    name: `${store.name} 공식 홈페이지`,
    inLanguage: 'ko-KR',
    publisher: { '@id': id.business },
  };
}

export function personSchema(site: URL | string) {
  const id = ids(site);
  return {
    '@type': 'Person',
    '@id': id.person,
    name: store.optician.name,
    jobTitle: store.optician.role,
    description: `${store.founded}년 ${store.name}을 개업해 운영해 온 경력 ${store.optician.careerYears}년 이상의 안경사.`,
    worksFor: { '@id': id.business },
  };
}

export function breadcrumbSchema(site: URL | string, crumbs: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(site, c.path),
    })),
  };
}

export function faqSchema(items: QA[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.filter((f) => f.schema !== false).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function articleSchema(
  site: URL | string,
  a: { title: string; description: string; path: string; published: Date; updated: Date; image: string },
) {
  const id = ids(site);
  return {
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    mainEntityOfPage: abs(site, a.path),
    datePublished: a.published.toISOString().slice(0, 10),
    dateModified: a.updated.toISOString().slice(0, 10),
    inLanguage: 'ko-KR',
    image: a.image,
    author: { '@id': id.business },
    publisher: { '@id': id.business },
  };
}

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
