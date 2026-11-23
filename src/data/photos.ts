/**
 * 매장 사진 — 단일 목록. 갤러리(/gallery/)와 각 페이지가 key 로 골라 쓴다.
 * 출처: 남문안경 블로그(blog.naver.com/lbjckorea/220856198177, 2016-11-25 촬영) — 운영자 사용 승인 2026-11-23.
 *       storefront: 네이버 플레이스 업체 사진(2019) · streetview: 네이버 거리뷰.
 * 촬영 시점이 있는 사진은 화면에 연도를 함께 적는다(지금 모습과 다를 수 있음).
 */
import type { ImageMetadata } from 'astro';
import frontSign from '../assets/photos/store/front-sign.jpg';
import frontWindow from '../assets/photos/store/front-window.jpg';
import signVertical from '../assets/photos/store/sign-vertical.jpg';
import interiorWide from '../assets/photos/store/interior-wide.jpg';
import displayWall from '../assets/photos/store/display-wall.jpg';
import displayCounter from '../assets/photos/store/display-counter.jpg';
import framesTable from '../assets/photos/store/frames-table.jpg';
import lounge from '../assets/photos/store/lounge.jpg';
import cleaner from '../assets/photos/store/cleaner.jpg';
import storefront from '../assets/photos/storefront.jpg';

export interface StorePhoto {
  key: string;
  src: ImageMetadata;
  alt: string;
  caption: string;
  year: number;
  group: 'outside' | 'inside';
}

export const photos: StorePhoto[] = [
  { key: 'storefront', src: storefront, alt: '부천역 남문안경 매장 정면 — NAMMUN 남문안경 간판과 전화번호 654-9540', caption: '매장 정면 · NAMMUN 간판', year: 2019, group: 'outside' },
  { key: 'front-sign', src: frontSign, alt: '남문안경 간판 — 녹색 남문안경 글씨와 전화번호 654-9540, 아래로 유리 진열창', caption: '남문안경 간판', year: 2016, group: 'outside' },
  { key: 'front-window', src: frontWindow, alt: '남문안경 진열창 — 유리창 너머로 보이는 선글라스 진열대와 주차 안내 표지', caption: '진열창과 입구', year: 2016, group: 'outside' },
  { key: 'sign-vertical', src: signVertical, alt: '건물 기둥의 남문안경 세로 간판과 파란 현수막', caption: '세로 간판', year: 2016, group: 'outside' },
  { key: 'interior-wide', src: interiorWide, alt: '남문안경 매장 내부 전경 — 벽면을 따라 이어진 안경테 진열장과 유리 진열대, 가운데 상담 소파', caption: '매장 내부 전경', year: 2016, group: 'inside' },
  { key: 'display-wall', src: displayWall, alt: '선글라스와 안경테가 진열된 벽면 진열장과 유리 진열대, 빨간 의자', caption: '안경테·선글라스 진열장', year: 2016, group: 'inside' },
  { key: 'display-counter', src: displayCounter, alt: '안경 케이스와 콘택트렌즈 진열대, 유리 진열대 앞 상담석', caption: '상담석과 콘택트렌즈 진열대', year: 2016, group: 'inside' },
  { key: 'frames-table', src: framesTable, alt: '유리 진열대 위에 줄지어 놓인 여러 디자인의 뿔테·금속테 안경', caption: '직접 써 볼 수 있는 안경테', year: 2016, group: 'inside' },
  { key: 'lounge', src: lounge, alt: '매장 안 대기 공간 — 검은 소파와 테이블', caption: '편히 기다리는 대기 공간', year: 2016, group: 'inside' },
  { key: 'cleaner', src: cleaner, alt: '매장 앞에 놓인 안경 초음파 세척기', caption: '매장 앞 안경 세척기', year: 2016, group: 'outside' },
];

export const photo = (key: string) => {
  const p = photos.find((x) => x.key === key);
  if (!p) throw new Error(`photo not found: ${key}`);
  return p;
};
export const photoSource = '사진: 남문안경 (2016년 촬영 사진은 현재 모습과 다를 수 있습니다)';
