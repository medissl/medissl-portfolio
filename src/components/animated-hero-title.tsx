"use client";

import { useState } from "react";

const phrases = [
  { label: "EN", lang: "en", lines: ["I make things", "that feel"], last: "alive." },
  { label: "ID", lang: "id", lines: ["Aku membuat", "hal-hal yang terasa"], last: "hidup." },
  { label: "中文", lang: "zh", lines: ["我创造", "有生命感的"], last: "东西。" },
  { label: "日本語", lang: "ja", lines: ["生きているように", "感じるものを"], last: "つくる。" },
  { label: "한국어", lang: "ko", lines: ["살아 있는 듯한", "것을"], last: "만듭니다." },
];

export function AnimatedHeroTitle() {
  const [language, setLanguage] = useState(0);
  const phrase = phrases[language];
  return (
    <div className="hero-title-shell">
      <h1 className={`hero-title hero-title--${phrase.lang}`} lang={phrase.lang}>
        {phrase.lines.map((line) => <span key={line}>{line}</span>)}
        <em>
          {phrase.last}<span className="title-asterisk" aria-hidden="true">✳</span>
        </em>
      </h1>
      <div className="language-picker" aria-label="Headline language">
        {phrases.map((item, index) => (
          <button
            key={item.lang}
            type="button"
            aria-pressed={index === language}
            onClick={() => setLanguage(index)}
            lang={item.lang}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
