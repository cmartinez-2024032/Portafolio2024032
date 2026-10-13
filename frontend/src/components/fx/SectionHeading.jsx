import { useRef } from "react";
import { useInView } from "framer-motion";
import TypeText from "./TypeText";
import ScrambleText from "./ScrambleText";

/** Section header that reveals itself on scroll: decrypted title, then the phrase types itself out. */
export default function SectionHeading({ title, phrase, phraseClassName = "section-title-serif" }) {
  const titleRef = useRef(null);
  const drawn = useInView(titleRef, { once: true, margin: "-10% 0px -10% 0px" });

  return (
    <>
      <h2 ref={titleRef} className={`section-title ${drawn ? "is-drawn" : ""}`}>
        <ScrambleText text={title} delay={0.1} />
      </h2>
      {phrase && (
        <p className={phraseClassName}>
          <TypeText text={phrase} speed={24} delay={0.55} />
        </p>
      )}
    </>
  );
}
