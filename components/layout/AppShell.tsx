"use client";

import type { ReactNode } from "react";
import styled from "styled-components";
import AppHeader from "./AppHeader";

const Shell = styled.div`
  height: 100dvh;
  display: flex;
  flex-direction: column;

  @media (max-width: ${({ theme }) => theme.breakpoints.stack}) {
    height: auto;
    min-height: 100dvh;
  }
`;

const Main = styled.main`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.layout.gutter};
`;

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <Shell>
      <AppHeader />
      <Main>{children}</Main>
    </Shell>
  );
}
