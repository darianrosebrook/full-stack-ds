import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@full-stack-ds/react";
import type { ComponentBundle, Framework } from "../../types/data";
import { bundle } from "../../types/bundle";

interface EvidencePanelProps {
  component: ComponentBundle;
}

const ALL_FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "angular", "lit"];

/**
 * Evidence / Residuals section.
 *
 * This section binds ONLY durable, bundle-derivable facts — what the build
 * already knows about this component without any new data plumbing:
 *   - the contract source path (provenance)
 *   - the bundle generation timestamp
 *   - which framework realizations have generated source present
 *
 * It deliberately does NOT bind admission-rail, runtime-rail, or token-gate
 * status. Those live in CI-side or point-in-time artifacts
 * (.emission-manifest.json — gitignored; preview-sweep-results — a snapshot;
 * the rail report — CI output) without a declared in-app freshness model.
 * Binding them is the follow-up COMPONENT-EVIDENCE-CI-STATUS-BINDING-01. Until
 * then this section states their absence explicitly rather than implying a
 * status the bundle cannot prove.
 */
export function EvidencePanel({ component }: EvidencePanelProps) {
  const generatedAt = new Date(bundle.generatedAt);
  const sourceByFramework = ALL_FRAMEWORKS.map((fw) => ({
    framework: fw,
    present: Boolean(component.sources[fw]?.component),
  }));

  return (
    <div className="evidence-panel">
      <div className="subsection">
        <h3 className="subsection-title">Provenance (bundle-derivable)</h3>
        <dl className="kv-grid">
          <dt>Contract source</dt>
          <dd>
            <code>{component.contractPath}</code>
          </dd>
          <dt>Bundle generated</dt>
          <dd>
            <time dateTime={generatedAt.toISOString()}>
              {generatedAt.toISOString()}
            </time>
          </dd>
        </dl>
      </div>

      <div className="subsection">
        <h3 className="subsection-title">Generated framework realizations</h3>
        <Table className="data-table" ariaLabel="Generated framework realizations">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Framework</TableHeaderCell>
              <TableHeaderCell>Generated source</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sourceByFramework.map(({ framework, present }) => (
              <TableRow key={framework}>
                <TableCell>{framework}</TableCell>
                <TableCell>{present ? "present" : "absent"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="muted" style={{ marginTop: "var(--fsds-core-spacing-size-04)" }}>
          "Present" means a generated component file exists in the framework
          package for this contract. It is a build-artifact fact, not a runtime
          or admission claim.
        </p>
      </div>

      <div className="subsection">
        <h3 className="subsection-title">Residuals &amp; non-claims</h3>
        <ul className="residuals-list">
          <li>
            <strong>Admission-rail status is not bound in-app.</strong> Whether
            these realizations passed the generated-artifact admission rail is
            proven in CI (and the gitignored emission manifest), not surfaced
            here. This page does not assert rail admission.
          </li>
          <li>
            <strong>Runtime-rail facts are not bound in-app.</strong> The
            Playwright runtime fact rail asserts narrow defaults for a subset of
            components in CI; those results are not carried into this bundle.
            This page does not assert runtime behavior.
          </li>
          <li>
            <strong>Token-gate status is not bound in-app.</strong> Contrast,
            brand-reference, and usage-regression token gates run in CI; their
            outcomes are not surfaced per component here.
          </li>
          <li>
            <strong>This page proves projection, not quality.</strong> It shows
            that one contract projects into human, framework, and agent-facing
            surfaces. It does <em>not</em> prove visual quality, accessibility
            adequacy, or product suitability.
          </li>
          <li className="muted">
            Live rail / runtime / token binding is tracked as a follow-up
            (COMPONENT-EVIDENCE-CI-STATUS-BINDING-01), pending a committed or
            reproducibly generated status artifact with a declared freshness
            model.
          </li>
        </ul>
      </div>
    </div>
  );
}
