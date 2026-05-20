/**
 * Svelte emitter — Anchored Presence Surface path.
 *
 * Activated for any contract whose IR has a `surface` block of an
 * anchored-presence kind (Tooltip, Popover, ...). Surface kind
 * eligibility is decided by `isAnchoredPresenceKind` in shared
 * semantics, and per-kind policy (`AnchoredSurfacePolicy`) drives
 * default content role and public dismissal props. This emitter
 * MUST NOT branch on component identity or on `surface.kind` for
 * any rule that could be expressed by the policy.
 *
 * Emits the compound API:
 *
 *   <Tooltip>
 *     <TooltipTrigger>Save</TooltipTrigger>
 *     <TooltipContent>Save the document</TooltipContent>
 *   </Tooltip>
 *
 * Host-adoption uses a split binding (`action` + `attrs`) delivered
 * through the consumer's `child` snippet, because Svelte cannot
 * spread a `use:` action or `bind:this` through a parameter object:
 *
 *   <PopoverTrigger>
 *     {#snippet child(trigger)}
 *       <a href="#help" use:trigger.action {...trigger.attrs}>
 *         Open
 *       </a>
 *     {/snippet}
 *   </PopoverTrigger>
 *
 * The snippet receives the WHOLE trigger object (`{ action, attrs }`)
 * so the split is explicit at the call site. Logically atomic
 * (consumer MUST use both or the substrate breaks); physically split
 * because Svelte's two channels (`use:` and spread) can't share an
 * object. In adoption mode the controller runs in handlerMode so
 * anchor-side DOM listeners are not double-installed.
 *
 * Bypasses the legacy `ir.dom` and compound-state-container paths
 * entirely — this is forward-facing replacement, not augmentation.
 */
import type { ComponentIR, SurfaceIR } from "../../ir.js";
import {
  isAnchoredPresenceKind,
  resolveAnchoredSurfacePolicy,
  type AnchoredSurfacePolicy,
  type PublicDismissalProp,
} from "../../semantics.js";

export interface SvelteSurfaceFiles {
  rootSfc: string;
  triggerSfc: string;
  contentSfc: string;
  composable: string;
}

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface !== undefined && isAnchoredPresenceKind(ir.surface.kind);
}

export function generateSvelteSurfaceFiles(ir: ComponentIR): SvelteSurfaceFiles {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateSvelteSurfaceFiles called on ${ir.name} without ir.surface`,
    );
  }
  const policy = resolveAnchoredSurfacePolicy(surface);
  return {
    rootSfc: emitRootSfc(ir, surface, policy),
    triggerSfc: emitTriggerSfc(ir, surface),
    contentSfc: emitContentSfc(ir, surface, policy),
    composable: emitComposable(ir, surface, policy),
  };
}

function emitRootSfc(
  ir: ComponentIR,
  _surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const placementValues = ir.variants["placement"];
  const placementTypeAlias = placementValues
    ? `type ${name}Placement = ${placementValues.map((v) => `"${v}"`).join(" | ")};\n`
    : "";

  // Policy-derived consumer-facing dismissal-mode flags
  // (closeOnEscape / closeOnBlur / closeOnOutsideClick / ...).
  // Only modes whose prop is non-null become consumer props.
  const dismissalProps = policy.publicDismissalProps.filter(
    (spec): spec is PublicDismissalProp & { prop: string } => spec.prop !== null,
  );
  const closeOnPropLines = dismissalProps.map(
    (spec) => `  ${spec.prop}?: boolean;`,
  );
  const closeOnDestructureLines = dismissalProps.map((spec) => `  ${spec.prop},`);
  const closeOnGetterLines = dismissalProps.map(
    (spec) => `  ${spec.prop}: () => ${spec.prop},`,
  );

  return [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import { use${name}, provide${name}Context } from "./use${name}.svelte.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start types`,
    placementTypeAlias.trimEnd(),
    `// @generated:end`,
    ``,
    `// @custom:start types`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start props`,
    `interface Props {`,
    `  open?: boolean;`,
    `  defaultOpen?: boolean;`,
    `  onOpenChange?: (open: boolean) => void;`,
    placementValues ? `  placement?: ${name}Placement;` : "",
    `  disabled?: boolean;`,
    ...closeOnPropLines,
    `  class?: string;`,
    `  "data-testid"?: string;`,
    `  children?: import('svelte').Snippet;`,
    `}`,
    ``,
    `let {`,
    `  open,`,
    `  defaultOpen,`,
    `  onOpenChange,`,
    placementValues ? `  placement,` : "",
    `  disabled,`,
    ...closeOnDestructureLines,
    `  class: className,`,
    `  "data-testid": dataTestid,`,
    `  children,`,
    `}: Props = $props();`,
    `// @generated:end`,
    ``,
    `// @generated:start hook`,
    `// Pass all reactive props as getters so Svelte 5 doesn't warn`,
    `// about state captured at initialization time.`,
    `const surface = use${name}({`,
    `  open: () => open,`,
    `  defaultOpen: () => defaultOpen,`,
    `  onOpenChange: (next) => onOpenChange?.(next),`,
    `  disabled: () => disabled === true,`,
    ...closeOnGetterLines,
    `});`,
    ``,
    `provide${name}Context(surface);`,
    `// @generated:end`,
    ``,
    `// @generated:start classes`,
    `const classes = $derived(`,
    `  [`,
    `    "${cssPrefix}",`,
    placementValues ? `    placement ? \`${cssPrefix}--\${placement}\` : null,` : "",
    `    disabled ? "${cssPrefix}--disabled" : null,`,
    `    className,`,
    `  ].filter(Boolean).join(" ")`,
    `);`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `<span class={classes} data-testid={dataTestid}>`,
    `  {@render children?.()}`,
    `</span>`,
    ``,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function emitTriggerSfc(ir: ComponentIR, _surface: SurfaceIR): string {
  const name = ir.name;
  return [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import type { Snippet } from "svelte";`,
    `import { use${name}Context } from "./use${name}.svelte.js";`,
    `import type { SurfaceTriggerProps } from "../../primitives/surfaces/createAnchoredSurface.svelte.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start props`,
    `interface Props {`,
    `  /** When true, the consumer takes over the host element via`,
    `   *  the \`child\` snippet prop, which receives the whole`,
    `   *  \`trigger\` object (\`{ action, attrs }\`). When false`,
    `   *  (default), a \`<button>\` is rendered around the implicit`,
    `   *  \`children\` snippet. */`,
    `  asChild?: boolean;`,
    `  class?: string;`,
    `  "data-testid"?: string;`,
    `  /** Default-host content (used when asChild is false). */`,
    `  children?: Snippet;`,
    `  /** Host-adoption snippet (used when asChild is true). Receives`,
    `   *  the trigger object \`{ action, attrs }\`. The consumer applies`,
    `   *  \`use:trigger.action\` and spreads \`{...trigger.attrs}\` on`,
    `   *  the adopted element. Applying one without the other will`,
    `   *  silently break the substrate — both are required. */`,
    `  child?: Snippet<[SurfaceTriggerProps]>;`,
    `}`,
    ``,
    `let {`,
    `  asChild,`,
    `  class: className,`,
    `  "data-testid": dataTestid,`,
    `  children,`,
    `  child,`,
    `}: Props = $props();`,
    `// @generated:end`,
    ``,
    `// @generated:start ctx`,
    `const ctx = use${name}Context();`,
    ``,
    `let buttonEl: HTMLButtonElement | null = $state(null);`,
    ``,
    `// Default-host path: bind the rendered <button> as the anchor`,
    `// (substrate auto-wires DOM listeners on it). The adoption path`,
    `// is owned by trigger.action and does not need a $effect here.`,
    `$effect(() => {`,
    `  if (!asChild && buttonEl) ctx.registerAnchor(buttonEl);`,
    `});`,
    ``,
    `// Reactive ARIA + data subset for the default-host <button>. We`,
    `// strip event handlers because the controller wires them as DOM`,
    `// listeners in default-host mode (they would double-fire if also`,
    `// spread as Svelte handlers).`,
    `const defaultHostBindings = $derived.by(() => {`,
    `  const { attrs } = ctx.getTriggerProps();`,
    `  const {`,
    `    onpointerenter,`,
    `    onpointerleave,`,
    `    onfocus,`,
    `    onfocusout,`,
    `    onclick,`,
    `    ...rest`,
    `  } = attrs;`,
    `  return rest;`,
    `});`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `{#if asChild}`,
    `  {@render child?.(ctx.getTriggerProps())}`,
    `{:else}`,
    `  <button`,
    `    type="button"`,
    `    bind:this={buttonEl}`,
    `    class={className}`,
    `    data-testid={dataTestid}`,
    `    {...defaultHostBindings}`,
    `  >`,
    `    {@render children?.()}`,
    `  </button>`,
    `{/if}`,
    ``,
  ].join("\n");
}

function emitContentSfc(
  ir: ComponentIR,
  _surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const contentRole = policy.defaultContentRole;
  return [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import { use${name}Context } from "./use${name}.svelte.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start props`,
    `interface Props {`,
    `  class?: string;`,
    `  "data-testid"?: string;`,
    `  children?: import('svelte').Snippet;`,
    `}`,
    ``,
    `let { class: className, "data-testid": dataTestid, children }: Props = $props();`,
    `// @generated:end`,
    ``,
    `// @generated:start ctx`,
    `const ctx = use${name}Context();`,
    `let contentEl: HTMLDivElement | null = $state(null);`,
    ``,
    `$effect(() => {`,
    `  if (contentEl) ctx.registerContent(contentEl);`,
    `});`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `{#if ctx.open()}`,
    `  <div`,
    `    bind:this={contentEl}`,
    `    id={ctx.contentId}`,
    // Policy-derived default content role. Shared semantics owns the
    // tooltip→"tooltip", popover→null rule (and the contract-override
    // path) — Popover and other interactive surfaces emit no role.
    contentRole !== null ? `    role="${contentRole}"` : null,
    `    class={className}`,
    `    data-testid={dataTestid}`,
    `    data-${cssPrefix}-content`,
    `  >`,
    `    {@render children?.()}`,
    `  </div>`,
    `{/if}`,
    ``,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function emitComposable(
  ir: ComponentIR,
  surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const openTriggersList = JSON.stringify(surface.openTriggers);
  const anchorRelation = surface.anchor?.relation ?? "describedby";

  // Policy-derived dismissal-array assembly. For each declared
  // dismissal mode:
  //   - public + runtime-toggleable modes (escape, blur,
  //     outside-click) gate behind `options.${closeOnProp}?.()` so
  //     toggling the prop at runtime re-mounts the controller.
  //   - internal-only modes (pointer-leave, ...) are always-on.
  const dismissalParts = policy.publicDismissalProps.map((spec) =>
    spec.prop && spec.runtimeToggleable
      ? `options.${spec.prop}?.() !== false ? "${spec.mode}" as const : null`
      : `"${spec.mode}" as const`,
  );
  const dismissalExpr = dismissalParts.join(",\n      ");

  const optionsInterfaceLines = policy.publicDismissalProps
    .filter(
      (spec): spec is PublicDismissalProp & { prop: string } =>
        spec.prop !== null,
    )
    .map((spec) => `  ${spec.prop}?: () => boolean | undefined;`);

  return [
    `// @generated:start imports`,
    `import {`,
    `  createAnchoredSurface,`,
    `  provideSurfaceContext,`,
    `  useSurfaceContext,`,
    `  type CreateAnchoredSurfaceResult,`,
    `} from "../../primitives/surfaces/createAnchoredSurface.svelte.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start types`,
    `export interface Use${name}Options {`,
    `  open: () => boolean | undefined;`,
    `  defaultOpen?: () => boolean | undefined;`,
    `  onOpenChange?: (open: boolean) => void;`,
    `  disabled?: () => boolean;`,
    ...optionsInterfaceLines,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start types`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start hook`,
    `export function use${name}(options: Use${name}Options): CreateAnchoredSurfaceResult {`,
    `  const dismissal = () => [`,
    `      ${dismissalExpr}`,
    `    ].filter((d): d is Exclude<typeof d, null> => d !== null);`,
    ``,
    `  return createAnchoredSurface({`,
    `    open: options.open,`,
    `    // defaultOpen is read once at substrate construction time.`,
    `    defaultOpen: options.defaultOpen?.() ?? false,`,
    `    onOpenChange: options.onOpenChange,`,
    `    openTriggers: () => ${openTriggersList},`,
    `    dismissal,`,
    `    anchorRelation: "${anchorRelation}",`,
    `    disabled: options.disabled,`,
    `    dataMarker: "data-${cssPrefix}-trigger",`,
    `  });`,
    `}`,
    ``,
    `export function provide${name}Context(value: CreateAnchoredSurfaceResult): void {`,
    `  provideSurfaceContext("${name}", value);`,
    `}`,
    ``,
    `export function use${name}Context(): CreateAnchoredSurfaceResult {`,
    `  return useSurfaceContext("${name}");`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    ``,
  ].join("\n");
}
