/**
 * Beyond-schema (cross-field) contract validation.
 *
 * JSON Schema can describe one field's shape in isolation, but it can't
 * express "this channel's value field must reference a prop that exists
 * elsewhere in this same contract." Those cross-field invariants live
 * here and run as a second pass after AJV.
 *
 * Doctrinal stance: this validator never modifies contracts. It produces
 * a flat list of ValidationIssue records using the same pointer-and-
 * message shape AJV uses, so the CLI's `formatIssues` renders them the
 * same way. An empty list means the contract is semantically consistent.
 *
 * Rules cover three classes of bug the cleanup-batch pass surfaced:
 *
 *   (1) Cross-reference rules: a field names something that has to
 *       exist elsewhere in the same contract.
 *         - anatomy.details keys ⊆ anatomy.parts
 *         - relationships[*].{from,to} ⊆ anatomy.parts
 *         - channels[*].{value,defaultValue,onChange} ⊆ prop names
 *         - events[*].emittedVia[*] ⊆ prop names
 *         - form.<bucket>.via[*] of form `prop:<name>` ⊆ prop names
 *         - stateMachine.transitions[*].{from,to} ⊆ states (when
 *           dimensional form is used).
 *
 *   (2) Layer-conditional rules: certain fields must be present (or
 *       must be absent) given the contract's authored layer.
 *         - composers must declare focus + non-empty channels
 *         - primitives must NOT carry dismissal, portal.enabled=true,
 *           or focus.strategy=trap/roving
 *         - compounds must NOT carry channels
 *
 *   (3) Anatomy/dom binding rules:
 *         - bindings of form `channel:<name>.<field>` and `prop:<name>`
 *           must reference channels/props that actually exist.
 *
 * Composers' channel-driven state is too narrow to enforce universally
 * (Checkbox/Switch are blueprint-named primitives that legitimately
 * carry one channel), so the primitive-channel restriction is NOT a
 * rule. The blueprint draws the line at multi-step orchestration, not
 * the presence of any channel.
 *
 *   (4) Cross-axis obligation rules (docs/architecture/contract-group-axes.md, the
 *       "Obligation rules" section). These prove that *combinations*
 *       across the contract's axes are coherent, not just that each
 *       axis is individually shaped. Each emits a typed diagnostic
 *       whose message is prefixed with a stable [CODE] so consumers can
 *       match on the obligation family without a CLI/format change.
 *         - OBLIGATION_INPUT_NO_DATA_BINDING: a `category: "input"`
 *           component must carry a `form` block or `channels` (or a
 *           documented display-only exception via a `usageHints` entry
 *           starting "display-only:"). An input that participates in no
 *           data binding and isn't declared display-only is incoherent.
 *         - OBLIGATION_SURFACE_DISMISSAL_NO_FOCUS_POLICY: a
 *           `category: "surface"` component that *can be dismissed*
 *           (a non-empty dismissal contract, or a surface.dismissal
 *           mode list) must also declare a `focus` block AND an
 *           escape/outside-click dismissal affordance. A dismissable
 *           surface with no focus policy strands keyboard users; one
 *           with no escape/outside-click can only be closed
 *           programmatically. Surfaces with NO dismissal are exempt.
 *         - OBLIGATION_A2UI_CHILDREN_NO_HOST: an `a2ui.children.slot`
 *           that names a *specific* host must resolve to a real hosting
 *           surface — a `slots` map key, an `anatomy.parts` entry, or an
 *           `anatomy.details` key. The reserved default-slot sentinels
 *           "children"/"default" always resolve (they map to the IR's
 *           unnamed `tag:"slot"`/`tag:"children"` placeholder), so a
 *           plain `slot: "children"` is never flagged.
 *
 * The obligation rules are CONDITIONAL by construction: they fire only
 * on genuinely incoherent combinations, so the existing coherent corpus
 * passes unchanged. They surface latent incoherence; they never rewrite
 * the contract to hide it.
 */

import type { ComponentContract } from "../contract.js";
import type { ValidationIssue } from "../validate.js";

export function validateContractSemantics(
  contract: ComponentContract,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Build the lookup sets the rules consult, once per contract.
  const parts = anatomyParts(contract);
  const propNames = collectPropNames(contract);
  const channelNames = new Set(Object.keys(contract.channels ?? {}));
  const stateDimensions = collectStateDimensions(contract);

  // --- Rule 1: anatomy.details keys ⊆ anatomy.parts -----------------
  if (typeof contract.anatomy === "object" && !Array.isArray(contract.anatomy)) {
    const details = contract.anatomy.details ?? {};
    for (const key of Object.keys(details)) {
      if (!parts.has(key)) {
        issues.push({
          pointer: `/anatomy/details/${key}`,
          message: `references part "${key}" which is not declared in anatomy.parts`,
        });
      }
    }
  }

  // --- Rule 2: relationships[*].{from,to} ⊆ anatomy.parts -----------
  for (const [index, rel] of (contract.relationships ?? []).entries()) {
    if (rel && typeof rel === "object") {
      if (rel.from && !parts.has(rel.from)) {
        issues.push({
          pointer: `/relationships/${index}/from`,
          message: `references part "${rel.from}" which is not declared in anatomy.parts`,
        });
      }
      if (rel.to && !parts.has(rel.to)) {
        issues.push({
          pointer: `/relationships/${index}/to`,
          message: `references part "${rel.to}" which is not declared in anatomy.parts`,
        });
      }
    }
  }

  // --- Rule 3: channels[*].{value,defaultValue,onChange} ⊆ prop names
  for (const [chanName, chan] of Object.entries(contract.channels ?? {})) {
    if (chan && typeof chan === "object") {
      for (const field of ["value", "defaultValue", "onChange"] as const) {
        const ref = (chan as unknown as Record<string, unknown>)[field];
        if (typeof ref === "string" && ref.length > 0 && !propNames.has(ref)) {
          issues.push({
            pointer: `/channels/${chanName}/${field}`,
            message: `references prop "${ref}" which is not declared in any props bucket`,
          });
        }
      }
    }
  }

  // --- Rule 4: events[*].emittedVia[*] ⊆ prop names -----------------
  for (const [evtName, evt] of Object.entries(
    (contract.events ?? {}) as Record<string, { emittedVia?: unknown }>,
  )) {
    if (evt && typeof evt === "object" && Array.isArray(evt.emittedVia)) {
      for (const [index, propRef] of evt.emittedVia.entries()) {
        if (typeof propRef === "string" && !propNames.has(propRef)) {
          issues.push({
            pointer: `/events/${evtName}/emittedVia/${index}`,
            message: `references prop "${propRef}" which is not declared in any props bucket`,
          });
        }
      }
    }
  }

  // --- Rule 5: form.<bucket>.via[*] of form `prop:<name>` ----------
  // `via` can appear under form.labeling, form.descriptions,
  // form.errors, form.validation, etc. — walk the form contract
  // recursively looking for it.
  walkVia(contract.form, propNames, issues, "/form");

  // --- Rule 6: stateMachine.transitions[*].{from,to} ⊆ states ------
  // Only enforced when states is in dimensional form AND
  // stateDimensions is non-empty (the dimensional form's
  // dimension-value strings, "<dimension>=<value>", are what
  // transitions reference).
  if (stateDimensions !== null) {
    const machine = contract.stateMachine;
    for (const [index, tr] of (machine?.transitions ?? []).entries()) {
      if (tr && typeof tr === "object") {
        if (tr.from !== undefined) {
          const sources = Array.isArray(tr.from) ? tr.from : [tr.from];
          for (const [si, src] of sources.entries()) {
            if (typeof src === "string" && !stateDimensions.has(src)) {
              issues.push({
                pointer: `/stateMachine/transitions/${index}/from${Array.isArray(tr.from) ? `/${si}` : ""}`,
                message: `references state "${src}" not declared in states.dimensions (expect "<dimension>=<value>" form)`,
              });
            }
          }
        }
        if (typeof tr.to === "string" && !stateDimensions.has(tr.to)) {
          issues.push({
            pointer: `/stateMachine/transitions/${index}/to`,
            message: `references state "${tr.to}" not declared in states.dimensions (expect "<dimension>=<value>" form)`,
          });
        }
      }
    }
  }

  // --- Rule 7: anatomy.dom bindings reference real channels/props ---
  if (typeof contract.anatomy === "object" && !Array.isArray(contract.anatomy)) {
    walkDomBindings(
      contract.anatomy.dom,
      propNames,
      channelNames,
      issues,
      "/anatomy/dom",
    );
  }

  // --- Layer-conditional rules -------------------------------------
  const layer = contract.layer;

  if (layer === "composer") {
    // 8a: composers must declare a focus block with a strategy.
    const strat = contract.focus?.strategy;
    if (!strat) {
      issues.push({
        pointer: "/focus",
        message:
          'composer must declare focus.strategy (one of "trap" | "roving" | "auto" | "manual" | "none")',
      });
    }
    // 8b: composers must declare at least one channel.
    if (channelNames.size === 0) {
      issues.push({
        pointer: "/channels",
        message:
          "composer must declare at least one channel — orchestrated state is what makes a composer a composer",
      });
    }
  }

  if (layer === "primitive") {
    // 9a: primitives must not declare a non-empty dismissal contract.
    const dismissal = contract.dismissal;
    const hasDismissal = Array.isArray(dismissal)
      ? dismissal.length > 0
      : Boolean(dismissal && typeof dismissal === "object" && dismissal.triggers && dismissal.triggers.length > 0);
    if (hasDismissal) {
      issues.push({
        pointer: "/dismissal",
        message: "primitive must not declare dismissal — close behavior is a composer concern",
      });
    }
    // 9b: primitives must not portal.
    if (contract.portal?.enabled === true) {
      issues.push({
        pointer: "/portal/enabled",
        message: "primitive must not enable portal — overlay rendering is a composer concern",
      });
    }
    // 9c: primitives must not trap or rove focus.
    if (contract.focus?.strategy === "trap" || contract.focus?.strategy === "roving") {
      issues.push({
        pointer: "/focus/strategy",
        message: `primitive must not use focus.strategy="${contract.focus.strategy}" — focus orchestration is a composer concern`,
      });
    }
  }

  if (layer === "compound") {
    // 10: compounds must not declare channels.
    if (channelNames.size > 0) {
      issues.push({
        pointer: "/channels",
        message: "compound must not declare channels — state orchestration is a composer concern",
      });
    }
  }

  // --- Cross-axis obligation rules ---------------------------------
  // (docs/architecture/contract-group-axes.md "Obligation rules"). Coherent
  // combinations across axes, not just per-axis shape. Each pushes a
  // [CODE]-prefixed message so the family is greppable through the
  // existing formatIssues path.
  const contractRecord = contract as unknown as Record<string, unknown>;
  const category =
    typeof contractRecord.category === "string"
      ? (contractRecord.category as string)
      : undefined;

  // R-INPUT: category:input must bind data (form or channels) or be a
  // documented display-only exception.
  if (category === "input") {
    const hasForm =
      typeof contract.form === "object" && contract.form !== null;
    const hasChannels = channelNames.size > 0;
    if (!hasForm && !hasChannels && !hasDocumentedDisplayOnly(contract)) {
      issues.push({
        pointer: "/category",
        message:
          '[OBLIGATION_INPUT_NO_DATA_BINDING] category "input" must declare a form block or channels (data participation), ' +
          'or document a display-only exception via a usageHints entry beginning "display-only:". ' +
          "An input that binds no data and isn't declared display-only is incoherent.",
      });
    }
  }

  // R-SURFACE: a dismissable surface must declare a focus policy AND an
  // escape/outside-click dismissal affordance. Surfaces with no
  // dismissal are exempt (the obligation is conditional on dismissal).
  if (category === "surface" && hasDismissal(contract)) {
    if (!hasFocusPolicy(contract)) {
      issues.push({
        pointer: "/focus",
        message:
          "[OBLIGATION_SURFACE_DISMISSAL_NO_FOCUS_POLICY] a dismissable surface must declare a focus block " +
          "(strategy / initialFocus / returnFocus) — otherwise keyboard focus is stranded when the surface opens and closes.",
      });
    }
    if (!hasEscapeOrOutsideClickDismissal(contract)) {
      issues.push({
        pointer: "/dismissal",
        message:
          "[OBLIGATION_SURFACE_DISMISSAL_NO_FOCUS_POLICY] a dismissable surface must offer an escape or outside-click " +
          "dismissal affordance (dismissal.triggers[].event of escape/overlayClick/outsideClick, or surface.dismissal of escape/outside-click) — " +
          "otherwise the surface can only be closed programmatically.",
      });
    }
  }

  // R-A2UI: a2ui.children.slot naming a SPECIFIC host must resolve to a
  // real hosting surface. The default-slot sentinels resolve implicitly.
  const childSlot = contract.a2ui?.children?.slot;
  if (typeof childSlot === "string" && !isDefaultSlotSentinel(childSlot)) {
    const hosts = hostingSurfaces(contract);
    if (!hosts.has(childSlot)) {
      issues.push({
        pointer: "/a2ui/children/slot",
        message:
          `[OBLIGATION_A2UI_CHILDREN_NO_HOST] a2ui.children.slot "${childSlot}" resolves to no hosting surface — ` +
          "it matches no slots map key, anatomy.parts entry, or anatomy.details key. " +
          'Declare the slot/anatomy host, or use the default slot "children".',
      });
    }
  }

  return issues;
}

// ---------- helpers ------------------------------------------------

function anatomyParts(contract: ComponentContract): Set<string> {
  const a = contract.anatomy;
  if (!a) return new Set();
  if (Array.isArray(a)) return new Set(a);
  return new Set(a.parts ?? []);
}

// ---------- obligation-rule helpers --------------------------------

/**
 * The reserved default-slot sentinels. `a2ui.children.slot` set to one
 * of these maps to the IR's unnamed `tag:"slot"` / `tag:"children"`
 * placeholder (see ir.ts: "Slot/children placement"), so it always
 * resolves — no named host is required.
 */
function isDefaultSlotSentinel(slot: string): boolean {
  return slot === "children" || slot === "default";
}

/**
 * The names a child slot may legitimately resolve to: declared slot
 * anchors, anatomy parts, and anatomy.details keys. These are the
 * hosting surfaces a child can be projected into.
 */
function hostingSurfaces(contract: ComponentContract): Set<string> {
  const hosts = new Set<string>(anatomyParts(contract));
  const a = contract.anatomy;
  if (a && typeof a === "object" && !Array.isArray(a)) {
    for (const key of Object.keys(a.details ?? {})) hosts.add(key);
  }
  const slots = (contract as unknown as Record<string, unknown>).slots;
  if (slots && typeof slots === "object" && !Array.isArray(slots)) {
    for (const key of Object.keys(slots)) hosts.add(key);
  }
  return hosts;
}

/**
 * True when the contract carries a documented display-only exception
 * for the input-data-binding obligation: a `usageHints` entry that
 * begins "display-only:". This is the explicit "this input-categorized
 * component intentionally binds no data" channel — point-in-time
 * documentation, not a blanket silencer.
 */
function hasDocumentedDisplayOnly(contract: ComponentContract): boolean {
  const hints = contract.a2ui?.usageHints;
  if (!Array.isArray(hints)) return false;
  return hints.some(
    (h) => typeof h === "string" && h.trimStart().startsWith("display-only:"),
  );
}

/**
 * True when the contract can be dismissed: either a structured
 * dismissal contract with at least one trigger, a legacy flat dismissal
 * array, or a surface.dismissal mode list. Mirrors the dual-form
 * handling the existing primitive-dismissal rule (9a) uses.
 */
function hasDismissal(contract: ComponentContract): boolean {
  const d = contract.dismissal;
  if (Array.isArray(d)) {
    if (d.length > 0) return true;
  } else if (d && typeof d === "object") {
    if (Array.isArray(d.triggers) && d.triggers.length > 0) return true;
  }
  const surfaceModes = contract.surface?.dismissal;
  return Array.isArray(surfaceModes) && surfaceModes.length > 0;
}

/**
 * True when the contract declares a focus policy: a `focus` object with
 * any of the policy fields a dismissable surface needs (strategy,
 * initialFocus, returnFocus). A bare empty `focus: {}` does not count.
 */
function hasFocusPolicy(contract: ComponentContract): boolean {
  const f = contract.focus;
  if (!f || typeof f !== "object") return false;
  return (
    typeof f.strategy === "string" ||
    typeof f.initialFocus === "string" ||
    typeof f.returnFocus === "string"
  );
}

/**
 * True when the contract offers an escape or outside-click dismissal
 * affordance, in either the dismissal-trigger vocabulary
 * (escape/overlayClick/outsideClick) or the surface.dismissal mode
 * vocabulary (escape/outside-click).
 */
function hasEscapeOrOutsideClickDismissal(contract: ComponentContract): boolean {
  const triggerEvents = new Set(["escape", "overlayClick", "outsideClick"]);
  const d = contract.dismissal;
  if (Array.isArray(d)) {
    if (d.some((e) => triggerEvents.has(e))) return true;
  } else if (d && typeof d === "object" && Array.isArray(d.triggers)) {
    if (d.triggers.some((t) => t && triggerEvents.has(t.event))) return true;
  }
  const surfaceModes = contract.surface?.dismissal;
  if (Array.isArray(surfaceModes)) {
    if (surfaceModes.some((m) => m === "escape" || m === "outside-click")) {
      return true;
    }
  }
  return false;
}

function collectPropNames(contract: ComponentContract): Set<string> {
  const names = new Set<string>();
  for (const bucket of Object.values(contract.props ?? {})) {
    for (const m of bucket?.members ?? []) {
      if (m && typeof m === "object" && typeof m.name === "string") {
        names.add(m.name);
      }
    }
  }
  return names;
}

/**
 * Return the set of "<dimension>=<value>" strings declared by the
 * contract's states block. Returns null when the contract omits states —
 * there is then no dimension/value pairing to cross-check stateMachine
 * references against. (States are always the dimensional object form.)
 */
function collectStateDimensions(contract: ComponentContract): Set<string> | null {
  const s = contract.states;
  if (!s) return null;
  const out = new Set<string>();
  for (const [dim, def] of Object.entries(s.dimensions ?? {})) {
    if (def && Array.isArray(def.values)) {
      for (const v of def.values) {
        out.add(`${dim}=${v}`);
      }
    }
  }
  return out;
}

/**
 * Recursively walk the form contract looking for `via: string[]`
 * entries; flag any `prop:<name>` reference whose `<name>` is missing
 * from propNames.
 */
function walkVia(
  node: unknown,
  propNames: Set<string>,
  issues: ValidationIssue[],
  pointer: string,
): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const [i, item] of node.entries()) {
      walkVia(item, propNames, issues, `${pointer}/${i}`);
    }
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    const childPointer = `${pointer}/${key}`;
    if (key === "via" && Array.isArray(value)) {
      for (const [i, entry] of value.entries()) {
        if (typeof entry === "string" && entry.startsWith("prop:")) {
          const ref = entry.slice("prop:".length);
          if (!propNames.has(ref)) {
            issues.push({
              pointer: `${childPointer}/${i}`,
              message: `references prop "${ref}" which is not declared in any props bucket`,
            });
          }
        }
      }
    } else if (typeof value === "object" && value !== null) {
      walkVia(value, propNames, issues, childPointer);
    }
  }
}

/**
 * Walk the anatomy.dom tree and flag any binding of form
 * `channel:<name>.<field>` whose `<name>` doesn't reference a real
 * channel, or `prop:<name>` whose `<name>` doesn't reference a real
 * prop. Bindings live under each node's `bindings` and `on` records.
 */
function walkDomBindings(
  node: unknown,
  propNames: Set<string>,
  channelNames: Set<string>,
  issues: ValidationIssue[],
  pointer: string,
): void {
  walkDomBindingsScoped(node, propNames, channelNames, issues, pointer, propNames);
}

/**
 * Recursive worker for walkDomBindings. `inScope` is the set of names a
 * `prop:X` reference may resolve to at the CURRENT subtree depth — the
 * union of declared component props (`propNames`) plus any iteration
 * aliases (`indexVar`, `itemVar`) introduced by enclosing `iterate`
 * declarations. Extending the scope when descending into an iterated
 * node mirrors the IR's `validateDomNode` rule
 * (IR-DOM-ITERATE-CAPABILITY-01) so this semantic checker and the
 * IR-build-time checker agree on what `prop:` may reference. The
 * iterate.source itself remains validated against the outer scope
 * (it cannot reference the names it introduces).
 */
function walkDomBindingsScoped(
  node: unknown,
  propNames: Set<string>,
  channelNames: Set<string>,
  issues: ValidationIssue[],
  pointer: string,
  inScope: Set<string>,
): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const [i, child] of node.entries()) {
      walkDomBindingsScoped(
        child,
        propNames,
        channelNames,
        issues,
        `${pointer}/${i}`,
        inScope,
      );
    }
    return;
  }

  // IR-DOM-ITERATE-CAPABILITY-01: extend the in-scope name set for THIS
  // node and every descendant when `iterate` is declared. The iterate
  // source must still resolve in the OUTER scope — validate it before
  // extending. itemVar/indexVar defaults match parseIterate in ir.ts.
  const iterate = (node as Record<string, unknown>).iterate;
  let nodeScope = inScope;
  if (iterate && typeof iterate === "object" && !Array.isArray(iterate)) {
    const it = iterate as Record<string, unknown>;
    if (typeof it.source === "string" && it.source.startsWith("prop:")) {
      const sourceProp = it.source.slice("prop:".length);
      if (!propNames.has(sourceProp)) {
        issues.push({
          pointer: `${pointer}/iterate/source`,
          message: `references prop "${sourceProp}" which is not declared in any props bucket`,
        });
      }
    }
    const indexVar = typeof it.indexVar === "string" ? it.indexVar : "index";
    const itemVar =
      it.kind === "array"
        ? typeof it.itemVar === "string"
          ? it.itemVar
          : "item"
        : undefined;
    nodeScope = new Set(inScope);
    nodeScope.add(indexVar);
    if (itemVar !== undefined) nodeScope.add(itemVar);
  }

  for (const map of ["bindings", "on"] as const) {
    const record = (node as Record<string, unknown>)[map];
    if (record && typeof record === "object") {
      for (const [attr, expr] of Object.entries(record as Record<string, unknown>)) {
        if (typeof expr !== "string") continue;
        if (expr.startsWith("channel:")) {
          const after = expr.slice("channel:".length);
          const chanName = after.split(".")[0];
          if (!channelNames.has(chanName)) {
            issues.push({
              pointer: `${pointer}/${map}/${attr}`,
              message: `references channel "${chanName}" which is not declared in contract.channels`,
            });
          }
        } else if (expr.startsWith("prop:")) {
          const propRef = expr.slice("prop:".length);
          if (!nodeScope.has(propRef)) {
            issues.push({
              pointer: `${pointer}/${map}/${attr}`,
              message: `references prop "${propRef}" which is not declared in any props bucket`,
            });
          }
        }
      }
    }
  }
  const children = (node as Record<string, unknown>).children;
  if (Array.isArray(children)) {
    for (const [i, child] of children.entries()) {
      walkDomBindingsScoped(
        child,
        propNames,
        channelNames,
        issues,
        `${pointer}/children/${i}`,
        nodeScope,
      );
    }
  }
}
