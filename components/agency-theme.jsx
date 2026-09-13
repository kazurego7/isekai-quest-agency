"use client";

import { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext(null);
export function AgencyThemeProvider({ initialPreference = "system", children }) {
  const [preference, setPreference] = useState(initialPreference);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = preference === "dark" || (preference === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.classList.toggle("light", !dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference]);
  return <ThemeContext.Provider value={{ preference, setPreference }}>{children}</ThemeContext.Provider>;
}
export const useAgencyTheme = () => useContext(ThemeContext);
