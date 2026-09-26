import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ExplorationCloud, ToolFlow } from "@/components/about-interactive";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Medianto Susilo, a Computer Science student focused on Interactive Multimedia.",
};

const profile = [
  ["Name", "Medianto Susilo"],
  ["Based in", "Jakarta, Indonesia"],
  ["University", "BINUS University"],
  ["Study", "Computer Science · Interactive Multimedia"],
  ["Languages", "Indonesian · English · Chinese"],
  ["Creative interests", "Art · Guitar · Music production · Songwriting · Games · UI/UX"],
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
              and small experiments. I don&apos;t need every project to solve a
              giant problem. Sometimes wanting to see an idea become real is
              enough reason to build it.
            </p>
            <p>
              My portfolio is allowed to change with me. Older pieces can move
              into the archive, better work can replace them, and experiments
              are allowed to stay experiments.
            </p>
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="about-panel about-panel--interactive">
            <p className="eyebrow">CURRENTLY EXPLORING</p>
            <ExplorationCloud />
          </article>
        </Reveal>

        <Reveal>
          <article className="about-panel about-panel--wide">
            <p className="eyebrow">TOOLS / WORKFLOW</p>
            <h2>Pick a lane.</h2>
            <ToolFlow />
          </article>
        </Reveal>
      </div>

      <Reveal>
        <section className="profile-section">
          <div className="profile-section__head">
            <p className="eyebrow">PERSONAL / PROFESSIONAL</p>
            <h2>The useful bits about me.</h2>
          </div>

          <div className="profile-grid">
            {profile.map(([label, value]) => (
              <div className="profile-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <div className="contact-panel" id="contact">
          <div>
            <p className="eyebrow">CONTACT</p>
            <h2>Want to make something?</h2>
            <p className="muted">
              Email me at mediantozeng@gmail.com or reach me on WhatsApp at
              0812 7635 8926.
            </p>
          </div>
          <Link
            href="mailto:mediantozeng@gmail.com"
            className="button button--primary"
          >
            Email me <ArrowUpRight size={18} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
