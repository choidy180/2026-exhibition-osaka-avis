"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { MediaVideo, errorMessage, useStallWatchdog, type PlayerProps } from "./shared";

function waitForIceGathering(pc: RTCPeerConnection, timeoutMs: number) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      window.clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", check);
      resolve();
    };
    const check = () => {
      if (pc.iceGatheringState === "complete") done();
    };
    const timer = window.setTimeout(done, timeoutMs);
    pc.addEventListener("icegatheringstatechange", check);
  });
}

/**
 * WebRTC WHEP 수신 플레이어.
 * MediaMTX(`http://host:8889/<path>/whep`) 또는 go2rtc(`http://host:1984/api/webrtc?src=<name>`) 에 연결한다.
 * 같은 LAN 이므로 STUN/TURN 없이 host 후보만 사용한다.
 */
export default function WhepPlayer({ source, onStatus }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const emit = useEffectEvent(onStatus);
  const url = source.url;

  useStallWatchdog(videoRef, playing, () => onStatus("error", "stream stalled"));

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    const abort = new AbortController();
    const pc = new RTCPeerConnection();
    const stream = new MediaStream();
    let sessionUrl: string | null = null;
    let disconnectTimer: number | undefined;
    let disposed = false;

    const fail = (detail: string) => {
      if (!disposed) emit("error", detail);
    };

    pc.addTransceiver("video", { direction: "recvonly" });
    pc.addTransceiver("audio", { direction: "recvonly" });

    pc.ontrack = (event) => {
      stream.addTrack(event.track);
      if (video.srcObject !== stream) video.srcObject = stream;
    };

    pc.onconnectionstatechange = () => {
      window.clearTimeout(disconnectTimer);
      const state = pc.connectionState;
      if (state === "failed") fail("WebRTC connection failed");
      if (state === "disconnected") {
        disconnectTimer = window.setTimeout(() => {
          if (pc.connectionState !== "connected") fail("WebRTC disconnected");
        }, 4000);
      }
    };

    (async () => {
      try {
        await pc.setLocalDescription(await pc.createOffer());
        await waitForIceGathering(pc, 2000);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: pc.localDescription?.sdp ?? "",
          signal: abort.signal,
        });
        if (!res.ok) throw new Error(`WHEP HTTP ${res.status}`);

        const location = res.headers.get("Location");
        if (location) sessionUrl = new URL(location, url).toString();

        await pc.setRemoteDescription({ type: "answer", sdp: await res.text() });
      } catch (error) {
        fail(errorMessage(error));
      }
    })();

    return () => {
      disposed = true;
      window.clearTimeout(disconnectTimer);
      abort.abort();
      pc.close();
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
      if (sessionUrl) fetch(sessionUrl, { method: "DELETE" }).catch(() => {});
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
    />
  );
}
