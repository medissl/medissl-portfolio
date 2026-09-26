import { getServerSupabase } from "@/lib/supabase";
import type { Project, ProjectWithMedia } from "@/lib/types";

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load projects:", error.message);
    return [];
  }

  return (data ?? []) as Project[];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("carousel_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Failed to load featured projects:", error.message);
    return [];
  }

  return (data ?? []) as Project[];
}

export async function getCarouselFallbackProjects(): Promise<Project[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("carousel_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Failed to load carousel projects:", error.message);
    return [];
  }

  return (data ?? []) as Project[];
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectWithMedia | null> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("projects")
    .select("*, project_media(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;

  data.project_media?.sort(
    (a: { display_order: number }, b: { display_order: number }) =>
      a.display_order - b.display_order,
  );

  return data as ProjectWithMedia;
}
