import { notFound, redirect } from "next/navigation";
import { getMineProjects } from "@/lib/mine-projects";
import { mineHref } from "@/components/mine/navigation";
export default async function WorkAlias({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, catalog] = await Promise.all([params, getMineProjects()]);
  const project = catalog.projects.find(item => item.slug === slug || item.id === slug);
  if (!project) notFound();
  redirect(mineHref(project.id));
}
