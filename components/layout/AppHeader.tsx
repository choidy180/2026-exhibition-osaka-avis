"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled, { css } from "styled-components";
import { FlaskConical, Maximize, Minimize, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useIsFullscreen } from "@/lib/hooks/useClientState";
import { useStageTest } from "@/lib/stage/StageTestProvider";
import SettingsDialog from "@/components/settings/SettingsDialog";
import NavTabs from "./NavTabs";
import HeaderClock from "./HeaderClock";

const Bar = styled.header`
  flex: none;
  height: ${({ theme }) => theme.layout.headerHeight};
  padding: 0 ${({ theme }) => theme.layout.gutter};
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 1px 3px rgba(22, 26, 48, 0.04);

  @media (max-width: ${({ theme }) => theme.breakpoints.stack}) {
    height: auto;
    padding-top: 12px;
    padding-bottom: 12px;
    grid-template-columns: 1fr auto;
    row-gap: 12px;

    & > nav {
      grid-column: 1 / -1;
      grid-row: 2;
      justify-self: start;
    }
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
`;

const Divider = styled.span`
  width: 1px;
  height: 30px;
  background: ${({ theme }) => theme.colors.border};
`;

const Wordmark = styled.span`
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.1;
`;

const Title = styled.span`
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.14em;
  background: linear-gradient(100deg, ${({ theme }) => theme.colors.text} 25%, ${({ theme }) => theme.colors.brand});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Tagline = styled.span`
  margin-top: 3px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSub};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Tools = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSub};
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

/** 품목 정보 테스트 모드 — 켜 있는 동안 주황으로 표시 */
const TestModeButton = styled(IconButton)<{ $active: boolean }>`
  ${({ $active, theme }) =>
    $active &&
    css`
      &,
      &:hover {
        color: ${theme.colors.warn};
        border-color: color-mix(in srgb, ${theme.colors.warn} 55%, transparent);
        background: color-mix(in srgb, ${theme.colors.warn} 10%, ${theme.colors.surface});
      }
    `}
`;

export default function AppHeader() {
  const { t } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isFullscreen = useIsFullscreen();
  const stageTest = useStageTest();
  const testMode = stageTest.sim !== null;
  const settingsButton = useRef<HTMLButtonElement>(null);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    settingsButton.current?.focus();
  };

  return (
    <Bar>
      <Brand href="/" aria-label="AVIS — DXSolutions">
        <Image src="/dxs-logo.svg" alt="DXSolutions" width={146} height={36} loading="eager" unoptimized />
        <Divider aria-hidden />
        <Wordmark>
          <Title>AVIS</Title>
          <Tagline>{t.app.tagline}</Tagline>
        </Wordmark>
      </Brand>

      <NavTabs />

      <Tools>
        <HeaderClock />
        <IconButton
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? t.action.exitFullscreen : t.action.fullscreen}
          title={isFullscreen ? t.action.exitFullscreen : t.action.fullscreen}
        >
          {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
        </IconButton>
        <IconButton
          ref={settingsButton}
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label={t.action.settings}
          aria-haspopup="dialog"
          title={t.action.settings}
        >
          <Settings size={20} />
        </IconButton>
        <TestModeButton
          type="button"
          onClick={stageTest.toggle}
          $active={testMode}
          aria-pressed={testMode}
          aria-label={t.action.testMode}
          title={t.action.testMode}
        >
          <FlaskConical size={19} />
        </TestModeButton>
      </Tools>

      {settingsOpen && <SettingsDialog onClose={closeSettings} />}
    </Bar>
  );
}
