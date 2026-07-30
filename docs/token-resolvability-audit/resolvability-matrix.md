# Token-reference resolvability matrix

`RAIL-TOKEN-REFERENCE-RESOLVABILITY-01` — read-only. A generated stylesheet that reads `var(--fsds-x)` where nothing declares `--fsds-x` does not error: CSS falls back to the literal, so the binding renders a plausible value while the token layer is decorative for that property.

`declared as` names the kebab-cased spelling the token graph actually ships, when the miss is a casing seam. A blank there means the name is missing for some other reason and needs its own diagnosis.

Declarations in the graph: **876** · unresolvable references: **64** across **23** distinct name(s)

| name | components | silent fallback | declared as | token value | repair |
|---|---|---|---|---|---|
| `--fsds-core-dimension-actionMinHeight` | 2 (Button, Chip) | `36px` | `--fsds-core-dimension-action-min-height` | `36px` | value-preserving |
| `--fsds-core-dimension-actionMinHeightLarge` | 1 (Button) | `48px` | `--fsds-core-dimension-action-min-height-large` | `48px` | value-preserving |
| `--fsds-core-dimension-actionMinHeightSmall` | 1 (Button) | `28px` | `--fsds-core-dimension-action-min-height-small` | `28px` | value-preserving |
| `--fsds-semantic-color-background-accentSubtle` | 3 (Blockquote, Calendar, NavList) | `#95dafb` | `--fsds-semantic-color-background-accent-subtle` | `—` | needs diagnosis |
| `--fsds-semantic-color-foreground-linkHover` | 2 (Links, Truncate) | `#b31b1b` | `--fsds-semantic-color-foreground-link-hover` | `—` | needs diagnosis |
| `--fsds-semantic-color-foreground-linkVisited` | 1 (Links) | `#e55b5a` | `--fsds-semantic-color-foreground-link-visited` | `—` | needs diagnosis |
| `--fsds-semantic-glyph-badge-size-lg-fontSize` | 2 (Badge, Chip) | `14px` | `--fsds-semantic-glyph-badge-size-lg-font-size` | `14px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-lg-minHeight` | 2 (Badge, Chip) | `32px` | `--fsds-semantic-glyph-badge-size-lg-min-height` | `32px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-lg-paddingX` | 2 (Badge, Chip) | `12px` | `--fsds-semantic-glyph-badge-size-lg-padding-x` | `12px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-lg-paddingY` | 2 (Badge, Chip) | `4px` | `--fsds-semantic-glyph-badge-size-lg-padding-y` | `4px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-md-fontSize` | 3 (Badge, Chip, Status) | `12px` | `--fsds-semantic-glyph-badge-size-md-font-size` | `12px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-md-minHeight` | 3 (Badge, Chip, Status) | `24px` | `--fsds-semantic-glyph-badge-size-md-min-height` | `24px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-md-paddingX` | 3 (Badge, Chip, Status) | `8px` | `--fsds-semantic-glyph-badge-size-md-padding-x` | `8px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-md-paddingY` | 3 (Badge, Chip, Status) | `2px` | `--fsds-semantic-glyph-badge-size-md-padding-y` | `2px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-sm-fontSize` | 2 (Badge, Chip) | `10px` | `--fsds-semantic-glyph-badge-size-sm-font-size` | `10px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-sm-minHeight` | 2 (Badge, Chip) | `16px` | `--fsds-semantic-glyph-badge-size-sm-min-height` | `16px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-sm-paddingX` | 2 (Badge, Chip) | `4px` | `--fsds-semantic-glyph-badge-size-sm-padding-x` | `4px` | value-preserving |
| `--fsds-semantic-glyph-badge-size-sm-paddingY` | 2 (Badge, Chip) | `2px` | `--fsds-semantic-glyph-badge-size-sm-padding-y` | `2px` | value-preserving |
| `--fsds-semantic-interaction-stateLayer-hover` | 1 (NavList) | `0.04` | `--fsds-semantic-interaction-state-layer-hover` | `0.04` | value-preserving |
| `--fsds-semantic-interaction-stateLayer-selected` | 1 (NavList) | `0.08` | `--fsds-semantic-interaction-state-layer-selected` | `0.08` | value-preserving |
| `--fsds-semantic-shape-control-border-defaultWidth` | 17 (Accordion, Avatar, Badge, Button, …) | `1px` | `--fsds-semantic-shape-control-border-default-width` | `1px` | value-preserving |
| `--fsds-semantic-shape-control-border-focusWidth` | 5 (Accordion, Blockquote, Details, Sheet, …) | `2px` | `--fsds-semantic-shape-control-border-focus-width` | `2px` | value-preserving |
| `--fsds-semantic-spacing-gap-gridSmall` | 2 (Alert, AlertNotice) | `8px` | `--fsds-semantic-spacing-gap-grid-small` | `—` | needs diagnosis |
