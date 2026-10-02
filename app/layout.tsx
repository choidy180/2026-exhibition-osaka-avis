import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { JetBrains_Mono, Noto_Sans_JP, Noto_Sans_KR } from "next/font/google";
import StyledComponentsRegistry from "@/lib/registry";
import Providers from "@/components/Providers";
import AppShell from "@/components/layout/AppShell";
import { loadAvisConfig } from "@/lib/config/load";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from "@/lib/i18n/locales";

const notoJp = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-jp", display: "swap" });
const notoKr = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-kr", display: "swap", preload: false });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AVIS | DXSolutions",
    template: "%s | AVIS",
  },
  description: "Vuzix M4000 웨어러블 실시간 미러링 · 컨베이어 카메라 대시보드 — 디엑스솔루션즈(DXSolutions)",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const config = await loadAvisConfig();

  return (
    <html lang={locale} className={`${notoJp.variable} ${notoKr.variable} ${mono.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <Providers locale={locale} config={config}>
            <AppShell>{children}</AppShell>
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
