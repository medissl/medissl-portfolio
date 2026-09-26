"use client";

import Link from "next/link";
import { ArrowDownRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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
        <p className="eyebrow hero__eyebrow">
          <Sparkles size={14} /> Interactive Multimedia · Computer Science
        </p>
        <h1>
          I make things that
          <span className="text-glow"> feel alive.</span>
        </h1>
        <p className="hero__lede">
          I&apos;m Medianto Susilo. I build visual experiences across art,
          UI/UX, games, web, and whatever strange little idea feels worth
          turning into something real.
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
      </motion.div>
    </section>
  );
}
