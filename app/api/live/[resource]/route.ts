import type { NextRequest } from "next/server";
import { isConfiguredSource, relay } from "@/lib/config/relay";

const RESOURCES = new Set(["status", "stream"]);

/**
 * 글래스(AVIS Live) 서버의 `/status` · `/stream` 중계.
 * 글래스가 CORS 를 열지 않아 브라우저가 직접 fetch 할 수 없으므로, 대시보드와 같은 주소로 넘겨준다.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const src = request.nextUrl.searchParams.get("src");
  if (!RESOURCES.has(resource) || !src) return new Response("not found", { status: 404 });
  if (!(await isConfiguredSource("avis-live", src))) return new Response("unknown source", { status: 403 });

  return relay(request, new URL(`/${resource}`, src));
}
