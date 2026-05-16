/**
 * Section-marker preservation.
 *
 * Generated files are partitioned into named regions. Two kinds:
 *
 *   - `@generated:<id>` — codegen owns the body; replaced byte-for-byte
 *     on every regeneration. Edits inside are lost without warning.
 *   - `@custom:<id>`    — user owns the body; preserved byte-for-byte
 *     across regenerations. Codegen never touches the body.
 *
 * Marker syntax (works in both line- and block-comment languages):
 *
 *   // @generated:start imports
 *   …codegen output…
 *   // @generated:end
 *
 *   /* @generated:start root *\/
 *   …codegen output…
 *   /* @generated:end *\/
 *
 * The `:end` marker may omit the id; it always closes the most recent
 * unclosed start. Markers must occupy their own line. Nested regions
 * are not supported.
 *
 * Merging rule: walk the freshly generated section list in order; for
 * each region, take the body from `generated` if it is `@generated`, or
 * from `existing` (matched by id) if it is `@custom`. Custom regions
 * present in `existing` but not in `generated` are appended at the end
 * so user code is never silently dropped.
 */

export type SectionKind = "generated" | "custom" | "between";
export type CommentStyle = "line" | "block";

export interface Section {
  kind: SectionKind;
  /** Region identifier. Required for `generated`/`custom`; absent for `between`. */
  id?: string;
  /** Section body, without the surrounding marker lines. */
  body: string;
}

const MARKER_RE =
  /^\s*(?:\/\/|\/\*)\s*@(?<kind>generated|custom):(?<state>start|end)(?:\s+(?<id>[\w:-]+))?\s*(?:\*\/)?\s*$/;

const MIN_ID_RE = /^[\w:-]+$/;

export class PreserveError extends Error {
  constructor(message: string, public readonly line: number) {
    super(`preserve: ${message} (line ${line})`);
    this.name = "PreserveError";
  }
}

/** True if the text contains at least one preservation marker. */
export function hasMarkers(text: string): boolean {
  for (const line of text.split("\n")) {
    if (MARKER_RE.test(line)) return true;
  }
  return false;
}

/**
 * Split a marker-bearing file into its ordered list of sections.
 *
 * Free text between marker pairs becomes a `between` section. Marker
 * lines themselves are not part of any body.
 *
 * Throws `PreserveError` on malformed markers (mismatched kinds, nested
 * starts, unclosed regions, missing ids on `:start`).
 */
export function splitSections(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let buffer: string[] = [];
  let active: { kind: "generated" | "custom"; id: string } | null = null;

  const flushBetween = () => {
    if (buffer.length === 0) return;
    sections.push({ kind: "between", body: buffer.join("\n") });
    buffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(MARKER_RE);
    if (!m) {
      buffer.push(line);
      continue;
    }
    const kind = m.groups!.kind as "generated" | "custom";
    const state = m.groups!.state as "start" | "end";
    const id = m.groups!.id;

    if (state === "start") {
      if (active) {
        throw new PreserveError(
          `nested @${kind}:start inside @${active.kind}:start "${active.id}"`,
          i + 1,
        );
      }
      if (!id) {
        throw new PreserveError(`@${kind}:start missing region id`, i + 1);
      }
      flushBetween();
      active = { kind, id };
    } else {
      if (!active) {
        throw new PreserveError(
          `@${kind}:end with no matching :start`,
          i + 1,
        );
      }
      if (kind !== active.kind) {
        throw new PreserveError(
          `@${kind}:end does not match active @${active.kind}:start "${active.id}"`,
          i + 1,
        );
      }
      if (id && id !== active.id) {
        throw new PreserveError(
          `@${kind}:end id "${id}" does not match active start id "${active.id}"`,
          i + 1,
        );
      }
      sections.push({
        kind: active.kind,
        id: active.id,
        body: buffer.join("\n"),
      });
      buffer = [];
      active = null;
    }
  }

  if (active) {
    throw new PreserveError(
      `unclosed @${active.kind}:start "${active.id}"`,
      lines.length,
    );
  }
  flushBetween();
  return sections;
}

/**
 * Render a section list back into source text.
 *
 * `commentStyle` controls the marker comment form: `line` for `// …`
 * (TS, JS, Vue script blocks), `block` for `/* … *\/` (CSS, HTML).
 */
export function renderSections(
  sections: Section[],
  commentStyle: CommentStyle,
): string {
  const parts: string[] = [];
  for (const s of sections) {
    if (s.kind === "between") {
      parts.push(s.body);
      continue;
    }
    if (!s.id) {
      throw new Error(`renderSections: ${s.kind} section missing id`);
    }
    if (!MIN_ID_RE.test(s.id)) {
      throw new Error(`renderSections: invalid region id "${s.id}"`);
    }
    const open =
      commentStyle === "line"
        ? `// @${s.kind}:start ${s.id}`
        : `/* @${s.kind}:start ${s.id} */`;
    const close =
      commentStyle === "line"
        ? `// @${s.kind}:end`
        : `/* @${s.kind}:end */`;
    parts.push([open, s.body, close].join("\n"));
  }
  return parts.join("\n");
}

/**
 * Merge a fresh codegen section list with an existing parsed section
 * list. The result has the structure of `generated` (its order, its
 * `between` whitespace, its `@generated` bodies) but uses bodies from
 * `existing` for any `@custom` region whose id matches.
 *
 * Custom regions present in `existing` but absent from `generated` are
 * appended at the end as orphans, with a between-line separator, so
 * user code is never lost on a structural change.
 */
export function mergeSections(
  generated: Section[],
  existing: Section[],
): Section[] {
  const customByKey = new Map<string, Section>();
  for (const s of existing) {
    if (s.kind === "custom" && s.id) {
      customByKey.set(s.id, s);
    }
  }

  const used = new Set<string>();
  const merged: Section[] = generated.map((s) => {
    if (s.kind === "custom" && s.id && customByKey.has(s.id)) {
      used.add(s.id);
      const preserved = customByKey.get(s.id)!;
      return { kind: "custom", id: s.id, body: preserved.body };
    }
    return s;
  });

  const orphans: Section[] = [];
  for (const [id, s] of customByKey) {
    if (used.has(id)) continue;
    if (!s.body.trim()) continue;
    orphans.push(s);
  }
  if (orphans.length > 0) {
    merged.push({ kind: "between", body: "" });
    for (const o of orphans) merged.push(o);
  }

  return merged;
}

/**
 * Convenience: parse `existing`, parse `generated`, merge, and render
 * back to text. If `existing` has no markers, returns `generated`
 * unchanged (legacy files are handled separately by the migrator).
 */
export function mergeFile(
  generated: string,
  existing: string,
  commentStyle: CommentStyle,
): string {
  if (!hasMarkers(existing)) return generated;
  const merged = mergeSections(splitSections(generated), splitSections(existing));
  return renderSections(merged, commentStyle);
}

/**
 * Build a fresh section list and inject a migration TODO into the
 * first matching custom region, pointing at the legacy snapshot file.
 *
 * Used when the on-disk file predates the marker scheme and we want to
 * write a clean scaffold while preserving the prior implementation
 * out-of-band as `<Name>.legacy.<ext>`.
 *
 * `commentStyle` controls how the TODO is rendered (line comments for
 * .tsx/.ts, block comments for .css). `candidateIds` is searched in
 * order; the first custom region with a matching id receives the note.
 * If no candidate matches, the TODO is appended as a new custom region
 * named after the first candidate so it's never silently dropped.
 */
export function injectMigrationTodo(
  fresh: Section[],
  legacyPathRelative: string,
  commentStyle: CommentStyle = "line",
  candidateIds: readonly string[] = ["trailing", "tests", "overrides"],
): Section[] {
  const noteLines = [
    "MIGRATION TODO",
    `Original hand-authored implementation saved at ${legacyPathRelative}.`,
    "Port behavior into the contract-driven flow and remove the legacy",
    "file once this region no longer depends on it.",
  ];
  const note =
    commentStyle === "line"
      ? noteLines.map((l) => `// ${l}`).join("\n")
      : `/*\n${noteLines.map((l) => ` * ${l}`).join("\n")}\n */`;

  for (const id of candidateIds) {
    const idx = fresh.findIndex(
      (s) => s.kind === "custom" && s.id === id,
    );
    if (idx === -1) continue;
    const next = [...fresh];
    next[idx] = { ...next[idx], body: note };
    return next;
  }

  return [
    ...fresh,
    { kind: "between", body: "" },
    { kind: "custom", id: candidateIds[0] ?? "trailing", body: note },
  ];
}
