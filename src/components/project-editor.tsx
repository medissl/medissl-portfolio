"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import {
  clearDraftFiles,
  loadDraftFiles,
  saveDraftFiles,
} from "@/lib/admin-draft";
import { getBrowserSupabase, publicMediaUrl } from "@/lib/supabase";
import { externalUrl, isArtwork } from "@/lib/content";
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

function mediaError(files: File[]) {
  const formats = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (files.some(file => !formats.includes(file.type))) return "Choose JPG, PNG, WebP, GIF or AVIF images.";
  if (files.some(file => file.size > 15 * 1024 * 1024)) return "Each image must be 15 MB or smaller.";
  return "";
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
  platform: string;
  features: string;
  repository_url: string;
  demo_url: string;
  download_url: string;
  action_label: string;
  portrait: boolean;
  mineral: string;
  cover_alt: string;
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
  platform: "", features: "", repository_url: "", demo_url: "", download_url: "",
  action_label: "", portrait: false, mineral: "", cover_alt: "", display_order: 0,
};

export function ProjectEditor({ projectId }: { projectId?: string }) {
  const supabase = getBrowserSupabase();
  const router = useRouter();
  const draftKey = `project-editor:${projectId ?? "new"}`;

  const [form, setForm] = useState<FormState>(initialForm);
  const [project, setProject] = useState<Project | null>(null);
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [processFiles, setProcessFiles] = useState<File[]>([]);
  const [slugTouched, setSlugTouched] = useState(Boolean(projectId));
  const [status, setStatus] = useState(projectId ? "Loading project…" : "");
  const [saving, setSaving] = useState(false);
  const [draftReady, setDraftReady] = useState(false);

  const coverPreview = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        let base = initialForm;

        if (projectId) {
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
            setDraftReady(true);
            return;
          }

          const loaded = projectData as Project;
          setProject(loaded);
          setMedia((mediaData ?? []) as ProjectMedia[]);

          base = {
            ...initialForm,
            title: loaded.title,
            slug: loaded.slug,
            category: loaded.category,
            short_description: loaded.short_description,
            description: loaded.description,
            year: loaded.year,
            tools: loaded.tools.join(", "),
            featured: loaded.featured,
            published: loaded.published,
            platform: loaded.platform ?? "", features: (loaded.features ?? []).join("\n"),
            repository_url: loaded.repository_url ?? "", demo_url: loaded.demo_url ?? "",
            download_url: loaded.download_url ?? "", action_label: loaded.action_label ?? "",
            portrait: loaded.portrait === true, mineral: loaded.mineral ?? "",
            cover_alt: loaded.cover_alt ?? "", display_order: loaded.display_order,
          };
        }

        const locallySaved = window.localStorage.getItem(draftKey);
        if (locallySaved) {
          try {
            base = { ...base, ...JSON.parse(locallySaved) } as FormState;
            setStatus("Restored your unsaved draft.");
          } catch {
            window.localStorage.removeItem(draftKey);
          }
        } else {
          setStatus("");
        }

        setForm(base);

        const [cover, gallery, process] = await Promise.all([
          loadDraftFiles(draftKey, "cover"),
          loadDraftFiles(draftKey, "gallery"),
          loadDraftFiles(draftKey, "process"),
        ]);

        setCoverFile(cover[0] ?? null);
        setGalleryFiles(gallery);
        setProcessFiles(process);
        setDraftReady(true);
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [draftKey, projectId, supabase]);

  useEffect(() => {
    if (!draftReady) return;

    const timer = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(form));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [draftKey, draftReady, form]);

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
    const { error } = await supabase.storage
      .from("portfolio-media")
      .upload(path, file, {
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
    if (!slugify(form.slug)) { setStatus("Use letters or numbers in the slug."); return; }
    if (!Number.isInteger(Number(form.year)) || Number(form.year) < 1 || Number(form.year) > 9999) { setStatus("Enter a valid four-digit year."); return; }
    if (!Number.isSafeInteger(form.display_order) || form.display_order < -2147483648 || form.display_order > 2147483647) { setStatus("Enter a valid whole number for station order."); return; }
    if ([form.repository_url, form.demo_url, form.download_url].some(url => url.trim() && !externalUrl(url.trim()))) { setStatus("Links must be complete HTTPS URLs without embedded credentials."); return; }

    setSaving(true);
    setStatus(form.published ? "Publishing…" : "Saving draft…");

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
        platform: form.platform.trim(),
        features: form.features.split("\n").map(value => value.trim()).filter(Boolean),
        repository_url: externalUrl(form.repository_url.trim()), demo_url: externalUrl(form.demo_url.trim()),
        download_url: externalUrl(form.download_url.trim()), action_label: form.action_label.trim(),
        portrait: form.portrait, mineral: form.mineral.trim(), cover_alt: form.cover_alt.trim(),
        display_order: form.display_order,
      };

      let id = projectId ?? project?.id;
      let savedProject: Project;

      if (id) {
        const { data, error } = await supabase
          .from("projects")
          .update({ ...payload, published: Boolean(project?.published && form.published) })
          .eq("id", id)
          .select("*")
          .single();

        if (error) throw error;
        savedProject = data as Project;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert({ ...payload, published: false })
          .select("*")
          .single();

        if (error) throw error;
        savedProject = data as Project;
        id = savedProject.id;
        // Retain the new draft ID if an upload fails, so retry cannot duplicate it.
        setProject(savedProject);
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

      if (coverFile) {
        setProject(savedProject);
        setCoverFile(null);
        await saveDraftFiles(draftKey, "cover", []);
      }

      async function uploadMedia(files: File[], section: "gallery" | "process") {
        if (!id) return;

        const existing = Math.max(-1, ...media.filter(item => item.section === section).map(item => item.display_order)) + 1;

        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          const path = await uploadOne(user!.id, id, file, section);
          const { data, error } = await supabase.from("project_media").insert({
            project_id: id,
            path,
            caption: "",
            alt_text: form.title,
            section,
            display_order: existing + index,
          }).select("*").single();

          if (error) throw error;
          setMedia(current => [...current, data as ProjectMedia]);
          const remaining = files.slice(index + 1);
          if (section === "gallery") setGalleryFiles(remaining); else setProcessFiles(remaining);
          await saveDraftFiles(draftKey, section, remaining);
        }
      }

      await uploadMedia(galleryFiles, "gallery");
      await uploadMedia(processFiles, "process");

      const { data: completed, error: completionError } = await supabase.from("projects")
        .update({ published: form.published }).eq("id", id).select("*").single();
      if (completionError) throw completionError;
      savedProject = completed as Project;

      window.localStorage.removeItem(draftKey);
      await clearDraftFiles(draftKey);

      setProject(savedProject);
      setCoverFile(null);
      setGalleryFiles([]);
      setProcessFiles([]);
      setStatus(form.published ? "Published to the portfolio." : "Draft saved.");

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

    // Imported local assets are shared deployed files, never storage objects.
    const { error } = await supabase
      .from("project_media")
      .delete()
      .eq("id", item.id);

    if (!error) {
      setMedia((current) => current.filter((mediaItem) => mediaItem.id !== item.id));
    } else {
      setStatus(error.message);
    }
  }

  async function removeProject() {
    if (
      !projectId ||
      !window.confirm("Delete this entire project? This cannot be undone.")
    ) {
      return;
    }

    setSaving(true);

    // Remove catalog references only. Keep source objects recoverable and avoid
    // deleting shared assets; storage cleanup is a separate maintenance action.
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (!error) {
      window.localStorage.removeItem(draftKey);
      await clearDraftFiles(draftKey);
      router.push("/admin/projects");
    } else {
      setStatus(error.message);
    }

    setSaving(false);
  }

  async function setCover(files: File[]) {
    const error = mediaError(files); if (error) { setStatus(error); return; }
    const file = files[0] ?? null;
    setCoverFile(file);
    await saveDraftFiles(draftKey, "cover", file ? [file] : []);
  }

  async function addFiles(
    event: ChangeEvent<HTMLInputElement>,
    slot: "gallery" | "process",
  ) {
    const incoming = Array.from(event.target.files ?? []);
    const error = mediaError(incoming); if (error) { setStatus(error); return; }

    if (slot === "gallery") {
      const combined = [...galleryFiles, ...incoming];
      setGalleryFiles(combined);
      await saveDraftFiles(draftKey, slot, combined);
    } else {
      const combined = [...processFiles, ...incoming];
      setProcessFiles(combined);
      await saveDraftFiles(draftKey, slot, combined);
    }
  }

  return (
    <form className="editor" onSubmit={save}>
      <div className="editor__top">
        <Link href="/admin/projects" className="back-link">
          <ArrowLeft size={16} /> Projects
        </Link>
      </div>

      <div className="editor__heading">
        <p className="eyebrow">{projectId ? "EDIT PROJECT" : "NEW PROJECT"}</p>
        <h1>{form.title || "Untitled work"}</h1>
        <p className="draft-note">
          Unsaved text and selected images are preserved in this browser, so you
          can leave this page and come back without starting over.
        </p>
        {status && <p className="form-message">{status}</p>}
      </div>

      <div className="editor-grid">
        <section className="editor-panel">
          <h2>Basics</h2>

          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => titleChanged(event.target.value)}
              required
            />
          </label>

          <label>
            Slug
            <input
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                update("slug", event.target.value);
              }}
              required
            />
          </label>

          <label>
            Category
            <select
              value={form.category}
              onChange={(event) =>
                update("category", event.target.value as ProjectCategory)
              }
            >
              {PROJECT_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label>
            Year
            <input
              type="number"
              value={form.year}
              onChange={(event) => update("year", Number(event.target.value))}
            />
          </label>

          <label>
            Short description
            <textarea
              rows={3}
              value={form.short_description}
              onChange={(event) =>
                update("short_description", event.target.value)
              }
            />
          </label>

          <label>
            Full description
            <textarea
              rows={10}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </label>

          <label>
            Technologies and tools <span className="label-note">comma separated</span>
            <input
              value={form.tools}
              onChange={(event) => update("tools", event.target.value)}
              placeholder="Figma, Clip Studio Paint, Blender"
            />
          </label>

          <label>Station order <span className="label-note">lower numbers appear first</span>
            <input type="number" step="1" value={form.display_order} onChange={event => update("display_order", Number(event.target.value))} />
          </label>
          <label>Presentation
            <select value={form.portrait ? "portrait" : "landscape"} onChange={event => update("portrait", event.target.value === "portrait")}>
              <option value="landscape">Landscape</option><option value="portrait">Portrait</option>
            </select>
          </label>
          <label>Cover image description
            <input value={form.cover_alt} onChange={event => update("cover_alt", event.target.value)} placeholder="Describe the image for screen readers" />
          </label>
          <label>Station label <span className="label-note">optional mineral or gallery name</span>
            <input value={form.mineral} onChange={event => update("mineral", event.target.value)} />
          </label>

          {!isArtwork(form.category) && <fieldset>
            <legend>Project details and links</legend>
            <label>Platform <input value={form.platform} onChange={event => update("platform", event.target.value)} placeholder="Browser, Windows, Android…" /></label>
            <label>Features <span className="label-note">one per line</span>
              <textarea rows={4} value={form.features} onChange={event => update("features", event.target.value)} />
            </label>
            <label>GitHub repository <input type="url" value={form.repository_url} onChange={event => update("repository_url", event.target.value)} placeholder="https://github.com/…" /></label>
            <label>Live demo or playable link <input type="url" value={form.demo_url} onChange={event => update("demo_url", event.target.value)} placeholder="https://…" /></label>
            <label>Download or releases <input type="url" value={form.download_url} onChange={event => update("download_url", event.target.value)} placeholder="https://…" /></label>
            <label>Primary link label <input value={form.action_label} onChange={event => update("action_label", event.target.value)} placeholder="Play project, Visit demo…" /></label>
          </fieldset>}

          <div className="visibility-panel">
            <label>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) => update("published", event.target.checked)}
              />
              <span>
                <strong>Visible on public site</strong>
                <small>
                  Turn this off when you want to keep the project as a private draft.
                </small>
              </span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update("featured", event.target.checked)}
              />
              <span>
                <strong>Feature in Projects</strong>
                <small>
                  Give this work a larger presentation in the Projects menu. Station order is managed separately.
                </small>
              </span>
            </label>
          </div>
        </section>

        <section className="editor-panel">
          <h2>Media</h2>

          <label className="upload-box">
            <Upload size={20} />
            <strong>Cover image</strong>
            <span>{coverFile?.name || "Choose JPG, PNG, WebP, GIF, or AVIF"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                void setCover(Array.from(event.target.files ?? []))
              }
            />
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
            <span>
              {galleryFiles.length
                ? `${galleryFiles.length} selected and preserved`
                : "Select one or more images"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => void addFiles(event, "gallery")}
            />
          </label>

          <label className="upload-box">
            <Upload size={20} />
            <strong>Process images</strong>
            <span>
              {processFiles.length
                ? `${processFiles.length} selected and preserved`
                : "Sketches, wireframes, iterations…"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => void addFiles(event, "process")}
            />
          </label>

          {media.length > 0 && (
            <div className="media-admin-grid">
              {media.map((item) => {
                const url = publicMediaUrl(item.path);
                if (!url) return null;

                return (
                  <div className="media-admin-item" key={item.id}>
                    <Image
                      src={url}
                      alt={item.alt_text || "Project media"}
                      fill
                      sizes="180px"
                      className="project-cover__image"
                    />
                    <span>{item.section}</span>
                    <button
                      type="button"
                      onClick={() => void removeMedia(item)}
                      aria-label="Delete image"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="editor-savebar">
        <div>
          {projectId && (
            <button
              className="button danger"
              type="button"
              onClick={() => void removeProject()}
              disabled={saving}
            >
              <Trash2 size={16} /> Delete project
            </button>
          )}
        </div>

        <button
          className="button button--primary editor-savebar__primary"
          type="submit"
          disabled={saving}
        >
          <Save size={17} />
          {saving
            ? "Saving…"
            : form.published
              ? projectId
                ? "Publish changes"
                : "Publish project"
              : "Save draft"}
        </button>
      </div>
    </form>
  );
}
