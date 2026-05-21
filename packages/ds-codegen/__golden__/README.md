# Golden files — non-web framework round 1

Hand-authored target outputs for the contract → IR → emitter validation
described in the round-1 exercise. These are not produced by any emitter;
they exist to answer the question:

> Does the framework-neutral IR carry enough information to express a
> meaningful component on a non-web target, without leaking web
> assumptions?

## Method

For each golden output, every non-trivial line is annotated with the
contract field or IR fact that produced it. If any line requires
"because it's Switch" (component-identity branching) rather than a
fact derivable from the contract/IR, that line is flagged in the
traceability table and the corresponding gap is logged as an IR
widening candidate.

The annotations use `// SRC: <fact>` (or `# SRC:` / `/* SRC: */` per
language convention) on the line above the code they justify. Acceptable
fact prefixes:

- `contract.<path>`  — directly from `Switch.contract.json`
- `ir.<path>`         — derived field in `ComponentIR`
- `semantic.<rule>`   — framework-neutral semantic rule
                        (e.g. `role=switch implies aria-checked binding`)
- `framework-grammar` — language/framework syntactic requirement that
                        carries no contract implication
                        (e.g. `Swift requires `public` to expose a type`)
- `framework-a11y`    — accessibility validator constraint specific to
                        the target (e.g. SwiftUI requires
                        `.accessibilityValue` not just `.accessibilityLabel`
                        for toggle state)

Any line that cannot be classified into one of these five is the failure
case. Those go in the `## Gaps` section of `Switch.traceability.md`.

## Layout

```
__golden__/
├── README.md                          (this file)
└── Switch/
    ├── Switch.swiftui.swift           SwiftUI hand-output
    ├── Switch.uikit.swift             UIKit hand-output
    ├── Switch.react-native.tsx        React Native hand-output
    ├── Switch.compose.kt              Jetpack Compose hand-output
    └── Switch.traceability.md         per-line fact attribution + gaps
```

## What "passing" means for round 1

- Every line in every golden file is annotated with one of the five
  acceptable fact prefixes.
- `Switch.traceability.md` lists zero `## Gaps`, OR every gap has a
  concrete IR-widening proposal beside it.

If both conditions hold, round 2 (implement one emitter for one
component) is justified. If either fails, the contract and/or IR
need work before any emitter code is worth writing.
