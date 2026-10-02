/** 디엑스솔루션즈 로고의 인디고 블루(#3D47BF / #7980D1)를 기반으로 한 화이트 대시보드 테마 */
export const theme = {
  colors: {
    bg: "#F3F5FA",
    surface: "#FFFFFF",
    /** 카드 안의 옅은 영역 (필드, 옵션 등) */
    surfaceSub: "#F6F7FB",
    surfaceHover: "#EDF0F8",
    /** 영상 재생 중 레터박스 */
    media: "#0E1220",
    /** 연결 대기·신호 없음 상태의 영상 영역 */
    mediaIdle: "#EEF1F8",
    border: "#E2E5EF",
    borderStrong: "#C7CCE0",
    brand: "#3D47BF",
    brandBright: "#4E59D6",
    brandSoft: "#7980D1",
    brandTint: "rgba(61, 71, 191, 0.09)",
    /** 영상 위(어두운 배경)에 올라가는 강조색 */
    brandOnMedia: "#8C94FF",
    text: "#161A30",
    textSub: "#4B5270",
    textMuted: "#6B718C",
    /** 브랜드색/영상 위 글자 */
    onDark: "#FFFFFF",
    backdrop: "rgba(22, 26, 48, 0.38)",
    live: "#D92D45",
    ok: "#0B8457",
    danger: "#D92D45",
    warn: "#B26B00",
    info: "#1769C2",
  },
  shadows: {
    panel: "0 1px 2px rgba(22, 26, 48, 0.04), 0 10px 28px -16px rgba(22, 26, 48, 0.16)",
    raised: "0 2px 6px rgba(22, 26, 48, 0.06), 0 24px 60px -20px rgba(22, 26, 48, 0.3)",
  },
  radii: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    pill: "999px",
  },
  fonts: {
    mono: "var(--font-mono), ui-monospace, Consolas, monospace",
  },
  layout: {
    headerHeight: "72px",
    gutter: "18px",
    gap: "16px",
  },
  breakpoints: {
    stack: "1100px",
  },
} as const;

export type AppTheme = typeof theme;
