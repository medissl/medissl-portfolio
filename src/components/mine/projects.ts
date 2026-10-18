import githubProjects from "./github-projects.json";
import type { Project, ProjectMedia } from "@/lib/types";

export type MineMedia = { id: string; src: string; alt: string; caption: string; section: "gallery" | "process" };

export type MineProject = {
  id: string; title: string; category: string; platform: string; description: string;
  tools: string; image: string | null; gallery: string | null; alt: string;
  features: string[]; repository: string | null; link: string | null; action: string;
  mineral: string; kind: string; portrait: boolean;
  media: MineMedia[];
};

// Public GitHub inventory verified 2026-10-18. Private Jellink source is represented
// by its public release repository; the profile README is linked in About.
export const repositoryProjects: MineProject[] = githubProjects.map(project => ({
  ...project,
  media: [
    ...(project.gallery ? [{ id: `${project.id}-gallery`, src: project.gallery, alt: project.alt, caption: "", section: "gallery" as const }] : []),
    ...(project.id === "sakiko" ? [{ id: "sakiko-classroom", src: "/mine/sakiko-classroom-day.webp", alt: "SAKIKO's daytime classroom", caption: "", section: "gallery" as const }] : []),
  ],
}));

export type PublishedMineRecord = Pick<Project, "id" | "slug" | "title" | "category" | "year" | "description" | "short_description" | "tools" | "cover_path"> & {
  project_media: Pick<ProjectMedia, "id" | "path" | "alt_text" | "caption" | "section" | "display_order">[];
};

export function artworkProjects(records: PublishedMineRecord[], mediaUrl: (path: string | null) => string | null): MineProject[] {
  return records.filter(project => project.slug !== "mewdi-pixel-sprite").map(project => ({
    id: project.id, title: project.title, category: project.category, platform: String(project.year),
    description: project.description || project.short_description, tools: project.tools.join(" · "),
    image: mediaUrl(project.cover_path), gallery: null, alt: project.title,
    features: project.description && project.short_description ? [project.short_description] : [],
    repository: null, link: `/work/${encodeURIComponent(project.slug)}`, action: "Original artwork page",
    mineral: "The artist’s grotto", kind: "artwork", portrait: false,
    media: [...project.project_media].sort((a, b) => a.display_order - b.display_order).flatMap(media => {
      const src = mediaUrl(media.path);
      return src ? [{ id: media.id, src, alt: media.alt_text || project.title, caption: media.caption, section: media.section }] : [];
    }),
  }));
}
