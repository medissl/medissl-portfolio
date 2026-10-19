export type MinePanel = "project" | "index" | "about" | "settings" | null;
export function readMineNavigation(params: URLSearchParams) {
  const value = params.get("panel");
  const panel: MinePanel = value === "projects" ? "index" : value === "project" || value === "about" || value === "settings" ? value : null;
  return { project: params.get("project"), panel, lightweight: params.get("view") === "projects" };
}
export function mineHref(project: string, panel: MinePanel = "project") {
  const params = new URLSearchParams({ project });
  if (panel) params.set("panel", panel === "index" ? "projects" : panel);
  return `/?${params}`;
}
