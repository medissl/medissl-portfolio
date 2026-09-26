import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About",
  description: "About Medianto Susilo, a Computer Science student focused on Interactive Multimedia.",
};

const tools = [
  "Figma",
  "Unity",
  "Godot",
  "Blender",
  "Clip Studio Paint",
  "FL Studio",
  "C#",
  "JavaScript",
  "Python",
  "SQL",
];

export default function AboutPage() {
  return (
    <section className="page shell">
      <div className="about-hero">
        <div>
          <p className="eyebrow">ABOUT</p>
          <h1>I&apos;m Medi.</h1>
        </div>
        <p className="about-hero__lede">
          A Computer Science student at BINUS University specializing in
          Interactive Multimedia. I&apos;m interested in the point where code,
          visual design, interaction, sound, and storytelling stop being
          separate things and become one experience.
        </p>
      </div>

      <div className="about-grid">
        <Reveal>
          <article className="about-panel">
            <p className="eyebrow">HOW I WORK</p>
            <h2>Curiosity first.</h2>
            <p>
              I enjoy making games, interfaces, illustrations, web experiences,
              and small experiments. I don&apos;t want every project to solve a
              giant problem. Sometimes a good enough reason to build something
              is simply wanting to see whether an idea can become real.
            </p>
            <p>
              My portfolio is intentionally allowed to change with me. Older
              pieces can move into the archive, better work can replace them,
              and experiments are allowed to stay experiments.
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="about-panel">
            <p className="eyebrow">CURRENTLY EXPLORING</p>
            <div className="tag-cloud">
              {[
                "Game Development",
                "UI / UX",
                "Digital Art",
                "Creative Coding",
                "Interactive Media",
                "Web Development",
                "3D",
                "AI Experiments",
              ].map((item) => (
                <span className="tag" key={item}>{item}</span>
              ))}
            </div>
          </article>
        </Reveal>

        <Reveal>
          <article className="about-panel about-panel--wide">
            <p className="eyebrow">TOOLS I REACH FOR</p>
            <div className="tool-list">
              {tools.map((tool, index) => (
                <div className="tool-row" key={tool}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{tool}</strong>
                </div>
              ))}
            </div>
          </article>
        </Reveal>
      </div>

      <Reveal>
        <div className="contact-panel" id="contact">
          <div>
            <p className="eyebrow">SAY HELLO</p>
            <h2>Find me where the code lives.</h2>
          </div>
          <Link
            href="https://github.com/medissl"
            target="_blank"
            rel="noreferrer"
            className="button button--primary"
          >
            GitHub @medissl <ArrowUpRight size={18} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
