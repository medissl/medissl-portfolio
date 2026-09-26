"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AdminGuard } from "@/components/admin-guard";
import { getBrowserSupabase } from "@/lib/supabase";
import type { Project } from "@/lib/types";

function ProjectList() {
  const supabase = getBrowserSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState("Loading projects…");

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
            Open an item to edit it, change its visibility, or update its media.
          </p>
        </div>
      </div>

      {status && <p className="form-message">{status}</p>}

      <div className="admin-project-list">
        {projects.map((project) => (
          <Link
            href={`/admin/projects/${project.id}`}
            className="admin-project-row"
            key={project.id}
          >
            <div>
              <span className={project.published ? "status-dot is-live" : "status-dot"} />
              <div>
                <strong>{project.title}</strong>
                <span>{project.category} · {project.year}</span>
              </div>
            </div>
            <div>
              {project.featured && <span className="mini-chip">Featured</span>}
              <span className="mini-chip">{project.published ? "Live" : "Draft"}</span>
              <ArrowUpRight size={17} />
            </div>
          </Link>
        ))}

        {!status && projects.length === 0 && (
          <div className="empty-state">
            <p className="eyebrow">NO PROJECTS YET</p>
            <h2>Your work will appear here after you create it.</h2>
            <Link href="/admin" className="button button--ghost">Back to admin</Link>
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
