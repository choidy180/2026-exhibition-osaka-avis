"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  html {
    color-scheme: light;
    -webkit-text-size-adjust: 100%;
  }

  body {
    min-height: 100dvh;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.text};
    background:
      radial-gradient(1200px 640px at 8% -12%, rgba(61, 71, 191, 0.07), transparent 62%),
      radial-gradient(900px 520px at 108% 112%, rgba(121, 128, 209, 0.08), transparent 60%),
      ${({ theme }) => theme.colors.bg};
    background-attachment: fixed;
    font-family: var(--font-jp), var(--font-kr), "Hiragino Sans", "Yu Gothic UI", Meiryo, "Malgun Gothic", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html[lang="ko"] body {
    font-family: var(--font-kr), var(--font-jp), "Malgun Gothic", "Apple SD Gothic Neo", system-ui, sans-serif;
  }

  button {
    font: inherit;
    color: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brandBright};
    outline-offset: 2px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.stack}) {
    body {
      overflow: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
