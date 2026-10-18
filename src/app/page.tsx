import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatedStatement } from "@/components/animated-statement";
import { DisciplineShowcase } from "@/components/discipline-showcase";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/reveal";
import {
  getCarouselFallbackProjects,
  getFeaturedProjects,
} from "@/lib/projects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [featured, fallback] = await Promise.all([
    getFeaturedProjects(),
    getCarouselFallbackProjects(),
  ]);

  const carouselProjects = featured.length ? featured : fallback;

  return (
    <>
      <Hero projects={carouselProjects} />

      <section className="section shell" id="selected-work">
        <Reveal>
          <div className="section-heading section-heading--compact">
            <div><p className="eyebrow">A SELECTION FROM THE ARCHIVE</p><h2>Recent <em>work.</em></h2></div>
            <Link href="/work" className="text-link">
              View all work <ArrowUpRight size={17} />
            </Link>
          </div>
        </Reveal>

        <FeaturedCarousel projects={carouselProjects} />
      </section>

      <section className="section shell">
        <Reveal>
          <div className="section-heading section-heading--stacked">
            <p className="eyebrow">WHAT I LIKE MAKING</p>
            <h2>Different mediums. Same urge to build.</h2>
          </div>
        </Reveal>

        <DisciplineShowcase />
      </section>

      <section className="section shell">
        <AnimatedStatement />
      </section>
    </>
  );
}
