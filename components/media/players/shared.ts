"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";
import styled, { css } from "styled-components";
import type { StreamSource } from "@/lib/config/types";

export type PlayerStatus = "connecting" | "live" | "error";

export interface PlayerProps {
  source: StreamSource;
  onStatus: (status: PlayerStatus, detail?: string) => void;
}

const fill = css<{ $fit?: "contain" | "cover" }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: ${({ $fit }) => $fit ?? "contain"};
  /* 더블클릭 이동을 부모 패널이 받도록 미디어는 포인터 이벤트를 막는다 */
  pointer-events: none;
`;

export const MediaVideo = styled.video<{ $fit?: "contain" | "cover" }>`
  ${fill}
`;

export const MediaImage = styled.img<{ $fit?: "contain" | "cover" }>`
  ${fill}
`;

export const MediaFrame = styled.iframe<{ $fit?: "contain" | "cover" }>`
  ${fill}
`;

export const MediaCanvas = styled.canvas<{ $fit?: "contain" | "cover" }>`
  ${fill}
`;

/** fetch 로 받은 조각을 이어 붙인다 (스트림 파서용) */
export function concatBytes(a: Uint8Array<ArrayBuffer>, b: Uint8Array<ArrayBuffer>) {
  if (a.length === 0) return b;
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * 재생 중인데 프레임이 멈춘 경우(네트워크 단절 등) 감지.
 * 전시장에서 화면이 정지된 채 방치되지 않도록 재연결을 유도한다.
 */
export function useStallWatchdog(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  onStall: () => void,
  timeoutMs = 10_000,
) {
  const handleStall = useEffectEvent(onStall);

  useEffect(() => {
    if (!enabled) return;
    let lastTime = -1;
    let lastChange = Date.now();

    const id = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || document.hidden) {
        lastChange = Date.now();
        return;
      }
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        lastChange = Date.now();
      } else if (Date.now() - lastChange > timeoutMs) {
        lastChange = Date.now();
        handleStall();
      }
    }, 2000);

    return () => window.clearInterval(id);
  }, [enabled, videoRef, timeoutMs]);
}
