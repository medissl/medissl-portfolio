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

type MineStation = MineProject & {
  image: string; gallery: string; repository: string; link: string;
};

// The existing railway supports exactly these two stations. Keep the prepared
// catalog separate until multi-station movement and nullable media are supported.
export const mineProjects = (["sakiko", "jellink"] as const).map<MineStation>(id => {
  const project = repositoryProjects.find(project => project.id === id);
  if (!project?.image || !project.gallery || !project.repository || !project.link) {
    throw new Error(`The ${id} prototype station needs its media and project links.`);
  }
  return { ...project, image: project.image, gallery: project.gallery,
    repository: project.repository, link: project.link };
});
