import type { Locale } from "@/lib/i18n/locales";

/**
 * 스트림 연결 방식
 * - mjpeg  : <img> 로 받는 MJPEG (ScreenStream 앱, IP 카메라, go2rtc 등)
 * - vision : AVIS 비전 서버 MJPEG (`http://host:8200/stream/<n>.mjpg`). /api/vision 로 중계해 fetch + canvas 로 그리고 멈춤을 감지·재연결
 * - avis-live : 글래스 AVIS Live 화면 공유 (`http://glass:8080`). /api/live 로 중계해 MediaSource 로 재생
 * - webrtc : WHEP 엔드포인트 (MediaMTX `http://host:8889/<path>/whep`, go2rtc `/api/webrtc?src=`)
 * - hls    : .m3u8 (MediaMTX `http://host:8888/<path>/index.m3u8`)
 * - video  : 브라우저가 바로 재생할 수 있는 영상 주소 (mp4 등)
 * - iframe : 스트리밍 서버가 제공하는 플레이어 페이지를 그대로 삽입
 * - webcam : PC 에 연결된 캡처보드/USB 카메라 (deviceLabel 로 장치 선택)
 * - none   : 미사용
 */
export type StreamType = "mjpeg" | "vision" | "avis-live" | "webrtc" | "hls" | "video" | "iframe" | "webcam" | "none";

export const STREAM_TYPES: readonly StreamType[] = ["mjpeg", "vision", "avis-live", "webrtc", "hls", "video", "iframe", "webcam", "none"];

export interface StreamSource {
  type: StreamType;
  url?: string;
  /** webcam 타입에서 장치 이름 일부 (예: "USB Capture") */
  deviceLabel?: string;
  /** 화면 맞춤 방식. 기본 contain (잘림 없이 전체 표시) */
  fit?: "contain" | "cover";
}

export type StreamKey = "mirror" | "conveyor1" | "conveyor2" | "conveyor3";

export interface DemoVideo {
  src: string;
  title: Record<Locale, string>;
}

/** 글래스의 현재 시연 단계 — 백엔드 `GET /v1/wearable/stage` (품목 정보의 작업 상태) */
export interface WearableStageSource {
  /** 예: `http://192.168.0.101:8100/v1/wearable/stage`. 비우면 작업 상태를 받지 않는다 */
  url?: string;
  /** 폴링 간격(초) */
  pollSeconds: number;
}

export interface AvisConfig {
  /** 연결이 끊겼을 때 재연결까지 대기 시간(초) */
  reconnectSeconds: number;
  streams: Record<StreamKey, StreamSource>;
  wearableStage: WearableStageSource;
  demoVideos: DemoVideo[];
}
