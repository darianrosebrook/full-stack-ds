import { useMemo } from "react";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@full-stack-ds/react";
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
 * Render-safe cell value: a string passes through; anything else (a payload
 * object/array that slipped past the deriver) is stringified so React can
 * render it as text instead of throwing. Nullish renders an em dash.
 */
function coerceCell(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
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
        <div className="subsection nutrition-facts">
          <h3 className="subsection-title">
            Agent-fillable props ({propEntries.length})
          </h3>
          <Table className="data-table nutrition-table" ariaLabel="Agent-fillable props">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Prop</TableHeaderCell>
                <TableHeaderCell>Accepts</TableHeaderCell>
                <TableHeaderCell>Enum domain</TableHeaderCell>
                <TableHeaderCell>Required</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {propEntries.map(([name, p]) => (
                <TableRow key={name}>
                  <TableCell>
                    <code>{name}</code>
                  </TableCell>
                  <TableCell>{p.accepts.join(" | ")}</TableCell>
                  <TableCell>{p.enum ? p.enum.join(", ") : "—"}</TableCell>
                  <TableCell>{p.required ? "yes" : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {eventEntries.length > 0 && (
        <div className="subsection">
          <h3 className="subsection-title">
            Events &amp; channels ({eventEntries.length})
          </h3>
          <Table className="data-table" ariaLabel="Events and channels">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Key</TableHeaderCell>
                <TableHeaderCell>Source</TableHeaderCell>
                <TableHeaderCell>Payload</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventEntries.map(([key, e]) => (
                <TableRow key={key}>
                  <TableCell>
                    <code>{key}</code>
                  </TableCell>
                  <TableCell>{e.source}</TableCell>
                  {/*
                    valueType is typed string | undefined and the deriver
                    guarantees a string (see payloadToValueType). Coerce
                    defensively anyway: a non-string here must degrade to text,
                    never throw "Objects are not valid as a React child".
                  */}
                  <TableCell>{coerceCell(e.valueType)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
