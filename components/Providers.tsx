"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/locales";
import { ConfigProvider } from "@/lib/config/ConfigProvider";
import type { AvisConfig } from "@/lib/config/types";
import { PlaylistProvider } from "@/lib/PlaylistProvider";
import { GlobalStyle } from "./GlobalStyle";

interface ProvidersProps {
  locale: Locale;
  config: AvisConfig;
  children: ReactNode;
}

export default function Providers({ locale, config, children }: ProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <I18nProvider initialLocale={locale}>
        <ConfigProvider config={config}>
          <PlaylistProvider>{children}</PlaylistProvider>
        </ConfigProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
