/**
 * Svelte emitter — Anchored Presence Surface path.
 *
 * Activated when `ir.surface?.kind === "tooltip"` (and, after F-3,
 * other anchored kinds). Emits the compound API:
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
 *   <TooltipTrigger>
 *     {#snippet child(trigger)}
 *       <a href="#help" use:trigger.action {...trigger.attrs}>
 *         Save
 *       </a>
 *     {/snippet}
 *   </TooltipTrigger>
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

export interface SvelteSurfaceFiles {
  rootSfc: string;
  triggerSfc: string;
  contentSfc: string;
  composable: string;
}

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface !== undefined;
}

export function generateSvelteSurfaceFiles(ir: ComponentIR): SvelteSurfaceFiles {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateSvelteSurfaceFiles called on ${ir.name} without ir.surface`,
    );
  }
  if (surface.kind !== "tooltip") {
    throw new Error(
      `Svelte surface emitter only supports kind "tooltip" in F-2C-2 (got "${surface.kind}").`,
    );
  }
  return {
    rootSfc: emitRootSfc(ir, surface),
    triggerSfc: emitTriggerSfc(ir, surface),
    contentSfc: emitContentSfc(ir, surface),
    composable: emitComposable(ir, surface),
  };
}

function emitRootSfc(ir: ComponentIR, _surface: SurfaceIR): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const placementValues = ir.variants["placement"];
  const placementTypeAlias = placementValues
    ? `type ${name}Placement = ${placementValues.map((v) => `"${v}"`).join(" | ")};\n`
    : "";

  return [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import { useTooltip, provideTooltipContext } from "./use${name}.svelte.js";`,
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
    `  closeOnEscape?: boolean;`,
    `  closeOnBlur?: boolean;`,
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
    `  closeOnEscape,`,
    `  closeOnBlur,`,
    `  class: className,`,
    `  "data-testid": dataTestid,`,
    `  children,`,
    `}: Props = $props();`,
    `// @generated:end`,
    ``,
    `// @generated:start hook`,
    `// Pass all reactive props as getters so Svelte 5 doesn't warn`,
    `// about state captured at initialization time.`,
    `const surface = useTooltip({`,
    `  open: () => open,`,
    `  defaultOpen: () => defaultOpen,`,
    `  onOpenChange: (next) => onOpenChange?.(next),`,
    `  disabled: () => disabled === true,`,
    `  closeOnEscape: () => closeOnEscape,`,
    `  closeOnBlur: () => closeOnBlur,`,
    `});`,
    ``,
    `provideTooltipContext(surface);`,
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
    `import { useTooltipContext } from "./use${name}.svelte.js";`,
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
    `const ctx = useTooltipContext();`,
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

function emitContentSfc(ir: ComponentIR, surface: SurfaceIR): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const contentRole = surface.content?.part.details?.aria?.role ?? "tooltip";
  return [
    `<script lang="ts">`,
    `// @generated:start imports`,
    `import { useTooltipContext } from "./use${name}.svelte.js";`,
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
    `const ctx = useTooltipContext();`,
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
    `    role="${contentRole}"`,
    `    class={className}`,
    `    data-testid={dataTestid}`,
    `    data-${cssPrefix}-content`,
    `  >`,
    `    {@render children?.()}`,
    `  </div>`,
    `{/if}`,
    ``,
  ].join("\n");
}

function emitComposable(ir: ComponentIR, surface: SurfaceIR): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const openTriggersList = JSON.stringify(surface.openTriggers);
  const anchorRelation = surface.anchor?.relation ?? "describedby";
  const alwaysOn = surface.dismissal
    .filter((d) => d === "pointer-leave" || d === "outside-click")
    .map((d) => JSON.stringify(d));

  const dismissalParts: string[] = [];
  if (surface.dismissal.includes("escape")) {
    dismissalParts.push(`options.closeOnEscape?.() !== false ? "escape" as const : null`);
  }
  if (surface.dismissal.includes("blur")) {
    dismissalParts.push(`options.closeOnBlur?.() !== false ? "blur" as const : null`);
  }
  for (const always of alwaysOn) {
    dismissalParts.push(`${always} as const`);
  }
  const dismissalExpr = dismissalParts.join(",\n      ");

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
    `  closeOnEscape?: () => boolean | undefined;`,
    `  closeOnBlur?: () => boolean | undefined;`,
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
    `export function provideTooltipContext(value: CreateAnchoredSurfaceResult): void {`,
    `  provideSurfaceContext("${name}", value);`,
    `}`,
    ``,
    `export function useTooltipContext(): CreateAnchoredSurfaceResult {`,
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
