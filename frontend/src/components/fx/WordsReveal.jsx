import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

const WORD = {
  hidden: { opacity: 0, y: "0.45em" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Words rise in one after another the first time the text scrolls into view. */
export default function WordsReveal({ text, delay = 0, stagger = 0.045 }) {
  const reduced = useReducedMotion();
  if (reduced || !text) return text ?? null;

  const words = text.split(" ");
  return (
    <motion.span
      className="fx-words"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {words.map((word, i) => (
        <span key={`${i}-${word}`}>
          <motion.span className="fx-word" variants={WORD}>
            {word}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </motion.span>
  );
}
