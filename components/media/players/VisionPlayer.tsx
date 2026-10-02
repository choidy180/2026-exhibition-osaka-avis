"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { MediaCanvas, concatBytes, errorMessage, type PlayerProps } from "./shared";

/** 이 시간 동안 새 프레임이 없으면 끊긴 것으로 본다 (비전 MjpegView 와 같은 3초) */
const STALL_MS = 3000;
/** 프레임 경계를 못 찾은 채 이만큼 쌓이면 MJPEG 가 아닌 것으로 본다 */
const MAX_BUFFER = 8 * 1024 * 1024;

const CR = 13;
const LF = 10;

/** 파트 머리(--frame, Content-Type, Content-Length …) 끝의 빈 줄(\r\n\r\n) 위치 */
function findHeaderEnd(buf: Uint8Array) {
  for (let i = 0; i + 3 < buf.length; i++) {
    if (buf[i] === CR && buf[i + 1] === LF && buf[i + 2] === CR && buf[i + 3] === LF) return i;
  }
  return -1;
}

/** 앞 장 JPEG 뒤에 붙은 줄바꿈을 건너뛴다 — 다음 장의 머리 끝으로 잘못 읽지 않도록 */
function skipLineBreaks(buf: Uint8Array<ArrayBuffer>) {
  let i = 0;
  while (i < buf.length && (buf[i] === CR || buf[i] === LF)) i++;
  return i === 0 ? buf : buf.subarray(i);
}

/**
 * AVIS 비전 서버의 MJPEG (`http://<비전>:8200/stream/{1,2,3,all}.mjpg`) — STREAM.md 3.2 `MjpegView` 와 같은 방식.
 * <img> 는 끊기거나 멈춰도 알 수 없으므로 fetch 로 받아 <canvas> 에 그린다.
 * Safari 가 fetch 로는 multipart 를 읽지 못해 `/api/vision` 중계를 거쳐 받는다 (바이트는 그대로).
 * - 프레임마다 Content-Length 로 잘라 그린다
 * - 3초 동안 새 프레임이 없으면 오류로 알리고 StreamView 가 다시 연결한다
 * - 그리는 동안은 다음을 읽지 않는다 → 서버가 중간 장을 버려 화면이 늦어지지 않는다
 */
export default function VisionPlayer({ source, onStatus }: PlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emit = useEffectEvent(onStatus);
  const url = source.url;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !url) return;

    const abort = new AbortController();
    let lastFrameAt = performance.now();
    let live = false;
    let disposed = false;

    // 화면을 떠나면 연결을 닫는다 — 안 닫으면 비전 쪽 보는 사람 수가 쌓인다 (STREAM.md 4장 4번)
    const stop = () => {
      disposed = true;
      window.clearInterval(watchdog);
      window.removeEventListener("pagehide", onPageHide);
      abort.abort();
    };

    const fail = (detail: string) => {
      if (disposed) return;
      stop();
      emit("error", detail);
    };

    // 페이지를 떠나 bfcache 에 남더라도 연결을 붙잡지 않는다
    const onPageHide = () => fail("page hidden");
    window.addEventListener("pagehide", onPageHide);

    const watchdog = window.setInterval(() => {
      if (performance.now() - lastFrameAt > STALL_MS) fail("stream stalled");
    }, 500);

    const draw = async (jpeg: Uint8Array<ArrayBuffer>) => {
      const bitmap = await createImageBitmap(new Blob([jpeg], { type: "image/jpeg" }));
      if (disposed) return bitmap.close();
      if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
      }
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      lastFrameAt = performance.now();
      if (!live) {
        live = true;
        emit("live");
      }
    };

    (async () => {
      try {
        const res = await fetch(`/api/vision?src=${encodeURIComponent(url)}`, { cache: "no-store", signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!res.body) throw new Error("empty response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf: Uint8Array<ArrayBuffer> = new Uint8Array(0);

        for (;;) {
          const { done, value } = await reader.read();
          if (done) throw new Error("stream ended");
          buf = concatBytes(buf, value);

          // 버퍼에 다 들어온 장 가운데 마지막 것만 그린다
          let latest: Uint8Array<ArrayBuffer> | null = null;
          for (;;) {
            buf = skipLineBreaks(buf);
            const headerEnd = findHeaderEnd(buf);
            if (headerEnd < 0) break;
            const length = /content-length:\s*(\d+)/i.exec(decoder.decode(buf.subarray(0, headerEnd)));
            if (!length) throw new Error("MJPEG part without Content-Length");
            const start = headerEnd + 4;
            const end = start + Number(length[1]);
            if (buf.length < end) break;
            latest = buf.subarray(start, end);
            buf = buf.subarray(end);
          }
          if (buf.length > MAX_BUFFER) throw new Error("not an MJPEG stream");
          if (latest) await draw(latest);
        }
      } catch (error) {
        fail(errorMessage(error));
      }
    })();

    return stop;
  }, [url]);

  return <MediaCanvas ref={canvasRef} $fit={source.fit} />;
}
