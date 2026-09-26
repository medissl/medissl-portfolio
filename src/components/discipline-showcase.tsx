"use client";

import { motion, useReducedMotion } from "motion/react";
import { Brush, Code2, Gamepad2, PanelsTopLeft } from "lucide-react";

const disciplines = [
  {
    index: "01",
    icon: Brush,
    title: "Visual Art",
    text: "Digital and traditional illustration, character work, studies, and visual experiments.",
    tags: ["Illustration", "Digital", "Traditional"],
  },
  {
    index: "02",
    icon: PanelsTopLeft,
    title: "UI / UX",
    text: "Interfaces that care about hierarchy, usability, motion, atmosphere, and how a person moves through them.",
    tags: ["Figma", "Interaction", "Systems"],
  },
  {
    index: "03",
    icon: Gamepad2,
    title: "Interactive Media",
    text: "Games, prototypes, XR ideas, and playful systems that respond instead of just sitting on a screen.",
    tags: ["Unity", "Godot", "Games"],
  },
  {
    index: "04",
    icon: Code2,
    title: "Creative Code",
    text: "Web experiments, visual tools, and small software projects built because the idea was worth trying.",
    tags: ["Web", "Experiments", "Tools"],
  },
];

export function DisciplineShowcase() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="discipline-showcase">
      {disciplines.map(({ index, icon: Icon, title, text, tags }, itemIndex) => (
        <motion.article
          key={title}
          className="discipline-card"
          initial={reducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          whileHover={reducedMotion ? undefined : { y: -8 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{
            duration: 0.5,
            delay: itemIndex * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="discipline-card__beam" />
          <div className="discipline-card__top">
            <span className="discipline-card__index">{index}</span>
            <Icon size={24} aria-hidden="true" />
          </div>

          <div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>

          <div className="discipline-card__tags">
            {tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </motion.article>
      ))}
    </div>
  );
}
