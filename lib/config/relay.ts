import { loadAvisConfig } from "./load";
import type { StreamType } from "./types";

/** avis.config.json 에 해당 type 으로 등록된 주소인지 — 아무 주소나 대신 열어 주는 프록시가 되지 않도록 */
export async function isConfiguredSource(type: StreamType, src: string) {
  const { streams } = await loadAvisConfig();
  return Object.values(streams).some((s) => s.type === type && s.url === src);
}

/**
 * upstream 응답 본문을 그대로 흘려 보낸다. 보는 화면을 떠나면 request.signal 로 upstream 연결도 함께 닫힌다.
 * contentType 을 주면 그 값으로 바꿔 보낸다.
 */
export async function relay(request: Request, upstream: URL, contentType?: string) {
  try {
    const res = await fetch(upstream, { cache: "no-store", signal: request.signal });
    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": contentType ?? res.headers.get("Content-Type") ?? "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new Response(`upstream error: ${error instanceof Error ? error.message : String(error)}`, { status: 502 });
  }
}
