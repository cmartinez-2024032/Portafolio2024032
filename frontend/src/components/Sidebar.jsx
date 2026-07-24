import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

export default function Sidebar({ data }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4"
    >
      <span className="text-[8px] tracking-[0.25em] uppercase text-dim-more font-mono" style={{ writingMode: "vertical-rl" }}>
        social
      </span>
      <div className="w-px h-10 bg-edge" />
      {data.github && (
        <a href={data.github} target="_blank" rel="noopener noreferrer" className="p-2 text-dim-more hover:text-accent transition-colors duration-200">
          <FiGithub size={16} />
        </a>
      )}
      {data.linkedin && (
        <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-dim-more hover:text-accent transition-colors duration-200">
          <FiLinkedin size={16} />
        </a>
      )}
      {data.email && (
        <a href={`mailto:${data.email}`} className="p-2 text-dim-more hover:text-accent transition-colors duration-200">
          <FiMail size={16} />
        </a>
      )}
      <div className="w-px h-10 bg-edge" />
    </motion.div>
  );
}
