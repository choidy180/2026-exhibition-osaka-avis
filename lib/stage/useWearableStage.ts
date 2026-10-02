"use client";

import { useEffect, useState } from "react";
import { useAvisConfig } from "@/lib/config/ConfigProvider";
import { parseStageResponse, type StageReading } from "./types";

/** 대시보드 서버가 avis.config.json 의 wearableStage.url 로 중계한다 (app/api/stage/route.ts) */
const ENDPOINT = "/api/stage";
const REQUEST_TIMEOUT_MS = 3000;
/** 한 번 놓친 것으로는 끊김으로 보지 않는다 */
const FAILS_BEFORE_OFFLINE = 2;

/** 글래스의 현재 단계를 폴링한다. enabled 가 false 면 (테스트 모드) 요청을 멈춘다 */
export function useWearableStage(enabled: boolean): StageReading {
  const { wearableStage } = useAvisConfig();
  const configured = Boolean(wearableStage.url);
  const intervalMs = wearableStage.pollSeconds * 1000;
  const [reading, setReading] = useState<StageReading>({ status: "connecting", snapshot: null });

  useEffect(() => {
    if (!enabled || !configured) return;

    let disposed = false;
    let timer: number | undefined;
    let request: AbortController | undefined;
    let fails = 0;

    const poll = async () => {
      request = new AbortController();
      const timeout = window.setTimeout(() => request?.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(ENDPOINT, { cache: "no-store", signal: request.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw: unknown = await res.json();
        fails = 0;
        if (!disposed) {
          setReading((prev) => ({ status: "live", snapshot: parseStageResponse(raw, prev.snapshot, Date.now()) }));
        }
      } catch {
        fails += 1;
        if (!disposed && fails >= FAILS_BEFORE_OFFLINE) setReading((prev) => ({ ...prev, status: "offline" }));
      } finally {
        window.clearTimeout(timeout);
      }
      if (!disposed) timer = window.setTimeout(poll, intervalMs);
    };

    void poll();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      request?.abort();
    };
  }, [enabled, configured, intervalMs]);

  return configured ? reading : { status: "unconfigured", snapshot: null };
}
