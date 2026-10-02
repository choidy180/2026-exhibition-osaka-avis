"use client";

import Link from "next/link";
import styled, { css } from "styled-components";

export const Panel = styled.section<{ $interactive?: "zoom-in" | "zoom-out" }>`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.panel};
  transition: border-color 0.2s, box-shadow 0.2s;

  ${({ $interactive, theme }) =>
    $interactive &&
    css`
      cursor: ${$interactive};
      user-select: none;

      &:hover {
        border-color: ${theme.colors.borderStrong};
        box-shadow: ${theme.shadows.raised};
      }
    `}
`;

export const PanelHeader = styled.header`
  flex: none;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 0 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const TitleIcon = styled.span`
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.brandTint};
  color: ${({ theme }) => theme.colors.brand};
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: clamp(15px, 0.9vw, 19px);
  font-weight: 700;
  white-space: nowrap;
`;

export const PanelSub = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
`;

export const PanelActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

export const Hint = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Tag = styled.span`
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSub};
  background: ${({ theme }) => theme.colors.surfaceSub};
  white-space: nowrap;
`;

export const PanelBody = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  background: ${({ theme }) => theme.colors.mediaIdle};
`;

export const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px 0 8px;
  margin-right: 4px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSub};
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s, background 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

/** 영상 위 왼쪽 아래에 떠 있는 큰 이동 버튼 (자세히 보기 / 크게보기) */
export const OverlayLink = styled(Link)`
  position: absolute;
  left: 20px;
  bottom: 20px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  padding: 0 22px 0 18px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: ${({ theme }) => theme.colors.brand};
  box-shadow: 0 12px 30px -10px rgba(61, 71, 191, 0.7);
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onDark};
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: ${({ theme }) => theme.colors.brandBright};
    transform: translateY(-1px);
  }
`;
