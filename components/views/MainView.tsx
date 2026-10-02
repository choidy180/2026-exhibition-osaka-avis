"use client";

import { Cctv, Clapperboard, Glasses, MousePointerClick, Repeat } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAvisConfig } from "@/lib/config/ConfigProvider";
import { usePanelLink } from "@/lib/hooks/usePanelLink";
import {
  Hint,
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
import DemoPlaylist from "@/components/media/DemoPlaylist";
import { Column, ViewGrid } from "./layout";

/** 1. 메인 — 왼쪽 AVIS 미러링 / 오른쪽 위 시연 영상 / 오른쪽 아래 컨베이어 카메라 */
export default function MainView() {
  const { t } = useI18n();
  const { streams } = useAvisConfig();
  const mirrorLink = usePanelLink("/mirror", t.panel.mirror);
  const conveyorLink = usePanelLink("/conveyor", t.panel.conveyor1);

  return (
    <ViewGrid $columns="minmax(0, 1.5fr) minmax(0, 1fr)">
      <Panel $interactive="zoom-in" {...mirrorLink}>
        <PanelHeader>
          <TitleIcon aria-hidden>
            <Glasses size={17} />
          </TitleIcon>
          <PanelTitle>{t.panel.mirror}</PanelTitle>
          <PanelSub>Vuzix M4000</PanelSub>
          <PanelActions>
            <Hint>
              <MousePointerClick size={15} aria-hidden />
              {t.hint.dblclickExpand}
            </Hint>
          </PanelActions>
        </PanelHeader>
        <PanelBody>
          <StreamView source={streams.mirror} />
        </PanelBody>
      </Panel>

      <Column>
        <Panel>
          <PanelHeader>
            <TitleIcon aria-hidden>
              <Clapperboard size={17} />
            </TitleIcon>
            <PanelTitle>{t.panel.demo}</PanelTitle>
            <PanelActions>
              <Hint>
                <Repeat size={14} aria-hidden />
                {t.hint.autoLoop}
              </Hint>
            </PanelActions>
          </PanelHeader>
          <PanelBody>
            <DemoPlaylist />
          </PanelBody>
        </Panel>

        <Panel $interactive="zoom-in" {...conveyorLink}>
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
          </PanelBody>
        </Panel>
      </Column>
    </ViewGrid>
  );
}
