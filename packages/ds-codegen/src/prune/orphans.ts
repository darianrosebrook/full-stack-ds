/**
 * Orphan detection and removal.
 *
 * An orphan is a manifest-tracked group (one framework × component
 * pair) whose source contract no longer exists on disk. The contract
 * is the single source of truth for whether a component should be
 * emitted; if it's gone, the generated artifacts are stale and
 * should be removed.
 *
 * Detection only looks at the manifest. It does NOT walk
 * `packages/ds-{framework}/src/components/` looking for orphan
 * directories without a manifest entry — those are the
 * UNTRACKED_GENERATED_PATHS case the required-mode rail already
 * surfaces, and conflating them here would mask producer bugs.
 *
 * Removal classifies each file by whether it contains the
 * `@generated:start` marker (see ../markers.ts). Generated files are
 * always safe to delete. Hand-edited files (no marker) are gated
 * behind explicit caller intent: skip (default), quarantine to a
 * timestamped sidecar dir, or force-delete.
 */
import fs from "node:fs";
import path from "node:path";
import { isGeneratedFile } from "../markers.js";
import type { EmissionManifest, EmittedArtifactGroup } from "../validation/types.js";

/** Per-file classification used to decide what to do with it. */
export type OrphanFileKind = "generated" | "hand_edited" | "missing";

export interface OrphanFile {
  /** POSIX path, relative to workspace root, as recorded in the manifest. */
  path: string;
  /** Absolute path on the host filesystem. */
  absPath: string;
  kind: OrphanFileKind;
}

export interface OrphanGroup {
  framework: EmittedArtifactGroup["framework"];
  component: string;
  /** Workspace-relative POSIX path of the (now-missing) contract. */
  contractPath: string;
  files: OrphanFile[];
}

/**
 * Three policies for how to handle a hand-edited orphan file —
 * generated files are always deleted regardless of policy.
 *
 *   "skip"        — leave hand-edited files in place; report them in
 *                   the summary so the operator can find them with
 *                   grep / find / IDE search.
 *   "quarantine"  — move hand-edited files into a single
 *                   timestamped directory under
 *                   `.orphan-quarantine/<ISO>/`. Discoverable, out
 *                   of the codegen path, easy to recover from.
 *   "force"       — delete hand-edited files outright. Equivalent
 *                   to `--prune --force`.
 */
export type HandEditPolicy = "skip" | "quarantine" | "force";

export interface OrphanRemovalReport {
  /** Files actually deleted from disk. */
  deleted: OrphanFile[];
  /** Files moved into the quarantine directory (empty unless policy was "quarantine"). */
  quarantined: { from: OrphanFile; to: string }[];
  /** Files left in place because policy was "skip" and the file is hand-edited. */
  skipped: OrphanFile[];
  /** Directories removed because they became empty after file removal. */
  removedDirs: string[];
  /**
   * Absolute path to the quarantine root, present only when policy
   * was "quarantine" and at least one file was moved there. Lets the
   * caller surface a single grep-able location.
   */
  quarantineRoot?: string;
}

/**
 * Classify every group in the manifest as either still-current or
 * orphan, based solely on whether its source contract still exists
 * on disk. The current-disk check uses the absolute workspace path
 * (manifest paths are workspace-relative POSIX), so a manifest from
 * a previous run can be evaluated from a fresh process.
 */
export function detectOrphans(
  manifest: EmissionManifest,
  workspaceRoot: string,
): OrphanGroup[] {
  const orphans: OrphanGroup[] = [];
  for (const group of manifest.groups) {
    const contractAbs = path.join(workspaceRoot, group.contract.path);
    if (fs.existsSync(contractAbs)) continue;
    orphans.push({
      framework: group.framework,
      component: group.component,
      contractPath: group.contract.path,
      files: group.files.map((f) => {
        const absPath = path.join(workspaceRoot, f.path);
        let kind: OrphanFileKind;
        if (!fs.existsSync(absPath)) {
          kind = "missing";
        } else if (isGeneratedFile(absPath)) {
          kind = "generated";
        } else {
          kind = "hand_edited";
        }
        return { path: f.path, absPath, kind };
      }),
    });
  }
  return orphans;
}

/**
 * Apply removal to the orphan set. Returns a report listing every
 * action taken so the CLI can print a concise summary.
 *
 * `now` is injectable so tests can pin the quarantine directory
 * timestamp; production callers pass `new Date()`.
 */
export function executeOrphanRemoval(
  orphans: OrphanGroup[],
  policy: HandEditPolicy,
  workspaceRoot: string,
  now: Date = new Date(),
): OrphanRemovalReport {
  const report: OrphanRemovalReport = {
    deleted: [],
    quarantined: [],
    skipped: [],
    removedDirs: [],
  };
  if (orphans.length === 0) return report;

  const quarantineRoot =
    policy === "quarantine"
      ? path.join(
          workspaceRoot,
          "packages",
          "ds-codegen",
          ".orphan-quarantine",
          isoForFilename(now),
        )
      : null;

  const touchedDirs = new Set<string>();

  for (const group of orphans) {
    for (const file of group.files) {
      if (file.kind === "missing") continue;
      touchedDirs.add(path.dirname(file.absPath));

      if (file.kind === "generated" || policy === "force") {
        try {
          fs.rmSync(file.absPath, { force: true });
          report.deleted.push(file);
        } catch {
          // Best-effort: a file already gone or owned by a different
          // user is fine to skip silently. The summary still reflects
          // the intent.
        }
        continue;
      }

      // file.kind === "hand_edited" and policy is "skip" | "quarantine"
      if (policy === "quarantine" && quarantineRoot) {
        const targetAbs = path.join(
          quarantineRoot,
          group.framework,
          group.component,
          path.basename(file.absPath),
        );
        fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
        try {
          fs.renameSync(file.absPath, targetAbs);
          report.quarantined.push({ from: file, to: targetAbs });
        } catch {
          // EXDEV across filesystems → fall back to copy+unlink.
          fs.copyFileSync(file.absPath, targetAbs);
          fs.rmSync(file.absPath, { force: true });
          report.quarantined.push({ from: file, to: targetAbs });
        }
        continue;
      }

      // policy === "skip"
      report.skipped.push(file);
    }
  }

  // Walk every directory we touched bottom-up; rmdir each that is
  // now empty. This collapses a component dir, a per-framework
  // dir, etc., without falsely removing dirs that still contain
  // unrelated content (e.g. another component).
  const dirsByDepth = [...touchedDirs].sort(
    (a, b) => b.split(path.sep).length - a.split(path.sep).length,
  );
  for (const dir of dirsByDepth) {
    try {
      const entries = fs.readdirSync(dir);
      if (entries.length === 0) {
        fs.rmdirSync(dir);
        report.removedDirs.push(dir);
        // The parent may now be empty too; add it for the next pass.
        const parent = path.dirname(dir);
        if (!dirsByDepth.includes(parent)) dirsByDepth.push(parent);
      }
    } catch {
      // Dir already gone or unreadable; ignore.
    }
  }

  if (quarantineRoot && report.quarantined.length > 0) {
    report.quarantineRoot = quarantineRoot;
  }

  return report;
}

/**
 * Filename-safe ISO timestamp (`2026-05-21T11-23-45-678Z`). Used as
 * the quarantine subdir so multiple prune runs on the same day
 * don't collide.
 */
function isoForFilename(now: Date): string {
  return now.toISOString().replace(/:/g, "-").replace(/\./g, "-");
}
