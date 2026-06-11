---
doc_id: REF-VARIANT-STYLE-MATRIX-001
authority: reference
status: draft
title: Variant-style realization matrix (measured)
owner: "@darianrosebrook"
updated: 2026-06-05
---

# Variant/style realization matrix

`VARIANT-STYLE-REALIZATION-AUDIT-01` — read-only. A variant VALUE is realized iff a `.<prefix>--<value>` selector exists in `<Name>.css` or `<Name>.tokens.css` (var re-scoping or direct property). The DEFAULT value is realized by the base rule and needs no per-value selector; only NON-DEFAULT values without a consuming selector are genuine gaps.

Components with variants: **36** · variant axes: **64** · values: **236** · unrealized non-default values: **24** · fully-dead axes: **5** · colliding components: **2**

## Variant-class collisions (axes that share a value → namespaced emission)

These axes share at least one value within the component, so a bare `.<prefix>--<value>` would be ambiguous. The codegen emits the namespaced class `.<prefix>--<axis>-<value>` for them, and realization is detected against that form. `VARIANT-CLASS-NAMESPACE-COLLISION-01`.

| component | colliding value | shared by axes (now namespaced) |
|---|---|---|
| Image | `sm` | `radius` × `size` |
| Image | `md` | `radius` × `size` |
| Image | `lg` | `radius` × `size` |
| Image | `full` | `radius` × `size` |
| List | `default` | `marker` × `variant` |
| List | `none` | `marker` × `spacing` |
| List | `sm` | `size` × `spacing` |
| List | `md` | `size` × `spacing` |
| List | `lg` | `size` × `spacing` |

## Failing — declared variant axis with no realization (fully-dead axes)

| component | axis | values (all unrealized) | default |
|---|---|---|---|
| Badge | `variant` | default, status, counter, tag | — |
| Blockquote | `variant` | default, bordered, highlighted | — |
| Chip | `variant` | default, selected, dismissible | — |
| Details | `variant` | default, inline, compact | — |
| Text | `weight` | light, normal, medium, semibold, bold | — |

## Review — partially-realized axes (some non-default values lack a selector)

| component | axis | unrealized non-default values |
|---|---|---|
| Divider | `orientation` | horizontal |
| Text | `variant` | display, headline, caption, overline, code |

## Full matrix (per component)

### Accordion  `.accordion`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `type` | single | single·(default) multiple✗ |

### Alert  `.alert`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `intent` | — | info✓ success✓ warning✓ danger✓ |
| `level` | — | inline✗ section✗ page✗ |

### AlertNotice  `.alert-notice`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `status` | — | info✓ success✓ warning✓ error✓ |
| `level` | — | page✗ section✗ inline✗ |

### Avatar  `.avatar`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | — | small✓ medium✓ large✓ extra-large✓ |

### Badge  `.badge`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `variant` | — | default✗ status✗ counter✗ tag✗ |
| `intent` | — | info✗ success✗ warning✗ danger✗ |
| `size` | — | sm✗ md✗ lg✗ |

### Blockquote  `.blockquote`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `variant` | — | default✗ bordered✗ highlighted✗ |
| `size` | — | sm✗ md✗ lg✗ |

### Button  `.button`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | medium | small✓ medium✓ large✓ |
| `variant` | primary | primary✓ secondary✓ tertiary✓ ghost✓ destructive✓ outline✓ |

### Calendar  `.calendar`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `mode` | single | single·(default) range✗ |

### Card  `.card`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `status` | — | completed✗ in-progress✗ planned✗ deprecated✗ category✗ complexity✗ |
| `density` | default | default·(default) inset✓ |

### Checkbox  `.checkbox`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | md | sm✗ md·(default) lg✗ |

### Chip  `.chip`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `variant` | — | default✗ selected✗ dismissible✗ |
| `size` | — | small✗ medium✗ large✗ |

### Details  `.details`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `variant` | — | default✗ inline✗ compact✗ |
| `icon` | — | left✗ right✗ none✗ |

### Dialog  `.dialog`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | md | sm✓ md·(default) lg✓ xl✓ full✓ |

### Divider  `.divider`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `orientation` | — | horizontal✗ vertical✓ |

### Field  `.field`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `status` | — | idle✗ validating✗ valid✓ invalid✓ |

### Image  `.image`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | — | xs✓ sm✓ md✓ lg✓ xl✓ full✓ |
| `radius` | — | none✓ sm✓ md✓ lg✓ full✓ |

### Links  `.links`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | — | small✗ medium✗ large✗ |

### List  `.list`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `as` | — | ul✗ ol✗ dl✗ |
| `variant` | default | default·(default) unstyled✓ inline✓ divided✓ spaced✓ |
| `marker` | default | default·(default) none✓ disc✓ circle✓ square✓ decimal✓ alpha✓ roman✓ |
| `spacing` | — | none✓ sm✓ md✓ lg✓ |
| `size` | — | sm✓ md✓ lg✓ |

### NavList  `.nav-list`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `orientation` | vertical | vertical·(default) horizontal✗ |

### OTP  `.otp`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `mode` | numeric | numeric·(default) alphanumeric✗ |

### Popover  `.popover`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `placement` | — | top✗ bottom✗ left✗ right✗ auto✗ |

### Postcard  `.postcard`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `type` | — | image✗ video✗ audio✗ |

### Progress  `.progress`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `variant` | — | linear✗ circular✗ |
| `size` | — | sm✗ md✗ lg✗ |
| `intent` | — | info✓ success✓ warning✓ danger✓ |

### Select  `.select`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | md | sm✓ md✓ lg✓ |
| `position` | — | bottom✗ top✗ auto✗ |

### Sheet  `.sheet`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `side` | right | top✓ right✓ bottom✓ left✓ |

### Skeleton  `.skeleton`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `variant` | block | block·(default) text✗ avatar✗ media✗ dataviz✗ actions✗ |
| `animate` | shimmer | shimmer·(default) wipe✗ pulse✗ none✗ |
| `density` | regular | compact✗ regular·(default) spacious✗ |

### Spinner  `.spinner`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | — | xs✓ sm✓ md✓ lg✓ |
| `thickness` | — | hairline✓ regular✓ bold✓ |

### Stat  `.stat`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | md | sm✓ md·(default) lg✓ |
| `trend` | — | up✓ down✓ neutral✓ |

### Status  `.status`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `status` | — | info✗ success✗ warning✗ danger✗ error✗ |

### Switch  `.switch`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | md | sm✓ md·(default) lg✓ |

### Tabs  `.tabs`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `orientation` | horizontal | horizontal·(default) vertical✗ |
| `appearance` | underline | underline·(default) pills✓ |
| `activationMode` | automatic | automatic·(default) manual✗ |

### Text  `.text`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `variant` | — | display✗ headline✗ title✓ body✓ caption✗ overline✗ code✗ |
| `size` | — | xs✗ sm✗ md✗ lg✗ xl✗ 2xl✗ 3xl✗ |
| `weight` | — | light✗ normal✗ medium✗ semibold✗ bold✗ |
| `align` | — | left✗ center✗ right✗ justify✗ |
| `transform` | — | none✗ uppercase✗ lowercase✗ capitalize✗ |

### Toast  `.toast`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `variant` | info | info·(default) success✓ warning✓ error✓ |
| `politeness` | polite | polite·(default) assertive✗ |

### ToggleSwitch  `.toggle-switch`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `size` | medium | small✗ medium·(default) large✗ |

### Tooltip  `.tooltip`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `placement` | — | top✗ bottom✗ left✗ right✗ auto✗ |

### Walkthrough  `.walkthrough`

| axis | default | values (✓ realized · ✗ gap · ·default) |
|---|---|---|
| `placement` | auto | top✗ bottom✗ left✗ right✗ auto·(default) |

