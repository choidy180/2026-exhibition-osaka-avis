"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { MediaVideo, concatBytes, errorMessage, type PlayerProps } from "./shared";

/** 이 시간 동안 받은 데이터가 없으면 끊긴 것으로 본다 (글래스 페이지와 같은 10초). 화면이 멈춰 있어도 keepalive 는 온다 */
const DATA_TIMEOUT_MS = 10_000;
/** 받아 두고 아직 못 넣은 조각이 이만큼 쌓이면 따라가지 못하는 것으로 본다 */
const MAX_QUEUE = 90;
const MAX_PACKET = 4 * 1024 * 1024;
/** 라이브 끝에서 이만큼 뒤처지면 끝(LIVE_EDGE_SEC 앞)으로 건너뛴다 */
const MAX_LAG_SEC = 0.65;
const LIVE_EDGE_SEC = 0.18;

/**
 * 글래스(Vuzix M4000) AVIS Live 화면 공유 — `http://<글래스>:8080`.
 * 글래스는 `/status`(코덱) 와 `/stream`(4바이트 길이 + fMP4 조각, 길이 0 은 keepalive) 을 주고,
 * 이를 MediaSource 로 재생한다. 글래스가 CORS 를 열지 않아 `/api/live/*` 중계를 거쳐 받는다.
 */
export default function AvisLivePlayer({ source, onStatus }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const emit = useEffectEvent(onStatus);
  const url = source.url;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    const abort = new AbortController();
    const query = `?src=${encodeURIComponent(url)}`;
    const queue: Uint8Array<ArrayBuffer>[] = [];
    let objectUrl: string | null = null;
    let buffer: SourceBuffer | null = null;
    let firstSample = true;
    let lastData = performance.now();
    let disposed = false;

    const stop = () => {
      disposed = true;
      window.clearInterval(watchdog);
      window.removeEventListener("pagehide", onPageHide);
      abort.abort();
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };

    const fail = (detail: string) => {
      if (disposed) return;
      stop();
      emit("error", detail);
    };

    // 글래스는 동시 시청자가 3명까지다. 페이지를 떠나 bfcache 에 남더라도 자리를 붙잡지 않도록 닫는다
    const onPageHide = () => fail("page hidden");
    window.addEventListener("pagehide", onPageHide);

    // 연결 · 첫 응답이 늦는 경우도 여기서 걸린다
    const watchdog = window.setInterval(() => {
      if (performance.now() - lastData > DATA_TIMEOUT_MS) fail("stream timeout");
    }, 2000);

    const pump = () => {
      if (disposed || !buffer || buffer.updating) return;
      try {
        // 지나간 구간은 지워 메모리가 쌓이지 않게 한다
        if (buffer.buffered.length && video.currentTime > 10 && buffer.buffered.start(0) < video.currentTime - 8) {
          buffer.remove(0, video.currentTime - 5);
          return;
        }
        const next = queue.shift();
        if (next) buffer.appendBuffer(next);
      } catch (error) {
        fail(errorMessage(error));
      }
    };

    (async () => {
      try {
        if (!window.MediaSource) throw new Error("MediaSource is not supported in this browser");

        const res = await fetch(`/api/live/status${query}`, { cache: "no-store", signal: abort.signal });
        if (!res.ok) throw new Error(`status HTTP ${res.status}`);
        const info = (await res.json()) as { ready?: boolean; codec?: string };
        if (!info.ready || !info.codec) throw new Error("encoder not ready — check screen sharing on the glasses");
        const type = `video/mp4; codecs="${info.codec}"`;
        if (!MediaSource.isTypeSupported(type)) throw new Error(`unsupported codec ${info.codec}`);

        const mediaSource = new MediaSource();
        objectUrl = URL.createObjectURL(mediaSource);
        video.src = objectUrl;
        await new Promise<void>((resolve, reject) => {
          mediaSource.addEventListener("sourceopen", () => resolve(), { once: true });
          abort.signal.addEventListener("abort", () => reject(new Error("cancelled")), { once: true });
        });

        const sb = mediaSource.addSourceBuffer(type);
        buffer = sb;
        sb.addEventListener("error", () => fail("MediaSource decode error"));
        sb.addEventListener("updateend", () => {
          if (disposed) return;
          if (sb.buffered.length) {
            const start = sb.buffered.start(sb.buffered.length - 1);
            const end = sb.buffered.end(sb.buffered.length - 1);
            if (firstSample || end - video.currentTime > MAX_LAG_SEC || video.currentTime < start) {
              video.currentTime = Math.max(start, end - LIVE_EDGE_SEC);
              firstSample = false;
            }
            video.play().catch(() => {});
          }
          pump();
        });

        const stream = await fetch(`/api/live/stream${query}`, { cache: "no-store", signal: abort.signal });
        if (!stream.ok) throw new Error(`stream HTTP ${stream.status}`);
        if (!stream.body) throw new Error("empty response body");

        const reader = stream.body.getReader();
        let pending: Uint8Array<ArrayBuffer> = new Uint8Array(0);

        for (;;) {
          const { done, value } = await reader.read();
          if (done) throw new Error("stream ended");
          lastData = performance.now();
          pending = concatBytes(pending, value);

          let offset = 0;
          while (pending.length - offset >= 4) {
            const size = new DataView(pending.buffer, pending.byteOffset + offset, 4).getUint32(0);
            if (size === 0) {
              offset += 4;
              continue;
            }
            if (size < 8 || size > MAX_PACKET) throw new Error("invalid packet size");
            if (pending.length - offset < 4 + size) break;
            queue.push(pending.slice(offset + 4, offset + 4 + size));
            offset += 4 + size;
            if (queue.length > MAX_QUEUE) throw new Error("viewer cannot keep up");
            pump();
          }
          pending = pending.subarray(offset);
        }
      } catch (error) {
        fail(errorMessage(error));
      }
    })();

    return stop;
  }, [url]);

  return (
    <MediaVideo
      ref={videoRef}
      $fit={source.fit}
      autoPlay
      muted
      playsInline
      onPlaying={() => onStatus("live")}
      onError={() => {
        if (videoRef.current?.error) onStatus("error", "video error");
      }}
    />
  );
}
