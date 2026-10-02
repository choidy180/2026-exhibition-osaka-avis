"use client";

import { useEffect, useMemo, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { Check, PackageSearch } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useIsClient } from "@/lib/hooks/useClientState";
import {
  COLOR_SWATCH,
  STAGES,
  STAGE_DURATION,
  advanceFeed,
  createInitialFeed,
  serialOf,
  type ColorKey,
  type WorkStage,
} from "@/lib/mock/items";
import { Panel, PanelActions, PanelHeader, PanelTitle, TitleIcon } from "@/components/ui/Panel";

const STAGE_TONE: Record<WorkStage, "muted" | "info" | "warn" | "ok"> = {
  waiting: "muted",
  working: "info",
  inspecting: "warn",
  done: "ok",
};

const rise = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const ring = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(61, 71, 191, 0.35); }
  100% { box-shadow: 0 0 0 10px rgba(61, 71, 191, 0); }
`;

const Realtime = styled.span`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.ok};

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    animation: ${blink} 1.6s ease-in-out infinite;
  }
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 20px 16px;
  overflow: hidden;
`;

const Label = styled.span`
  display: block;
  margin-bottom: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Hero = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 16px;
  padding: 16px 18px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid rgba(61, 71, 191, 0.16);
  background: ${({ theme }) => theme.colors.brandTint};
  animation: ${rise} 0.4s ease-out both;
`;

const HeroValue = styled.div`
  font-size: clamp(22px, 1.6vw, 30px);
  font-weight: 800;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Serial = styled(HeroValue)`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-weight: 700;
  font-size: clamp(19px, 1.35vw, 26px);
  color: ${({ theme }) => theme.colors.brand};
`;

const Facts = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
`;

const Fact = styled.div`
  min-width: 0;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSub};
`;

const FactValue = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  font-size: clamp(15px, 0.95vw, 18px);
  font-weight: 700;
  white-space: nowrap;

  & > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Swatch = styled.span<{ $color: string }>`
  flex: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  box-shadow: inset 0 0 0 1px rgba(22, 26, 48, 0.22), 0 0 0 2px rgba(22, 26, 48, 0.06);
`;

const Avatar = styled.span`
  flex: none;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.brandTint};
  color: ${({ theme }) => theme.colors.brand};
  font-size: 12px;
  font-weight: 800;
`;

const toneColor = (tone: "muted" | "info" | "warn" | "ok") =>
  css`
    color: ${({ theme }) => (tone === "muted" ? theme.colors.textSub : theme.colors[tone])};
  `;

const StatusBadge = styled.span<{ $tone: "muted" | "info" | "warn" | "ok" }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 3px 10px 3px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: color-mix(in srgb, currentColor 11%, transparent);
  font-size: clamp(14px, 0.9vw, 17px);
  font-weight: 700;
  white-space: nowrap;
  ${({ $tone }) => toneColor($tone)}

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
`;

const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(${STAGES.length}, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Step = styled.li<{ $state: "past" | "current" | "future" }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  text-align: center;
  color: ${({ $state, theme }) => ($state === "future" ? theme.colors.textMuted : theme.colors.text)};

  /* 이전 단계와 이어지는 선 */
  &:not(:first-child)::before {
    content: "";
    position: absolute;
    top: 13px;
    right: 50%;
    width: 100%;
    height: 2px;
    background: ${({ $state, theme }) => ($state === "future" ? theme.colors.border : theme.colors.brand)};
    transition: background 0.4s;
  }
`;

const StepDot = styled.span<{ $state: "past" | "current" | "future" }>`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.onDark};
  transition: background 0.3s, border-color 0.3s;
  border: 2px solid ${({ $state, theme }) => ($state === "future" ? theme.colors.borderStrong : theme.colors.brand)};
  background: ${({ $state, theme }) => ($state === "past" ? theme.colors.brand : theme.colors.surface)};

  ${({ $state, theme }) =>
    $state === "current" &&
    css`
      animation: ${ring} 1.4s ease-out infinite;

      &::after {
        content: "";
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${theme.colors.brand};
      }
    `}
`;

const History = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 13.5px;

  th {
    padding: 0 10px 8px;
    text-align: left;
    font-size: 11.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMuted};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  td {
    padding: 9px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  tbody tr {
    animation: ${rise} 0.4s ease-out both;
  }
`;

const Mono = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const Inline = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

/** 공정 단계가 자동으로 진행되는 시뮬레이션 피드 */
function useItemFeed() {
  const [feed, setFeed] = useState(createInitialFeed);

  useEffect(() => {
    const id = window.setTimeout(() => setFeed((prev) => advanceFeed(prev)), STAGE_DURATION[feed.stage]);
    return () => window.clearTimeout(id);
  }, [feed]);

  return feed;
}

export default function ItemInfoPanel() {
  const { t, intlLocale } = useI18n();
  const isClient = useIsClient();
  const feed = useItemFeed();
  const { current, stage, history } = feed;

  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    [intlLocale],
  );

  const colorName = (color: ColorKey) => t.mock.colors[color];
  const workerName = t.mock.workers[current.worker];
  const stageIndex = STAGES.indexOf(stage);

  return (
    <Panel aria-labelledby="item-info-title" style={{ flex: 1 }}>
      <PanelHeader>
        <TitleIcon aria-hidden>
          <PackageSearch size={17} />
        </TitleIcon>
        <PanelTitle id="item-info-title">{t.panel.item}</PanelTitle>
        <PanelActions>
          <Realtime>{t.item.realtime}</Realtime>
        </PanelActions>
      </PanelHeader>

      <Body>
        <Hero key={current.seq}>
          <div>
            <Label>{t.item.name}</Label>
            <HeroValue>{t.mock.productName}</HeroValue>
          </div>
          <div>
            <Label>{t.item.serial}</Label>
            <Serial>{serialOf(current.seq)}</Serial>
          </div>
        </Hero>

        <Facts>
          <Fact>
            <Label>{t.item.color}</Label>
            <FactValue>
              <Swatch $color={COLOR_SWATCH[current.color]} aria-hidden />
              <span>{colorName(current.color)}</span>
            </FactValue>
          </Fact>
          <Fact>
            <Label>{t.item.worker}</Label>
            <FactValue>
              <Avatar aria-hidden>{workerName.charAt(0)}</Avatar>
              <span>{workerName}</span>
            </FactValue>
          </Fact>
          <Fact>
            <Label>{t.item.status}</Label>
            <FactValue>
              <StatusBadge $tone={STAGE_TONE[stage]} aria-live="polite">
                {t.item.statuses[stage]}
              </StatusBadge>
            </FactValue>
          </Fact>
        </Facts>

        <div>
          <Label>{t.item.progress}</Label>
          <Steps>
            {STAGES.map((s, i) => {
              const state = i < stageIndex || stage === "done" ? "past" : i === stageIndex ? "current" : "future";
              return (
                <Step key={s} $state={state} aria-current={i === stageIndex ? "step" : undefined}>
                  <StepDot $state={state} aria-hidden>
                    {state === "past" && <Check size={15} strokeWidth={3} />}
                  </StepDot>
                  {t.item.statuses[s]}
                </Step>
              );
            })}
          </Steps>
        </div>

        <History>
          <Label>{t.item.recent}</Label>
          <Table>
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "27%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{t.item.serial}</th>
                <th scope="col">{t.item.color}</th>
                <th scope="col">{t.item.worker}</th>
                <th scope="col">{t.item.time}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.seq}>
                  <td>
                    <Mono>{serialOf(item.seq)}</Mono>
                  </td>
                  <td>
                    <Inline>
                      <Swatch $color={COLOR_SWATCH[item.color]} aria-hidden />
                      {colorName(item.color)}
                    </Inline>
                  </td>
                  <td>{t.mock.workers[item.worker]}</td>
                  <td>
                    <Mono>{isClient ? timeFmt.format(item.completedAt) : "--:--:--"}</Mono>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </History>
      </Body>
    </Panel>
  );
}
