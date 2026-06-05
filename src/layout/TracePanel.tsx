import { Chip, Button } from "@full-stack-ds/react";
import type { ComponentBundle } from "../types/data";
import type { TraceSelection } from "../trace/types";
import { JsonTreeViewer } from "../components/JsonTreeViewer";

interface TracePanelProps {
  component: ComponentBundle | null;
  selection: TraceSelection | null;
  onClear: () => void;
}

export function TracePanel({ component, selection, onClear }: TracePanelProps) {
  if (!component) {
    return (
      <div className="trace-empty">Select a component to inspect its contract.</div>
    );
  }

  return (
    <div className="trace">
      <h3 className="trace-title">Contract</h3>
      {selection ? (
        <div style={{ marginBottom: "var(--fsds-core-spacing-size-06)", fontSize: "var(--fsds-core-typography-ramp-2)" }}>
          <Chip size="small" variant="selected" style={{ fontFamily: "var(--fsds-core-typography-font-family-mono)", marginBottom: "var(--fsds-core-spacing-size-05)" }}>
            {selection.hit.kind}
          </Chip>
          <div style={{ color: "var(--fsds-semantic-color-foreground-primary)", marginBottom: "var(--fsds-core-spacing-size-04)" }}>
            {selection.hit.explanation}
          </div>
          <code style={{ display: "block", color: "var(--fsds-semantic-color-foreground-secondary)", fontSize: "var(--fsds-core-typography-ramp-2)", marginBottom: "var(--fsds-core-spacing-size-05)" }}>
            {selection.hit.contractPath}
          </code>
          <Button variant="ghost" size="small" onClick={onClear}>
            Clear selection
          </Button>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)", marginTop: 0 }}>
          Click any tagged region in the source on the Developer tab to highlight
          the contract field that produced it.
        </p>
      )}

      <JsonTreeViewer
        value={component.contract}
        highlightPath={selection?.hit.contractPath}
      />
    </div>
  );
}
