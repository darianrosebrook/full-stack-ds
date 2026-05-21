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
  ArtifactAdmissionEntry,
  ComponentAdmissionRow,
  FrameworkId,
  RailReport,
  ScopedArtifactGroup,
  ScopedProjection,
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

  // Environment provenance summary
  // (CODEGEN-RAIL-ENVIRONMENT-PROVENANCE-01). Records what runtime
  // / dependency surface produced the manifest. Drift is rendered
  // by the existing required-mode diagnostics section below.
  if (report.artifactManifest?.environment) {
    const env = report.artifactManifest.environment;
    lines.push("## Environment provenance");
    lines.push("");
    lines.push(
      "Generate-time Node major, codegen package version, and lockfile digest. Drift surfaces as `RAIL_REQUIRE_MANIFEST_NODE_MAJOR_MISMATCH`, `RAIL_REQUIRE_MANIFEST_CODEGEN_VERSION_MISMATCH`, `RAIL_REQUIRE_MANIFEST_LOCKFILE_MISSING`, or `RAIL_REQUIRE_MANIFEST_LOCKFILE_HASH_MISMATCH`.",
    );
    lines.push("");
    lines.push(`- Node major: \`${env.nodeMajor}\``);
    lines.push(`- Codegen package version: \`${env.codegenPackageVersion}\``);
    lines.push(
      `- Lockfile: \`${env.lockfile.path}\` (sha256 \`${shortHash(env.lockfile.sha256)}\`)`,
    );
    lines.push("");
  }

  // Per-framework emitter source set summary
  // (CODEGEN-RAIL-EMITTER-PROVENANCE-01). Cites the size of each
  // framework's declared material source set so a reader knows
  // how much surface required-mode is verifying. Drift, when it
  // occurs, is rendered in the Required-mode diagnostics section
  // below by the existing diagnostic-rendering loop.
  if (report.artifactManifest?.emitterSourceSets) {
    const sets = report.artifactManifest.emitterSourceSets;
    const present = FRAMEWORKS_IN_ORDER.filter((fw) => sets[fw]);
    if (present.length > 0) {
      lines.push("## Per-framework emitter provenance");
      lines.push("");
      lines.push(
        "Bounded material codegen source set, per framework. Required mode rejects drift between these recorded bytes and the on-disk source files via `RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_*` diagnostics.",
      );
      lines.push("");
      lines.push("| Framework | Source files |");
      lines.push("|---|---:|");
      for (const fw of present) {
        lines.push(`| ${fw} | ${sets[fw]!.sources.length} |`);
      }
      lines.push("");
    }
  }

  // Changed artifact scope (reviewer projection over full-rail
  // evidence; rendered after the per-framework summary but
  // BEFORE the full per-component index so reviewers see the
  // PR-relevant subset first).
  if (report.scopedProjection) {
    appendScopedProjectionSection(lines, report.scopedProjection);
  }

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

/**
 * Append the "Changed artifact scope" section to the rendered
 * markdown. Doctrine sentence is the first prose line of the
 * section: this is a reviewer projection over already-admitted
 * evidence, NOT a reduced gate.
 */
function appendScopedProjectionSection(
  lines: string[],
  sp: ScopedProjection,
): void {
  lines.push("## Changed artifact scope");
  lines.push("");
  lines.push(
    "Reviewer projection over the full admission report below. The rail still admitted the full workspace.",
  );
  lines.push("");
  if (sp.mode.kind === "git_range") {
    lines.push(`- Git range: \`${sp.mode.rangeNotation}\``);
  }
  lines.push(`- Matched artifact groups: ${sp.matchedGroups.length}`);
  lines.push(`- Changed generated files: ${sp.changedGeneratedPaths.length}`);
  lines.push(`- Changed contracts: ${sp.changedContractPaths.length}`);
  lines.push(`- Unmatched generated paths: ${sp.unmatchedGeneratedPaths.length}`);
  lines.push(
    `- Non-generated changed paths: ${sp.nonGeneratedChangedPaths.length}`,
  );
  lines.push("");

  if (sp.matchedGroups.length > 0) {
    lines.push("| Component | Framework | Files | Contract | Contract hash | Admission |");
    lines.push("| --- | --- | ---: | --- | --- | --- |");
    const sorted = [...sp.matchedGroups].sort(compareScopedGroup);
    for (const g of sorted) {
      lines.push(
        `| ${g.component} | ${g.framework} | ${g.files.length} | \`${g.contract.path}\` | \`${shortHash(g.contract.sha256)}\` | ${renderScopedAdmission(g.admission)} |`,
      );
    }
    lines.push("");
  }

  if (sp.changedContractPaths.length > 0) {
    lines.push("### Changed contracts");
    lines.push("");
    lines.push(
      "Contracts in the PR diff that the manifest attributes to one or more artifact groups. Surfaced as review context; the required-mode `RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH` code is the authoritative failure surface when a contract changes without a corresponding regenerate.",
    );
    lines.push("");
    const head = sp.changedContractPaths.slice(0, 10);
    for (const p of head) lines.push(`- \`${p}\``);
    if (sp.changedContractPaths.length > head.length) {
      lines.push(
        `- ... (${sp.changedContractPaths.length - head.length} more)`,
      );
    }
    lines.push("");
  }

  if (sp.unmatchedGeneratedPaths.length > 0) {
    lines.push("### Unmatched generated paths");
    lines.push("");
    lines.push(
      "These paths appear in the git diff but were not in any artifact group; required-mode diagnostics are the authoritative failure surface for these.",
    );
    lines.push("");
    const head = sp.unmatchedGeneratedPaths.slice(0, 10);
    for (const p of head) lines.push(`- \`${p}\``);
    if (sp.unmatchedGeneratedPaths.length > head.length) {
      lines.push(
        `- ... (${sp.unmatchedGeneratedPaths.length - head.length} more)`,
      );
    }
    lines.push("");
  }

  if (sp.nonGeneratedChangedPaths.length > 0) {
    lines.push("### Non-generated changed paths");
    lines.push("");
    lines.push(
      "Context for why the generated tree changed (contracts, codegen, configs, etc.).",
    );
    lines.push("");
    const head = sp.nonGeneratedChangedPaths.slice(0, 10);
    for (const p of head) lines.push(`- \`${p}\``);
    if (sp.nonGeneratedChangedPaths.length > head.length) {
      lines.push(
        `- ... (${sp.nonGeneratedChangedPaths.length - head.length} more)`,
      );
    }
    lines.push("");
  }
}

const FRAMEWORK_RANK: Record<FrameworkId, number> = {
  react: 0,
  vue: 1,
  svelte: 2,
  lit: 3,
  angular: 4,
};

function compareScopedGroup(
  a: ScopedArtifactGroup,
  b: ScopedArtifactGroup,
): number {
  if (a.component !== b.component) return a.component.localeCompare(b.component);
  return FRAMEWORK_RANK[a.framework] - FRAMEWORK_RANK[b.framework];
}

function renderScopedAdmission(
  admission: readonly ArtifactAdmissionEntry[],
): string {
  if (admission.length === 0) return "not_admitted";
  const anyFail = admission.some((a) => a.status === "fail");
  const status = anyFail ? "fail" : "pass";
  const abbrev = admission.map((a) => abbreviateCoverage(a.coverage)).join("+");
  const narrowings = new Set<string>();
  for (const a of admission) {
    for (const n of a.knownRuleNarrowings ?? []) narrowings.add(n);
  }
  const narrowSuffix =
    narrowings.size > 0
      ? ` (narrowings: ${[...narrowings].join(", ")})`
      : "";
  return `${status} [${abbrev}]${narrowSuffix}`;
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

/**
 * Render the first 12 hex chars of a sha256 — enough to
 * distinguish contract revisions at a glance in a markdown table
 * without bloating the cell width.
 */
function shortHash(sha256: string): string {
  return sha256.slice(0, 12);
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
