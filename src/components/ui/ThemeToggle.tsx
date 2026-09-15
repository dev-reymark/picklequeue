"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-24 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded-md p-1.5 transition flex items-center justify-center ${
          theme === "light"
            ? "bg-white text-slate-950 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
        title="Light Mode"
        aria-label="Light mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded-md p-1.5 transition flex items-center justify-center ${
          theme === "dark"
            ? "bg-white text-slate-950 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
        title="Dark Mode"
        aria-label="Dark mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`rounded-md p-1.5 transition flex items-center justify-center ${
          theme === "system"
            ? "bg-white text-slate-950 shadow-xs dark:bg-zinc-800 dark:text-white"
            : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        }`}
        title="System Preference"
        aria-label="System theme"
      >
        <Monitor className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
