import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AnimatedHeroTitle } from "@/components/animated-hero-title";
import { publicMediaUrl } from "@/lib/supabase";
import type { Project } from "@/lib/types";

export function Hero({ projects }: { projects: Project[] }) {
  const artworks = projects.filter((project) => project.cover_path).slice(0, 2);

  return (
    <section className="hero shell">
      <div className="hero__topline">
        <p className="eyebrow">THE PERSONAL PORTFOLIO OF MEDIANTO SUSILO</p>
        <span>Jakarta, Indonesia ↗</span>
      </div>
      <div className="hero__copy">
        <AnimatedHeroTitle />
      </div>
      <div className="hero__visual">
        <span className="studio-note">a few things from my desk</span>
        <div className="artwork-backdrop" aria-hidden="true">
          <span>MAKE<br />SOMETHING<br /><i>feel.</i></span>
        </div>
        {artworks.map((project, index) => (
          <Link
            href={`/work/${project.slug}`}
            className={`desk-art desk-art--${index + 1}`}
            key={project.id}
          >
            <div className="desk-art__image">
              <Image
                src={publicMediaUrl(project.cover_path)!}
                alt={project.title}
                fill
                sizes="(max-width: 600px) 65vw, 320px"
                priority
              />
            </div>
            <span>{project.title}<ArrowUpRight size={13} /></span>
          </Link>
        ))}
        <span className="desk-stamp" aria-hidden="true">
          Made with<br /><b>curiosity.</b><span>✳</span>
        </span>
      </div>
      <div className="hero__intro">
        <p className="hero__lede">
          I&apos;m Medianto Susilo. I build visual experiences across art,
          UI/UX, games, web, and the random ideas that feel interesting enough
          to become real.
        </p>
        <div className="hero__actions">
          <Link href="/work" className="button button--primary">
            Explore work <ArrowDownRight size={19} />
          </Link>
          <Link href="/about" className="text-link">
            About me <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
      <div className="hero__bottomline">
        <span>Software / Games / UI & UX / Artwork</span>
        <a href="#selected-work">A look inside <ArrowDownRight size={17} /></a>
      </div>
    </section>
  );
}
