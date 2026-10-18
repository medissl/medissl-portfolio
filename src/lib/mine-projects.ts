import { cache } from "react";
import { artworkProjects, repositoryProjects, type PublishedMineRecord } from "@/components/mine/projects";
import snapshot from "@/components/mine/published-art.json";
import { getServerSupabase, publicMediaUrl } from "@/lib/supabase";

export const getMineProjects = cache(async () => {
  try {
    const { data, error } = await getServerSupabase().from("projects")
    .select("id,title,slug,category,short_description,description,tools,cover_path,year,project_media(*)")
    .eq("published", true).neq("slug", "mewdi-pixel-sprite")
    .order("display_order", { ascending: true }).abortSignal(AbortSignal.timeout(5000));
    if (error || !data) throw new Error("Published artwork feed unavailable");
    return { projects: [...repositoryProjects, ...artworkProjects(data as PublishedMineRecord[], publicMediaUrl)], savedArtwork: false };
  } catch {
    // Only previously verified public records; live unpublishing wins whenever the feed is available.
    return { projects: [...repositoryProjects, ...artworkProjects(snapshot as PublishedMineRecord[], publicMediaUrl)], savedArtwork: true };
  }
});
