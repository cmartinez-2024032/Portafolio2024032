import { createContext, useContext, useEffect, useMemo, useState } from "react";

const THEME_KEY = "forge-theme";
const ThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f5f3ef" : "#152238");
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return readStoredTheme();
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("forge:theme", { detail: { theme } }));
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isLight: theme === "light",
      setTheme: (next) => setThemeState(next === "light" ? "light" : "dark"),
      toggleTheme: () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark",
      isLight: false,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
