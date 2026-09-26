"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

const exploring = [
  "Game Development",
  "UI / UX",
  "Digital Art",
  "Creative Coding",
  "Interactive Media",
  "Web Development",
  "3D",
  "AI Experiments",
];

const groups = [
  {
    title: "Design",
    description: "Shaping interfaces and visual systems.",
    tools: ["Figma", "UI/UX", "Prototyping"],
  },
  {
    title: "Interactive",
    description: "Building things people can actually play with.",
    tools: ["Unity", "Godot", "C#"],
  },
  {
    title: "Code",
    description: "Turning ideas into working software.",
    tools: ["JavaScript", "Python", "SQL", "Git"],
  },
  {
    title: "Visual",
    description: "Illustration, 3D, and image-making.",
    tools: ["Clip Studio Paint", "Blender"],
  },
  {
    title: "Audio",
    description: "Music and sound as part of the experience.",
    tools: ["FL Studio"],
  },
];

export function ExplorationCloud() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="exploration-cloud">
      {exploring.map((item, index) => (
        <motion.span
          key={item}
          className="exploration-pill"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
          whileHover={reducedMotion ? undefined : { y: -4, scale: 1.03 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.04 }}
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}

export function ToolFlow() {
  const [open, setOpen] = useState(0);
  const reducedMotion = useReducedMotion();

  return (
    <div className="tool-flow">
      {groups.map((group, index) => {
        const expanded = open === index;

        return (
          <div className={expanded ? "tool-node is-open" : "tool-node"} key={group.title}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? -1 : index)}
              aria-expanded={expanded}
            >
              <span className="tool-node__number">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>{group.title}</strong>
                <small>{group.description}</small>
              </span>
              <ChevronDown size={18} />
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  className="tool-node__content"
                  initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                  animate={reducedMotion ? undefined : { height: "auto", opacity: 1 }}
                  exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div>
                    {group.tools.map((tool) => <span key={tool}>{tool}</span>)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
