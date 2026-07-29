# State-suppression matrix

`RAIL-STATE-SUPPRESSION-01` — read-only. A contract that declares `suppresses.categories: ["interaction"]` claims that no interaction-state styling applies while suppressed. The CSS honours it only if every property set under an interaction pseudo is also set in the suppressing block (winning it back at equal specificity) or the interaction selector is guarded against the suppressed state.

Independent of the pseudo-state rail: a dimension can be **realized** (a `:disabled` block exists) and its suppression contract **violated** at the same time, which is why this is its own axis.

**Reachability.** On a native form-control root a natively-disabled element cannot match `:focus-visible` or `:active`, so those leaks are unreachable there; `:hover` still matches. On any other root the disabled state is an ARIA/class convention and every interaction pseudo is reachable.

Components declaring suppression: **16** · guarded: **13** · leaks: **0** (reachable: **0**)

| component | root | dim | pseudo | property | reachability |
|---|---|---|---|---|---|
