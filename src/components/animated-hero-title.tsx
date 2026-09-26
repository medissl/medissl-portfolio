"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const phrases = [
  { text: "I make things that feel alive.", size: "english" },
  { text: "生きているように感じるものをつくる。", size: "dense" },
  { text: "살아 있는 듯한 것을 만듭니다.", size: "compact" },
  { text: "我创造有生命感的东西。", size: "chinese" },
  { text: "Aku membuat hal-hal yang terasa hidup.", size: "long" },
] as const;

type PhraseSize = (typeof phrases)[number]["size"];

const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789アイウエオ가나다라마바사中文";

function scrambledText(target: string) {
  return target
    .split("")
    .map((character) => {
      if (character === " ") return " ";
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    })
    .join("");
}

export function AnimatedHeroTitle() {
  const reducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [display, setDisplay] = useState<string>(phrases[0].text);
  const [displaySize, setDisplaySize] = useState<PhraseSize>(phrases[0].size);
  const [revealedCount, setRevealedCount] = useState(phrases[0].text.length);

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const target = phrase.text;

    if (reducedMotion) {
      const nextTimer = window.setTimeout(() => {
        const nextIndex = (phraseIndex + 1) % phrases.length;
        const nextPhrase = phrases[nextIndex];

        setDisplay(nextPhrase.text);
        setDisplaySize(nextPhrase.size);
        setRevealedCount(nextPhrase.text.length);
        setPhraseIndex(nextIndex);
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
          const nextIndex = (phraseIndex + 1) % phrases.length;
          const nextPhrase = phrases[nextIndex];

          // The next string and its matching size are switched in the same
          // timer callback, so long phrases never flash at another language's size.
          setDisplay(scrambledText(nextPhrase.text));
          setDisplaySize(nextPhrase.size);
          setRevealedCount(0);
          setPhraseIndex(nextIndex);
        }, 2700);
      }
    }, 42);

    return () => {
      window.clearInterval(scrambleTimer);
      if (nextTimer) window.clearTimeout(nextTimer);
    };
  }, [phraseIndex, reducedMotion]);

  return (
    <div className={`hero-title-shell hero-title-shell--${displaySize}`}>
      <h1
        className={`hero-title hero-title--${displaySize}`}
        aria-label="I make things that feel alive."
      >
        <span className="hero-title__text" aria-hidden="true">
          {display.split("").map((character, index) => {
            const isLast = index === display.length - 1;

            return (
              <span
                className={`${
                  index < revealedCount
                    ? "hero-title__settled"
                    : "hero-title__scramble"
                }${isLast ? " hero-title__tail" : ""}`}
                key={`${phraseIndex}-${index}`}
              >
                {character}
              </span>
            );
          })}
        </span>
      </h1>
    </div>
  );
}
