# Contract oracle mutation measurement

This runner measures which contract facts the current FSDS rails can
contradict. It changes one curated fact, regenerates every registered target,
and records the first selected gate that goes red.

Run the catalog self-check and full profile:

    pnpm run audit:contract-oracle-mutations

Run only the fast catalog-integrity check used by push and ordinary CI:

    pnpm run audit:contract-oracle-mutations:selfcheck

Select a smaller sample or the shorter development profile:

    pnpm run audit:contract-oracle-mutations -- --only=dialog-name-to-body
    pnpm run audit:contract-oracle-mutations -- --profile=core --only=badge-rtl-flip-icon-false

Verify the catalog's reviewed outcome dispositions:

    pnpm run audit:contract-oracle-mutations -- --profile=full --verify-dispositions

Disposition verification is intentionally defined only for the `full`
profile. The first failing stage depends on the ordered stage set, so comparing
a shorter profile with full-profile dispositions would turn omitted evidence
into a false regression.

Reports and per-stage logs are written under
`tmp/contract-oracle-mutation/`. The source worktree must be clean. The
runner clones its exact HEAD into a throwaway directory, installs from the
lockfile, proves the unmutated baseline first, and restores a byte-clean
generated tree between mutants. It never mutates the developer worktree. Each
run allocates a dedicated loopback port for the Playwright rails, so an active
showcase or another agent's run cannot invalidate the baseline by occupying
the default development port.

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
was right. The catalog therefore distinguishes two reviewed dispositions:

- `detected` mutants protect an existing detector. If one starts surviving,
  the oracle regressed.
- `survived` mutants are blind-spot sentinels. Each names an owning spec and a
  reason. If one becomes detected, its disposition is stale and must be
  re-adjudicated rather than left on the books as permanent debt.

For a detected mutant, the disposition also pins its first failing stage and
evidence class. `--verify-dispositions` fails if a mutant remains detected but
its first detector changes. This prevents an independent runtime or authored
test oracle from disappearing behind a newly earlier structural or
contract-derived echo check while the aggregate kill count stays green.

Disposition verification fails on outcome or first-detector mismatch. This is
stricter than an aggregate survivor threshold: swapping one newly surviving
protected mutant for one newly detected sentinel leaves the count unchanged
but still fails.
The default command remains measurement-only. `--max-survivors=N` remains
available for deliberately count-based experiments, but it is not the
scheduled authority.

Ordinary CI and the change-scoped pre-push hook run only the self-check. The
`Contract oracle mutations` workflow runs the full profile every Monday and on
manual dispatch, fails when any mutant differs from its reviewed disposition,
and uploads the report plus per-stage logs for 30 days. That lane measures the
catalog; it does not turn the contract into its own correctness oracle or claim
that a recorded survivor's original value is right.

The catalog includes influence probes for state-machine event vocabulary,
named-slot requiredness, text-overflow prop binding, and motion transition
properties. These are behavioral probes, not name searches: each changes one
schema-valid leaf and observes which selected consumer, audit, authored test,
or runtime witness can distinguish the two contracts. A surviving leaf is
evidence about that exact fact only; it is not permission to call the entire
field dead without product-intent review.
