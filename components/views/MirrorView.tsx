"use client";

import styled from "styled-components";
import { ArrowLeft, Clapperboard, Glasses, MousePointerClick } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAvisConfig } from "@/lib/config/ConfigProvider";
import { usePanelLink } from "@/lib/hooks/usePanelLink";
import {
  BackLink,
  Hint,
  Panel,
  PanelActions,
  PanelBody,
  PanelHeader,
  PanelSub,
  PanelTitle,
  TitleIcon,
} from "@/components/ui/Panel";
import StreamView from "@/components/media/StreamView";
import DemoPlaylist from "@/components/media/DemoPlaylist";

const Pip = styled.aside`
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 4;
  width: clamp(280px, 24%, 480px);
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 3px solid ${({ theme }) => theme.colors.surface};
  box-shadow: 0 20px 50px -14px rgba(22, 26, 48, 0.55);
  cursor: default;
`;

const PipLabel = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(5, 7, 15, 0.66);
  backdrop-filter: blur(6px);
  color: ${({ theme }) => theme.colors.onDark};
  font-size: 11.5px;
  font-weight: 700;
  pointer-events: none;
`;

/** 2. AVIS 미러링 전체 화면 — 오른쪽 아래 작은 화면에 시연 영상 */
export default function MirrorView() {
  const { t } = useI18n();
  const { streams } = useAvisConfig();
  const backLink = usePanelLink("/", t.action.back);

  return (
    <Panel $interactive="zoom-out" onDoubleClick={backLink.onDoubleClick} style={{ flex: 1 }}>
      <PanelHeader>
        <BackLink href="/">
          <ArrowLeft size={16} aria-hidden />
          {t.action.back}
        </BackLink>
        <TitleIcon aria-hidden>
          <Glasses size={17} />
        </TitleIcon>
        <PanelTitle>{t.panel.mirror}</PanelTitle>
        <PanelSub>Vuzix M4000</PanelSub>
        <PanelActions>
          <Hint>
            <MousePointerClick size={15} aria-hidden />
            {t.hint.dblclickBack}
          </Hint>
        </PanelActions>
      </PanelHeader>

      <PanelBody>
        <StreamView source={streams.mirror} />

        <Pip aria-label={t.panel.demo} onDoubleClick={(event) => event.stopPropagation()}>
          <PipLabel>
            <Clapperboard size={13} aria-hidden />
            {t.panel.demo}
          </PipLabel>
          <DemoPlaylist compact />
        </Pip>
      </PanelBody>
    </Panel>
  );
}
