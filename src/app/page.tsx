import { notFound } from "next/navigation";
import { MineExperience } from "@/components/mine/mine-experience";
import { readMineNavigation } from "@/components/mine/navigation";
import { getMineProjects } from "@/lib/mine-projects";
import "./mine/mine.css";

export const metadata = { title: "The Crystal Mine", alternates: { canonical: "/" } };
export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [query, catalog] = await Promise.all([searchParams, getMineProjects()]);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (typeof value === "string") params.set(key, value);
  const state = readMineNavigation(params);
  const project = catalog.projects.find(item => item.id === state.project || item.slug === state.project);
  if (state.project && !project) notFound();
  return <MineExperience key={state.lightweight ? "archive" : "mine"} projects={catalog.projects} savedArtwork={catalog.savedArtwork}
    initialProject={project?.id} initialPanel={state.panel} lightweight={state.lightweight} />;
}
