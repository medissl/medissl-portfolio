"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MineProject } from "./projects";
import type { MineEngine } from "./scene";
import { MineLoading } from "./mine-loading";
import { createMineAudio, defaultSound, readSound, soundKey, type SoundPreference } from "./audio";
import { mineHref, readMineNavigation, type MinePanel as Panel } from "./navigation";

function ProjectImage({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="mine-media-error">Image unavailable</span>;
  return <Image src={src} alt={alt} width={1280} height={720} unoptimized
    loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />;
}

export function MineExperience({ projects, lightweight = false, initialProject, initialPanel = null, savedArtwork = false }: {
  projects: MineProject[]; lightweight?: boolean; initialProject?: string; initialPanel?: Panel; savedArtwork?: boolean;
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
  const [panel, setPanel] = useState<Panel>(initialPanel);
  const [detail, setDetail] = useState(initialIndex);
  const [reduced, setReduced] = useState(false);
  const audio = useRef<ReturnType<typeof createMineAudio> | null>(null);
  const [sound, setSound] = useState(defaultSound);
  const [unlocked, setUnlocked] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const current = projects[station];
  const project = projects[detail];
  const mary = projects.find(item => item.slug === "virgin-mary-fanart");
  const sakiko = projects.find(item => item.id === "sakiko");
  const moving = ["drilling", "breaking", "travelling"].includes(phase);
  const lastStation = station === projects.length - 1;

  useEffect(() => () => { audio.current?.dispose(); audio.current = null; }, []);
  useEffect(() => { audio.current?.phase(phase, Boolean(panel) || failed || reduced); }, [phase, panel, failed, reduced]);
  function changeSound(value: SoundPreference) {
    setAudioFailed(false);
    if (!audio.current && value.enabled) {
      audio.current = createMineAudio(() => setAudioFailed(true));
      audio.current.phase(phase, Boolean(panel) || failed || reduced);
      setUnlocked(true);
    }
    setSound(value); audio.current?.configure(value);
    try { localStorage.setItem(soundKey, JSON.stringify(value)); } catch { /* Private mode can block storage. */ }
  }
  function savedSound() {
    try { return readSound(localStorage.getItem(soundKey)); } catch { return sound; }
  }

  function select(index: number) {
    if (selected.current !== index || moving) engine.current?.jump(index);
    selected.current = index; setStation(index);
  }
  function navigate(next: Panel, index: number) {
    const url = new URL(window.location.href);
    url.searchParams.set("project", projects[index].id);
    if (next) url.searchParams.set("panel", next === "index" ? "projects" : next);
    else url.searchParams.delete("panel");
    url.hash = "";
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
  }
  function open(next: Panel, index = station) {
    if (next === "settings" && !unlocked) setSound({ ...savedSound(), enabled: false });
    if (!dialog.current?.open) opener.current = document.activeElement as HTMLElement;
    if (next === "project") { select(index); setDetail(index); }
    setPanel(next); engine.current?.pause(true);
    navigate(next, index);
    if (!dialog.current?.open) dialog.current?.showModal();
    else dialog.current.querySelector<HTMLButtonElement>(".mine-close")?.focus();
    if (dialog.current) dialog.current.scrollTop = 0;
  }
  useEffect(() => {
    const restore = () => {
      const state = readMineNavigation(new URLSearchParams(window.location.search));
      const index = Math.max(0, projects.findIndex(item => item.id === state.project || item.slug === state.project));
      selected.current = index; setStation(index); setDetail(index); setPanel(state.panel);
      engine.current?.jump(index); engine.current?.pause(Boolean(state.panel));
      if (state.panel) {
        if (!dialog.current?.open) { opener.current = document.activeElement as HTMLElement; dialog.current?.showModal(); }
        if (dialog.current) dialog.current.scrollTop = 0;
      } else dialog.current?.close();
    };
    if (initialPanel) dialog.current?.showModal();
    const focusContact = requestAnimationFrame(() => {
      if (window.location.hash === "#contact") document.getElementById("contact")?.scrollIntoView();
    });
    window.addEventListener("popstate", restore);
    return () => { window.removeEventListener("popstate", restore); cancelAnimationFrame(focusContact); };
  }, [initialPanel, projects]);
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
  function onClose() {
    setPanel(null); engine.current?.pause(false); opener.current?.focus();
    if (new URLSearchParams(window.location.search).has("panel")) navigate(null, selected.current);
  }

  function projectList() {
    return <div className="mine-index">{projects.map((item, index) => (
      <a key={item.id} href={mineHref(item.id)} data-project={item.id} data-kind={item.kind} data-portrait={item.portrait}
        className={item.image ? "" : "without-media"} onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); open("project", index);
        }} aria-label={`View ${item.title}`}>
        <span className="mine-index-media">{item.image ? <ProjectImage src={item.image} alt="" />
          : <span className="mine-index-specimen" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>}</span>
        <span className="mine-index-caption"><span className="mine-index-category">{String(index + 1).padStart(2, "0")} · {item.category}</span>
          <strong>{item.title}</strong>{!item.image && <span className="mine-index-summary">{item.description}</span>}</span>
      </a>
    ))}</div>;
  }

  return (
    <main className="mine" id="main-content" data-station={current.id}>
      <div className="mine-world" ref={host} aria-hidden={failed} />
      <div className="mine-vignette" aria-hidden="true" />
      <header className="mine-header">
        <Link className="mine-brand" href="/" aria-label="Medissl — portfolio home" onClick={event => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault(); select(0); navigate(null, 0);
        }}>MEDISSL</Link>
        <nav aria-label="Portfolio">
          <button aria-haspopup="dialog" onClick={() => open("index")}>Projects</button>
          <button aria-haspopup="dialog" onClick={() => open("about")}>About</button>
          <button aria-haspopup="dialog" onClick={() => open("settings")}>Settings</button>
          <button aria-pressed={unlocked && sound.enabled} onClick={() => changeSound({ ...(unlocked ? sound : savedSound()), enabled: !unlocked || !sound.enabled })}>
            {unlocked && sound.enabled ? "Sound on" : "Sound off"}
          </button>
        </nav>
      </header>
      {failed ? <section className="mine-fallback">
        <h1>Projects</h1>
        {!lightweight && <p>The cave is unavailable on this device. Explore the work here.</p>}
        {projectList()}
        {savedArtwork && <p className="mine-feed-status">Showing saved artwork while the live archive is unavailable.</p>}
      </section> : <>
        {phase === "loading" && <MineLoading stage="Opening the cave. The project archive is ready." />}
        <footer className="mine-controls">
          <div className="mine-caption">
            <span className="mine-count">{String(station + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
            <h1><button className="mine-inspect" aria-label={`Inspect ${current.title}`} onClick={() => open("project")} disabled={moving}>
              {current.title}
            </button></h1>
          </div>
          <div className="mine-drive">
            <p className="mine-sr" role="status">{moving
              ? phase === "drilling" ? "Drilling…" : phase === "breaking" ? "Breaking through…" : "Onward…"
              : reduced ? "Reduced motion: instant travel" : "W / ↑ to advance"}</p>
            <button className="mine-primary" disabled={phase === "loading" || moving} onClick={() => engine.current?.advance()}>
              {moving ? "Drilling…" : lastStation ? "Return to the start" : reduced ? "Next project" : "Drill onward"}
            </button>
          </div>
        </footer>
      </>}
      <span className="mine-sr" aria-live="polite">{phase === "ready" ? `${station + 1} of ${projects.length}: ${current.title}` : ""}</span>
      <dialog ref={dialog} className="mine-dialog" data-panel={panel} onClose={onClose}
        onClick={event => { if (event.target === event.currentTarget) close(); }} aria-labelledby="mine-panel-title">
        <div className="mine-sheet">
          <button className="mine-close" onClick={close} aria-label="Return to the mine">Close <span aria-hidden="true">×</span></button>
          {panel === "project" && <article className="mine-case" data-kind={project.kind} data-detail={project.id}>
            <header className="mine-case-intro">
            <button className="mine-back" onClick={() => open("index")}>← Projects</button>
            <p className="mine-kicker">{project.category}{project.platform ? ` · ${project.platform}` : ""}</p>
            <h2 id="mine-panel-title">{project.title}</h2>
            <p className="mine-description">{project.description}</p>
            <div className="mine-links">
              {project.link && <Link href={project.link} target="_blank" rel="noreferrer">{project.action} ↗</Link>}
              {project.repository && <a href={project.repository} target="_blank" rel="noreferrer">GitHub ↗</a>}
            </div>
            </header>
            {(project.image || project.media.length > 0) && <div className={`mine-gallery ${project.portrait ? "portrait" : ""}`}>
              {project.image && <figure><ProjectImage key={project.image} src={project.image} alt={project.alt} eager /></figure>}
              {project.media.map(media => <figure key={media.id} data-section={media.section}>
                <ProjectImage src={media.src} alt={media.alt} />
                {(media.caption || media.section === "process") && <figcaption>{media.caption || "Process"}</figcaption>}
              </figure>)}
            </div>}
            <aside className="mine-case-notes">
            {project.tools && <><h3>Made with</h3><p className="mine-tools">{project.tools}</p></>}
            {project.features.length > 0 && <h3>{project.kind === "artwork" ? "About the piece" : "Inside the project"}</h3>}
            {project.features.length > 0 && <ul>{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul>}
            </aside>
          </article>}
          {panel === "index" && <section>
            <p className="mine-kicker">The collection · {projects.length} stations</p>
            <h2 id="mine-panel-title">Projects</h2>
            <p className="mine-description">Choose where to explore next.</p>
            {projectList()}
            <Link href={`/?view=projects&project=${encodeURIComponent(current.id)}`} className="mine-text-link">Browse without 3D →</Link>
            {savedArtwork && <p className="mine-feed-status">Showing saved artwork while the live archive is unavailable.</p>}
          </section>}
          {panel === "about" && <section className="mine-about">
            <div className="mine-about-intro"><p className="mine-kicker">The person behind the mine</p>
            <h2 id="mine-panel-title">Medianto<br />Susilo.</h2>
            <p className="mine-description">I make games, software, interactive experiences, and artwork.</p>
            <p>I study Computer Science at BINUS University in Jakarta, specializing in Interactive Multimedia.</p>
            <p>I like connecting code, visual design and sound, from illustration to a game’s main menu.</p>
            <p>Outside the screen: guitar, music production, and songwriting.</p>
            <div className="mine-contact" id="contact"><span>Get in touch</span>
              <a href="mailto:mediantozeng@gmail.com">mediantozeng@gmail.com</a>
              <a href="https://github.com/medissl" target="_blank" rel="noreferrer">GitHub / medissl ↗</a>
            </div></div>
            <div className="mine-about-work" aria-label="Selected games and artwork">
              {[mary, sakiko].filter((item): item is MineProject => Boolean(item)).map(item => <a key={item.id} href={mineHref(item.id)} aria-label={`View ${item.title}`} onClick={event => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault(); open("project", projects.findIndex(p => p.id === item.id));
                }}><figure>
                  {item.image && <ProjectImage src={item.image} alt={item.id === "sakiko" ? "SAKIKO's actual main-menu design" : "Virgin Mary fanart by Medianto"} />}
                  <figcaption><strong>{item.id === "sakiko" ? "SAKIKO main menu" : item.title}</strong>
                    <span>{item.id === "sakiko" ? "Game UI · Visual direction · Interactive multimedia" : "Illustration · Digital art"}</span>
                  </figcaption>
                </figure></a>)}
            </div>
          </section>}
          {panel === "settings" && <section className="mine-settings">
            <p className="mine-kicker">Make yourself comfortable</p>
            <h2 id="mine-panel-title">Journey settings</h2>
            <fieldset className="mine-audio">
              <legend>Sound in the mine</legend>
              <label><input type="checkbox" checked={unlocked && sound.enabled} onChange={event => changeSound({ ...sound, enabled: event.target.checked })} /> Enable sound</label>
              <label>Music <input type="range" min="0" max="100" value={Math.round(sound.music * 100)} onChange={event => changeSound({ ...sound, music: Number(event.target.value) / 100 })} /><output>{Math.round(sound.music * 100)}%</output></label>
              <label>Effects <input type="range" min="0" max="100" value={Math.round(sound.effects * 100)} onChange={event => changeSound({ ...sound, effects: Number(event.target.value) / 100 })} /><output>{Math.round(sound.effects * 100)}%</output></label>
              <p className="mine-help">Sound starts only when you enable it. Your levels are remembered; audio pauses when this tab is hidden.</p>
              {audioFailed && <p role="status">Some audio could not play. You can continue exploring silently or toggle sound to retry.</p>}
              <a href="/mine/audio/CREDITS.txt" target="_blank" rel="noreferrer">Audio credits ↗</a>
            </fieldset>
            {!failed && <label className="mine-motion"><input type="checkbox" checked={reduced} disabled={phase === "loading"} onChange={event => {
              const value = event.target.checked; setReduced(value); engine.current?.motion(value);
            }} /> Instant travel</label>}
            <p className="mine-help">Move between stations without drilling or camera travel. You can always choose a project directly.</p>
            <p className="mine-help">W or ↑ advances. Escape skips a journey. Use Projects to visit any station.</p>
          </section>}
        </div>
      </dialog>
      <noscript><section className="mine-fallback"><h1>MEDISSL</h1>
        <p>The mine needs JavaScript. Browse <a href="https://github.com/medissl">my GitHub projects</a> or <Link href="/work">published artwork</Link>, or <a href="mailto:mediantozeng@gmail.com">email me</a>.</p>
      </section></noscript>
    </main>
  );
}
