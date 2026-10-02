"use client";

import { useEffect, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

/** 패널을 더블클릭(또는 포커스 후 Enter)하면 href 로 이동 */
export function usePanelLink(href: string, label: string) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  return {
    role: "link" as const,
    tabIndex: 0,
    "aria-label": label,
    onDoubleClick: () => router.push(href),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter") router.push(href);
    },
  };
}
