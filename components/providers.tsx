"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

export const ThemeContext = React.createContext({
  theme: "light",
  setTheme: (theme: string) => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "light", setTheme }}>
      <SessionProvider>{children}</SessionProvider>
    </ThemeContext.Provider>
  );
}
