"use client";

import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";

interface PlaybackPosition {
  index: number;
  time: number;
}

interface PlaylistStore {
  read: () => PlaybackPosition;
  save: (index: number, time: number) => void;
}

const PlaylistContext = createContext<PlaylistStore | null>(null);

/**
 * 메인 ↔ 미러링 화면을 오가도 시연 영상이 처음부터 다시 시작하지 않도록
 * 레이아웃 레벨에서 재생 위치를 기억한다.
 */
export function PlaylistProvider({ children }: { children: ReactNode }) {
  const position = useRef<PlaybackPosition>({ index: 0, time: 0 });

  const store = useMemo<PlaylistStore>(
    () => ({
      read: () => ({ ...position.current }),
      save: (index, time) => {
        position.current = { index, time };
      },
    }),
    [],
  );

  return <PlaylistContext.Provider value={store}>{children}</PlaylistContext.Provider>;
}

export function usePlaylistStore() {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylistStore must be used inside <PlaylistProvider>");
  return ctx;
}
