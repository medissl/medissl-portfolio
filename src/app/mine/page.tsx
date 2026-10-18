import type { Metadata } from "next";
import { MineExperience } from "@/components/mine/mine-experience";
import "./mine.css";

export const metadata: Metadata = {
  title: "The Crystal Mine — prototype",
  robots: { index: false, follow: false },
};

export default async function MinePage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  return <MineExperience key={view ?? "mine"} lightweight={view === "projects"} />;
}

