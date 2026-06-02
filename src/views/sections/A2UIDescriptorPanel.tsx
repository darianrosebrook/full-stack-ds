import { useMemo } from "react";
import {
  deriveA2UIDescriptor,
  type A2UIDescriptor,
  type ComponentContractLike,
} from "../../../packages/ds-contracts/a2ui";
import type { ComponentContract } from "../../types/data";

interface A2UIDescriptorPanelProps {
  contract: ComponentContract;
}

/**
 * Renders the agent-facing A2UI projection of a component contract, derived at
 * render time via `deriveA2UIDescriptor` (packages/ds-contracts/a2ui). No baked
 * artifact: the descriptor is recomputed from the live contract each render.
 *
 * `deriveA2UIDescriptor` throws when a contract authors no `a2ui.category`.
 * Rather than crash the surrounding page we catch that and render an explicit
 * "no descriptor authored" empty state (every corpus contract authors one
 * today, but the panel must not assume it).
 */
export function A2UIDescriptorPanel({ contract }: A2UIDescriptorPanelProps) {
  const result = useMemo<
    { ok: true; descriptor: A2UIDescriptor } | { ok: false; reason: string }
  >(() => {
    try {
      // ComponentContract is a structural superset of ComponentContractLike.
      const descriptor = deriveA2UIDescriptor(
        contract as unknown as ComponentContractLike,
      );
      return { ok: true, descriptor };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : String(err) };
    }
  }, [contract]);

  if (!result.ok) {
    return (
      <div className="muted" style={{ padding: "var(--fsds-core-spacing-size-06)" }}>
        No A2UI descriptor authored for {contract.name}. This contract declares
        no <code>a2ui.category</code>, so the agent-facing projection is
        unavailable.
      </div>
    );
  }

  const d = result.descriptor;
  const propEntries = Object.entries(d.props);
  const eventEntries = Object.entries(d.events);

  return (
    <div className="a2ui-descriptor">
      <dl className="kv-grid">
        <dt>Agent category</dt>
        <dd>
          <code>{d.category}</code>
        </dd>
        {d.usageHints && d.usageHints.length > 0 && (
          <>
            <dt>Usage hints</dt>
            <dd>
              <ul style={{ margin: 0, paddingLeft: "var(--fsds-core-spacing-size-06)" }}>
                {d.usageHints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        {d.children && (
          <>
            <dt>Children policy</dt>
            <dd>
              {d.children.allowed
                ? `accepts children${d.children.slot ? ` in slot "${d.children.slot}"` : ""}${
                    d.children.accepts && d.children.accepts.length > 0
                      ? ` (${d.children.accepts.join(", ")})`
                      : ""
                  }${
                    d.children.min != null || d.children.max != null
                      ? ` [${d.children.min ?? 0}–${d.children.max ?? "∞"}]`
                      : ""
                  }`
                : "no children accepted"}
            </dd>
          </>
        )}
        {d.form != null && (
          <>
            <dt>Form participation</dt>
            <dd>declared</dd>
          </>
        )}
      </dl>

      {propEntries.length > 0 && (
        <div className="subsection">
          <h3 className="subsection-title">
            Agent-fillable props ({propEntries.length})
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Accepts</th>
                <th>Enum domain</th>
                <th>Required</th>
              </tr>
            </thead>
            <tbody>
              {propEntries.map(([name, p]) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>{p.accepts.join(" | ")}</td>
                  <td>{p.enum ? p.enum.join(", ") : "—"}</td>
                  <td>{p.required ? "yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {eventEntries.length > 0 && (
        <div className="subsection">
          <h3 className="subsection-title">
            Events &amp; channels ({eventEntries.length})
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Source</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {eventEntries.map(([key, e]) => (
                <tr key={key}>
                  <td>
                    <code>{key}</code>
                  </td>
                  <td>{e.source}</td>
                  <td>{e.valueType ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {propEntries.length === 0 && eventEntries.length === 0 && (
        <div className="muted">
          No agent-fillable props or events derived from this contract.
        </div>
      )}
    </div>
  );
}
