import { createContext, useContext, useEffect, useState } from "react";
import { getTheme } from "../theme";
import { KEYS } from "../utils/storage";

const ThemeContext = createContext(null);

function getInitialMode() {
  try {
    const saved = localStorage.getItem(KEYS.theme);
    if (saved === "light" || saved === "dark") return saved;
  } catch {}
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);
  const C = getTheme(mode);

  useEffect(() => {
    try {
      localStorage.setItem(KEYS.theme, mode);
    } catch {}
    document.documentElement.style.background = C.bg;
    document.documentElement.style.colorScheme = mode;
  }, [mode, C.bg]);

  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ C, mode, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
