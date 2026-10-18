"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { mineProjects } from "./projects";
import type { MineEngine } from "./scene";

type Panel = "project" | "index" | "about" | null;
export function MineExperience({ lightweight = false }: { lightweight?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<MineEngine | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [station, setStation] = useState(0);
  const [phase, setPhase] = useState("loading");
  const [failed, setFailed] = useState(lightweight);
  const [panel, setPanel] = useState<Panel>(null);
  const [detail, setDetail] = useState(0);
  const [reduced, setReduced] = useState(false);
  const inspectRef = useRef<() => void>(() => {});
  const current = mineProjects[station];
  const project = mineProjects[detail];
  const moving = ["drilling", "breaking", "travelling"].includes(phase);

  function open(next: Panel, index = station) {
    opener.current = document.activeElement as HTMLElement;
    setDetail(index); setPanel(next); engine.current?.pause(true);
    dialog.current?.showModal();
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
        engine.current = createMine(host.current, { station: setStation, phase: setPhase, inspect: () => inspectRef.current(), failed: () => setFailed(true) }, preference.matches);
        engine.current.pause(Boolean(dialog.current?.open));
      } catch { if (!cancelled) setFailed(true); }
    };
    void start();
    return () => { cancelled = true; engine.current?.dispose(); engine.current = null; };
  }, [lightweight]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.repeat || dialog.current?.open || e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key.toLowerCase() === "w" || e.key === "ArrowUp") { e.preventDefault(); engine.current?.advance(); }
      if (e.key === "Escape") engine.current?.skip();
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => { if (failed) { engine.current?.dispose(); engine.current = null; } }, [failed]);
  function close() { dialog.current?.close(); }
  function onClose() { setPanel(null); engine.current?.pause(false); opener.current?.focus(); }
  function visit(index: number) { engine.current?.jump(index); setStation(index); close(); }

  return (
    <main className="mine" id="main-content">
      <div className="mine-world" ref={host} aria-hidden={failed} />
      <div className="mine-vignette" aria-hidden="true" />
      <header className="mine-header">
        <Link className="mine-brand" href="/" aria-label="Medissl — original portfolio">MEDISSL<span>Independent worlds & interactive work</span></Link>
        <nav aria-label="Portfolio"><button onClick={() => open("index")}>Project index <span aria-hidden="true">↗</span></button><button onClick={() => open("about")}>About & contact</button></nav>
      </header>
      {failed ? <section className="mine-fallback"><p className="mine-kicker">The work, without the ride</p><h1>Explore the projects</h1><p>{lightweight ? "All the work, with no 3D loading required." : "The 3D cave could not start on this device. Every project is still available here."}</p><div className="mine-index">{mineProjects.map((p, i) => <button key={p.title} onClick={() => open("project", i)}><Image width={1280} height={720} unoptimized src={p.image} alt={`${p.title} screenshot`} /><span><strong>{p.title}</strong>{p.category}</span><span>Inspect ↗</span></button>)}</div><Link href="/work">Browse published artwork →</Link></section> : <>
        <div className="mine-location"><span className="mine-kicker">The crystal mine</span><h1>{current.mineral}</h1><p>0{station + 1} / 02 <span>·</span> {current.title}</p></div>
        {phase === "loading" && <p className="mine-loading" role="status">Lighting the lanterns…<br /><button onClick={() => open("index")}>Browse projects while you wait</button></p>}
        <footer className="mine-controls">
          <div className="mine-caption"><span className="mine-kicker">{moving ? "Opening the next passage" : "Discovered in the rock"}</span><button className="mine-inspect" onClick={() => open("project")} disabled={moving}>{current.title} <span>Inspect project ↗</span></button></div>
          <div className="mine-drive">
            {moving ? <><p role="status">{phase === "drilling" ? "Drilling into the seam…" : phase === "breaking" ? "Stone giving way…" : "Entering the fluorite garden…"}</p><button className="mine-primary" onClick={() => engine.current?.skip()}>Skip transition <span>↗</span></button></> : station === 0 ? <><p>{reduced ? "Reduced motion · instant travel" : "Press W or ↑ to continue"}</p><button className="mine-primary" disabled={phase === "loading"} onClick={() => engine.current?.advance()}>Drill to the next discovery <span>↑</span></button></> : <><p>End of this two-station expedition</p><button className="mine-primary" onClick={() => open("index")}>Explore the work <span>↗</span></button></>}
          </div>
        </footer>
      </>}
      <span className="mine-sr" aria-live="polite">{phase === "ready" ? `Station ${station + 1}: ${current.title}` : ""}</span>
      <dialog ref={dialog} className="mine-dialog" onClose={onClose} onClick={e => { if (e.target === e.currentTarget) close(); }} aria-labelledby="mine-panel-title">
        <div className="mine-sheet">
          <button className="mine-close" onClick={close} aria-label="Return to the cave">Close <span aria-hidden="true">×</span></button>
          {panel === "project" && <article><p className="mine-kicker">{project.category} / {project.platform}</p><h2 id="mine-panel-title">{project.title}</h2><p className="mine-description">{project.description}</p><div className={`mine-gallery ${detail === 1 ? "portrait" : ""}`}><Image width={1280} height={720} unoptimized src={project.image} alt={`${project.title} ${detail === 1 ? "gameplay" : "daytime classroom"}`} /><Image width={1280} height={720} unoptimized src={project.gallery} alt={project.alt} loading="lazy" /></div><p className="mine-tools">{project.tools}</p><ul>{project.features.map(f => <li key={f}>{f}</li>)}</ul><div className="mine-links"><a href={project.link} target="_blank" rel="noreferrer">{project.action} ↗</a><a href={project.repository} target="_blank" rel="noreferrer">GitHub ↗</a></div></article>}
          {panel === "index" && <section><p className="mine-kicker">Go straight to the work</p><h2 id="mine-panel-title">Project index</h2><p>Two discoveries. Take the railway, or open a project here.</p><div className="mine-index">{mineProjects.map((p, i) => <div className="mine-index-row" key={p.title}><button onClick={() => { setDetail(i); setPanel("project"); }}><Image width={1280} height={720} unoptimized src={p.image} alt={`${p.title} screenshot`} /><span><strong>{p.title}</strong>{p.category}</span><span>Inspect ↗</span></button>{!failed && <button className="mine-visit" onClick={() => visit(i)}>Visit station {i + 1} →</button>}</div>)}</div><Link href="/work" className="mine-text-link">Published artwork & archive →</Link><br /><Link href="/mine?view=projects" className="mine-text-link">Lightweight project browsing →</Link></section>}
          {panel === "about" && <section><p className="mine-kicker">The person behind the mine</p><h2 id="mine-panel-title">Medianto<br />Susilo.</h2><p className="mine-description">Software, games, and interactive media. I build things you can explore, play, and use.</p><p>This small expedition brings together two of my games: SAKIKO’s quiet school corridors and Jellink’s soft-body puzzles.</p><div className="mine-links"><a href="mailto:mediantozeng@gmail.com">Email me ↗</a><a href="https://github.com/medissl" target="_blank" rel="noreferrer">GitHub ↗</a><Link href="/about">More about me →</Link></div><p className="mine-email">mediantozeng@gmail.com</p></section>}
        </div>
      </dialog>
      <noscript><section className="mine-fallback"><h1>MEDISSL’s projects</h1><p>The interactive mine needs JavaScript. Explore <a href="https://github.com/medissl/SAKIKO">SAKIKO</a> and <a href="https://jellink.vercel.app">Jellink</a>, or <a href="mailto:mediantozeng@gmail.com">get in touch</a>.</p></section></noscript>
    </main>
  );
}



