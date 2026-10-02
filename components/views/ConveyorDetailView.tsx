"use client";

import styled from "styled-components";
import { Cctv, Maximize2, MousePointerClick } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAvisConfig } from "@/lib/config/ConfigProvider";
import { usePanelLink } from "@/lib/hooks/usePanelLink";
import type { StreamSource } from "@/lib/config/types";
import {
  Hint,
  OverlayLink,
  Panel,
  PanelActions,
  PanelBody,
  PanelHeader,
  PanelSub,
  PanelTitle,
  Tag,
  TitleIcon,
} from "@/components/ui/Panel";
import StreamView from "@/components/media/StreamView";
import ItemInfoPanel from "./ItemInfoPanel";
import { ViewGrid, WideBody } from "./layout";

const Right = styled.div`
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.layout.gap};
`;

const CameraRow = styled.div`
  flex: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.layout.gap};
`;

function SideCamera({ title, tag, source }: { title: string; tag: string; source: StreamSource }) {
  return (
    <Panel>
      <PanelHeader>
        <TitleIcon aria-hidden>
          <Cctv size={16} />
        </TitleIcon>
        <PanelTitle>{title}</PanelTitle>
        <PanelActions>
          <Tag>{tag}</Tag>
        </PanelActions>
      </PanelHeader>
      <WideBody>
        <StreamView source={source} />
      </WideBody>
    </Panel>
  );
}

/**
 * 4. 컨베이어 상세 — 왼쪽 카메라 1 [크게보기],
 * 오른쪽 위 품목 정보 / 오른쪽 아래 카메라 2 · 3
 */
export default function ConveyorDetailView() {
  const { t } = useI18n();
  const { streams } = useAvisConfig();
  const enlargeLink = usePanelLink("/conveyor", t.action.enlarge);

  return (
    <ViewGrid $columns="minmax(0, 1.25fr) minmax(0, 1fr)">
      <Panel $interactive="zoom-in" onDoubleClick={enlargeLink.onDoubleClick}>
        <PanelHeader>
          <TitleIcon aria-hidden>
            <Cctv size={17} />
          </TitleIcon>
          <PanelTitle>{t.panel.conveyor1}</PanelTitle>
          <PanelSub>{t.panel.conveyor1Sub}</PanelSub>
          <PanelActions>
            <Hint>
              <MousePointerClick size={15} aria-hidden />
              {t.hint.dblclickExpand}
            </Hint>
            <Tag>CAM 01</Tag>
          </PanelActions>
        </PanelHeader>
        <PanelBody>
          <StreamView source={streams.conveyor1} />
          <OverlayLink href="/conveyor" onDoubleClick={(event) => event.stopPropagation()}>
            <Maximize2 size={19} aria-hidden />
            {t.action.enlarge}
          </OverlayLink>
        </PanelBody>
      </Panel>

      <Right>
        <ItemInfoPanel />
        <CameraRow>
          <SideCamera title={t.panel.conveyor2} tag="CAM 02" source={streams.conveyor2} />
          <SideCamera title={t.panel.conveyor3} tag="CAM 03" source={streams.conveyor3} />
        </CameraRow>
      </Right>
    </ViewGrid>
  );
}
