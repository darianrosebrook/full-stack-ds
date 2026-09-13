/**
 * Framework-neutral emission-class substrate for the native targets
 * (SwiftUI, Jetpack Compose).
 *
 * An *emission class* is a structural fact about a component's IR — "this
 * component IS a projected-children action," "this component IS a static
 * content chrome box" — not a fact about any framework. Which classes a
 * target *realizes*, and in what order it prefers them, is target
 * capability; what the component IS is not. Predicates that are identical
 * across targets live here exactly once (precedent: swift's emitter
 * exported `isProjectedChildrenAction` for the jetpack action path with
 * "the IR owns this fact"; this module is that fact's durable home).
 *
 * Predicates that genuinely differ between targets (the jetpack
 * prop-text/expandable gates are broader than swift's) stay in their
 * emitters — a divergence there is capability information, and unifying it
 * would silently change one target's admitted set. What this module
 * guarantees is that every predicate the targets share word-for-word is
 * written once, and that the divergent ones compose from the same atoms
 * (`countChildrenLeaves`, `hasEssentialComponentInstance`) so drift is
 * visible at the dispatch site.
 *
 * Contract: pure functions over `ComponentIR`. No emitter imports a
 * component NAME from here — a class predicate that special-cases a name
 * is a missing IR fact (see AGENTS.md layer authority).
 */
import type { ComponentIR, DomNodeIR, NormalizedChannelIR } from "../ir.js";

/**
 * The projected-children action class: a native action affordance whose
 * entire content is the consumer's projected children.
 *
 * The class fact is *consumer content shape*, not literal child arity: an
 * action root the consumer fills with exactly one content region and no
 * named slots. Internal chrome around that region (Button's `spinner` and
 * `loadingText` parts) is not part of the class test, because native
 * targets synthesize their own loading affordance from the `loading` prop
 * rather than from `anatomy.dom`.
 *
 * The predicate previously required the root's sole child to be a bare
 * `children` node. That held only while the web DOM happened to project
 * children directly off the root; giving Button the spinner/loadingText
 * elements its contract has always declared (so those style carriers
 * become reachable) dropped Button out of every native emission class and
 * made `--target=all` throw. Web anatomy must not decide whether a native
 * target has a button.
 *
 * Named slots and a second content region are still rejected — those are
 * genuinely different composition classes, handled by composer paths.
 */
export function isProjectedChildrenAction(ir: ComponentIR): boolean {
  if (!ir.dom || ir.root.element !== "button") return false;
  // `ir.root.element` is derived from `a11y.role`, not from the dom — Chip
  // declares role "button" on a `<span>` root that owns two Button instances.
  // The action class needs the host to really be a button element.
  if (ir.dom.tag !== "button") return false;
  let contentRegions = 0;
  let namedSlots = 0;
  const walk = (node: DomNodeIR): void => {
    if (node.tag === "children") contentRegions += 1;
    if (node.tag === "slot") namedSlots += 1;
    for (const child of node.children ?? []) walk(child);
  };
  for (const child of ir.dom.children ?? []) walk(child);
  return contentRegions === 1 && namedSlots === 0;
}

/**
 * Count of `children` projection leaves in the dom tree — the atomic
 * measure behind the content-class predicates. A `children` node with its
 * own children is a wrapper, not a leaf.
 */
export function countChildrenLeaves(ir: ComponentIR): number {
  let count = 0;
  const walk = (node: DomNodeIR): void => {
    const kids = node.children ?? [];
    if (node.tag === "children" && kids.length === 0) count += 1;
    kids.forEach(walk);
  };
  if (ir.dom) walk(ir.dom);
  return count;
}

/**
 * Whether the dom tree holds a component-instance reference that is
 * essential (not a `decoration`-roled part). A contract-authored
 * decoration may degrade on a target without changing the component's
 * class; an essential instance means the component is a composer over
 * another component, which is a different class.
 */
export function hasEssentialComponentInstance(ir: ComponentIR): boolean {
  if (!ir.dom) return false;
  let hasInstance = false;
  const walk = (node: DomNodeIR): void => {
    if ((node as { componentRef?: string }).componentRef) {
      const role = ir.parts.find((part) => part.name === node.part)?.details?.role;
      if (role !== "decoration") hasInstance = true;
    }
    (node.children ?? []).forEach(walk);
  };
  walk(ir.dom);
  return hasInstance;
}

/**
 * The static-content class: a passive root (no channels, no surface, not
 * an action/control element) whose tree projects at most one consumer
 * content region and holds no essential component instances.
 *
 * One children leaf is the plain chrome-surrounds-content shape. Zero
 * leaves with no root content binding is a decorative box (Skeleton): its
 * purely internal children exist so the web can paint per-`lines` bars,
 * and requiring an empty child list made that web realization drop
 * Skeleton out of every emission class. A native decorative box does not
 * honor `lines` — a pre-existing, ledgered gap, not a class change.
 */
export function isStaticContent(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.behavior.normalizedChannels.length > 0) return false;
  if (ir.dom.tag === "button" || ir.dom.tag === "input") return false;
  if (hasEssentialComponentInstance(ir)) return false;
  if (ir.dom.tag === "img") return false;
  const childrenLeaves = countChildrenLeaves(ir);
  if (childrenLeaves === 1) return true;
  if (childrenLeaves === 0 && !ir.dom.content) {
    return true;
  }
  return false;
}

/** A bare rule leaf: an hr root with no children and no channels (Divider). */
export function isBareRuleLeaf(ir: ComponentIR): boolean {
  return (
    !!ir.dom &&
    ir.dom.tag === "hr" &&
    (ir.dom.children ?? []).length === 0 &&
    ir.behavior.normalizedChannels.length === 0 &&
    ir.surface == null
  );
}

/** A visual-only leaf: one childless span under a passive root (Spinner). */
export function isVisualOnlyLeaf(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.behavior.normalizedChannels.length > 0) return false;
  const children = ir.dom.children ?? [];
  if (children.length !== 1) return false;
  const child = children[0]!;
  return child.tag === "span" && (child.children ?? []).length === 0;
}

/**
 * The dom's single `input` element, when the tree holds exactly one and
 * projects no consumer content — the shape a native scalar control can
 * absorb whole. Returns null otherwise.
 *
 * The input need not be the root. Checkbox wraps its input in a `<label>`
 * beside a visual `indicator` span so those parts carry real style hooks on
 * the web; a native target collapses that whole group into one control, so
 * the wrapper is immaterial to the class. Requiring an input *root* made a
 * web anatomy repair silently drop Checkbox out of every native emission
 * class.
 *
 * Three conditions, each with its own witness:
 *
 * 1. The input is the root or a *direct* child of it. An input buried deeper
 *    belongs to some inner structure, not to this component as a whole —
 *    OTP's `field` sits under a `group` wrapper and Select's under its
 *    listbox search box. Neither is a scalar control the way Checkbox and
 *    Input are, and admitting them would swap their realization for a
 *    scalar control.
 * 2. The tree projects no consumer content. TextField pairs a direct-child
 *    input with named slot regions; it is a composer, and the composer
 *    class is what knows how to place those regions.
 * 3. That input is not iterated. A single iterated input renders N controls;
 *    collapsing it to one native control would silently drop N-1 of them.
 *    No corpus contract has this shape today, so the falsifier is synthetic.
 */
export function soleInputElement(dom: DomNodeIR): DomNodeIR | null {
  const candidates =
    dom.tag === "input"
      ? [dom]
      : (dom.children ?? []).filter((child) => child.tag === "input");
  if (candidates.length !== 1) return null;
  const input = candidates[0]!;
  if (input.iteration !== undefined) return null;

  let projections = 0;
  const walk = (node: DomNodeIR): void => {
    if (node.tag === "children" || node.tag === "slot") projections += 1;
    for (const child of node.children ?? []) walk(child);
  };
  walk(dom);
  return projections === 0 ? input : null;
}

/**
 * The single scalar (string or boolean) channel of an input-root control,
 * or null when the shape does not match. String lowers to a text control;
 * boolean lowers to a boolean (checkbox) control.
 */
export function soleValueChannel(ir: ComponentIR): NormalizedChannelIR | null {
  const scalar = ir.behavior.normalizedChannels.filter(
    (c) => c.valueType === "string" || c.valueType === "boolean",
  );
  return scalar.length === 1 ? scalar[0]! : null;
}

/**
 * The scalar value-control class: a dom tree whose single non-iterated
 * input absorbs the whole component, paired with exactly one scalar value
 * channel. `Checkbox` (boolean) and `Input` (string) are the corpus
 * consumers. The channel's `valueType` discriminates the realization; the
 * class membership is target-neutral.
 */
export function isValueChannelControl(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (soleInputElement(ir.dom) === null) return false;
  return soleValueChannel(ir) !== null;
}

/**
 * The glyph-host class: some dom node carries the iconGlyph fact (Icon,
 * NavTree). The component lowers to a registry lookup over the shared
 * glyph substrate; size hints from the IR map the size prop to the
 * rendered frame; decorative-by-default comes from the catalog semantics.
 *
 * The predicate is "any node carries iconGlyph," which is deliberately
 * greedy: NavTree matches because its item icons carry the fact, even
 * though its primary shape is a list. Admission is the allowlist's
 * decision, not the dispatch's — a target may decline to admit a
 * component whose best class has not landed (compose and NavTree).
 */
export function isGlyphHost(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  const stack = [ir.dom];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.iconGlyph) return true;
    stack.push(...(node.children ?? []));
  }
  return false;
}

/** The first iconGlyph fact in the dom walk, for emitters that lower it. */
export function domGlyph(
  ir: ComponentIR,
): NonNullable<ComponentIR["dom"]>["iconGlyph"] {
  const stack = [ir.dom!];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.iconGlyph) return node.iconGlyph;
    stack.push(...(node.children ?? []));
  }
  return undefined;
}

/**
 * The icon-decorated-content class: a passive root (no channels, no
 * surface) whose content is one consumer region beside an author-
 * addressable icon — a string icon prop (registry lookup) or a ReactNode
 * icon prop (consumer region). Status has neither (its glyph is
 * state-driven) and needs a status→glyph intent table instead.
 *
 * Exactly one children leaf, an icon part, and component-instance
 * children only under a dismiss part (its omission is documented).
 */
export function isIconDecoratedContent(ir: ComponentIR): boolean {
  if (!ir.dom || ir.surface != null) return false;
  if (ir.root.element !== "div" && ir.root.element !== "span") return false;
  if (ir.behavior.normalizedChannels.length > 0) return false;
  const hasIconProp = ir.styledProps.some(
    (p) => p.safeName === "icon" && (p.type === "string" || p.type === "ReactNode"),
  );
  if (!hasIconProp) return false;
  let childrenLeaves = 0;
  let hasIconPart = false;
  let strayInstance = false;
  const walk = (node: DomNodeIR): void => {
    if (node.part === "icon") hasIconPart = true;
    const isInstance = Boolean((node as { componentRef?: string }).componentRef);
    const isDismissPart = node.part === "dismiss";
    if (isInstance && !isDismissPart) strayInstance = true;
    const kids = node.children ?? [];
    if (node.tag === "children" && kids.length === 0) childrenLeaves += 1;
    kids.forEach(walk);
  };
  walk(ir.dom);
  return childrenLeaves === 1 && hasIconPart && !strayInstance;
}
