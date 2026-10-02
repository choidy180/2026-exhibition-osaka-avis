import { readFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_CONFIG, normalizeConfig } from "./defaults";
import type { AvisConfig } from "./types";

const CONFIG_FILE = "avis.config.json";

/**
 * 프로젝트 루트의 avis.config.json 을 요청마다 읽는다.
 * 전시장에서 IP 가 바뀌어도 파일만 수정하고 브라우저를 새로고침하면 된다 (재빌드 불필요).
 */
export async function loadAvisConfig(): Promise<AvisConfig> {
  try {
    const raw = await readFile(path.join(process.cwd(), CONFIG_FILE), "utf8");
    return normalizeConfig(JSON.parse(raw));
  } catch (error) {
    console.error(`[AVIS] ${CONFIG_FILE} 을(를) 읽지 못해 기본 설정을 사용합니다.`, error);
    return DEFAULT_CONFIG;
  }
}
