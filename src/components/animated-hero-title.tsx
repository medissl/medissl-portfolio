"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const phrases = [
  { text: "I make things that feel alive.", size: "default" },
  { text: "生きているように感じるものをつくる。", size: "dense" },
  { text: "살아 있는 듯한 것을 만듭니다.", size: "compact" },
  { text: "我创造有生命感的东西。", size: "default" },
  { text: "Aku membuat hal-hal yang terasa hidup.", size: "long" },
] as const;

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオ가나다라마바사中文";

export function AnimatedHeroTitle() {
  const reducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [display, setDisplay] = useState<string>(phrases[0].text);
  const [revealedCount, setRevealedCount] = useState(phrases[0].text.length);

  useEffect(() => {
    const target = phrases[phraseIndex].text;

    if (reducedMotion) {
      const nextTimer = window.setTimeout(() => {
        const nextIndex = (phraseIndex + 1) % phrases.length;
        const nextPhrase = phrases[nextIndex].text;

        setPhraseIndex(nextIndex);
        setDisplay(nextPhrase);
        setRevealedCount(nextPhrase.length);
      }, 4200);

      return () => window.clearTimeout(nextTimer);
    }

    let reveal = 0;
    let nextTimer: number | undefined;

    const scrambleTimer = window.setInterval(() => {
      const revealed = Math.floor(reveal);

      setRevealedCount(revealed);
      setDisplay(
        target
          .split("")
          .map((character, index) => {
            if (character === " ") return " ";
            if (index < revealed) return character;
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join(""),
      );

      reveal += 0.72;

      if (reveal >= target.length + 1) {
        window.clearInterval(scrambleTimer);
        setDisplay(target);
        setRevealedCount(target.length);

        nextTimer = window.setTimeout(() => {
          setPhraseIndex((current) => (current + 1) % phrases.length);
        }, 2700);
      }
    }, 42);

    return () => {
      window.clearInterval(scrambleTimer);
      if (nextTimer) window.clearTimeout(nextTimer);
    };
  }, [phraseIndex, reducedMotion]);

  const size = phrases[phraseIndex].size;

  return (
    <div className="hero-title-shell">
      <h1
        className={`hero-title hero-title--${size}`}
        aria-label="I make things that feel alive."
      >
        <span className="hero-title__text" aria-hidden="true">
          {display.split("").map((character, index) => (
            <span
              className={
                index < revealedCount
                  ? "hero-title__settled"
                  : "hero-title__scramble"
              }
              key={`${phraseIndex}-${index}`}
            >
              {character}
            </span>
          ))}
        </span>
        <span className="hero-title__cursor" aria-hidden="true">_</span>
      </h1>
    </div>
  );
}
