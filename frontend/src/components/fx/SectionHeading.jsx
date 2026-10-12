import { useRef } from "react";
import { useInView } from "framer-motion";
import TypeText from "./TypeText";
import ScrambleText from "./ScrambleText";
import WordsReveal from "./WordsReveal";

/** Section header that reveals itself on scroll: typed comment → decrypted title → rising phrase. */
export default function SectionHeading({ comment, title, phrase, phraseClassName = "section-title-serif" }) {
  const titleRef = useRef(null);
  const drawn = useInView(titleRef, { once: true, margin: "-10% 0px -10% 0px" });

  return (
    <>
      <p className="section-comment">
        <TypeText text={comment} />
      </p>
      <h2 ref={titleRef} className={`section-title ${drawn ? "is-drawn" : ""}`}>
        <ScrambleText text={title} delay={0.15} />
        <span className="text-accent">.</span>
      </h2>
      {phrase && (
        <p className={phraseClassName}>
          <WordsReveal text={phrase} delay={0.45} />
        </p>
      )}
    </>
  );
}
