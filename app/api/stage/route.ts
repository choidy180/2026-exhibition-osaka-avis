import { loadAvisConfig } from "@/lib/config/load";
import { relay } from "@/lib/config/relay";

/**
 * 글래스의 현재 시연 단계 중계 — avis.config.json 의 `wearableStage.url` (백엔드 `GET /v1/wearable/stage`).
 * 영상과 같이 브라우저는 대시보드 주소에만 붙는다. 주소는 설정 파일에서만 정하므로 아무 곳이나 열어 주지 않는다.
 */
export async function GET(request: Request) {
  const { wearableStage } = await loadAvisConfig();
  if (!wearableStage.url) return new Response("wearableStage.url is not configured", { status: 404 });

  return relay(request, new URL(wearableStage.url));
}
