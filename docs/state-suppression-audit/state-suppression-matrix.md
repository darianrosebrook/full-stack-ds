# State-suppression matrix

`RAIL-STATE-SUPPRESSION-01` — read-only. A contract that declares `suppresses.categories: ["interaction"]` claims that no interaction-state styling applies while suppressed. The CSS honours it only if every property set under an interaction pseudo is also set in the suppressing block (winning it back at equal specificity) or the interaction selector is guarded against the suppressed state.

Independent of the pseudo-state rail: a dimension can be **realized** (a `:disabled` block exists) and its suppression contract **violated** at the same time, which is why this is its own axis.

**Reachability.** On a native form-control root a natively-disabled element cannot match `:focus-visible` or `:active`, so those leaks are unreachable there; `:hover` still matches. On any other root the disabled state is an ARIA/class convention and every interaction pseudo is reachable.

Components declaring suppression: **16** · guarded: **1** · leaks: **45** (reachable: **15**)

| component | root | dim | pseudo | property | reachability |
|---|---|---|---|---|---|
| Accordion | `<div>` | `availability` | `:hover` | `background-color` | reachable |
| Accordion | `<div>` | `availability` | `:hover` | `color` | reachable |
| Accordion | `<div>` | `availability` | `:focus-visible` | `outline-width` | unreachable-not-focusable |
| Accordion | `<div>` | `availability` | `:focus-visible` | `outline-color` | unreachable-not-focusable |
| Accordion | `<div>` | `availability` | `:focus-visible` | `outline-offset` | unreachable-not-focusable |
| Accordion | `<div>` | `availability` | `:focus-visible` | `outline-style` | unreachable-not-focusable |
| Button | `<button>` | `availability` | `:hover` | `border-color` | reachable |
| Button | `<button>` | `availability` | `:focus-visible` | `border-color` | unreachable-disabled-not-focusable |
| Calendar | `<div>` | `availability` | `:hover` | `background-color` | reachable |
| Calendar | `<div>` | `availability` | `:hover` | `color` | reachable |
| Calendar | `<div>` | `availability` | `:focus-visible` | `outline-width` | unreachable-not-focusable |
| Calendar | `<div>` | `availability` | `:focus-visible` | `outline-color` | unreachable-not-focusable |
| Calendar | `<div>` | `availability` | `:focus-visible` | `outline-offset` | unreachable-not-focusable |
| Calendar | `<div>` | `availability` | `:focus-visible` | `outline-style` | unreachable-not-focusable |
| Chip | `<span>` | `availability` | `:hover` | `background-color` | reachable |
| Command | `<div>` | `availability` | `:hover` | `background-color` | reachable |
| Details | `<details>` | `availability` | `:hover` | `background-color` | reachable |
| Details | `<details>` | `availability` | `:hover` | `border-color` | reachable |
| Details | `<details>` | `availability` | `:focus-visible` | `outline-width` | unreachable-not-focusable |
| Details | `<details>` | `availability` | `:focus-visible` | `outline-color` | unreachable-not-focusable |
| Details | `<details>` | `availability` | `:focus-visible` | `outline-offset` | unreachable-not-focusable |
| Details | `<details>` | `availability` | `:focus-visible` | `outline-style` | unreachable-not-focusable |
| Input | `<input>` | `availability` | `:focus-visible` | `outline-width` | unreachable-disabled-not-focusable |
| Input | `<input>` | `availability` | `:focus-visible` | `outline-color` | unreachable-disabled-not-focusable |
| Input | `<input>` | `availability` | `:focus-visible` | `outline-style` | unreachable-disabled-not-focusable |
| Input | `<input>` | `availability` | `:focus-visible` | `outline-offset` | unreachable-disabled-not-focusable |
| Links | `<a>` | `availability` | `:hover` | `text-decoration-color` | reachable |
| Links | `<a>` | `availability` | `:focus-visible` | `outline-width` | reachable |
| Links | `<a>` | `availability` | `:focus-visible` | `outline-color` | reachable |
| Links | `<a>` | `availability` | `:focus-visible` | `outline-style` | reachable |
| Links | `<a>` | `availability` | `:focus-visible` | `outline-offset` | reachable |
| Links | `<a>` | `availability` | `:focus-visible` | `border-radius` | reachable |
| OTP | `<div>` | `availability` | `:focus-visible` | `border-color` | unreachable-not-focusable |
| OTP | `<div>` | `availability` | `:focus-visible` | `outline-width` | unreachable-not-focusable |
| OTP | `<div>` | `availability` | `:focus-visible` | `outline-color` | unreachable-not-focusable |
| OTP | `<div>` | `availability` | `:focus-visible` | `outline-style` | unreachable-not-focusable |
| OTP | `<div>` | `availability` | `:focus-visible` | `outline-offset` | unreachable-not-focusable |
| Select | `<div>` | `availability` | `:focus-visible` | `outline-width` | unreachable-not-focusable |
| Select | `<div>` | `availability` | `:focus-visible` | `outline-color` | unreachable-not-focusable |
| Select | `<div>` | `availability` | `:focus-visible` | `outline-style` | unreachable-not-focusable |
| Select | `<div>` | `availability` | `:focus-visible` | `outline-offset` | unreachable-not-focusable |
| ToggleSwitch | `<button>` | `availability` | `:focus-visible` | `outline-width` | unreachable-disabled-not-focusable |
| ToggleSwitch | `<button>` | `availability` | `:focus-visible` | `outline-color` | unreachable-disabled-not-focusable |
| ToggleSwitch | `<button>` | `availability` | `:focus-visible` | `outline-style` | unreachable-disabled-not-focusable |
| ToggleSwitch | `<button>` | `availability` | `:focus-visible` | `outline-offset` | unreachable-disabled-not-focusable |
