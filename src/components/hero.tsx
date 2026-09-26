"use client";

import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { AnimatedHeroTitle } from "@/components/animated-hero-title";

export function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="hero shell">
      <motion.div
        className="hero__copy"
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatedHeroTitle />
        <p className="hero__lede">
          I&apos;m Medianto Susilo. I build visual experiences across art,
          UI/UX, games, web, and the random ideas that feel interesting enough
          to become real.
        </p>

        <div className="hero__actions">
          <Link href="/work" className="button button--primary">
            Explore work <ArrowDownRight size={18} />
          </Link>
          <Link href="/about" className="button button--ghost">
            About me
          </Link>
        </div>
      </motion.div>

      <motion.div
        className="hero__visual"
        aria-hidden="true"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.12 }}
      >
        <div className="signal-orbit signal-orbit--outer" />
        <div className="signal-orbit signal-orbit--inner" />
        <div className="signal-pulse signal-pulse--one" />
        <div className="signal-pulse signal-pulse--two" />

        <div className="signal-card signal-card--a">
          <span>ART</span><strong>01</strong>
        </div>
        <div className="signal-card signal-card--b">
          <span>UI/UX</span><strong>02</strong>
        </div>

        <div className="signal-core">
          <div className="signal-core__ring" />
          <span>IDEA</span>
        </div>

        <div className="signal-line signal-line--one" />
        <div className="signal-line signal-line--two" />
        <div className="signal-dot signal-dot--one" />
        <div className="signal-dot signal-dot--two" />
        <div className="signal-dot signal-dot--three" />
      </motion.div>
    </section>
  );
}
