"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const phrases = [
  { lines: ["I make things", "that feel", "alive."], size: "english" },
  { lines: ["生きているように", "感じるものを", "つくる。"], size: "dense" },
  { lines: ["살아 있는 듯한", "것을", "만듭니다."], size: "compact" },
  { lines: ["我创造", "有生命感的", "东西。"], size: "chinese" },
  { lines: ["Aku membuat", "hal-hal yang terasa", "hidup."], size: "long" },
] as const;

type PhraseSize = (typeof phrases)[number]["size"];

const glyphSets: Record<PhraseSize, string> = {
  english: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  long: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  dense: "アイウエオカキクケコサシスセソ0123456789",
  compact: "가나다라마바사아자차카타파하0123456789",
  chinese: "中文生命创造感觉东西灵感作品0123456789",
};

function scrambleLine(line: string, size: PhraseSize) {
  const glyphs = glyphSets[size];

  return line
    .split("")
    .map((character) => {
      if (character === " ") return character;
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    })
    .join("");
}

function scrambledLines(lines: readonly string[], size: PhraseSize) {
  return lines.map((line) => scrambleLine(line, size));
}

export function AnimatedHeroTitle() {
  const reducedMotion = useReducedMotion();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayLines, setDisplayLines] = useState<string[]>([
    ...phrases[0].lines,
  ]);
  const [displaySize, setDisplaySize] = useState<PhraseSize>(phrases[0].size);
  const [revealedCount, setRevealedCount] = useState(
    phrases[0].lines.join("\n").length,
  );

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    const targetLines = phrase.lines;
    const glyphs = glyphSets[phrase.size];
    const targetLength = targetLines.join("\n").length;

    if (reducedMotion) {
      const nextTimer = window.setTimeout(() => {
        const nextIndex = (phraseIndex + 1) % phrases.length;
        const nextPhrase = phrases[nextIndex];

        setDisplayLines([...nextPhrase.lines]);
        setDisplaySize(nextPhrase.size);
        setRevealedCount(nextPhrase.lines.join("\n").length);
        setPhraseIndex(nextIndex);
      }, 4200);

      return () => window.clearTimeout(nextTimer);
    }

    let reveal = 0;
    let nextTimer: number | undefined;

    const scrambleTimer = window.setInterval(() => {
      const revealed = Math.floor(reveal);
      let offset = 0;

      setRevealedCount(revealed);
      setDisplayLines(
        targetLines.map((line) => {
          const start = offset;
          offset += line.length + 1;

          return line
            .split("")
            .map((character, index) => {
              if (character === " ") return character;
              if (start + index < revealed) return character;
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            })
            .join("");
        }),
      );

      reveal += 0.72;

      if (reveal >= targetLength + 1) {
        window.clearInterval(scrambleTimer);
        setDisplayLines([...targetLines]);
        setRevealedCount(targetLength);

        nextTimer = window.setTimeout(() => {
          const nextIndex = (phraseIndex + 1) % phrases.length;
          const nextPhrase = phrases[nextIndex];

          setDisplayLines(scrambledLines(nextPhrase.lines, nextPhrase.size));
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
          {displayLines.map((line, lineIndex) => (
            <span className="hero-title__line" key={`${phraseIndex}-${lineIndex}`}>
              {line.split("").map((character, characterIndex) => {
                const globalIndex =
                  displayLines
                    .slice(0, lineIndex)
                    .reduce((sum, currentLine) => sum + currentLine.length + 1, 0) +
                  characterIndex;
                const isLast =
                  lineIndex === displayLines.length - 1 &&
                  characterIndex === line.length - 1;

                return (
                  <span
                    className={`${
                      globalIndex < revealedCount
                        ? "hero-title__settled"
                        : "hero-title__scramble"
                    }${isLast ? " hero-title__tail" : ""}`}
                    key={`${phraseIndex}-${lineIndex}-${characterIndex}`}
                  >
                    {character}
                  </span>
                );
              })}
            </span>
          ))}
        </span>
      </h1>
    </div>
  );
}
