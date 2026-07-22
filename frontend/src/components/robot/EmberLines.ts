import type { RobotSection } from "./RobotPath";

/** Guided lines Ember speaks when entering each section. */
export const EMBER_LINES: Partial<Record<RobotSection, string>> = {
  hero: "¡Hola! Soy Ember. Te acompaño mientras exploras el portafolio.",
  intro: "Aquí conoces a Cristopher: Junior Full-Stack con foco en backend.",
  skills: "Estas tecnologías son las que usa con mayor frecuencia.",
  abilities: "Así trabaja en equipo: responsable, puntual y con buen trato.",
  timeline: "Un recorrido corto de formación y proyectos reales.",
  achievements: "Incluye Aditus: 1er lugar en Hackathon x Tec.",
  projects: "Estos son los proyectos de los que Cristopher está más orgulloso.",
  contact: "¿Te gustó el portafolio? Puedes enviar un mensaje desde aquí.",
};

/** Extra tips when the visitor interacts with Ember. */
export const EMBER_TIPS = [
  "Tip: haz clic en un proyecto para ver la galería completa.",
  "Si quieres escribirle, baja a Contacto — yo te aviso.",
  "Las skills brillan cuando paso cerca… ¡pruébalo!",
  "Estoy quieto cuando hablo para que leas con calma.",
  "Doble clic en mí y vuelo un momento hacia tu cursor.",
];

export const EMBER_NAME = "Ember";
export const EMBER_TAG = "guía · forge";
export const EMBER_INITIAL = "E";
