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

function compareCarouselOrder(a: Project, b: Project) {
  if (a.carousel_order !== b.carousel_order) {
    return a.carousel_order - b.carousel_order;
  }

  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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

  const carouselProjects = useMemo(() => {
    const live = projects.filter((project) => project.published);
    const featured = live.filter((project) => project.featured);
    return [...(featured.length ? featured : live)].sort(compareCarouselOrder);
  }, [projects]);

  const carouselUsesFeatured = projects.some(
    (project) => project.published && project.featured,
  );

  async function moveCarouselProject(projectId: string, direction: -1 | 1) {
    if (reordering) return;

    const currentIndex = carouselProjects.findIndex(
      (project) => project.id === projectId,
    );
    const nextIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= carouselProjects.length
    ) {
      return;
    }

    const reordered = [...carouselProjects];
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
          : { ...project, carousel_order: nextOrder };
      }),
    );

    setReordering(true);
    setStatus("Saving carousel order…");

    const results = await Promise.all(
      reordered.map((project, index) =>
        supabase
          .from("projects")
          .update({ carousel_order: index })
          .eq("id", project.id),
      ),
    );

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      setProjects(previousProjects);
      setStatus(failed.error.message);
    } else {
      setStatus("Carousel order saved.");
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
            or control the homepage carousel order.
          </p>
        </div>
      </div>

      {status && <p className="form-message">{status}</p>}

      {carouselProjects.length > 0 && (
        <section className="carousel-order-panel">
          <div className="carousel-order-panel__head">
            <div>
              <p className="eyebrow">HOMEPAGE CAROUSEL</p>
              <h2>Choose what appears first.</h2>
              <p>
                New work can still start at the front by default. Use these
                arrows whenever you want to override that order.
                {carouselUsesFeatured
                  ? " Only live Featured projects are currently in the carousel."
                  : " No Featured projects are live, so the carousel is using published work."}
              </p>
            </div>
          </div>

          <div className="carousel-order-list">
            {carouselProjects.map((project, index) => (
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
                    {index < 6 ? " · In carousel" : " · Queued"}
                  </span>
                </Link>

                <div className="carousel-order-actions">
                  <button
                    type="button"
                    onClick={() => void moveCarouselProject(project.id, -1)}
                    disabled={reordering || index === 0}
                    aria-label={`Move ${project.title} earlier`}
                    title="Move earlier"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void moveCarouselProject(project.id, 1)}
                    disabled={
                      reordering || index === carouselProjects.length - 1
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
