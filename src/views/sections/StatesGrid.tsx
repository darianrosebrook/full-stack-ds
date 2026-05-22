import { Card, Badge } from "@full-stack-ds/react";
import type { ComponentContract } from "../../types/data";

type Intent = "info" | "success" | "warning" | "danger" | undefined;

const STATE_META: Record<string, { intent: Intent; description: string }> = {
  default: { intent: undefined, description: "Baseline state, no interaction." },
  hover: { intent: "info", description: "Pointer is over the component." },
  focus: { intent: "info", description: "Keyboard or programmatic focus." },
  active: { intent: "warning", description: "Currently being pressed/activated." },
  disabled: { intent: undefined, description: "Component is non-interactive." },
  checked: { intent: "success", description: "Selected / on state." },
  loading: { intent: "info", description: "Awaiting completion of an async action." },
  invalid: { intent: "danger", description: "Validation error present." },
};

interface StatesGridProps {
  contract: ComponentContract;
}

export function StatesGrid({ contract }: StatesGridProps) {
  const states = contract.states ?? [];
  return (
    <Card density="inset">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {states.map((s) => {
          const meta = STATE_META[s] ?? { intent: undefined as Intent, description: "Declared state." };
          return (
            <div key={s} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <Badge variant="tag" intent={meta.intent} size="sm" style={{ fontFamily: "var(--font-mono)" }}>
                {s}
              </Badge>
              <span className="muted" style={{ fontSize: "var(--fs-200)" }}>
                {meta.description}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
