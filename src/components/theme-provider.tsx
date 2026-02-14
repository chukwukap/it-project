"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored) {
            setTheme(stored);
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            setResolvedTheme(systemTheme);
            root.classList.toggle("dark", systemTheme === "dark");
        } else {
            setResolvedTheme(theme);
            root.classList.toggle("dark", theme === "dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e: MediaQueryListEvent) => {
                setResolvedTheme(e.matches ? "dark" : "light");
                document.documentElement.classList.toggle("dark", e.matches);
            };
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
