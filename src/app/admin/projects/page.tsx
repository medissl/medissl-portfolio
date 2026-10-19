"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
} from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";
import { getBrowserSupabase } from "@/lib/supabase";
import type { Project } from "@/lib/types";

function compareStationOrder(a: Project, b: Project) {
  if (a.display_order !== b.display_order) {
    return a.display_order - b.display_order;
  }

  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || a.id.localeCompare(b.id);
}

function ProjectList() {
  const supabase = getBrowserSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState("Loading projects…");
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setStatus(error.message);
        return;
      }

      setProjects((data ?? []) as Project[]);
      setStatus("");
    }

    void load();
  }, [supabase]);

  const stationProjects = useMemo(() => {
    const live = projects.filter((project) => project.published);
    return live.filter(project => project.slug !== "mewdi-pixel-sprite").sort(compareStationOrder);
  }, [projects]);

  async function moveStationProject(projectId: string, direction: -1 | 1) {
    if (reordering) return;

    const currentIndex = stationProjects.findIndex(
      (project) => project.id === projectId,
    );
    const nextIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= stationProjects.length
    ) {
      return;
    }

    const reordered = [...stationProjects];
    [reordered[currentIndex], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[currentIndex],
    ];

    const previousProjects = projects;
    const orderById = new Map(
      reordered.map((project, index) => [project.id, index]),
    );

    setProjects((current) =>
      current.map((project) => {
        const nextOrder = orderById.get(project.id);
        return nextOrder === undefined
          ? project
          : { ...project, display_order: nextOrder, carousel_order: nextOrder };
      }),
    );

    setReordering(true);
    setStatus("Saving station order…");

    const results = await Promise.all(
      reordered.map((project, index) =>
        supabase
          .from("projects")
          .update({ display_order: index, carousel_order: index })
          .eq("id", project.id),
      ),
    );

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      setProjects(previousProjects);
      setStatus(failed.error.message);
    } else {
      setStatus("Station order saved.");
      window.setTimeout(() => setStatus(""), 1400);
    }

    setReordering(false);
  }

  return (
    <div className="admin-card admin-card--wide">
      <Link href="/admin" className="back-link admin-page-back">
        <ArrowLeft size={16} /> Admin home
      </Link>

      <div className="admin-title-row">
        <div>
          <p className="eyebrow">PROJECTS</p>
          <h1>Everything in one place.</h1>
          <p className="muted">
            Open an item to edit it, change its visibility, update its media,
            or change the order of published stations.
          </p>
        </div>
      </div>

      {status && <p className="form-message">{status}</p>}

      {stationProjects.length > 0 && (
        <section className="carousel-order-panel">
          <div className="carousel-order-panel__head">
            <div>
              <p className="eyebrow">PUBLISHED CMS STATIONS</p>
              <h2>Order the collection.</h2>
              <p>
                Published work becomes stations after the curated GitHub projects.
                Use the arrows to change its order. Drafts stay private. The excluded Mewdi sprite remains outside the public collection.
              </p>
            </div>
          </div>

          <div className="carousel-order-list">
            {stationProjects.map((project, index) => (
              <div className="carousel-order-row" key={project.id}>
                <span className="carousel-order-index">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <Link
                  href={`/admin/projects/${project.id}`}
                  className="carousel-order-link"
                >
                  <strong>{project.title}</strong>
                  <span>
                    {project.category}
                    {project.featured ? " · Featured" : ""}
                    {" · Published station"}
                  </span>
                </Link>

                <div className="carousel-order-actions">
                  <button
                    type="button"
                    onClick={() => void moveStationProject(project.id, -1)}
                    disabled={reordering || index === 0}
                    aria-label={`Move ${project.title} earlier`}
                    title="Move earlier"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void moveStationProject(project.id, 1)}
                    disabled={
                      reordering || index === stationProjects.length - 1
                    }
                    aria-label={`Move ${project.title} later`}
                    title="Move later"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="admin-project-list">
        {projects.map((project) => (
          <Link
            href={`/admin/projects/${project.id}`}
            className="admin-project-row"
            key={project.id}
          >
            <div>
              <span
                className={project.published ? "status-dot is-live" : "status-dot"}
              />
              <div>
                <strong>{project.title}</strong>
                <span>
                  {project.category} · {project.year}
                </span>
              </div>
            </div>
            <div>
              {project.featured && <span className="mini-chip">Featured</span>}
              <span className="mini-chip">
                {project.published ? "Live" : "Draft"}
              </span>
              <ArrowUpRight size={17} />
            </div>
          </Link>
        ))}

        {!status && projects.length === 0 && (
          <div className="empty-state">
            <p className="eyebrow">NO PROJECTS YET</p>
            <h2>Your work will appear here after you create it.</h2>
            <Link href="/admin" className="button button--ghost">
              Back to admin
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProjectsPage() {
  return (
    <AdminGuard>
      <ProjectList />
    </AdminGuard>
  );
}
