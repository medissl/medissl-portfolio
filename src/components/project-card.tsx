import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { publicMediaUrl } from "@/lib/supabase";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const image = publicMediaUrl(project.cover_path);

  return (
    <Link href={`/work/${project.slug}`} className="project-card group">
      <div className="project-card__media">
        {image ? (
          <Image
            src={image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="project-card__image"
          />
        ) : (
          <div className="project-card__placeholder" aria-hidden="true">
            <span>{project.category}</span>
          </div>
        )}
      </div>
      <div className="project-card__body">
        <div>
          <p className="eyebrow">{project.category} · {project.year}</p>
          <h3>{project.title}</h3>
          <p className="muted">{project.short_description}</p>
        </div>
        <ArrowUpRight size={20} aria-hidden="true" />
      </div>
    </Link>
  );
}
