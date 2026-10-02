"use client";

import { MediaFrame, type PlayerProps } from "./shared";

/** 스트리밍 서버가 제공하는 웹 플레이어 페이지를 그대로 삽입 (예: MediaMTX `http://host:8889/<path>`) */
export default function IframePlayer({ source, onStatus }: PlayerProps) {
  return (
    <MediaFrame
      src={source.url}
      title="stream"
      allow="autoplay; fullscreen"
      referrerPolicy="no-referrer"
      onLoad={() => onStatus("live")}
    />
  );
}
