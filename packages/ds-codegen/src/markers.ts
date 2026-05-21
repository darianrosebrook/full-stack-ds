import fs from "node:fs";

/**
 * The marker token codegen writes into every generated file. Both
 * single-line (`// @generated:start <section>`) and block
 * (`/* @generated:start <section> *\/`) markers contain this prefix.
 */
export const GENERATED_MARKER = "@generated:start";

/**
 * True iff the file at `absPath` contains the `@generated:start`
 * marker codegen writes near the top of every emitted file. Used by
 * the prune pipeline to distinguish files safe to delete (generated)
 * from files that may carry hand-edits (no marker).
 *
 * Reads only the first 2KB — codegen always writes the marker near
 * the top of the file, so a partial read is sufficient and avoids
 * reading large generated files in full.
 */
export function isGeneratedFile(absPath: string): boolean {
  let buf: Buffer;
  try {
    const fd = fs.openSync(absPath, "r");
    buf = Buffer.alloc(2048);
    const bytesRead = fs.readSync(fd, buf, 0, 2048, 0);
    fs.closeSync(fd);
    buf = buf.subarray(0, bytesRead);
  } catch {
    return false;
  }
  return buf.toString("utf8").includes(GENERATED_MARKER);
}
