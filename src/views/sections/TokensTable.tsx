import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@full-stack-ds/react";
import type { TokenDefinition } from "../../types/data";

interface TokensTableProps {
  tokens: Record<string, Record<string, TokenDefinition>>;
}

function isColorish(val: string | undefined): boolean {
  if (!val) return false;
  return /^#|^rgb|^hsl|^var\(/.test(val);
}

export function TokensTable({ tokens }: TokensTableProps) {
  const groups = Object.entries(tokens);

  return (
    <div className="panel">
      <div className="panel-toolbar">
        <span>{groups.length} state group{groups.length === 1 ? "" : "s"}</span>
        <span className="subtle">
          token → resolves → CSS property
        </span>
      </div>
      {groups.map(([groupName, entries]) => (
        <div key={groupName}>
          <div
            style={{
              padding: "var(--fsds-core-spacing-size-05) var(--fsds-core-spacing-size-06)",
              fontSize: "var(--fsds-core-typography-ramp-2)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--fsds-semantic-color-foreground-tertiary)",
              borderBottom: "1px solid var(--fsds-semantic-color-border-subtle)",
              background: "var(--fsds-semantic-color-background-primary)",
            }}
          >
            {groupName}
          </div>
          <Table className="tokens-table" ariaLabel="Token definitions">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Token</TableHeaderCell>
                <TableHeaderCell>Resolves to</TableHeaderCell>
                <TableHeaderCell>Fallback</TableHeaderCell>
                <TableHeaderCell>Property</TableHeaderCell>
                <TableHeaderCell>Layer</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(entries).map(([name, def]) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell className="muted">{def.resolvesTo ?? "—"}</TableCell>
                  <TableCell>
                    {isColorish(def.fallback) && (
                      <span
                        className="token-swatch"
                        style={{ background: def.fallback }}
                        aria-hidden
                      />
                    )}
                    {def.fallback ?? "—"}
                  </TableCell>
                  <TableCell className="muted">{def.property ?? "—"}</TableCell>
                  <TableCell className="muted">{def.layer ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
