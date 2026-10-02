"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import styled, { css } from "styled-components";
import { Film } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAvisConfig } from "@/lib/config/ConfigProvider";
import { usePlaylistStore } from "@/lib/PlaylistProvider";
import { MediaVideo } from "./players/shared";

const Stage = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.media};
`;

const Caption = styled.div<{ $compact: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? "7px" : "10px")};
  padding: ${({ $compact }) => ($compact ? "22px 12px 10px" : "40px 16px 14px")};
  background: linear-gradient(180deg, transparent, rgba(2, 3, 8, 0.86));
  color: ${({ theme }) => theme.colors.onDark};
  pointer-events: none;
`;

const CaptionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const Index = styled.span<{ $compact: boolean }>`
  flex: none;
  padding: 2px 7px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.brand};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ $compact }) => ($compact ? "10.5px" : "12px")};
  font-weight: 700;
  letter-spacing: 0.04em;
`;

const ClipTitle = styled.span<{ $compact: boolean }>`
  min-width: 0;
  font-size: ${({ $compact }) => ($compact ? "13px" : "clamp(15px, 1vw, 19px)")};
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.6);
`;

const Segments = styled.div`
  display: flex;
  gap: 4px;
`;

const Segment = styled.span<{ $compact: boolean }>`
  position: relative;
  flex: 1;
  height: ${({ $compact }) => ($compact ? "3px" : "4px")};
  overflow: hidden;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);

  & > span {
    position: absolute;
    inset: 0;
    transform-origin: left center;
    background: ${({ theme }) => theme.colors.brandOnMedia};
  }
`;

const Message = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
  background: rgba(2, 3, 8, 0.75);
`;

const Video = styled(MediaVideo)<{ $hidden: boolean }>`
  ${({ $hidden }) =>
    $hidden &&
    css`
      opacity: 0;
    `}
`;

/**
 * 시연 영상 3개(타임체크 → 무작업관리 → 불량역추적)를 순서대로 무한 반복 재생.
 * 화면을 이동해도 재생 위치를 이어서 재생한다.
 */
export default function DemoPlaylist({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useI18n();
  const { demoVideos } = useAvisConfig();
  const playlist = usePlaylistStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  const count = demoVideos.length;
  const [index, setIndex] = useState(() => (count ? playlist.read().index % count : 0));
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  const goNext = () => {
    const next = (index + 1) % count;
    playlist.save(next, 0);
    setIndex(next);
    setProgress(0);
    setFailed(false);
  };
  const skipFailed = useEffectEvent(goNext);

  // 파일을 읽지 못하면 잠시 안내 후 다음 영상으로
  useEffect(() => {
    if (!failed) return;
    const id = window.setTimeout(() => skipFailed(), 2500);
    return () => window.clearTimeout(id);
  }, [failed]);

  // src 는 마운트 후에 연결 — SSR 로 먼저 로드되면 하이드레이션 전에 발생한 error/loadedmetadata 를 놓친다
  const src = count ? demoVideos[index].src : undefined;
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    video.src = src;
    return () => {
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  if (!count) {
    return (
      <Stage>
        <Message>
          <Film size={26} aria-hidden />
          {t.playlist.empty}
        </Message>
      </Stage>
    );
  }

  const clip = demoVideos[index];

  return (
    <Stage>
      <Video
        ref={videoRef}
        $hidden={failed}
        autoPlay
        muted
        playsInline
        preload="auto"
        loop={count === 1}
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          const saved = playlist.read();
          if (saved.index === index && saved.time > 0 && saved.time < video.duration - 1) {
            video.currentTime = saved.time;
          }
        }}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (!video.duration) return;
          playlist.save(index, video.currentTime);
          setProgress(video.currentTime / video.duration);
        }}
        onEnded={() => goNext()}
        onError={(event) => {
          if (event.currentTarget.getAttribute("src")) setFailed(true);
        }}
      />

      {failed && (
        <Message role="status">
          <Film size={26} aria-hidden />
          {t.playlist.loadError}
        </Message>
      )}

      <Caption $compact={compact}>
        <CaptionRow>
          <Index $compact={compact}>
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </Index>
          <ClipTitle $compact={compact}>{clip.title[locale]}</ClipTitle>
        </CaptionRow>
        <Segments aria-hidden>
          {demoVideos.map((video, i) => (
            <Segment key={video.src + i} $compact={compact}>
              <span style={{ transform: `scaleX(${i < index ? 1 : i === index ? progress : 0})` }} />
            </Segment>
          ))}
        </Segments>
      </Caption>
    </Stage>
  );
}
