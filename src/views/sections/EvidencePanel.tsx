import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@full-stack-ds/react";
import type { ComponentBundle, Framework } from "../../types/data";
import { bundle } from "../../types/bundle";
import {
  railCoverageFor,
  hasDefaultFact,
  nonDefaultMechanism,
} from "../../runtime/rail-coverage";

interface EvidencePanelProps {
  component: ComponentBundle;
}

const ALL_FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "angular", "lit"];

/**
 * Evidence / Residuals section.
 *
 * This section binds durable facts that need no point-in-time CI artifact:
 *   - the contract source path (provenance)
 *   - the bundle generation timestamp
 *   - which framework realizations have generated source present
 *   - which runtime-rail facts the rail ASSERTS for this component, from the
 *     committed coverage projection (src/runtime/rail-coverage.ts)
 *
 * The runtime-rail binding is COVERAGE, not last-run status: "rail facts
 * asserted" / "no rail facts asserted", never "passed". Coverage is a property
 * of the committed rail spec, so it needs no Playwright run and no freshness
 * model (COMPONENT-EVIDENCE-RAIL-COVERAGE-BINDING-01).
 *
 * It deliberately does NOT bind admission-rail or token-gate status, nor the
 * runtime rail's last-run pass/fail. Those live in CI-side or point-in-time
 * artifacts (.emission-manifest.json — gitignored; the rail report — CI output)
 * without a declared in-app freshness model. Binding those last-run statuses is
 * the reserved follow-up COMPONENT-EVIDENCE-CI-STATUS-BINDING-01.
 */
export function EvidencePanel({ component }: EvidencePanelProps) {
  const generatedAt = new Date(bundle.generatedAt);
  const sourceByFramework = ALL_FRAMEWORKS.map((fw) => ({
    framework: fw,
    present: Boolean(component.sources[fw]?.component),
  }));
  const railEntry = railCoverageFor(component.name);

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

      <div className="subsection nutrition-facts">
        <h3 className="subsection-title">Generated framework realizations</h3>
        <Table className="data-table nutrition-table" ariaLabel="Generated framework realizations">
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
        <h3 className="subsection-title">Runtime-rail coverage</h3>
        {railEntry ? (
          <>
            <Table className="data-table" ariaLabel="Runtime-rail coverage">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Framework</TableHeaderCell>
                  <TableHeaderCell>Default-prop facts</TableHeaderCell>
                  <TableHeaderCell>Non-default facts</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ALL_FRAMEWORKS.map((fw) => {
                  const mech = nonDefaultMechanism(railEntry, fw);
                  return (
                    <TableRow key={fw}>
                      <TableCell>{fw}</TableCell>
                      <TableCell>
                        {hasDefaultFact(railEntry, fw) ? "asserted" : "—"}
                      </TableCell>
                      <TableCell>
                        {mech === "query-param"
                          ? "asserted (query-param)"
                          : mech === "fixed-fixture"
                            ? "asserted (fixed fixture)"
                            : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <p className="muted" style={{ marginTop: "var(--fsds-core-spacing-size-04)" }}>
              "Asserted" means <code>e2e/runtime-rail.spec.ts</code> asserts a
              contract fact for this component in that framework
              {railEntry.nonDefault
                ? ` (non-default prop${railEntry.nonDefault.props.length > 1 ? "s" : ""}: ${railEntry.nonDefault.props.join(", ")})`
                : ""}
              . It is a coverage fact — that the rail asserts it — not a claim
              that the last CI run passed.
            </p>
          </>
        ) : (
          <p className="muted">
            No rail facts asserted for this component. The runtime fact rail
            covers a subset of components; absence here is neutral, not a
            failure.
          </p>
        )}
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
            <strong>Runtime-rail binding is coverage, not last-run status.</strong>{" "}
            The section above states which facts the rail <em>asserts</em> for
            this component (from the committed coverage projection). It is not a
            claim that the most recent CI rail run passed, and it does not prove
            visual quality or runtime behavior beyond the asserted facts.
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
            Live last-run pass/fail binding (rail / admission / token) is tracked
            as a follow-up (COMPONENT-EVIDENCE-CI-STATUS-BINDING-01), pending a
            committed or reproducibly generated status artifact with a declared
            freshness model.
          </li>
        </ul>
      </div>
    </div>
  );
}
