# Contract oracle mutation measurement

This runner measures which contract facts the current FSDS rails can
contradict. It changes one curated fact, regenerates every registered target,
and records the first selected gate that goes red.

Run the catalog self-check and full profile:

    pnpm run audit:contract-oracle-mutations

Select a smaller sample or the shorter development profile:

    pnpm run audit:contract-oracle-mutations -- --only=dialog-name-to-body
    pnpm run audit:contract-oracle-mutations -- --profile=core

Reports and per-stage logs are written under
`tmp/contract-oracle-mutation/`. The source worktree must be clean. The
runner clones its exact HEAD into a throwaway directory, installs from the
lockfile, proves the unmutated baseline first, and restores a byte-clean
generated tree between mutants. It never mutates the developer worktree.

The full profile expands the governed rail, runs every contract-derived
realization audit, typechecks all admitted packages, runs the root and
framework suites, and runs the two Playwright fact rails. It deliberately
does not run a generated-tree diff against HEAD: that identity check would
trivially reject every intentional mutation without saying whether the
mutated fact is correct. Coverage instrumentation is also omitted because it
repeats the same assertions and can produce incidental line-count failures.

Interpret outcomes by evidence class:

- `structural`: schema, semantic, emission, admission, or type checking
  rejected the mutant.
- `contract-derived`: an obligation derived from the mutated contract no
  longer matched its generated realization.
- `mixed-test`: a framework suite contradicted it, but the stage contains
  generated tests, axe, and hand-authored custom regions; inspect its log
  before calling the detection independent.
- `hand-authored-runtime`: a committed Playwright fact rail contradicted it.
- `survived`: no selected stage contradicted the fact.

A detection is not automatically proof that the contract was independently
checked. A survivor is a measured blind spot, not proof that the original fact
was right. The default command reports survivors without failing so the first
measurement can establish a baseline. Add `--max-survivors=N` only when a
reviewed threshold is ready to become a gate.
