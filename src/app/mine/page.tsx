import type { Metadata } from "next";
import { MineExperience } from "@/components/mine/mine-experience";
import { getMineProjects } from "@/lib/mine-projects";
import "./mine.css";

export const metadata: Metadata = {
  title: "The Crystal Mine — prototype",
  robots: { index: false, follow: false },
};

export default async function MinePage({ searchParams }: { searchParams: Promise<{ view?: string; project?: string }> }) {
  const [{ view, project }, catalog] = await Promise.all([searchParams, getMineProjects()]);
  return <MineExperience key={`${view ?? "mine"}:${project ?? ""}`} projects={catalog.projects}
    savedArtwork={catalog.savedArtwork} initialProject={project} lightweight={view === "projects"} />;
}

