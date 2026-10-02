"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { MediaVideo, errorMessage, useStallWatchdog, type PlayerProps } from "./shared";

/** HLS(.m3u8) 플레이어 — hls.js 는 필요할 때만 불러온다 */
export default function HlsPlayer({ source, onStatus }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const emit = useEffectEvent(onStatus);
  const url = source.url;

  useStallWatchdog(videoRef, playing, () => onStatus("error", "stream stalled"));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let disposed = false;
    let destroy: (() => void) | undefined;

    (async () => {
      try {
        const { default: Hls } = await import("hls.js");
        if (disposed) return;

        if (Hls.isSupported()) {
          const hls = new Hls({ lowLatencyMode: true, liveSyncDurationCount: 2, backBufferLength: 10 });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal && !disposed) emit("error", `HLS ${data.details}`);
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          destroy = () => hls.destroy();
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          destroy = () => {
            video.removeAttribute("src");
            video.load();
          };
        } else {
          emit("error", "HLS is not supported in this browser");
        }
      } catch (error) {
        if (!disposed) emit("error", errorMessage(error));
      }
    })();

    return () => {
      disposed = true;
      destroy?.();
    };
  }, [url]);

  return (
    <MediaVideo
      ref={videoRef}
      $fit={source.fit}
      autoPlay
      muted
      playsInline
      onPlaying={() => {
        setPlaying(true);
        onStatus("live");
      }}
      onError={() => onStatus("error", "HLS media error")}
    />
  );
}
