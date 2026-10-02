export const LOCALES = ["ko", "ja", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** 일본 전시회용이므로 기본 언어는 일본어 */
export const DEFAULT_LOCALE: Locale = "ja";
export const LOCALE_COOKIE = "avis-locale";

export const INTL_LOCALE: Record<Locale, string> = {
  ko: "ko-KR",
  ja: "ja-JP",
  en: "en-US",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
