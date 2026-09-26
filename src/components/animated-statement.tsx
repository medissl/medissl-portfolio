"use client";

import Link from "next/link";
import { Github, Mail, MessageCircle, Phone } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function AnimatedStatement() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="statement-wrap">
      <motion.div
        className="statement"
        initial={reducedMotion ? false : { opacity: 0, y: 26 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 0.7 }}
      >
        <div className="statement__signal" aria-hidden="true" />
        <p className="eyebrow">WHY I MAKE THINGS</p>
        <blockquote>
          I like creating things with care, especially the small projects that
          begin with a random idea and suddenly turn into something real.
          <span className="statement__cursor" aria-hidden="true">_</span>
        </blockquote>
      </motion.div>

      <motion.section
        className="commission"
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.08 }}
      >
        <div>
          <p className="eyebrow">OPEN FOR COMMISSIONS</p>
          <h2>Have an idea? Tell me about it.</h2>
          <p className="muted">
            Art, interface work, small creative builds, or something weird enough
            to be interesting.
          </p>
        </div>

        <div className="contact-links">
          <Link href="mailto:mediantozeng@gmail.com">
            <Mail size={17} /> Email
          </Link>
          <Link href="tel:+6281276358926">
            <Phone size={17} /> 0812 7635 8926
          </Link>
          <Link href="https://wa.me/6281276358926" target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> WhatsApp
          </Link>
          <Link href="https://github.com/medissl" target="_blank" rel="noreferrer">
            <Github size={17} /> GitHub
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
