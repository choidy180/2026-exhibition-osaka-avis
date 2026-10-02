"use client";

import { useCallback, useEffect, useState, type ComponentType } from "react";
import styled, { css, keyframes } from "styled-components";
import { Radio, Settings2, VideoOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { format } from "@/lib/i18n/dictionaries";
import { useAvisConfig } from "@/lib/config/ConfigProvider";
import type { StreamSource, StreamType } from "@/lib/config/types";
import type { PlayerProps, PlayerStatus } from "./players/shared";
import MjpegPlayer from "./players/MjpegPlayer";
import WhepPlayer from "./players/WhepPlayer";
import HlsPlayer from "./players/HlsPlayer";
import UrlVideoPlayer from "./players/UrlVideoPlayer";
import IframePlayer from "./players/IframePlayer";
import WebcamPlayer from "./players/WebcamPlayer";

const PLAYERS: Record<Exclude<StreamType, "none">, ComponentType<PlayerProps>> = {
  mjpeg: MjpegPlayer,
  webrtc: WhepPlayer,
  hls: HlsPlayer,
  video: UrlVideoPlayer,
  iframe: IframePlayer,
  webcam: WebcamPlayer,
};

interface StreamState {
  status: PlayerStatus;
  /** 재연결까지 남은 초 */
  countdown: number;
  /** 재연결할 때마다 증가 → 플레이어를 새로 마운트 */
  attempt: number;
  detail?: string;
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

const Stage = styled.div<{ $live: boolean }>`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-color: ${({ $live, theme }) => ($live ? theme.colors.media : theme.colors.mediaIdle)};

  ${({ $live }) =>
    !$live &&
    css`
      background-image:
        linear-gradient(rgba(61, 71, 191, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(61, 71, 191, 0.06) 1px, transparent 1px);
      background-size: 44px 44px;
      background-position: center;
    `}
`;

const Overlay = styled.div<{ $dim: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  background: ${({ $dim }) => ($dim ? "rgba(238, 241, 248, 0.92)" : "transparent")};
`;

const IconRing = styled.span<{ $tone: "brand" | "live" | "muted"; $spinning?: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 6px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 14px -6px rgba(22, 26, 48, 0.18);
  color: ${({ $tone, theme }) =>
    $tone === "live" ? theme.colors.live : $tone === "brand" ? theme.colors.brand : theme.colors.textMuted};

  ${({ $spinning, theme }) =>
    $spinning &&
    css`
      &::before {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: 50%;
        border: 2px solid transparent;
        border-top-color: ${theme.colors.brand};
        animation: ${spin} 1s linear infinite;
      }
    `}
`;

const OverlayTitle = styled.p`
  margin: 0;
  font-size: clamp(14px, 0.95vw, 18px);
  font-weight: 700;
`;

const OverlayText = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSub};
`;

const SourceLine = styled.p`
  margin: 4px 0 0;
  max-width: 100%;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LiveBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px 5px 9px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(5, 7, 15, 0.62);
  backdrop-filter: blur(6px);
  color: ${({ theme }) => theme.colors.onDark};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.14em;
  pointer-events: none;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ff4d5e;
    box-shadow: 0 0 10px #ff4d5e;
    animation: ${pulse} 1.6s ease-in-out infinite;
  }
`;

function describeSource(source: StreamSource) {
  const type = source.type.toUpperCase();
  if (source.type === "webcam") return `${type} · ${source.deviceLabel ?? "default"}`;
  if (!source.url) return type;
  try {
    return `${type} · ${new URL(source.url).host}`;
  } catch {
    return `${type} · ${source.url}`;
  }
}

interface StreamViewProps {
  source: StreamSource;
  /** 우측 상단 LIVE 배지 표시 여부 */
  badge?: boolean;
}

/**
 * 설정된 방식(mjpeg/webrtc/hls/…)에 맞는 플레이어를 띄우고
 * 연결 상태 표시와 자동 재연결을 담당한다.
 */
export default function StreamView({ source, badge = true }: StreamViewProps) {
  const { t } = useI18n();
  const { reconnectSeconds } = useAvisConfig();
  const [state, setState] = useState<StreamState>({ status: "connecting", countdown: 0, attempt: 0 });

  const configured = source.type === "webcam" || (source.type !== "none" && Boolean(source.url));

  const handleStatus = useCallback(
    (next: PlayerStatus, detail?: string) =>
      setState((prev) => {
        if (next === "error") {
          return prev.status === "error" ? prev : { ...prev, status: "error", countdown: reconnectSeconds, detail };
        }
        // 오류 후 재연결 대기 중에는 이전 플레이어의 늦은 이벤트를 무시
        if (prev.status === "error" || prev.status === next) return prev;
        return { ...prev, status: next, detail: undefined };
      }),
    [reconnectSeconds],
  );

  useEffect(() => {
    if (state.status !== "error") return;
    const id = window.setInterval(() => {
      setState((prev) => {
        if (prev.status !== "error") return prev;
        if (prev.countdown <= 1) return { status: "connecting", countdown: 0, attempt: prev.attempt + 1 };
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.status]);

  const Player = source.type === "none" ? null : PLAYERS[source.type];
  const live = configured && state.status === "live";

  return (
    <Stage $live={live}>
      {configured && Player && (
        <Player key={`${source.type}|${source.url}|${state.attempt}`} source={source} onStatus={handleStatus} />
      )}

      {!configured && (
        <Overlay $dim={false}>
          <IconRing $tone="muted" aria-hidden>
            <Settings2 size={26} />
          </IconRing>
          <OverlayTitle>{t.stream.unconfigured}</OverlayTitle>
          <OverlayText>{t.stream.unconfiguredHint}</OverlayText>
        </Overlay>
      )}

      {configured && state.status === "connecting" && (
        <Overlay $dim={false} role="status">
          <IconRing $tone="brand" $spinning aria-hidden>
            <Radio size={24} />
          </IconRing>
          <OverlayTitle>{t.stream.connecting}</OverlayTitle>
          <SourceLine>{describeSource(source)}</SourceLine>
        </Overlay>
      )}

      {configured && state.status === "error" && (
        <Overlay $dim role="status">
          <IconRing $tone="live" aria-hidden>
            <VideoOff size={26} />
          </IconRing>
          <OverlayTitle>{t.stream.noSignal}</OverlayTitle>
          <OverlayText>{format(t.stream.reconnectIn, { s: state.countdown })}</OverlayText>
          <SourceLine title={state.detail}>
            {describeSource(source)}
            {state.detail ? ` — ${state.detail}` : ""}
          </SourceLine>
        </Overlay>
      )}

      {badge && live && <LiveBadge>{t.stream.live}</LiveBadge>}
    </Stage>
  );
}
