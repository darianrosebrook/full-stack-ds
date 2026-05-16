import type { PropMember } from "../../types/data";

interface PropsTableProps {
  members: PropMember[];
}

export function PropsTable({ members }: PropsTableProps) {
  return (
    <div className="card">
      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.name}>
              <td>
                <code>{m.name}</code>
                {m.required && (
                  <span className="chip chip--accent" style={{ marginLeft: "var(--space-3)" }}>
                    required
                  </span>
                )}
              </td>
              <td>
                <code>{m.type}</code>
              </td>
              <td>
                {m.default !== undefined ? (
                  <code>{JSON.stringify(m.default)}</code>
                ) : (
                  <span className="subtle">—</span>
                )}
              </td>
              <td>
                {m.description ? (
                  <span className="muted">{m.description}</span>
                ) : (
                  <span className="subtle">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
