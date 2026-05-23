import type { ComponentBundle } from "../../types/data";
import { renderUsageTree } from "../../lib/render-usage";

interface UsageExamplesProps {
  component: ComponentBundle;
}

/**
 * Render every curated example from `<Name>.usage.jsonl` as live React. The
 * first example takes a larger frame as the de-facto hero; subsequent
 * examples stack below with a one-line label.
 *
 * When a component has no usage sidecar yet, this section renders nothing —
 * callers should gate on `component.usage.length` to decide whether to show
 * the surrounding section chrome.
 */
export function UsageExamples({ component }: UsageExamplesProps) {
  if (component.usage.length === 0) return null;
  const [hero, ...rest] = component.usage;

  return (
    <div>
      <ExampleFrame
        example={hero}
        emphasize
        componentName={component.name}
      />
      {rest.length > 0 && (
        <div style={{ display: "grid", gap: "var(--fsds-core-spacing-size-06)", marginTop: "var(--fsds-core-spacing-size-07)" }}>
          {rest.map((ex) => (
            <ExampleFrame
              key={ex.name}
              example={ex}
              componentName={component.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExampleFrameProps {
  example: ComponentBundle["usage"][number];
  emphasize?: boolean;
  componentName: string;
}

function ExampleFrame({ example, emphasize, componentName }: ExampleFrameProps) {
  return (
    <div className="card">
      <div className="card-toolbar">
        <span>
          {componentName} · <strong>{example.name}</strong>
        </span>
        {example.description && (
          <span className="muted" title={example.description}>
            {example.description}
          </span>
        )}
      </div>
      <div
        className="preview-frame"
        style={{
          padding: emphasize ? "var(--fsds-core-spacing-size-08)" : "var(--fsds-core-spacing-size-06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {renderUsageTree(example.tree)}
      </div>
    </div>
  );
}
