/**
 * 전시 시연용 임의 품목 데이터 (PPT 4페이지: 품명 이너드럼 / 시리얼 dxs-drum-0001 / 색상 / 작업자).
 * 작업 상태는 글래스의 시연 단계(lib/stage)를 받아 표시하고, 품목 자체는 실제 MES 연동 전까지 고정값이다.
 */

export const COLORS = ["silver", "graphite", "white"] as const;
export type ColorKey = (typeof COLORS)[number];

export const COLOR_SWATCH: Record<ColorKey, string> = {
  silver: "#C4C9D4",
  graphite: "#4B505E",
  white: "#F3F4F6",
};

export const WORKERS = ["w1", "w2", "w3"] as const;
export type WorkerKey = (typeof WORKERS)[number];

export interface ItemRecord {
  seq: number;
  color: ColorKey;
  worker: WorkerKey;
}

export const CURRENT_ITEM: ItemRecord = { seq: 4, color: "silver", worker: "w2" };

export function serialOf(seq: number) {
  return `dxs-drum-${String(seq).padStart(4, "0")}`;
}
