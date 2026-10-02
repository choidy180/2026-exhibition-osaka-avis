import type { Metadata } from "next";
import ConveyorView from "@/components/views/ConveyorView";

export const metadata: Metadata = { title: "Conveyor" };

export default function ConveyorPage() {
  return <ConveyorView />;
}
