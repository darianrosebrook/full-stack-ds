# Token-reference resolvability matrix

`RAIL-TOKEN-REFERENCE-RESOLVABILITY-01` — read-only. A generated global or component stylesheet that reads `var(--fsds-x)` where nothing declares `--fsds-x` does not error: CSS falls back to the literal, so the binding renders a plausible value while the token layer is decorative for that property.

`declared as` names the kebab-cased spelling the token graph actually ships, when the miss is a casing seam. A blank there means the name is missing for some other reason and needs its own diagnosis.

Declarations in the graph: **866** · unresolvable references: **0** across **0** distinct name(s)

| name | stylesheet sources | silent fallback | declared as | token value | repair |
|---|---|---|---|---|---|
