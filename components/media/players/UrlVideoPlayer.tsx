"use client";

import { useEffect, useRef, useState } from "react";
import { MediaVideo, useStallWatchdog, type PlayerProps } from "./shared";

/** 브라우저가 직접 재생할 수 있는 영상 주소(mp4 등) */
export default function UrlVideoPlayer({ source, onStatus }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const url = source.url;

  useStallWatchdog(videoRef, playing, () => onStatus("error", "stream stalled"));

  // SSR HTML 에 src 가 있으면 하이드레이션 전에 재생이 시작되어 playing 이벤트를 놓치므로 마운트 후 연결
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    video.src = url;
    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [url]);

  return (
    <MediaVideo
      ref={videoRef}
      $fit={source.fit}
      autoPlay
      muted
      loop
      playsInline
      onPlaying={() => {
        setPlaying(true);
        onStatus("live");
      }}
      onError={() => {
        if (videoRef.current?.getAttribute("src")) onStatus("error", "video error");
      }}
    />
  );
}
