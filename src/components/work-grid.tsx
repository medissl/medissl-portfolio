"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import {
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategory,
} from "@/lib/types";

type Filter = "All" | ProjectCategory;

export function WorkGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((project) => project.category === filter),
    [filter, projects],
  );

  return (
    <>
      <div className="filters" aria-label="Filter projects">
        {(["All", ...PROJECT_CATEGORIES] as Filter[]).map((item) => (
          <button
            key={item}
            className={filter === item ? "filter is-active" : "filter"}
            onClick={() => setFilter(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="project-grid">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="eyebrow">THE WALL IS STILL WARMING UP</p>
          <h2>No published work here yet.</h2>
          <p className="muted">
            This portfolio is intentionally growing in public. New artwork,
            interfaces, and experiments will land here as they are finished.
          </p>
        </div>
      )}
    </>
  );
}
