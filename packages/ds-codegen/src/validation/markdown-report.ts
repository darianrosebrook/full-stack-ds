/**
 * Markdown projection of the RailReport
 * (CODEGEN-RAIL-ARTIFACT-EVIDENCE-REPORT-01).
 *
 * Doctrine: this projection is a DERIVED view. The JSON
 * RailReport is canonical. The markdown is a citation-friendly
 * surface for closure notes, audits, and PR descriptions. The
 * header sentence below is pinned verbatim into the rendered
 * output so a reader copying any section into a closure note
 * carries the "JSON is canonical" claim with them.
 *
 * Read-only: this module computes nothing the RailReport does
 * not already state. It only changes how the report is cited,
 * not what it asserts.
 */
import type {
  ComponentAdmissionRow,
  FrameworkId,
  RailReport,
} from "./types.js";

const HEADER_AUTHORITY_PREFIX =
  "> Derived from RailReport at";

const FRAMEWORKS_IN_ORDER: readonly FrameworkId[] = [
  "react",
  "vue",
  "svelte",
  "lit",
  "angular",
];

/**
 * Render the RailReport as markdown. Pure function — does no IO.
 * The caller (validate-cli) is responsible for writing the
 * returned string to disk.
 */
export function renderMarkdownReport(report: RailReport): string {
  const lines: string[] = [];

  // Authority footer (rendered as a leading blockquote so it
  // carries with any copied section). Includes both timestamp
  // and manifest schemaVersion so a reader knows which
  // RailReport this projection came from.
  const schemaVersion = report.artifactManifest?.schemaVersion;
  const schemaSuffix =
    schemaVersion !== undefined
      ? `; manifest schemaVersion v${schemaVersion}`
      : "";
  lines.push(
    `${HEADER_AUTHORITY_PREFIX} ${report.timestamp}${schemaSuffix}. The JSON is canonical.`,
  );
  lines.push("");

  // Overall verdict.
  lines.push(`# Framework admission rail report`);
  lines.push("");
  lines.push(`- Overall: **${report.overall.toUpperCase()}**`);
  lines.push(`- Scope: ${report.scope}`);
  lines.push(`- Artifact selection: ${report.artifactSelection}`);
  lines.push(
    `- Required-mode invocation: ${report.requireArtifactManifest ? "yes" : "no"}`,
  );
  if (report.artifactManifest) {
    const fileCount = report.artifactManifest.groups.reduce(
      (acc, g) => acc + g.files.length,
      0,
    );
    lines.push(
      `- Manifest: ${report.artifactManifest.groups.length} group(s), ${fileCount} file(s), schema v${report.artifactManifest.schemaVersion}, generated ${report.artifactManifest.generatedAt}`,
    );
  }
  lines.push("");

  // Per-framework summary.
  lines.push("## Per-framework summary");
  lines.push("");
  lines.push("| Framework | Status | Duration | Checks | Artifact groups |");
  lines.push("|---|---|---|---|---|");
  for (const fw of FRAMEWORKS_IN_ORDER) {
    const r = report.frameworks[fw];
    if (!r) continue;
    const checks = Object.entries(r.checks)
      .map(([name, outcome]) => `${name}=${outcome}`)
      .join(", ");
    const artifactStr = r.artifacts ? `${r.artifacts.length}` : "n/a";
    lines.push(
      `| ${fw} | ${r.status} | ${r.durationMs}ms | ${checks} | ${artifactStr} |`,
    );
  }
  lines.push("");

  // Per-component index.
  if (report.componentsIndex) {
    lines.push("## Per-component admission index");
    lines.push("");
    lines.push(
      "One row per component. Cell value: status + coverage abbreviations + (rule narrowings if any).",
    );
    lines.push("");
    const header = ["Component", ...FRAMEWORKS_IN_ORDER];
    lines.push(`| ${header.join(" | ")} |`);
    lines.push(`| ${header.map(() => "---").join(" | ")} |`);
    const componentNames = Object.keys(report.componentsIndex).sort();
    for (const name of componentNames) {
      const entry = report.componentsIndex[name] ?? {};
      const cells = [
        name,
        ...FRAMEWORKS_IN_ORDER.map((fw) => renderCell(entry[fw])),
      ];
      lines.push(`| ${cells.join(" | ")} |`);
    }
    lines.push("");
  }

  // Required-mode diagnostics.
  if (
    report.requiredModeDiagnostics &&
    report.requiredModeDiagnostics.length > 0
  ) {
    lines.push("## Required-mode diagnostics");
    lines.push("");
    for (const d of report.requiredModeDiagnostics) {
      lines.push(`### \`${d.code}\``);
      lines.push("");
      lines.push(d.message);
      lines.push("");
      if (d.paths && d.paths.length > 0) {
        const head = d.paths.slice(0, 10);
        for (const p of head) lines.push(`- \`${p}\``);
        if (d.paths.length > head.length) {
          lines.push(`- ... (${d.paths.length - head.length} more)`);
        }
        lines.push("");
      }
    }
  }

  // Known gaps.
  if (report.knownGaps.length > 0) {
    lines.push("## Known gaps");
    lines.push("");
    for (const gap of report.knownGaps) {
      lines.push(`- ${gap}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** Render one cell of the per-component table. */
function renderCell(row: ComponentAdmissionRow | undefined): string {
  if (!row) return "—";
  const coverageAbbrev = row.coverages.map(abbreviateCoverage).join("+");
  const narrowings =
    row.knownRuleNarrowings.length > 0
      ? ` (narrowings: ${row.knownRuleNarrowings.join(", ")})`
      : "";
  return `${row.status} [${coverageAbbrev || "—"}]${narrowings}`;
}

function abbreviateCoverage(c: string): string {
  switch (c) {
    case "covered_by_workspace_check":
      return "ws";
    case "covered_by_package_check":
      return "pkg";
    case "covered_by_direct_template_check":
      return "tpl";
    case "not_selected":
      return "ns";
    case "not_checkable_by_this_lane":
      return "ncl";
    default:
      return c;
  }
}
