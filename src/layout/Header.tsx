import { useEffect, useState } from "react";
import { Popover, ToggleSwitch } from "@full-stack-ds/react";

const BRAND_LABEL_OVERRIDES: Record<string, string> = {
  default: "Default",
};

function humanizeBrand(id: string): string {
  if (BRAND_LABEL_OVERRIDES[id]) return BRAND_LABEL_OVERRIDES[id];
  return id
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const BRAND_SELECTOR_RE = /\[data-brand=["']?([^"'\]]+)["']?\]/g;

function discoverBrandsFromStylesheets(): string[] {
  if (typeof document === "undefined") return ["default"];
  const seen = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    if (!rules) continue;
    collectBrandsFromRules(rules, seen);
  }
  if (seen.size === 0) seen.add("default");
  const list = Array.from(seen);
  list.sort((a, b) => {
    if (a === "default") return -1;
    if (b === "default") return 1;
    return a.localeCompare(b);
  });
  return list;
}

function collectBrandsFromRules(rules: CSSRuleList, out: Set<string>) {
  for (const rule of Array.from(rules)) {
    const styleRule = rule as CSSStyleRule;
    if (typeof styleRule.selectorText === "string") {
      BRAND_SELECTOR_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = BRAND_SELECTOR_RE.exec(styleRule.selectorText)) !== null) {
        out.add(m[1]);
      }
    }
    const groupRule = rule as CSSGroupingRule;
    if (groupRule.cssRules) {
      collectBrandsFromRules(groupRule.cssRules, out);
    }
  }
}

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("fsds-theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [brands, setBrands] = useState<string[]>(() => ["default"]);

  useEffect(() => {
    setBrands(discoverBrandsFromStylesheets());
  }, []);

  const [brand, setBrand] = useState<string>(() => {
    if (typeof window === "undefined") return "default";
    const stored = localStorage.getItem("fsds-brand");
    if (stored && stored.length > 0) return stored;
    return "default";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("fsds-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (brand === "default") {
      delete document.documentElement.dataset.brand;
    } else {
      document.documentElement.dataset.brand = brand;
    }
    localStorage.setItem("fsds-brand", brand);
  }, [brand]);

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

        <Popover placement="bottom">
          <Popover.Trigger asChild>
            <button
              type="button"
              className="icon-btn"
              aria-label="Appearance settings"
              title="Appearance"
            >
              <PaletteIcon />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="card"
            style={{ minWidth: 240, padding: "var(--space-4)" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: "var(--fs-300)" }}>
                Dark mode
              </span>
              <ToggleSwitch
                size="small"
                checked={isDark}
                onChange={(next) => setTheme(next ? "dark" : "light")}
                ariaLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
              />
            </div>

            <div
              style={{
                fontWeight: 600,
                fontSize: "var(--fs-300)",
                marginBottom: "var(--space-3)",
              }}
            >
              Brand
            </div>
            <div
              role="radiogroup"
              aria-label="Brand theme"
              style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
            >
              {brands.map((id) => {
                const active = brand === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setBrand(id)}
                    className={`sidebar-item${active ? " sidebar-item--active" : ""}`}
                    style={{ textAlign: "left" }}
                  >
                    <span>{humanizeBrand(id)}</span>
                    {active && (
                      <span aria-hidden style={{ fontSize: "var(--fs-200)" }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {brands.length <= 1 && (
              <p
                className="muted"
                style={{
                  fontSize: "var(--fs-100)",
                  marginTop: "var(--space-3)",
                  marginBottom: 0,
                }}
              >
                Add brand token files in{" "}
                <code>packages/ds-tokens/src/brands/</code> to populate this
                list.
              </p>
            )}
          </Popover.Content>
        </Popover>
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

function PaletteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.5-9-10-9z" />
    </svg>
  );
}
