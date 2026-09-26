import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";
import { publicMediaUrl } from "@/lib/supabase";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return { title: "Work" };

  return {
    title: project.title,
    description: project.short_description || project.description.slice(0, 150),
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const cover = publicMediaUrl(project.cover_path);
  const gallery = project.project_media.filter((media) => media.section === "gallery");
  const process = project.project_media.filter((media) => media.section === "process");

  return (
    <article className="project-page shell">
      <Link href="/work" className="back-link">
        <ArrowLeft size={16} /> Back to work
      </Link>

      <header className="project-hero">
        <div>
          <p className="eyebrow">{project.category} · {project.year}</p>
          <h1>{project.title}</h1>
        </div>
        <p className="project-hero__summary">{project.short_description}</p>
      </header>

      <div className="project-cover">
        {cover ? (
          <Image
            src={cover}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="project-cover__image"
          />
        ) : (
          <div className="project-card__placeholder">
            <span>{project.category}</span>
          </div>
        )}
      </div>

      <section className="project-info">
        <div>
          <p className="eyebrow">ABOUT THIS WORK</p>
          <p className="project-description">{project.description}</p>
        </div>
        <aside>
          <p className="eyebrow">TOOLS</p>
          <div className="tag-cloud">
            {project.tools.length ? project.tools.map((tool) => (
              <span className="tag" key={tool}>{tool}</span>
            )) : <span className="muted">Not listed</span>}
          </div>
        </aside>
      </section>

      {gallery.length > 0 && (
        <section className="project-gallery">
          <p className="eyebrow">GALLERY</p>
          {gallery.map((media) => {
            const url = publicMediaUrl(media.path);
            if (!url) return null;
            return (
              <figure key={media.id} className="gallery-item">
                <div className="gallery-item__image">
                  <Image
                    src={url}
                    alt={media.alt_text || media.caption || project.title}
                    fill
                    sizes="100vw"
                    className="project-cover__image"
                  />
                </div>
                {media.caption && <figcaption>{media.caption}</figcaption>}
              </figure>
            );
          })}
        </section>
      )}

      {process.length > 0 && (
        <section className="project-gallery">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PROCESS</p>
              <h2>Behind the final piece.</h2>
            </div>
          </div>
          {process.map((media) => {
            const url = publicMediaUrl(media.path);
            if (!url) return null;
            return (
              <figure key={media.id} className="gallery-item">
                <div className="gallery-item__image">
                  <Image
                    src={url}
                    alt={media.alt_text || media.caption || `${project.title} process`}
                    fill
                    sizes="100vw"
                    className="project-cover__image"
                  />
                </div>
                {media.caption && <figcaption>{media.caption}</figcaption>}
              </figure>
            );
          })}
        </section>
      )}

      <div className="project-end">
        <p className="eyebrow">END OF PROJECT</p>
        <Link href="/work" className="text-link">
          Explore more work <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
