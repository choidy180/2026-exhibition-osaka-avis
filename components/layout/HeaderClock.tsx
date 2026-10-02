"use client";

import { useMemo } from "react";
import styled from "styled-components";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useNowSecond } from "@/lib/hooks/useClientState";

const Clock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 6px;
  line-height: 1.15;
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const Time = styled.time`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text};
`;

const DateText = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export default function HeaderClock() {
  const { intlLocale } = useI18n();
  const now = useNowSecond();

  const [dateFmt, timeFmt] = useMemo(
    () => [
      new Intl.DateTimeFormat(intlLocale, { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" }),
      new Intl.DateTimeFormat(intlLocale, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
    ],
    [intlLocale],
  );

  return (
    <Clock aria-live="off">
      <Time dateTime={now ? new Date(now).toISOString() : undefined}>{now ? timeFmt.format(now) : "--:--:--"}</Time>
      <DateText>{now ? dateFmt.format(now) : " "}</DateText>
    </Clock>
  );
}
