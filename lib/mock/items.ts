/**
 * 전시 시연용 임의 품목 데이터 (PPT 4페이지: 품명 이너드럼 / 시리얼 dxs-drum-0001 / 색상 / 작업자 / 작업상태).
 * 실제 MES 연동 전까지 공정 단계가 자동으로 진행되며 품목이 순환한다.
 */

export const STAGES = ["waiting", "working", "inspecting", "done"] as const;
export type WorkStage = (typeof STAGES)[number];

/** 단계별 머무는 시간(ms) */
export const STAGE_DURATION: Record<WorkStage, number> = {
  waiting: 3000,
  working: 8000,
  inspecting: 5000,
  done: 3500,
};

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

export interface CompletedItem extends ItemRecord {
  completedAt: number;
}

export interface ItemFeed {
  current: ItemRecord;
  stage: WorkStage;
  history: CompletedItem[];
}

const HISTORY_SIZE = 4;

export function serialOf(seq: number) {
  return `dxs-drum-${String(seq).padStart(4, "0")}`;
}

function itemFor(seq: number): ItemRecord {
  return {
    seq,
    color: COLORS[(seq - 1) % COLORS.length],
    worker: WORKERS[Math.floor((seq - 1) / 2) % WORKERS.length],
  };
}

export function createInitialFeed(now = Date.now()): ItemFeed {
  const history = [3, 2, 1].map((seq, i) => ({ ...itemFor(seq), completedAt: now - (i + 1) * 21_000 }));
  return { current: itemFor(4), stage: "working", history };
}

export function advanceFeed(feed: ItemFeed, now = Date.now()): ItemFeed {
  const stageIndex = STAGES.indexOf(feed.stage);
  if (stageIndex < STAGES.length - 1) {
    return { ...feed, stage: STAGES[stageIndex + 1] };
  }
  const history = [{ ...feed.current, completedAt: now }, ...feed.history].slice(0, HISTORY_SIZE);
  return { current: itemFor(feed.current.seq + 1), stage: "waiting", history };
}
