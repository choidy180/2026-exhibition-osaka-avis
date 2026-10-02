"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** 서버 렌더링/하이드레이션 중에는 false, 이후 true */
export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function subscribeSecond(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

/** 1초마다 갱신되는 현재 시각(ms, 초 단위로 절삭). 서버에서는 null */
export function useNowSecond(): number | null {
  return useSyncExternalStore(
    subscribeSecond,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );
}

function subscribeFullscreen(onChange: () => void) {
  document.addEventListener("fullscreenchange", onChange);
  return () => document.removeEventListener("fullscreenchange", onChange);
}

export function useIsFullscreen() {
  return useSyncExternalStore(
    subscribeFullscreen,
    () => document.fullscreenElement !== null,
    () => false,
  );
}
