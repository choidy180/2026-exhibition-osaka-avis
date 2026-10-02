"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { StageEntry, StageReading, WearableStage } from "./types";

/**
 * 품목 정보 테스트 모드 — 헤더의 🧪 버튼으로 켠다.
 * 켜 있는 동안 백엔드 폴링을 멈추고, 여기서 만든 단계 값으로 품목 정보를 그린다.
 * 화면을 오가도 유지되도록 루트(Providers)에 둔다.
 */

export interface StageSim {
  stage: WearableStage | null;
  since: number | null;
  seq: number;
  history: StageEntry[];
  /** 백엔드 연결 끊김 흉내 */
  offline: boolean;
  /** 1 → 2 → 3 → 4 → 1 자동 순환 */
  auto: boolean;
}

/** 자동 순환 때 한 단계에 머무는 시간 */
const AUTO_STEP_MS = 4000;
const HISTORY_SIZE = 10;

/** 켤 때 채워 두는 이력 — 오래된 순으로 [단계, 머문 시간(초)]. 마지막이 현재 단계(경과 3초) */
const SEED: [WearableStage, number][] = [
  [2, 35],
  [1, 410],
  [2, 48],
  [3, 72],
  [4, 40],
  [1, 3],
];

function seed(now: number): StageSim {
  const history: StageEntry[] = [];
  let at = now;
  for (let i = SEED.length - 1; i >= 0; i--) {
    at -= SEED[i][1] * 1000;
    history.push({ stage: SEED[i][0], at });
  }
  return { stage: history[0].stage, since: history[0].at, seq: SEED.length, history, offline: false, auto: true };
}

function moveTo(sim: StageSim, stage: WearableStage, now: number): StageSim {
  if (sim.stage === stage) return sim; // 백엔드처럼 같은 단계가 다시 오면 그대로 둔다
  return {
    ...sim,
    stage,
    since: now,
    seq: sim.seq + 1,
    history: [{ stage, at: now }, ...sim.history].slice(0, HISTORY_SIZE),
  };
}

type Action =
  | { type: "toggle"; now: number }
  | { type: "select"; stage: WearableStage | null; now: number }
  | { type: "advance"; now: number }
  | { type: "toggleOffline" }
  | { type: "toggleAuto" };

function reducer(sim: StageSim | null, action: Action): StageSim | null {
  if (action.type === "toggle") return sim ? null : seed(action.now);
  if (!sim) return sim;

  switch (action.type) {
    case "select":
      // 대기 = 백엔드가 아직 아무 단계도 받지 않은 상태 (stage: null, 이력 없음)
      if (action.stage === null) return { ...sim, stage: null, since: null, seq: 0, history: [], auto: false };
      return { ...moveTo(sim, action.stage, action.now), auto: false };
    case "advance":
      return moveTo(sim, sim.stage === null ? 1 : ((sim.stage % 4) + 1) as WearableStage, action.now);
    case "toggleOffline":
      return { ...sim, offline: !sim.offline };
    case "toggleAuto":
      return { ...sim, auto: !sim.auto };
  }
}

interface StageTestContextValue {
  /** null 이면 테스트 모드 꺼짐 */
  sim: StageSim | null;
  toggle: () => void;
  select: (stage: WearableStage | null) => void;
  toggleOffline: () => void;
  toggleAuto: () => void;
}

const StageTestContext = createContext<StageTestContextValue | null>(null);

export function StageTestProvider({ children }: { children: ReactNode }) {
  const [sim, dispatch] = useReducer(reducer, null);

  const autoRunning = Boolean(sim?.auto && !sim.offline);
  const seq = sim?.seq;

  useEffect(() => {
    if (!autoRunning) return;
    const id = window.setTimeout(() => dispatch({ type: "advance", now: Date.now() }), AUTO_STEP_MS);
    return () => window.clearTimeout(id);
  }, [autoRunning, seq]);

  const toggle = useCallback(() => dispatch({ type: "toggle", now: Date.now() }), []);
  const select = useCallback((stage: WearableStage | null) => dispatch({ type: "select", stage, now: Date.now() }), []);
  const toggleOffline = useCallback(() => dispatch({ type: "toggleOffline" }), []);
  const toggleAuto = useCallback(() => dispatch({ type: "toggleAuto" }), []);

  const value = useMemo(
    () => ({ sim, toggle, select, toggleOffline, toggleAuto }),
    [sim, toggle, select, toggleOffline, toggleAuto],
  );

  return <StageTestContext.Provider value={value}>{children}</StageTestContext.Provider>;
}

export function useStageTest() {
  const ctx = useContext(StageTestContext);
  if (!ctx) throw new Error("useStageTest must be used inside <StageTestProvider>");
  return ctx;
}

export function simToReading(sim: StageSim): StageReading {
  const { stage, since, seq, history } = sim;
  return { status: sim.offline ? "offline" : "live", snapshot: { stage, since, seq, history } };
}
