import type { RobotSection } from "./RobotPath";
import { es, en } from "../../i18n/locales";

function currentLocale(): "es" | "en" {
  const lang = document.documentElement.lang;
  return lang === "en" ? "en" : "es";
}

function dictionary() {
  return currentLocale() === "en" ? en : es;
}

/** Guided lines Ember speaks when entering each section. */
export function getEmberLines(): Partial<Record<RobotSection, string>> {
  return dictionary().ember.lines;
}

export function getEmberTips(): string[] {
  return dictionary().ember.tips;
}

export const EMBER_NAME = "Ember";
export const EMBER_TAG = "guía · forge";
export const EMBER_INITIAL = "E";
