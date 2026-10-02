/**
 * 글래스(AVIS 앱)의 시연 단계 — 백엔드 `GET /v1/wearable/stage`.
 * 글래스가 단계가 바뀔 때마다 백엔드에 보내고, 대시보드는 1초마다 받아 품목 정보의 작업 상태로 보여 준다.
 */

export const WEARABLE_STAGES = [1, 2, 3, 4] as const;
/** 1 정상 화면 · 2 불량 대응 · 3 설비 점검 · 4 보고서 */
export type WearableStage = (typeof WEARABLE_STAGES)[number];

export interface StageEntry {
  stage: WearableStage;
  /** 그 단계로 바뀐 시각(ms) */
  at: number;
}

export interface StageSnapshot {
  /** 아직 아무 단계도 오지 않았으면 null */
  stage: WearableStage | null;
  /** 현재 단계에 들어온 시각(ms, 이 브라우저 시계 기준) — 경과 시간 계산용 */
  since: number | null;
  /** 단계가 바뀔 때마다 1씩 오른다 */
  seq: number;
  /** 최신순. 첫 항목이 현재 단계 */
  history: StageEntry[];
}

export type StageStatus = "unconfigured" | "connecting" | "live" | "offline";

export interface StageReading {
  status: StageStatus;
  /** 마지막으로 받은 값. 연결이 끊겨도 그대로 둔다 */
  snapshot: StageSnapshot | null;
}

export function isWearableStage(value: unknown): value is WearableStage {
  return typeof value === "number" && (WEARABLE_STAGES as readonly number[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const numberOr = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);

/**
 * 백엔드 응답 → StageSnapshot.
 * - `history[].at` 은 백엔드 시계(초)를 그대로 쓴다 (시작 시각 표시 · 단계별 소요 시간).
 * - 현재 단계 경과 시간은 `since_sec` 를 받은 시각에서 빼 브라우저 시계로 옮긴다. 같은 단계가 이어지는 동안은
 *   처음 계산한 값을 유지해, 폴링마다 네트워크 지연만큼 경과 시간이 흔들리지 않게 한다.
 */
export function parseStageResponse(raw: unknown, prev: StageSnapshot | null, receivedAt: number): StageSnapshot {
  const data = isRecord(raw) ? raw : {};
  const stage = isWearableStage(data.stage) ? data.stage : null;
  const seq = numberOr(data.seq, 0);

  const history = (Array.isArray(data.history) ? data.history : []).flatMap((item): StageEntry[] =>
    isRecord(item) && isWearableStage(item.stage) && typeof item.at === "number"
      ? [{ stage: item.stage, at: item.at * 1000 }]
      : [],
  );

  let since: number | null = null;
  if (stage !== null) {
    since =
      prev && prev.stage === stage && prev.seq === seq && prev.since !== null
        ? prev.since
        : receivedAt - numberOr(data.since_sec, 0) * 1000;
  }

  return { stage, since, seq, history };
}
