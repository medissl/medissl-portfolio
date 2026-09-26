import type { Metadata } from "next";
import { WorkGrid } from "@/components/work-grid";
import { getPublishedProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Work",
  description: "Art, UI/UX, interactive media, and experiments by Medianto Susilo.",
};

export default async function WorkPage() {
  const projects = await getPublishedProjects();

  return (
    <section className="page shell">
      <div className="page-intro">
        <p className="eyebrow">WORK / ARCHIVE</p>
        <h1>Things I&apos;ve made.</h1>
        <p className="page-intro__lede">
          Finished pieces, experiments, interface studies, and interactive work.
          Some are serious. Some started because I got curious.
        </p>
      </div>
      <WorkGrid projects={projects} />
    </section>
  );
}
