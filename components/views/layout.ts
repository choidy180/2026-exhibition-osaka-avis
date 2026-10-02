"use client";

import styled from "styled-components";
import { PanelBody } from "@/components/ui/Panel";

/** 화면별 그리드 공통: 헤더 아래 남은 높이를 모두 채운다 */
export const ViewGrid = styled.div<{ $columns: string }>`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: ${({ $columns }) => $columns};
  gap: ${({ theme }) => theme.layout.gap};

  @media (max-width: ${({ theme }) => theme.breakpoints.stack}) {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: minmax(360px, auto);
  }
`;

export const Column = styled.div`
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.layout.gap};

  & > * {
    flex: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.stack}) {
    & > * {
      min-height: 340px;
    }
  }
`;

/** 16:9 고정 비율 미디어 영역 (컨베이어 카메라 2·3) */
export const WideBody = styled(PanelBody)`
  flex: none;
  aspect-ratio: 16 / 9;
`;
