export const PROJECT_CATEGORIES = [
  "Digital Art",
  "Traditional Art",
  "UI/UX",
  "Interactive",
  "Experimental",
  "Software",
  "Game development",
  "Interactive media",
  "Experiment",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type ProjectMedia = {
  id: string;
  project_id: string;
  path: string;
  caption: string;
  alt_text: string;
  section: "gallery" | "process";
  display_order: number;
  created_at: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  short_description: string;
  description: string;
  year: number;
  tools: string[];
  cover_path: string | null;
  featured: boolean;
  published: boolean;
  display_order: number;
  carousel_order: number;
  created_at: string;
  updated_at: string;
  legacy_key?: string | null;
  platform?: string;
  features?: string[];
  repository_url?: string | null;
  demo_url?: string | null;
  download_url?: string | null;
  action_label?: string;
  portrait?: boolean;
  mineral?: string;
  cover_alt?: string;
};

export type ProjectWithMedia = Project & {
  project_media: ProjectMedia[];
};
