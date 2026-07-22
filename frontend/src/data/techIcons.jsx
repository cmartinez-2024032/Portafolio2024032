import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiPostgresql,
  SiMongodb,
  SiMysql,
  SiDotnet,
  SiOpenjdk,
  SiPython,
  SiGit,
  SiDocker,
  SiGithubactions,
  SiVite,
  SiJsonwebtokens,
} from "react-icons/si";
import { DiJava } from "react-icons/di";
import { FaJava } from "react-icons/fa";

/**
 * Icon map for stack skills and project tech tags.
 * Keys are normalized (lowercase, no spaces/punctuation).
 */
const ICONS = {
  javascript: { Icon: SiJavascript, color: "#F7DF1E" },
  typescript: { Icon: SiTypescript, color: "#3178C6" },
  react: { Icon: SiReact, color: "#61DAFB" },
  reactnative: { Icon: SiReact, color: "#61DAFB" },
  "html5/css3": { Icon: SiHtml5, color: "#E34F26" },
  html5: { Icon: SiHtml5, color: "#E34F26" },
  html: { Icon: SiHtml5, color: "#E34F26" },
  css3: { Icon: SiCss, color: "#1572B6" },
  css: { Icon: SiCss, color: "#1572B6" },
  tailwindcss: { Icon: SiTailwindcss, color: "#06B6D4" },
  "tailwind css": { Icon: SiTailwindcss, color: "#06B6D4" },
  nodejs: { Icon: SiNodedotjs, color: "#339933" },
  "node.js": { Icon: SiNodedotjs, color: "#339933" },
  express: { Icon: SiExpress, color: "#FFFFFF" },
  "c#.net": { Icon: SiDotnet, color: "#512BD4" },
  csharp: { Icon: SiDotnet, color: "#512BD4" },
  "c#": { Icon: SiDotnet, color: "#512BD4" },
  ".net": { Icon: SiDotnet, color: "#512BD4" },
  java: { Icon: FaJava, color: "#ED8B00" },
  openjdk: { Icon: SiOpenjdk, color: "#ED8B00" },
  servlets: { Icon: DiJava, color: "#ED8B00" },
  jsp: { Icon: DiJava, color: "#ED8B00" },
  python: { Icon: SiPython, color: "#3776AB" },
  postgresql: { Icon: SiPostgresql, color: "#4169E1" },
  mongodb: { Icon: SiMongodb, color: "#47A248" },
  mysql: { Icon: SiMysql, color: "#4479A1" },
  git: { Icon: SiGit, color: "#F05032" },
  docker: { Icon: SiDocker, color: "#2496ED" },
  "ci/cd": { Icon: SiGithubactions, color: "#2088FF" },
  cicd: { Icon: SiGithubactions, color: "#2088FF" },
  vite: { Icon: SiVite, color: "#646CFF" },
  jwt: { Icon: SiJsonwebtokens, color: "#FFFFFF" },
};

function normalize(name = "") {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function keyVariants(name) {
  const n = normalize(name);
  return [
    n,
    n.replace(/\s/g, ""),
    n.replace(/[.\s]/g, ""),
    n.replace(/\s*\/\s*/g, "/"),
  ];
}

/** Returns { Icon, color } or null for a tech/skill name. */
export function resolveTechIcon(name) {
  for (const key of keyVariants(name)) {
    if (ICONS[key]) return ICONS[key];
  }
  const compact = normalize(name).replace(/[\s./#]+/g, "");
  for (const [k, v] of Object.entries(ICONS)) {
    if (k.replace(/[\s./#]+/g, "") === compact) return v;
  }
  return null;
}
