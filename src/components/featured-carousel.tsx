"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { publicMediaUrl } from "@/lib/supabase";
import type { Project } from "@/lib/types";

export function FeaturedCarousel({ projects }: { projects: Project[] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (projects.length < 2 || reducedMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % projects.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [projects.length, reducedMotion]);

  if (!projects.length) {
    return (
      <div className="empty-state">
        <p className="eyebrow">NO PUBLISHED WORK</p>
        <h2>Nothing is live yet.</h2>
        <p className="muted">
          Published artwork and projects will appear here automatically.
        </p>
      </div>
    );
  }

  const project = projects[index];
  const image = publicMediaUrl(project.cover_path);

  function move(direction: number) {
    setIndex((current) => {
      const next = current + direction;
      if (next < 0) return projects.length - 1;
      if (next >= projects.length) return 0;
      return next;
    });
  }

  return (
    <div className="featured-carousel">
      <AnimatePresence mode="wait">
        <motion.div
          className="featured-carousel__stage"
          key={project.id}
          initial={reducedMotion ? false : { opacity: 0, x: 28 }}
          animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -28 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href={`/work/${project.slug}`} className="featured-carousel__image">
            {image ? (
              <Image
                src={image}
                alt={project.title}
                fill
                sizes="(max-width: 900px) 100vw, 70vw"
                className="project-cover__image"
                priority={index === 0}
              />
            ) : (
              <div className="project-card__placeholder">
                <span>{project.category}</span>
              </div>
            )}

            <div className="featured-carousel__shine" />
          </Link>

          <div className="featured-carousel__meta">
            <div>
              <p className="eyebrow">
                {project.category} · {String(project.year)}
              </p>
              <h3>{project.title}</h3>
              <p className="muted">{project.short_description}</p>
            </div>
            <Link href={`/work/${project.slug}`} className="carousel-open" aria-label={`Open ${project.title}`}>
              <ArrowUpRight size={22} />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="featured-carousel__controls">
        <div className="carousel-dots" aria-label="Carousel position">
          {projects.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              className={itemIndex === index ? "carousel-dot is-active" : "carousel-dot"}
              onClick={() => setIndex(itemIndex)}
              aria-label={`Show ${item.title}`}
            />
          ))}
        </div>

        {projects.length > 1 && (
          <div className="carousel-arrows">
            <button type="button" onClick={() => move(-1)} aria-label="Previous project">
              <ArrowLeft size={18} />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Next project">
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
