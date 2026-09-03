# Web-DOM style-carrier reachability

`RAIL-WEB-STYLE-CARRIER-REACHABILITY-01` — an authored style selector may claim only a component-owned carrier the Web-DOM IR can produce. Carrier vocabulary comes from `deriveWebDomCarriers` (IR authority: `classRecipe` for modifier spelling, the `anatomy.dom` walk for part carriers, `expandOptionsForContract` for `data-*` markers). This script re-implements none of it.

**What a row means:** authored CSS requires a carrier the current realization does not produce, so the rule matches nothing. **What it does not mean:** that the contract side is stale. Resolution may be selector repair, realization repair, or independently justified contract retirement — adjudicate per case (`FIX-DEAD-SLOT-UNRENDERED-PART-AUTHORITY-01`).

**Non-claims.** A reachable carrier proves only that a rule has a producible attachment point. It does not prove the rule wins the cascade, changes computed style, supplies content the part needs, or realizes the intended visual distinction. Pseudo-class host satisfiability, `aria-*` truth and suppression guards stay with the element-awareness and pseudo-state rails. Contracts with no `anatomy.dom` (Card, Popover, Tooltip) have an UNKNOWN producible part set and are skipped for part carriers: absence of information is not evidence of a defect.

**Direction.** This rail asks only whether authored CSS demands an impossible carrier. An emitted variant class with no matching CSS rule is the inverse problem and lives in `scripts/variant-style-audit/`.

Findings: **0** across **0** component(s).

| component | styles key | expands to | unreachable carrier | kind |
|---|---|---|---|---|
