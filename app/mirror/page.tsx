import type { Metadata } from "next";
import MirrorView from "@/components/views/MirrorView";

export const metadata: Metadata = { title: "Mirroring" };

export default function MirrorPage() {
  return <MirrorView />;
}
