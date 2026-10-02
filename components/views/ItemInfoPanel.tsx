"use client";

import { useMemo } from "react";
import styled, { css, keyframes, type DefaultTheme } from "styled-components";
import {
  Check,
  CircleCheck,
  FileText,
  FlaskConical,
  Hourglass,
  PackageSearch,
  Pause,
  Play,
  TriangleAlert,
  WifiOff,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useNowSecond } from "@/lib/hooks/useClientState";
import { COLOR_SWATCH, CURRENT_ITEM, serialOf } from "@/lib/mock/items";
import { WEARABLE_STAGES, type StageReading, type StageStatus, type WearableStage } from "@/lib/stage/types";
import { useWearableStage } from "@/lib/stage/useWearableStage";
import { simToReading, useStageTest, type StageSim } from "@/lib/stage/StageTestProvider";
import { Panel, PanelActions, PanelHeader, PanelTitle, TitleIcon } from "@/components/ui/Panel";

type Tone = "muted" | "ok" | "danger" | "warn" | "info";
type StepState = "past" | "current" | "future";

const STAGE_TONE: Record<WearableStage, Tone> = { 1: "ok", 2: "danger", 3: "warn", 4: "info" };
const STAGE_ICON: Record<WearableStage, LucideIcon> = { 1: CircleCheck, 2: TriangleAlert, 3: Wrench, 4: FileText };

const INDICATOR: Record<StageStatus, { tone: Tone; pulse: boolean }> = {
  live: { tone: "ok", pulse: true },
  connecting: { tone: "muted", pulse: true },
  offline: { tone: "danger", pulse: false },
  unconfigured: { tone: "muted", pulse: false },
};

const toneColor = (theme: DefaultTheme, tone: Tone) => (tone === "muted" ? theme.colors.textSub : theme.colors[tone]);

/** 00:55 · 14:46 · 1:02:03 */
function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const mmss = `${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

const rise = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
`;

const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const ring = keyframes`
  0%   { box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 40%, transparent); }
  100% { box-shadow: 0 0 0 10px transparent; }
`;

const alert = keyframes`
  0%, 100% { background: color-mix(in srgb, currentColor 11%, transparent); }
  50% { background: color-mix(in srgb, currentColor 22%, transparent); }
`;

/** 패널 맨 위 단계 색 띠 — 정상(1)일 때는 표시하지 않는다 */
const Accent = styled.span<{ $tone: Tone | null }>`
  position: absolute;
  inset: 0 0 auto;
  z-index: 1;
  height: 3px;
  background: ${({ $tone, theme }) => ($tone ? toneColor(theme, $tone) : "transparent")};
  transition: background 0.3s;
`;

const Indicator = styled.span<{ $tone: Tone; $pulse: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ $tone, theme }) => toneColor(theme, $tone)};

  &::before {
    content: "";
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    ${({ $pulse }) =>
      $pulse &&
      css`
        animation: ${blink} 1.6s ease-in-out infinite;
      `}
  }
`;

const TestBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px 3px 7px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px dashed color-mix(in srgb, ${({ theme }) => theme.colors.warn} 55%, transparent);
  background: color-mix(in srgb, ${({ theme }) => theme.colors.warn} 9%, transparent);
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.warn};
  white-space: nowrap;
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

const LabelRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;

  & > ${Label} {
    margin-bottom: 0;
  }
`;

const ElapsedText = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;

  & > span {
    margin-left: 6px;
    font-size: 14px;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
  }
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

/** 작업 상태 칸은 단계 색으로 옅게 칠한다 */
const StatusFact = styled(Fact)<{ $tone: Tone }>`
  transition: border-color 0.3s, background 0.3s;

  ${({ $tone, theme }) =>
    $tone !== "muted" &&
    css`
      border-color: color-mix(in srgb, ${toneColor(theme, $tone)} 32%, ${theme.colors.border});
      background: color-mix(in srgb, ${toneColor(theme, $tone)} 6%, ${theme.colors.surface});
    `}
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

const StatusBadge = styled.span<{ $tone: Tone }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 3px 11px 3px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: color-mix(in srgb, currentColor 11%, transparent);
  font-size: clamp(14px, 0.9vw, 17px);
  font-weight: 700;
  white-space: nowrap;
  color: ${({ $tone, theme }) => toneColor(theme, $tone)};
  transition: color 0.3s;

  & > svg {
    flex: none;
  }

  ${({ $tone }) =>
    $tone === "danger" &&
    css`
      animation: ${alert} 1.2s ease-in-out infinite;
    `}
`;

const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(${WEARABLE_STAGES.length}, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Step = styled.li<{ $state: StepState; $tone: Tone }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: ${({ $state }) => ($state === "current" ? 700 : 600)};
  text-align: center;
  color: ${({ $state, $tone, theme }) =>
    $state === "current" ? toneColor(theme, $tone) : $state === "past" ? theme.colors.text : theme.colors.textMuted};
  transition: color 0.3s;

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

const StepDot = styled.span<{ $state: StepState }>`
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  font-weight: 700;
  transition: background 0.3s, border-color 0.3s;

  ${({ $state, theme }) => {
    if ($state === "past") {
      return css`
        border-color: ${theme.colors.brand};
        background: ${theme.colors.brand};
        color: ${theme.colors.onDark};
      `;
    }
    if ($state === "current") {
      // 색은 Step 의 단계 색(currentColor)을 그대로 받는다
      return css`
        border-color: currentColor;
        background: currentColor;
        animation: ${ring} 1.4s ease-out infinite;

        & > svg {
          color: ${theme.colors.onDark};
        }
      `;
    }
    return css`
      border-color: ${theme.colors.borderStrong};
      background: ${theme.colors.surface};
      color: ${theme.colors.textMuted};
    `;
  }}
`;

/** 이력이 넘치면 아래 끝을 흐리게 잘라 낸다 */
const History = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  mask-image: linear-gradient(to bottom, #000 calc(100% - 36px), transparent);
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

  tbody tr[data-current] td {
    background: ${({ theme }) => theme.colors.surfaceSub};
    font-weight: 700;
  }
`;

const EmptyCell = styled.td`
  && {
    padding: 18px 10px;
    text-align: center;
    color: ${({ theme }) => theme.colors.textMuted};
    white-space: normal;
  }
`;

const StageChip = styled.span<{ $tone: Tone }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  color: ${({ $tone, theme }) => toneColor(theme, $tone)};

  & > svg {
    flex: none;
  }
`;

const Ongoing = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 7px;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.ok};
    animation: ${blink} 1.6s ease-in-out infinite;
  }
`;

const Mono = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const Toolbar = styled.div`
  flex: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 9px 10px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px dashed color-mix(in srgb, ${({ theme }) => theme.colors.warn} 45%, transparent);
  background: color-mix(in srgb, ${({ theme }) => theme.colors.warn} 5%, ${({ theme }) => theme.colors.surface});
`;

const ToolbarIcon = styled.span`
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  margin-right: 2px;
  color: ${({ theme }) => theme.colors.warn};
`;

const ToolbarDivider = styled.span`
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background: ${({ theme }) => theme.colors.border};
`;

const Chip = styled.button<{ $tone: Tone }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px 0 9px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSub};
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &[aria-pressed="true"] {
    color: ${({ $tone, theme }) => ($tone === "muted" ? theme.colors.text : toneColor(theme, $tone))};
    border-color: color-mix(in srgb, currentColor 50%, transparent);
    background: color-mix(in srgb, currentColor 10%, ${({ theme }) => theme.colors.surface});
  }
`;

/** 1초마다 갱신되는 경과 시간 — 패널 전체가 매초 다시 그려지지 않도록 따로 둔다 */
function Elapsed({ since }: { since: number }) {
  const now = useNowSecond();
  return <Mono>{now === null ? "--:--" : formatDuration(now - since)}</Mono>;
}

function TestToolbar({ sim }: { sim: StageSim }) {
  const { t } = useI18n();
  const { select, toggleOffline, toggleAuto } = useStageTest();

  return (
    <Toolbar role="toolbar" aria-label={t.test.toolbar}>
      <ToolbarIcon aria-hidden>
        <FlaskConical size={16} />
      </ToolbarIcon>
      <Chip type="button" $tone="muted" aria-pressed={sim.stage === null} onClick={() => select(null)}>
        <Hourglass size={14} aria-hidden />
        {t.test.idle}
      </Chip>
      {WEARABLE_STAGES.map((s) => {
        const Icon = STAGE_ICON[s];
        return (
          <Chip key={s} type="button" $tone={STAGE_TONE[s]} aria-pressed={sim.stage === s} onClick={() => select(s)}>
            <Icon size={14} aria-hidden />
            {t.item.stages[s]}
          </Chip>
        );
      })}
      <ToolbarDivider aria-hidden />
      <Chip type="button" $tone="danger" aria-pressed={sim.offline} onClick={toggleOffline}>
        <WifiOff size={14} aria-hidden />
        {t.test.offline}
      </Chip>
      <Chip type="button" $tone="info" aria-pressed={sim.auto} onClick={toggleAuto}>
        {sim.auto ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
        {t.test.auto}
      </Chip>
    </Toolbar>
  );
}

export default function ItemInfoPanel() {
  const { t, intlLocale } = useI18n();
  const { sim } = useStageTest();
  const liveReading = useWearableStage(sim === null);
  const reading: StageReading = sim ? simToReading(sim) : liveReading;
  const { status, snapshot } = reading;
  const stage = snapshot?.stage ?? null;

  const timeFmt = useMemo(
    () => new Intl.DateTimeFormat(intlLocale, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    [intlLocale],
  );

  const workerName = t.mock.workers[CURRENT_ITEM.worker];
  const indicator = INDICATOR[status];
  const indicatorText = {
    live: t.item.realtime,
    connecting: t.item.connecting,
    offline: t.item.offline,
    unconfigured: t.item.unconfigured,
  }[status];

  let badge: { tone: Tone; Icon: LucideIcon; text: string };
  if (stage !== null) {
    badge = { tone: STAGE_TONE[stage], Icon: STAGE_ICON[stage], text: t.item.stages[stage] };
  } else if (snapshot) {
    badge = { tone: "muted", Icon: Hourglass, text: t.item.idle };
  } else if (status === "offline") {
    badge = { tone: "danger", Icon: WifiOff, text: t.item.offline };
  } else {
    badge = { tone: "muted", Icon: Hourglass, text: status === "unconfigured" ? t.item.unconfigured : t.item.connecting };
  }

  const history = snapshot?.history ?? [];
  const since = snapshot?.since ?? null;
  /** 이력 첫 줄이 지금 단계면 소요 시간 대신 경과 시간을 흘려 보여 준다 */
  const ongoing = stage !== null && since !== null && history[0]?.stage === stage;

  let emptyText = t.item.noHistory;
  if (status === "unconfigured") emptyText = t.item.unconfiguredHint;
  else if (!snapshot) emptyText = status === "offline" ? t.item.offlineHint : t.item.connecting;

  return (
    <Panel aria-labelledby="item-info-title" style={{ flex: 1 }}>
      <Accent $tone={stage === null || stage === 1 ? null : STAGE_TONE[stage]} aria-hidden />
      <PanelHeader>
        <TitleIcon aria-hidden>
          <PackageSearch size={17} />
        </TitleIcon>
        <PanelTitle id="item-info-title">{t.panel.item}</PanelTitle>
        <PanelActions>
          {sim && (
            <TestBadge>
              <FlaskConical size={13} aria-hidden />
              {t.test.badge}
            </TestBadge>
          )}
          <Indicator $tone={indicator.tone} $pulse={indicator.pulse}>
            {indicatorText}
          </Indicator>
        </PanelActions>
      </PanelHeader>

      <Body>
        <Hero>
          <div>
            <Label>{t.item.name}</Label>
            <HeroValue>{t.mock.productName}</HeroValue>
          </div>
          <div>
            <Label>{t.item.serial}</Label>
            <Serial>{serialOf(CURRENT_ITEM.seq)}</Serial>
          </div>
        </Hero>

        <Facts>
          <Fact>
            <Label>{t.item.color}</Label>
            <FactValue>
              <Swatch $color={COLOR_SWATCH[CURRENT_ITEM.color]} aria-hidden />
              <span>{t.mock.colors[CURRENT_ITEM.color]}</span>
            </FactValue>
          </Fact>
          <Fact>
            <Label>{t.item.worker}</Label>
            <FactValue>
              <Avatar aria-hidden>{workerName.charAt(0)}</Avatar>
              <span>{workerName}</span>
            </FactValue>
          </Fact>
          <StatusFact $tone={badge.tone}>
            <Label>{t.item.status}</Label>
            <FactValue>
              <StatusBadge $tone={badge.tone} aria-live="polite">
                <badge.Icon size={16} strokeWidth={2.4} aria-hidden />
                {badge.text}
              </StatusBadge>
            </FactValue>
          </StatusFact>
        </Facts>

        <div>
          <LabelRow>
            <Label>{t.item.progress}</Label>
            {stage !== null && since !== null && (
              <ElapsedText>
                {t.item.elapsed}
                <Elapsed since={since} />
              </ElapsedText>
            )}
          </LabelRow>
          <Steps>
            {WEARABLE_STAGES.map((s) => {
              const state: StepState = stage === null || s > stage ? "future" : s < stage ? "past" : "current";
              const Icon = STAGE_ICON[s];
              return (
                <Step key={s} $state={state} $tone={STAGE_TONE[s]} aria-current={state === "current" ? "step" : undefined}>
                  <StepDot $state={state} aria-hidden>
                    {state === "past" ? (
                      <Check size={15} strokeWidth={3} />
                    ) : state === "current" ? (
                      <Icon size={15} strokeWidth={2.4} />
                    ) : (
                      s
                    )}
                  </StepDot>
                  {t.item.stages[s]}
                </Step>
              );
            })}
          </Steps>
        </div>

        <History>
          <Label>{t.item.history}</Label>
          <Table>
            <colgroup>
              <col style={{ width: "44%" }} />
              <col style={{ width: "28%" }} />
              <col style={{ width: "28%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">{t.item.stage}</th>
                <th scope="col">{t.item.startedAt}</th>
                <th scope="col">{t.item.duration}</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <EmptyCell colSpan={3}>{emptyText}</EmptyCell>
                </tr>
              ) : (
                history.map((entry, i) => {
                  const Icon = STAGE_ICON[entry.stage];
                  const current = i === 0 && ongoing;
                  return (
                    <tr key={`${entry.at}-${entry.stage}`} data-current={current || undefined}>
                      <td>
                        <StageChip $tone={STAGE_TONE[entry.stage]}>
                          <Icon size={15} aria-hidden />
                          {t.item.stages[entry.stage]}
                        </StageChip>
                      </td>
                      <td>
                        <Mono>{timeFmt.format(entry.at)}</Mono>
                      </td>
                      <td>
                        {current && since !== null ? (
                          <Ongoing>
                            <Elapsed since={since} />
                          </Ongoing>
                        ) : i > 0 ? (
                          <Mono>{formatDuration(history[i - 1].at - entry.at)}</Mono>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </History>

        {sim && <TestToolbar sim={sim} />}
      </Body>
    </Panel>
  );
}
