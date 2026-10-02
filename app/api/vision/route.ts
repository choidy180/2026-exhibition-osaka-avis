import type { NextRequest } from "next/server";
import { isConfiguredSource, relay } from "@/lib/config/relay";

/**
 * 비전 서버 MJPEG 중계 (`/api/vision?src=http://<비전>:8200/stream/1.mjpg`).
 * Safari(WebKit) 는 fetch 로 받은 multipart/x-mixed-replace 본문을 읽지 못하고 "Load failed" 로 끊으므로,
 * 바이트는 그대로 두고 Content-Type 만 바꿔 넘긴다. 브라우저는 localhost 에만 붙으면 된다.
 */
export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src) return new Response("not found", { status: 404 });
  if (!(await isConfiguredSource("vision", src))) return new Response("unknown source", { status: 403 });

  return relay(request, new URL(src), "application/octet-stream");
}
