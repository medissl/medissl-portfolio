import { cache } from "react";
import { artworkProjects, repositoryProjects, type PublishedMineRecord } from "@/components/mine/projects";
import { getServerSupabase, publicMediaUrl } from "@/lib/supabase";

export const getMineProjects = cache(async () => {
  try {
    const { data, error } = await getServerSupabase().from("projects")
    .select("*,project_media(*)")
    .eq("published", true).neq("slug", "mewdi-pixel-sprite")
    .order("display_order", { ascending: true }).order("created_at", { ascending: false }).order("id", { ascending: true }).abortSignal(AbortSignal.timeout(5000));
    if (error || !data) throw new Error("Published portfolio feed unavailable");
    const records = data as PublishedMineRecord[];
    const cms = artworkProjects(records, publicMediaUrl);
    if (process.env.MEDISSL_UNIFIED_CMS === "true") return { projects: cms, savedArtwork: false };
    // Compatibility during migration: imported projects cannot appear twice or
    // move old stations before the verified CMS-only cutover.
    const curatedKeys = new Set(repositoryProjects.map(project => project.id));
    return { projects: [...repositoryProjects, ...cms.filter(project => !curatedKeys.has(project.id) && !curatedKeys.has(project.slug))], savedArtwork: false };
  } catch {
    // A recovery snapshot cannot prove a CMS record is still published.
    // Keep curated projects available without resurrecting unpublished CMS content.
    return { projects: process.env.MEDISSL_UNIFIED_CMS === "true" ? [] : [...repositoryProjects], savedArtwork: true };
  }
});
