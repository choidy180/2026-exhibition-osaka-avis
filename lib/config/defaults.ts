import { LOCALES } from "@/lib/i18n/locales";
import {
  STREAM_TYPES,
  type AvisConfig,
  type DemoVideo,
  type StreamKey,
  type StreamSource,
  type WearableStageSource,
} from "./types";

export const DEFAULT_CONFIG: AvisConfig = {
  reconnectSeconds: 5,
  streams: {
    mirror: { type: "none" },
    conveyor1: { type: "none" },
    conveyor2: { type: "none" },
    conveyor3: { type: "none" },
  },
  wearableStage: { pollSeconds: 1 },
  demoVideos: [
    {
      src: "/videos/01-timecheck.mp4",
      title: { ko: "타임체크", ja: "タイムチェック", en: "Time Check" },
    },
    {
      src: "/videos/02-idle-management.mp4",
      title: { ko: "무작업관리", ja: "非作業管理", en: "Idle Time Management" },
    },
    {
      src: "/videos/03-defect-traceability.mp4",
      title: { ko: "불량역추적", ja: "不良トレーサビリティ", en: "Defect Traceability" },
    },
  ],
};

const STREAM_KEYS = Object.keys(DEFAULT_CONFIG.streams) as StreamKey[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeStream(raw: unknown, fallback: StreamSource): StreamSource {
  if (!isRecord(raw)) return fallback;
  const type = STREAM_TYPES.find((t) => t === raw.type) ?? "none";
  return {
    type,
    url: typeof raw.url === "string" && raw.url.trim() ? raw.url.trim() : undefined,
    deviceLabel: typeof raw.deviceLabel === "string" ? raw.deviceLabel : undefined,
    fit: raw.fit === "cover" ? "cover" : "contain",
  };
}

function normalizeWearableStage(raw: unknown): WearableStageSource {
  const fallback = DEFAULT_CONFIG.wearableStage;
  if (!isRecord(raw)) return fallback;
  return {
    url: typeof raw.url === "string" && raw.url.trim() ? raw.url.trim() : undefined,
    pollSeconds:
      typeof raw.pollSeconds === "number" && raw.pollSeconds >= 0.5 ? raw.pollSeconds : fallback.pollSeconds,
  };
}

function normalizeVideo(raw: unknown): DemoVideo | null {
  if (!isRecord(raw) || typeof raw.src !== "string" || !raw.src) return null;
  const titles = isRecord(raw.title) ? raw.title : {};
  const firstTitle = LOCALES.map((l) => titles[l]).find((v): v is string => typeof v === "string") ?? raw.src;
  const title = Object.fromEntries(
    LOCALES.map((l) => [l, typeof titles[l] === "string" ? (titles[l] as string) : firstTitle]),
  ) as DemoVideo["title"];
  return { src: raw.src, title };
}

/** 사람이 직접 편집하는 JSON 이므로, 잘못된 값은 기본값으로 대체한다 */
export function normalizeConfig(raw: unknown): AvisConfig {
  if (!isRecord(raw)) return DEFAULT_CONFIG;

  const rawStreams = isRecord(raw.streams) ? raw.streams : {};
  const streams = Object.fromEntries(
    STREAM_KEYS.map((key) => [key, normalizeStream(rawStreams[key], DEFAULT_CONFIG.streams[key])]),
  ) as AvisConfig["streams"];

  const demoVideos = Array.isArray(raw.demoVideos)
    ? raw.demoVideos.map(normalizeVideo).filter((v): v is DemoVideo => v !== null)
    : DEFAULT_CONFIG.demoVideos;

  const reconnectSeconds =
    typeof raw.reconnectSeconds === "number" && raw.reconnectSeconds >= 1
      ? Math.round(raw.reconnectSeconds)
      : DEFAULT_CONFIG.reconnectSeconds;

  return { reconnectSeconds, streams, wearableStage: normalizeWearableStage(raw.wearableStage), demoVideos };
}
