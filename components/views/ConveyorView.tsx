"use client";

import { ArrowLeft, Cctv, MousePointerClick, ZoomIn } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAvisConfig } from "@/lib/config/ConfigProvider";
import { usePanelLink } from "@/lib/hooks/usePanelLink";
import {
  BackLink,
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

/** 3. 컨베이어 벨트 전체 카메라 크게 보기 — 왼쪽 아래 [자세히 보기] */
export default function ConveyorView() {
  const { t } = useI18n();
  const { streams } = useAvisConfig();
  const detailLink = usePanelLink("/conveyor/detail", t.action.details);

  return (
    <Panel $interactive="zoom-in" onDoubleClick={detailLink.onDoubleClick} style={{ flex: 1 }}>
      <PanelHeader>
        <BackLink href="/">
          <ArrowLeft size={16} aria-hidden />
          {t.action.back}
        </BackLink>
        <TitleIcon aria-hidden>
          <Cctv size={17} />
        </TitleIcon>
        <PanelTitle>{t.panel.conveyor1}</PanelTitle>
        <PanelSub>{t.panel.conveyor1Sub}</PanelSub>
        <PanelActions>
          <Hint>
            <MousePointerClick size={15} aria-hidden />
            {t.hint.dblclickDetails}
          </Hint>
          <Tag>CAM 01</Tag>
        </PanelActions>
      </PanelHeader>

      <PanelBody>
        <StreamView source={streams.conveyor1} />
        <OverlayLink href="/conveyor/detail" onDoubleClick={(event) => event.stopPropagation()}>
          <ZoomIn size={20} aria-hidden />
          {t.action.details}
        </OverlayLink>
      </PanelBody>
    </Panel>
  );
}
