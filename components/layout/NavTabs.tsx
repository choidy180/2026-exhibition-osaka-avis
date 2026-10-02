"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styled, { css } from "styled-components";
import { Cctv, Glasses, LayoutDashboard, ScanSearch, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const TABS: { href: string; icon: LucideIcon; label: keyof Dictionary["nav"] }[] = [
  { href: "/", icon: LayoutDashboard, label: "main" },
  { href: "/mirror", icon: Glasses, label: "mirror" },
  { href: "/conveyor", icon: Cctv, label: "conveyor" },
  { href: "/conveyor/detail", icon: ScanSearch, label: "detail" },
];

const Nav = styled.nav`
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceSub};
`;

const Tab = styled(Link)<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.textSub};
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  ${({ $active, theme }) =>
    $active &&
    css`
      color: ${theme.colors.onDark};
      background: ${theme.colors.brand};
      box-shadow: 0 6px 16px -8px ${theme.colors.brand};

      &:hover {
        color: ${theme.colors.onDark};
      }
    `}
`;

export default function NavTabs() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <Nav aria-label={t.nav.label}>
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Tab key={href} href={href} $active={active} aria-current={active ? "page" : undefined}>
            <Icon size={16} aria-hidden />
            {t.nav[label]}
          </Tab>
        );
      })}
    </Nav>
  );
}
