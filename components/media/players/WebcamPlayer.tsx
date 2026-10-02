"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { MediaVideo, errorMessage, type PlayerProps } from "./shared";

const RESOLUTION = { width: { ideal: 1920 }, height: { ideal: 1080 } };

/**
 * PC 에 연결된 영상 장치(HDMI 캡처보드, USB 카메라, OBS 가상 카메라 등).
 * deviceLabel 을 지정하면 이름에 해당 문자열이 포함된 장치를 사용한다.
 */
export default function WebcamPlayer({ source, onStatus }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const emit = useEffectEvent(onStatus);
  const deviceLabel = source.deviceLabel?.toLowerCase();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stream: MediaStream | null = null;
    let disposed = false;
    const stop = (s: MediaStream | null) => s?.getTracks().forEach((track) => track.stop());

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access requires HTTPS or localhost");
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: RESOLUTION, audio: false });

        if (deviceLabel) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const match = devices.find((d) => d.kind === "videoinput" && d.label.toLowerCase().includes(deviceLabel));
          if (!match) throw new Error(`Video device "${source.deviceLabel}" not found`);
          if (stream.getVideoTracks()[0]?.getSettings().deviceId !== match.deviceId) {
            stop(stream);
            stream = await navigator.mediaDevices.getUserMedia({
              video: { ...RESOLUTION, deviceId: { exact: match.deviceId } },
              audio: false,
            });
          }
        }

        if (disposed) return stop(stream);
        video.srcObject = stream;
      } catch (error) {
        if (!disposed) emit("error", errorMessage(error));
      }
    })();

    return () => {
      disposed = true;
      stop(stream);
      video.srcObject = null;
    };
  }, [deviceLabel, source.deviceLabel]);

  return (
    <MediaVideo ref={videoRef} $fit={source.fit} autoPlay muted playsInline onPlaying={() => onStatus("live")} />
  );
}
