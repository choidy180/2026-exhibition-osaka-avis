"use client";

import { useEffect, useRef, useState } from "react";
import { MediaImage, type PlayerProps } from "./shared";

/** MJPEG (multipart/x-mixed-replace) 스트림 — ScreenStream 앱, IP 카메라 등 */
export default function MjpegPlayer({ source, onStatus }: PlayerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const url = source.url;

  // src 를 직접 붙였다 떼야 화면 이동 시 브라우저가 스트림 연결을 확실히 끊는다
  // (호스트당 동시 연결 수 제한에 걸리지 않도록)
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !url) return;
    img.src = url;
    return () => img.removeAttribute("src");
  }, [url]);

  return (
    <MediaImage
      ref={imgRef}
      alt=""
      $fit={source.fit}
      // 첫 프레임 전에는 브라우저 기본 '깨진 이미지' 표시가 보이지 않도록 숨김
      style={{ visibility: loaded ? "visible" : "hidden" }}
      onLoad={() => {
        setLoaded(true);
        onStatus("live");
      }}
      onError={() => {
        if (imgRef.current?.getAttribute("src")) onStatus("error", "MJPEG stream error");
      }}
    />
  );
}
