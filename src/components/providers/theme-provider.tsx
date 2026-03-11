"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "desaconnect-theme";
const THEME_COLOR = {
  light: "#f7faf8",
  dark: "#101715",
} as const;

function createThemeTransition() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return () => {};
  }

  const existingStyle = document.querySelector('style[data-theme-transition="true"]');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement("style");
  style.setAttribute("data-theme-transition", "true");
  style.textContent = `
    *, *::before, *::after {
      transition-property: background-color, border-color, color, fill, stroke, box-shadow;
      transition-duration: 150ms;
      transition-timing-function: ease;
    }
  `;

  document.head.appendChild(style);

  return () => {
    window.setTimeout(() => {
      style.remove();
    }, 180);
  };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", THEME_COLOR[theme]);
  }
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = React.useState<Theme>("light");

  React.useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    const initialTheme: Theme = savedTheme === "dark" ? "dark" : "light";
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const setTheme = React.useCallback((value: Theme) => {
    const cleanupTransition = createThemeTransition();
    setThemeState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
    applyTheme(value);
    cleanupTransition();
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const contextValue = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}