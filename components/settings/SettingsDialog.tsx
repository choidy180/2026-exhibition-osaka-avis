"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import styled, { css, keyframes } from "styled-components";
import { Check, Languages, Settings, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/locales";

const LANGUAGE_OPTIONS: { code: Locale; native: string; caption: string }[] = [
  { code: "ko", native: "한국어", caption: "Korean · KO" },
  { code: "ja", native: "日本語", caption: "Japanese · JA" },
  { code: "en", native: "English", caption: "English · EN" },
];

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const popIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: none; }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.colors.backdrop};
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 0.18s ease-out both;
`;

const Card = styled.div`
  width: min(460px, 100%);
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.raised};
  animation: ${popIn} 0.22s ease-out both;
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 18px 16px 22px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeadIcon = styled.span`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.brandTint};
  color: ${({ theme }) => theme.colors.brand};
`;

const Title = styled.h2`
  margin: 0;
  flex: 1;
  font-size: 19px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSub};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Body = styled.div`
  padding: 20px 22px 24px;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const SectionHint = styled.p`
  margin: 6px 0 14px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Options = styled.div`
  display: grid;
  gap: 10px;
`;

const Option = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 16px;
  text-align: left;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSub};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  ${({ $selected, theme }) =>
    $selected &&
    css`
      border-color: ${theme.colors.brand};
      background: ${theme.colors.brandTint};
      box-shadow: inset 0 0 0 1px ${theme.colors.brand};

      &:hover {
        border-color: ${theme.colors.brand};
        background: ${theme.colors.brandTint};
      }
    `}
`;

const OptionText = styled.span`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Native = styled.span`
  font-size: 18px;
  font-weight: 700;
`;

const Caption = styled.span`
  font-size: 12px;
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Radio = styled.span<{ $selected: boolean }>`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${({ $selected, theme }) => ($selected ? theme.colors.brand : theme.colors.borderStrong)};
  background: ${({ $selected, theme }) => ($selected ? theme.colors.brand : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.onDark};
`;

const Foot = styled.div`
  padding: 12px 22px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export default function SettingsDialog({ onClose }: { onClose: () => void }) {
  const { t, locale, setLocale } = useI18n();
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cardRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <Backdrop onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <Card ref={cardRef} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <Head>
          <HeadIcon aria-hidden>
            <Settings size={18} />
          </HeadIcon>
          <Title id={titleId}>{t.settings.title}</Title>
          <CloseButton type="button" onClick={onClose} aria-label={t.action.close}>
            <X size={20} />
          </CloseButton>
        </Head>

        <Body>
          <SectionLabel>
            <Languages size={17} aria-hidden />
            {t.settings.language}
            {locale !== "en" && <Caption as="span">· Language</Caption>}
          </SectionLabel>
          <SectionHint>{t.settings.languageHint}</SectionHint>

          <Options role="radiogroup" aria-label={t.settings.language}>
            {LANGUAGE_OPTIONS.map(({ code, native, caption }) => {
              const selected = code === locale;
              return (
                <Option
                  key={code}
                  type="button"
                  role="radio"
                  lang={code}
                  aria-checked={selected}
                  $selected={selected}
                  onClick={() => setLocale(code)}
                >
                  <OptionText>
                    <Native>{native}</Native>
                    <Caption>{caption}</Caption>
                  </OptionText>
                  <Radio $selected={selected} aria-hidden>
                    {selected && <Check size={14} strokeWidth={3} />}
                  </Radio>
                </Option>
              );
            })}
          </Options>
        </Body>

        <Foot>AVIS · {t.app.company}</Foot>
      </Card>
    </Backdrop>,
    document.body,
  );
}
