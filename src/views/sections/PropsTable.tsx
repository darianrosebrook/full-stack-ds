import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@full-stack-ds/react";
import type { PropMember } from "../../types/data";

interface PropsTableProps {
  members: PropMember[];
}

export function PropsTable({ members }: PropsTableProps) {
  return (
    <div className="panel">
      <Table className="props-table" ariaLabel="Component props">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Prop</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Default</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.name}>
              <TableCell>
                <code>{m.name}</code>
                {m.required && (
                  <span className="chip chip--accent" style={{ marginLeft: "var(--fsds-core-spacing-size-05)" }}>
                    required
                  </span>
                )}
              </TableCell>
              <TableCell>
                <code>{m.type}</code>
              </TableCell>
              <TableCell>
                {m.default !== undefined ? (
                  <code>{JSON.stringify(m.default)}</code>
                ) : (
                  <span className="subtle">—</span>
                )}
              </TableCell>
              <TableCell>
                {m.description ? (
                  <span className="muted">{m.description}</span>
                ) : (
                  <span className="subtle">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
