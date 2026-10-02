"use client";

import styled, { keyframes } from "styled-components";

const enter = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
`;

const Page = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  animation: ${enter} 0.35s ease-out both;
`;

/** 화면 전환 시 부드럽게 나타나도록 페이지마다 새로 마운트되는 래퍼 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <Page>{children}</Page>;
}
