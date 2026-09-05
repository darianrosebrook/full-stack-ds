import { useEffect, useState } from "react";
import { Button, Icon, Popover, Stack, Switch, Walkthrough } from "@full-stack-ds/react";
import { AboutDialog } from "../components/AboutDialog";

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

export function Header({ onOpenPalette }: { onOpenPalette?: () => void } = {}) {
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

  const [aboutOpen, setAboutOpen] = useState(false);
  const [tourStep, setTourStep] = useState(-1);
  const tour = [
    { anchor: ".brand", title: "The brand", description: "One contract drives every component on this site." },
    { anchor: ".app-sidebar", title: "The corpus", description: "Every component, grouped by contract layer." },
    { anchor: ".app-main", title: "The evidence", description: "Design, developer, and token views per component." },
    { anchor: ".header-actions", title: "You are here", description: "Palette (Cmd+K), tour, about, and appearance." },
  ];

  return (
    <header className="app-header">
      <Stack as="a" variant="horizontal" className="brand stack-gap-05" href="#/">
        <span className="brand-mark">fs</span>
        <span>Full-Stack DS</span>
        <span className="brand-meta">contract → 5 frameworks</span>
      </Stack>

      <Stack variant="horizontal" className="header-actions stack-gap-05">
        <Button
          variant="ghost"
          size="small"
          className="icon-btn"
          ariaLabel="Open command palette (Ctrl+K or Cmd+K)"
          onClick={() => onOpenPalette?.()}
        >
          <Icon name="search" size="sm" />
        </Button>
        <Button
          variant="ghost"
          size="small"
          className="icon-btn"
          ariaLabel="Take a tour of the showcase"
          onClick={() => setTourStep(0)}
        >
          <Icon name="home" size="sm" />
        </Button>
        <Button
          variant="ghost"
          size="small"
          className="icon-btn"
          ariaLabel="About this project"
          onClick={() => setAboutOpen(true)}
        >
          <Icon name="info" size="sm" />
        </Button>
        <a
          className="icon-btn"
          href="https://github.com/darianrosebrook/full-stack-ds"
          target="_blank"
          rel="noreferrer"
          aria-label="Source repository"
        >
          <Icon name="external-link" size="sm" />
        </a>

        <Popover placement="bottom" closeOnBlur={false} className="header-popover-anchor">
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              size="small"
              className="icon-btn"
              ariaLabel="Appearance settings"
              title="Appearance"
            >
              <PaletteIcon />
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="panel"
            style={{ minWidth: 240, padding: "var(--fsds-core-spacing-size-06)" }}
          >
            <Switch
              size="sm"
              checked={isDark}
              onChange={(checked) => setTheme(checked ? "dark" : "light")}
              className="header-appearance-row"
            >
              <Stack
                as="span"
                layout="inline-stack"
                variant="horizontal"
                className="header-appearance-row__label stack-gap-05"
              >
                <SunMoonIcon />
                <span>Dark mode</span>
              </Stack>
            </Switch>

            <div
              style={{
                fontWeight: 600,
                fontSize: "var(--fsds-core-typography-ramp-3)",
                marginBottom: "var(--fsds-core-spacing-size-05)",
              }}
            >
              Brand
            </div>
            <Stack
              className="header-brand-options stack-gap-04"
              role="radiogroup"
              aria-label="Brand theme"
            >
              {brands.map((id) => {
                const active = brand === id;
                return (
                  <Stack
                    as="label"
                    key={id}
                    variant="horizontal"
                    className={`header-brand-option${active ? " header-brand-option--active" : ""} stack-gap-04`}
                  >
                    <input
                      className="header-brand-option__input"
                      type="radio"
                      name="fsds-brand"
                      value={id}
                      checked={active}
                      onChange={() => setBrand(id)}
                    />
                    <span>{humanizeBrand(id)}</span>
                    {active && (
                      <span aria-hidden style={{ fontSize: "var(--fsds-core-typography-ramp-2)" }}>
                        ✓
                      </span>
                    )}
                  </Stack>
                );
              })}
            </Stack>

            {brands.length <= 1 && (
              <p
                className="muted"
                style={{
                  fontSize: "var(--fsds-core-typography-ramp-2)",
                  marginTop: "var(--fsds-core-spacing-size-05)",
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
      </Stack>

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      <Walkthrough
        index={tourStep}
        onStepChange={setTourStep}
        onComplete={() => setTourStep(-1)}
        onSkip={() => setTourStep(-1)}
        label="Showcase tour"
        storageKey="fsds-showcase-tour"
        steps={tour}
        slots={{
          title: tour[tourStep]?.title,
          description: tour[tourStep]?.description,
        }}
      />
    </header>
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

function SunMoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2V4M12 20V22M4.9 4.9L6.3 6.3M17.7 17.7L19.1 19.1M2 12H4M20 12H22M6.3 17.7L4.9 19.1M19.1 4.9L17.7 6.3M12 8C11.4984 8.5362 11.2249 9.24634 11.2371 9.98047C11.2493 10.7146 11.5464 11.4152 12.0656 11.9344C12.5848 12.4536 13.2854 12.7507 14.0195 12.7629C14.7537 12.7751 15.4638 12.5016 16 12C16 12.7911 15.7654 13.5645 15.3259 14.2223C14.8864 14.8801 14.2616 15.3928 13.5307 15.6955C12.7998 15.9983 11.9956 16.0775 11.2196 15.9231C10.4437 15.7688 9.73098 15.3878 9.17157 14.8284C8.61216 14.269 8.2312 13.5563 8.07686 12.7804C7.92252 12.0044 8.00173 11.2002 8.30448 10.4693C8.60723 9.73836 9.11992 9.11365 9.77772 8.67412C10.4355 8.2346 11.2089 8 12 8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
