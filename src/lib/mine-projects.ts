import { cache } from "react";
import { artworkProjects, repositoryProjects, type PublishedMineRecord } from "@/components/mine/projects";
import { getServerSupabase, publicMediaUrl } from "@/lib/supabase";

export const getMineProjects = cache(async () => {
  try {
    const { data, error } = await getServerSupabase().from("projects")
    .select("id,title,slug,category,short_description,description,tools,cover_path,year,featured,project_media(*)")
    .eq("published", true).neq("slug", "mewdi-pixel-sprite")
    .order("display_order", { ascending: true }).order("created_at", { ascending: false }).order("id", { ascending: true }).abortSignal(AbortSignal.timeout(5000));
    if (error || !data) throw new Error("Published artwork feed unavailable");
    return { projects: [...repositoryProjects, ...artworkProjects(data as PublishedMineRecord[], publicMediaUrl)], savedArtwork: false };
  } catch {
    // A recovery snapshot cannot prove a CMS record is still published.
    // Keep curated projects available without resurrecting unpublished CMS content.
    return { projects: [...repositoryProjects], savedArtwork: true };
  }
});
