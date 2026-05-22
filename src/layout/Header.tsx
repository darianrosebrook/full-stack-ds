import { useEffect, useState } from "react";
import { ToggleSwitch } from "@full-stack-ds/react";

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("fsds-theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fsds-theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <header className="app-header">
      <a className="brand" href="#/">
        <span className="brand-mark">fs</span>
        <span>Full-Stack DS</span>
        <span className="brand-meta">contract → 5 frameworks</span>
      </a>

      <div className="header-actions">
        <a
          className="icon-btn"
          href="https://github.com/darianrosebrook/full-stack-ds"
          target="_blank"
          rel="noreferrer"
          aria-label="Source repository"
          title="Source"
        >
          <GithubIcon />
        </a>
        <ToggleSwitch
          size="small"
          checked={isDark}
          onChange={(next) => setTheme(next ? "dark" : "light")}
          ariaLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
        />
      </div>
    </header>
  );
}

function GithubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 012-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}
