"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { getBrowserSupabase, publicMediaUrl } from "@/lib/supabase";
import {
  PROJECT_CATEGORIES,
  type Project,
  type ProjectCategory,
  type ProjectMedia,
} from "@/lib/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function safeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
}

type FormState = {
  title: string;
  slug: string;
  category: ProjectCategory;
  short_description: string;
  description: string;
  year: number;
  tools: string;
  featured: boolean;
  published: boolean;
  display_order: number;
};

const initialForm: FormState = {
  title: "",
  slug: "",
  category: "Digital Art",
  short_description: "",
  description: "",
  year: new Date().getFullYear(),
  tools: "",
  featured: false,
  published: false,
  display_order: 0,
};

export function ProjectEditor({ projectId }: { projectId?: string }) {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [project, setProject] = useState<Project | null>(null);
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [processFiles, setProcessFiles] = useState<File[]>([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(projectId));
  const [status, setStatus] = useState(projectId ? "Loading project…" : "");
  const [saving, setSaving] = useState(false);

  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );

  useEffect(() => {
    if (!projectId) return;

    async function load() {
      const [{ data: projectData, error }, { data: mediaData }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase
          .from("project_media")
          .select("*")
          .eq("project_id", projectId)
          .order("display_order"),
      ]);

      if (error || !projectData) {
        setStatus("Could not load this project.");
        return;
      }

      const loaded = projectData as Project;
      setProject(loaded);
      setMedia((mediaData ?? []) as ProjectMedia[]);
      setForm({
        title: loaded.title,
        slug: loaded.slug,
        category: loaded.category,
        short_description: loaded.short_description,
        description: loaded.description,
        year: loaded.year,
        tools: loaded.tools.join(", "),
        featured: loaded.featured,
        published: loaded.published,
        display_order: loaded.display_order,
      });
      setStatus("");
    }

    void load();
  }, [projectId, supabase]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function titleChanged(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
  }

  async function uploadOne(userId: string, id: string, file: File, label: string) {
    const path = `${userId}/${id}/${label}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from("portfolio-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    return path;
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.slug.trim()) {
      setStatus("Title and slug are required.");
      return;
    }

    setSaving(true);
    setStatus("Saving…");

    try {
      const { data: session } = await supabase.auth.getSession();
      const user = session.session?.user;
      if (!user) throw new Error("Your session expired. Sign in again.");

      const payload = {
        title: form.title.trim(),
        slug: slugify(form.slug),
        category: form.category,
        short_description: form.short_description.trim(),
        description: form.description.trim(),
        year: Number(form.year),
        tools: form.tools
          .split(",")
          .map((tool) => tool.trim())
          .filter(Boolean),
        featured: form.featured,
        published: form.published,
        display_order: Number(form.display_order),
      };

      let id = projectId;
      let savedProject: Project;

      if (id) {
        const { data, error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        savedProject = data as Project;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw error;
        savedProject = data as Project;
        id = savedProject.id;
      }

      if (coverFile && id) {
        const path = await uploadOne(user.id, id, coverFile, "cover");
        const { data, error } = await supabase
          .from("projects")
          .update({ cover_path: path })
          .eq("id", id)
          .select("*")
          .single();
        if (error) throw error;
        savedProject = data as Project;
      }

      async function uploadMedia(files: File[], section: "gallery" | "process") {
        if (!id) return;
        const existing = media.filter((item) => item.section === section).length;
        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          const path = await uploadOne(user!.id, id, file, section);
          const { error } = await supabase.from("project_media").insert({
            project_id: id,
            path,
            caption: "",
            alt_text: form.title,
            section,
            display_order: existing + index,
          });
          if (error) throw error;
        }
      }

      await uploadMedia(galleryFiles, "gallery");
      await uploadMedia(processFiles, "process");

      setProject(savedProject);
      setCoverFile(null);
      setGalleryFiles([]);
      setProcessFiles([]);
      setStatus("Saved.");
      router.push(`/admin/projects/${savedProject.id}`);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function removeMedia(item: ProjectMedia) {
    if (!window.confirm("Remove this image from the project?")) return;
    await supabase.storage.from("portfolio-media").remove([item.path]);
    const { error } = await supabase.from("project_media").delete().eq("id", item.id);
    if (!error) setMedia((current) => current.filter((mediaItem) => mediaItem.id !== item.id));
  }

  async function removeProject() {
    if (!projectId || !window.confirm("Delete this entire project? This cannot be undone.")) return;
    setSaving(true);
    const paths = [
      ...(project?.cover_path ? [project.cover_path] : []),
      ...media.map((item) => item.path),
    ];
    if (paths.length) await supabase.storage.from("portfolio-media").remove(paths);
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (!error) router.push("/admin/projects");
    else setStatus(error.message);
    setSaving(false);
  }

  function filesFrom(event: ChangeEvent<HTMLInputElement>) {
    return Array.from(event.target.files ?? []);
  }

  return (
    <form className="editor" onSubmit={save}>
      <div className="editor__top">
        <Link href="/admin/projects" className="back-link">
          <ArrowLeft size={16} /> Projects
        </Link>
        <div className="editor__actions">
          {projectId && (
            <button className="button danger" type="button" onClick={removeProject} disabled={saving}>
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button className="button button--primary" type="submit" disabled={saving}>
            <Save size={16} /> {saving ? "Saving…" : "Save project"}
          </button>
        </div>
      </div>

      <div className="editor__heading">
        <p className="eyebrow">{projectId ? "EDIT PROJECT" : "NEW PROJECT"}</p>
        <h1>{form.title || "Untitled work"}</h1>
        {status && <p className="form-message">{status}</p>}
      </div>

      <div className="editor-grid">
        <section className="editor-panel">
          <h2>Basics</h2>
          <label>Title
            <input value={form.title} onChange={(e) => titleChanged(e.target.value)} required />
          </label>
          <label>Slug
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update("slug", e.target.value);
              }}
              required
            />
          </label>
          <label>Category
            <select value={form.category} onChange={(e) => update("category", e.target.value as ProjectCategory)}>
              {PROJECT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <div className="form-row">
            <label>Year
              <input type="number" value={form.year} onChange={(e) => update("year", Number(e.target.value))} />
            </label>
            <label>Display order
              <input type="number" value={form.display_order} onChange={(e) => update("display_order", Number(e.target.value))} />
            </label>
          </div>
          <label>Short description
            <textarea rows={3} value={form.short_description} onChange={(e) => update("short_description", e.target.value)} />
          </label>
          <label>Full description
            <textarea rows={10} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </label>
          <label>Tools <span className="label-note">comma separated</span>
            <input value={form.tools} onChange={(e) => update("tools", e.target.value)} placeholder="Figma, Clip Studio Paint, Blender" />
          </label>
          <div className="check-row">
            <label><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} /> Featured</label>
            <label><input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} /> Published</label>
          </div>
        </section>

        <section className="editor-panel">
          <h2>Media</h2>
          <label className="upload-box">
            <Upload size={20} />
            <strong>Cover image</strong>
            <span>{coverFile?.name || "Choose JPG, PNG, WebP, GIF, or AVIF"}</span>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
          </label>

          {(coverPreview || publicMediaUrl(project?.cover_path)) && (
            <div className="editor-cover">
              <Image
                src={coverPreview || publicMediaUrl(project?.cover_path)!}
                alt="Cover preview"
                fill
                sizes="500px"
                className="project-cover__image"
                unoptimized={Boolean(coverPreview)}
              />
            </div>
          )}

          <label className="upload-box">
            <Upload size={20} />
            <strong>Gallery images</strong>
            <span>{galleryFiles.length ? `${galleryFiles.length} selected` : "Select one or more images"}</span>
            <input type="file" accept="image/*" multiple onChange={(e) => setGalleryFiles(filesFrom(e))} />
          </label>

          <label className="upload-box">
            <Upload size={20} />
            <strong>Process images</strong>
            <span>{processFiles.length ? `${processFiles.length} selected` : "Sketches, wireframes, iterations…"}</span>
            <input type="file" accept="image/*" multiple onChange={(e) => setProcessFiles(filesFrom(e))} />
          </label>

          {media.length > 0 && (
            <div className="media-admin-grid">
              {media.map((item) => {
                const url = publicMediaUrl(item.path);
                if (!url) return null;
                return (
                  <div className="media-admin-item" key={item.id}>
                    <Image src={url} alt={item.alt_text || "Project media"} fill sizes="180px" className="project-cover__image" />
                    <span>{item.section}</span>
                    <button type="button" onClick={() => removeMedia(item)} aria-label="Delete image">
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </form>
  );
}
