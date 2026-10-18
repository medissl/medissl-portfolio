import { repositoryProjects, type MineProject } from "@/components/mine/projects";
import snapshot from "@/components/mine/published-art.json";
import { getServerSupabase, publicMediaUrl } from "@/lib/supabase";

export async function getMineProjects(): Promise<MineProject[]> {
  const { data, error } = await getServerSupabase().from("projects")
    .select("id,title,slug,category,short_description,description,tools,cover_path,year,project_media(*)")
    .eq("published", true).neq("slug", "mewdi-pixel-sprite")
    .order("display_order", { ascending: true }).abortSignal(AbortSignal.timeout(5000));
  // Verified public snapshot keeps the portfolio readable during a backend outage.
  const records = error || !data ? snapshot : data;
  const artworks: MineProject[] = records.filter(p => p.slug !== "mewdi-pixel-sprite").map(p => ({
    id: p.id, title: p.title, category: p.category, platform: String(p.year),
    description: p.description || p.short_description, tools: p.tools.join(" · "),
    image: publicMediaUrl(p.cover_path), gallery: null, alt: p.title,
    features: p.description && p.short_description ? [p.short_description] : [],
    repository: null, link: `/work/${p.slug}`, action: "Full artwork & process",
    mineral: "The artist’s grotto", kind: "artwork", portrait: true,
  }));
  return [...repositoryProjects, ...artworks];
}
