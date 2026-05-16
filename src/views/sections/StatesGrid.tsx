import type { ComponentContract } from "../../types/data";

const STATE_LABELS: Record<string, { dot: string; description: string }> = {
  default: { dot: "var(--fg-subtle)", description: "Baseline state, no interaction." },
  hover: { dot: "var(--info)", description: "Pointer is over the component." },
  focus: { dot: "var(--accent)", description: "Keyboard or programmatic focus." },
  active: { dot: "var(--warning)", description: "Currently being pressed/activated." },
  disabled: { dot: "var(--fg-subtle)", description: "Component is non-interactive." },
  checked: { dot: "var(--success)", description: "Selected / on state." },
  loading: { dot: "var(--info)", description: "Awaiting completion of an async action." },
  invalid: { dot: "var(--accent)", description: "Validation error present." },
};

interface StatesGridProps {
  contract: ComponentContract;
}

export function StatesGrid({ contract }: StatesGridProps) {
  const states = contract.states ?? [];
  return (
    <div
      className="card card--inset"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "var(--space-4)",
      }}
    >
      {states.map((s) => {
        const meta = STATE_LABELS[s] ?? { dot: "var(--fg-subtle)", description: "Declared state." };
        return (
          <div key={s} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "var(--radius-pill)",
                  background: meta.dot,
                  flexShrink: 0,
                }}
                aria-hidden
              />
              <strong style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-200)" }}>{s}</strong>
            </div>
            <span className="muted" style={{ fontSize: "var(--fs-200)" }}>
              {meta.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}
