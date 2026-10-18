import githubProjects from "./github-projects.json";

export type MineProject = {
  id: string; title: string; category: string; platform: string; description: string;
  tools: string; image: string | null; gallery: string | null; alt: string;
  features: string[]; repository: string | null; link: string | null; action: string;
  mineral: string; kind: string; portrait: boolean;
};

// Public GitHub inventory verified 2026-10-18. Private Jellink source is represented
// by its public release repository; the profile README is linked in About.
export const repositoryProjects: MineProject[] = githubProjects;
