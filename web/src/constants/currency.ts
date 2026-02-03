/**
 * 화폐 단계별 게임 데이터 (docs/primary.md PRD 기준)
 * 10원 ~ 골드바 총 9단계
 */
export interface ICurrencyStage {
  /** 단계 인덱스 (0~8) */
  stage: number
  /** 표시명 */
  label: string
  /** Matter.js 원형 바디 반지름 (px) */
  radius: number
  /** 채우기 색상 (hex) */
  color: string
  /** 아이콘/이미지 URL (placeholder) */
  imageURL: string
  /** 머지 시 획득 점수 */
  score: number
}

/** 한국 동전/지폐 색상 기준 (Matter.js render fillStyle), 반지름 0.8배 적용 */
export const CURRENCY_STAGES: ICurrencyStage[] = [
  { stage: 0, label: '10원', radius: 35, color: '#C38067', imageURL: '/placeholder-10.png', score: 10 },
  { stage: 1, label: '50원', radius: 42, color: '#B87333', imageURL: '/placeholder-50.png', score: 50 },
  { stage: 2, label: '100원', radius: 48, color: '#D8D8D8', imageURL: '/placeholder-100.png', score: 100 },
  { stage: 3, label: '500원', radius: 54, color: '#E2E2E2', imageURL: '/placeholder-500.png', score: 500 },
  { stage: 4, label: '1,000원', radius: 61, color: '#4D76B6', imageURL: '/placeholder-1000.png', score: 1000 },
  { stage: 5, label: '5,000원', radius: 67, color: '#E48D65', imageURL: '/placeholder-5000.png', score: 5000 },
  { stage: 6, label: '10,000원', radius: 74, color: '#5E9D61', imageURL: '/placeholder-10000.png', score: 10000 },
  { stage: 7, label: '50,000원', radius: 80, color: '#D4AF37', imageURL: '/placeholder-50000.png', score: 50000 },
  { stage: 8, label: '골드바', radius: 86, color: '#B8860B', imageURL: '/placeholder-gold.png', score: 100000 },
]

/** 최소 단계(10원) 반지름 - 대기/드롭 기본값 */
export const DEFAULT_COIN_STAGE_INDEX = 0
export const STAGE_COUNT = CURRENCY_STAGES.length
