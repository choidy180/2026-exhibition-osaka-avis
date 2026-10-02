"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONFIG } from "./defaults";
import type { AvisConfig } from "./types";

const ConfigContext = createContext<AvisConfig>(DEFAULT_CONFIG);

export function ConfigProvider({ config, children }: { config: AvisConfig; children: ReactNode }) {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export function useAvisConfig() {
  return useContext(ConfigContext);
}
