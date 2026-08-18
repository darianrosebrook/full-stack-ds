import type { PrimitiveBundle } from "../types/data";
import { Stack } from "@full-stack-ds/react";
import { CodeViewer } from "../components/CodeViewer";

interface PrimitiveViewProps {
  primitive: PrimitiveBundle;
}

export function PrimitiveView({ primitive }: PrimitiveViewProps) {
  return (
    <div className="page">
      <p className="page-eyebrow">FOUNDATION</p>
      <h1 className="page-title">{primitive.name}</h1>
      <p className="page-lede">
        Every component in the system is composed from this single layout primitive.
      </p>

      {Object.entries(primitive.sources).map(([fw, files]) => (
        <section className="section" key={fw}>
          <Stack as="header" variant="horizontal" className="section-header stack-gap-06">
            <h2 className="section-title">{fw}</h2>
            <span className="section-meta">{files?.length ?? 0} files</span>
          </Stack>
          {(files ?? []).map((f) => (
            <div key={f.filename} style={{ marginBottom: "var(--fsds-core-spacing-size-06)" }}>
              <CodeViewer code={f.code} filename={f.filename} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
