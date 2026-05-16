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
        <div style={{ marginBottom: "var(--space-5)", fontSize: "var(--fs-200)" }}>
          <div className="chip chip--accent chip--mono" style={{ marginBottom: "var(--space-3)" }}>
            {selection.hit.kind}
          </div>
          <div style={{ color: "var(--fg-default)", marginBottom: "var(--space-2)" }}>
            {selection.hit.explanation}
          </div>
          <code style={{ display: "block", color: "var(--fg-muted)", fontSize: "var(--fs-100)", marginBottom: "var(--space-3)" }}>
            {selection.hit.contractPath}
          </code>
          <button
            type="button"
            className="icon-btn"
            onClick={onClear}
            style={{ width: "auto", padding: "var(--space-2) var(--space-3)", fontSize: "var(--fs-100)", border: "1px solid var(--border-default)" }}
          >
            Clear selection
          </button>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: "var(--fs-200)", marginTop: 0 }}>
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
