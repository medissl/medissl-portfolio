import Link from "next/link";
import { ArrowUpRight, Brush, Code2, Gamepad2, PanelsTopLeft } from "lucide-react";
import { Hero } from "@/components/hero";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { getFeaturedProjects } from "@/lib/projects";

const disciplines = [
  {
    icon: Brush,
    title: "Visual Art",
    text: "Digital and traditional work, illustration, visual studies, and experiments.",
  },
  {
    icon: PanelsTopLeft,
    title: "UI / UX",
    text: "Interfaces built around clarity, motion, atmosphere, and human interaction.",
  },
  {
    icon: Gamepad2,
    title: "Interactive Media",
    text: "Games, prototypes, systems, and playful experiences that react to people.",
  },
  {
    icon: Code2,
    title: "Creative Code",
    text: "Web experiments and small software projects made because the idea sounded fun.",
  },
];

export default async function Home() {
  const featured = await getFeaturedProjects();

  return (
    <>
      <Hero />

      <section className="section shell" id="selected-work">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">SELECTED WORK</p>
              <h2>A growing collection of things I care about.</h2>
            </div>
            <Link href="/work" className="text-link">
              View everything <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>

        {featured.length ? (
          <div className="project-grid">
            {featured.map((project, index) => (
              <Reveal key={project.id} delay={index * 0.06}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="empty-state empty-state--home">
              <p className="eyebrow">PORTFOLIO IN PROGRESS</p>
              <h3>The first pieces are being prepared.</h3>
              <p className="muted">
                I&apos;m rebuilding my creative portfolio from the ground up.
                This space will fill with art, interface work, interactive
                experiments, and projects as I finish them.
              </p>
              <Link href="/about" className="button button--ghost">
                Meet the person making it
              </Link>
            </div>
          </Reveal>
        )}
      </section>

      <section className="section shell">
        <Reveal>
          <p className="eyebrow">WHAT I LIKE MAKING</p>
          <div className="discipline-grid">
            {disciplines.map(({ icon: Icon, title, text }) => (
              <article className="discipline" key={title}>
                <Icon size={22} aria-hidden="true" />
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section shell">
        <Reveal>
          <div className="statement">
            <p className="eyebrow">THE POINT</p>
            <blockquote>
              I like creating things with care, especially the small projects
              that begin with a random idea and suddenly turn into something real.
            </blockquote>
          </div>
        </Reveal>
      </section>
    </>
  );
}
