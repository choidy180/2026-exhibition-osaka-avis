import type { Metadata } from "next";
import ConveyorDetailView from "@/components/views/ConveyorDetailView";

export const metadata: Metadata = { title: "Conveyor Details" };

export default function ConveyorDetailPage() {
  return <ConveyorDetailView />;
}
