"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MineProject } from "./projects";
import type { MineEngine } from "./scene";

type Panel = "project" | "index" | "about" | null;

function ProjectImage({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="mine-media-error">Image unavailable</span>;
  return <Image src={src} alt={alt} width={1280} height={720} unoptimized
    loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />;
}

export function MineExperience({ projects, lightweight = false, initialProject, savedArtwork = false }: {
  projects: MineProject[]; lightweight?: boolean; initialProject?: string; savedArtwork?: boolean;
}) {
  const initialIndex = Math.max(0, projects.findIndex(project => project.id === initialProject));
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<MineEngine | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const selected = useRef(initialIndex);
  const inspectRef = useRef<() => void>(() => {});
  const [station, setStation] = useState(initialIndex);
  const [phase, setPhase] = useState("loading");
  const [failed, setFailed] = useState(lightweight);
  const [panel, setPanel] = useState<Panel>(null);
  const [detail, setDetail] = useState(initialIndex);
  const [reduced, setReduced] = useState(false);
  const current = projects[station];
  const project = projects[detail];
  const moving = ["drilling", "breaking", "travelling"].includes(phase);
  const lastStation = station === projects.length - 1;

  function select(index: number) {
    if (selected.current !== index || moving) engine.current?.jump(index);
    selected.current = index; setStation(index);
  }
  function open(next: Panel, index = station) {
    if (!dialog.current?.open) opener.current = document.activeElement as HTMLElement;
    if (next === "project") { select(index); setDetail(index); }
    setPanel(next); engine.current?.pause(true);
    if (!dialog.current?.open) dialog.current?.showModal();
    else dialog.current.querySelector<HTMLButtonElement>(".mine-close")?.focus();
  }
  useEffect(() => { inspectRef.current = () => open("project"); });
  useEffect(() => {
    if (lightweight) return;
    let cancelled = false;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = async () => {
      try {
        const { createMine } = await import("./scene");
        if (cancelled || !host.current) return;
        setReduced(preference.matches);
        engine.current = createMine(host.current, {
          station: index => { selected.current = index; setStation(index); },
          phase: setPhase, inspect: () => inspectRef.current(), failed: () => setFailed(true),
        }, preference.matches, projects, selected.current);
        engine.current.pause(Boolean(dialog.current?.open));
      } catch { if (!cancelled) setFailed(true); }
    };
    void start();
    return () => { cancelled = true; engine.current?.dispose(); engine.current = null; };
  }, [lightweight, projects]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (failed || event.repeat || dialog.current?.open || event.altKey || event.metaKey || event.ctrlKey) return;
      if (event.key.toLowerCase() === "w" || event.key === "ArrowUp") { event.preventDefault(); engine.current?.advance(); }
      if (event.key === "Escape") engine.current?.skip();
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [failed]);
  useEffect(() => { if (failed) { engine.current?.dispose(); engine.current = null; } }, [failed]);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("project", projects[station].id);
    // Native history preserves Next's route state without re-querying the artwork feed.
    window.history.replaceState(null, "", url);
  }, [station, projects]);
  function close() { dialog.current?.close(); }
  function onClose() { setPanel(null); engine.current?.pause(false); opener.current?.focus(); }

  function projectList() {
    return <div className="mine-index">{projects.map((item, index) => (
      <button key={item.id} data-project={item.id} onClick={() => open("project", index)} aria-label={`View ${item.title}`}>
        <span className="mine-index-number">{String(index + 1).padStart(2, "0")}</span>
        {item.image && <ProjectImage src={item.image} alt="" />}
        <span><strong>{item.title}</strong><span className="mine-index-category">{item.category}</span></span>
        <span className="mine-index-arrow" aria-hidden="true">↗</span>
      </button>
    ))}</div>;
  }

  return (
    <main className="mine" id="main-content" data-station={current.id}>
      <div className="mine-world" ref={host} aria-hidden={failed} />
      <div className="mine-vignette" aria-hidden="true" />
      <header className="mine-header">
        <Link className="mine-brand" href="/" aria-label="Medissl — portfolio home">MEDISSL</Link>
        <nav aria-label="Portfolio">
          <button onClick={() => open("index")}>Projects</button>
          <button onClick={() => open("about")}>About</button>
        </nav>
      </header>
      {failed ? <section className="mine-fallback">
        <h1>Projects</h1>
        {!lightweight && <p>The cave is unavailable on this device. Explore the work here.</p>}
        {projectList()}
        {savedArtwork && <p className="mine-feed-status">Showing saved artwork while the live archive is unavailable.</p>}
      </section> : <>
        {phase === "loading" && <p className="mine-loading" role="status">Opening the mine…</p>}
        <footer className="mine-controls">
          <div className="mine-caption">
            <span className="mine-count">{String(station + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
            <h1><button className="mine-inspect" aria-label={`Inspect ${current.title}`} onClick={() => open("project")} disabled={moving}>
              {current.title} <span aria-hidden="true">↗</span>
            </button></h1>
          </div>
          <div className="mine-drive">
            <p className="mine-travel-status" role="status">{moving
              ? phase === "drilling" ? "Drilling…" : phase === "breaking" ? "Breaking through…" : "Onward…"
              : reduced ? "Reduced motion: instant travel" : "W / ↑ to advance"}</p>
            <button className="mine-primary" disabled={phase === "loading"} onClick={() => moving ? engine.current?.skip() : engine.current?.advance()}>
              {moving ? "Skip" : lastStation ? "Return to the start" : "Drill onward"}<span aria-hidden="true">{lastStation && !moving ? "↻" : "↑"}</span>
            </button>
          </div>
        </footer>
      </>}
      <span className="mine-sr" aria-live="polite">{phase === "ready" ? `${station + 1} of ${projects.length}: ${current.title}` : ""}</span>
      <dialog ref={dialog} className="mine-dialog" onClose={onClose}
        onClick={event => { if (event.target === event.currentTarget) close(); }} aria-labelledby="mine-panel-title">
        <div className="mine-sheet">
          <button className="mine-close" onClick={close} aria-label="Return to the mine">Close <span aria-hidden="true">×</span></button>
          {panel === "project" && <article data-detail={project.id}>
            <p className="mine-kicker">{project.category}{project.platform ? ` · ${project.platform}` : ""}</p>
            <h2 id="mine-panel-title">{project.title}</h2>
            <p className="mine-description">{project.description}</p>
            {(project.image || project.media.length > 0) && <div className={`mine-gallery ${project.portrait ? "portrait" : ""}`}>
              {project.image && <figure><ProjectImage key={project.image} src={project.image} alt={project.alt} eager /></figure>}
              {project.media.map(media => <figure key={media.id} data-section={media.section}>
                <ProjectImage src={media.src} alt={media.alt} />
                {(media.caption || media.section === "process") && <figcaption>{media.caption || "Process"}</figcaption>}
              </figure>)}
            </div>}
            {project.tools && <p className="mine-tools">{project.tools}</p>}
            {project.features.length > 0 && <ul>{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul>}
            <div className="mine-links">
              {project.link && <Link href={project.link} target="_blank" rel="noreferrer">{project.action} ↗</Link>}
              {project.repository && <a href={project.repository} target="_blank" rel="noreferrer">GitHub ↗</a>}
            </div>
          </article>}
          {panel === "index" && <section>
            <h2 id="mine-panel-title">Projects</h2>
            {projectList()}
            <Link href={`/mine?view=projects&project=${encodeURIComponent(current.id)}`} className="mine-text-link">Browse without 3D →</Link>
            {savedArtwork && <p className="mine-feed-status">Showing saved artwork while the live archive is unavailable.</p>}
          </section>}
          {panel === "about" && <section>
            <h2 id="mine-panel-title">Medianto Susilo</h2>
            <p className="mine-description">Software, games, interactive experiments, and artwork.</p>
            <div className="mine-links">
              <a href="mailto:mediantozeng@gmail.com">mediantozeng@gmail.com ↗</a>
              <a href="https://github.com/medissl" target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </section>}
        </div>
      </dialog>
      <noscript><section className="mine-fallback"><h1>MEDISSL</h1>
        <p>The mine needs JavaScript. Browse <a href="https://github.com/medissl">my GitHub projects</a> or <Link href="/work">published artwork</Link>, or <a href="mailto:mediantozeng@gmail.com">email me</a>.</p>
      </section></noscript>
    </main>
  );
}
