/**
 * Vue emitter — Anchored Presence Surface path.
 *
 * Activated for any `ir.surface` whose `kind` is in
 * SUPPORTED_ANCHORED_KINDS. Emits the compound API:
 *
 *   <Surface>
 *     <SurfaceTrigger>Save</SurfaceTrigger>
 *     <SurfaceContent>Save the document</SurfaceContent>
 *   </Surface>
 *
 * Host-adoption uses Vue-native slot props:
 *
 *   <SurfaceTrigger v-slot="{ triggerProps }">
 *     <button v-bind="triggerProps" type="button">Save</button>
 *   </SurfaceTrigger>
 *
 * The `triggerProps` bag is indivisible — consumer spreads it
 * atomically. No `as-child` prop and no `cloneVNode`. The slot-props
 * shape is the canonical Vue host-adoption equivalent.
 *
 * The emitter is data-driven on `surface.dismissal` and
 * `surface.openTriggers` — Tooltip and Popover share the same code
 * path; only the contract differs (dismissal modes, anchor relation,
 * content role).
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

export interface VueSurfaceFiles {
  rootSfc: string;
  triggerSfc: string;
  contentSfc: string;
  composable: string;
}

export function isSurfaceComponent(ir: ComponentIR): boolean {
  // Kind-aware like svelte/angular/lit: non-anchored kinds (dialog, sheet,
  // toast, …) may declare a surface taxonomy block for fact-tracking while
  // keeping the existing generic/hook emission path on web.
  return ir.surface !== undefined && isAnchoredPresenceKind(ir.surface.kind);
}

export function generateVueSurfaceFiles(ir: ComponentIR): VueSurfaceFiles {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateVueSurfaceFiles called on ${ir.name} without ir.surface`,
    );
  }
  if (!isAnchoredPresenceKind(surface.kind)) {
    throw new Error(
      `Vue surface emitter expected an anchored-presence kind (got "${surface.kind}"). ` +
        `Add the kind to ANCHORED_PRESENCE_KINDS in semantics.ts when its substrate is ready.`,
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
  surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const placementValues = ir.variants["placement"];
  const placementTypeAlias = placementValues
    ? `export type ${name}Placement = ${placementValues.map((v) => `"${v}"`).join(" | ")};\n`
    : "";

  const openTriggersList = JSON.stringify(surface.openTriggers);
  const anchorRelation = surface.anchor?.relation ?? "describedby";

  // Policy-derived dismissal props. Public modes (prop !== null)
  // become closeOnX consumer props.
  const dismissalProps = policy.publicDismissalProps.filter(
    (spec): spec is PublicDismissalProp & { prop: string } => spec.prop !== null,
  );

  const closeOnPropLines = dismissalProps.map(
    (spec) => `  ${spec.prop}?: boolean;`,
  );
  const closeOnUndefinedLines = dismissalProps.map(
    (spec) => `  ${spec.prop}: undefined,`,
  );
  const closeOnGetterLines = dismissalProps.map(
    (spec) => `  ${spec.prop}: () => props.${spec.prop} !== false,`,
  );

  return [
    `<script setup lang="ts">`,
    `// @generated:start imports`,
    `import { computed } from "vue";`,
    `import { use${name}, provide${name}Context } from "./use${name}.js";`,
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
    `}`,
    ``,
    `// Vue runtime coerces unpassed Boolean props to \`false\` by`,
    `// default; \`withDefaults\` with \`undefined\` keeps the`,
    `// "controlled vs uncontrolled" distinction the substrate needs.`,
    `const props = withDefaults(defineProps<Props>(), {`,
    `  open: undefined,`,
    `  defaultOpen: undefined,`,
    `  disabled: undefined,`,
    ...closeOnUndefinedLines,
    `});`,
    `// @generated:end`,
    ``,
    `// @generated:start hook`,
    `const surface = use${name}({`,
    `  open: () => props.open,`,
    `  defaultOpen: props.defaultOpen,`,
    `  onOpenChange: props.onOpenChange,`,
    `  disabled: () => props.disabled === true,`,
    ...closeOnGetterLines,
    `});`,
    ``,
    `provide${name}Context({`,
    `  open: surface.open,`,
    `  contentId: surface.contentId,`,
    `  registerAnchor: surface.registerAnchor,`,
    `  registerAnchorRefOnly: surface.registerAnchorRefOnly,`,
    `  registerContent: surface.registerContent,`,
    `  getTriggerHandlers: surface.getTriggerHandlers,`,
    `  triggerProps: surface.triggerProps,`,
    `});`,
    `// @generated:end`,
    ``,
    `// @generated:start classes`,
    `const classNames = computed(() => [`,
    `  "${cssPrefix}",`,
    placementValues ? `  props.placement ? \`${cssPrefix}--\${props.placement}\` : null,` : "",
    `  props.disabled ? "${cssPrefix}--disabled" : null,`,
    `  props.class,`,
    `].filter(Boolean).join(" "));`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `<template>`,
    `  <span :class="classNames" :data-testid="props['data-testid']">`,
    `    <slot />`,
    `  </span>`,
    `</template>`,
    ``,
    `<!-- openTriggers: ${openTriggersList} | anchorRelation: ${anchorRelation} -->`,
    ``,
  ]
    .filter((line) => line !== "")
    .map((line) => line)
    .join("\n");
}

function emitTriggerSfc(ir: ComponentIR, _surface: SurfaceIR): string {
  const name = ir.name;
  const dataMarker = `data-${ir.cssPrefix}-trigger`;
  return [
    `<script setup lang="ts">`,
    `// @generated:start imports`,
    `import { computed } from "vue";`,
    `import { use${name}Context } from "./use${name}.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start defineOptions`,
    `// Multi-root template (v-if asChild / v-else button) disables Vue's`,
    `// automatic attribute fallthrough; we apply $attrs explicitly to the`,
    `// rendered host below.`,
    `defineOptions({ inheritAttrs: false });`,
    `// @generated:end`,
    ``,
    `// @generated:start props`,
    `interface Props {`,
    `  /** When true, the consumer takes over the host element via`,
    `   *  the default slot's \`triggerProps\` bindings. When false`,
    `   *  (the default), a \`<button>\` is rendered. */`,
    `  asChild?: boolean;`,
    `}`,
    ``,
    `const props = defineProps<Props>();`,
    `// @generated:end`,
    ``,
    `// @generated:start ctx`,
    `const ctx = use${name}Context();`,
    ``,
    `/** Default-host path needs the listener-installing ref. The`,
    ` *  triggerProps bag carries the listener-skipping ref (for the`,
    ` *  slot-props host-adoption path), so we omit it here and pass`,
    ` *  registerAnchor via :ref. The rest of the bag (aria, data,`,
    ` *  handlers — none of which the default-host needs since the`,
    ` *  controller wires them as DOM listeners) is also omitted to`,
    ` *  avoid double-firing. */`,
    `const defaultHostAriaAndData = computed(() => {`,
    `  const { ref: _ref, ...rest } = ctx.triggerProps.value;`,
    `  return {`,
    `    "aria-describedby": rest["aria-describedby"],`,
    `    "aria-controls": rest["aria-controls"],`,
    `    "aria-expanded": rest["aria-expanded"],`,
    `    "aria-labelledby": rest["aria-labelledby"],`,
    `    "${dataMarker}": rest["${dataMarker}"],`,
    `  };`,
    `});`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    `<template>`,
    `  <template v-if="props.asChild">`,
    `    <slot :triggerProps="ctx.triggerProps.value" />`,
    `  </template>`,
    `  <button`,
    `    v-else`,
    `    type="button"`,
    `    :ref="ctx.registerAnchor"`,
    `    v-bind="{ ...$attrs, ...defaultHostAriaAndData }"`,
    `  >`,
    `    <slot />`,
    `  </button>`,
    `</template>`,
    ``,
  ].join("\n");
}

function emitContentSfc(
  ir: ComponentIR,
  surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
): string {
  // `surface` is no longer read but kept in the signature for symmetry
  // with the other emit functions (and to leave room for content-
  // specific facts the policy may need to look at later).
  void surface;
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  // Policy-derived default content role. Shared semantics owns the
  // tooltip→"tooltip", popover→null rule (and the contract-override
  // path).
  const contentRole = policy.defaultContentRole;
  const templateLines: (string | null)[] = [
    `<template>`,
    `  <div`,
    `    v-if="ctx.open.value"`,
    `    :ref="ctx.registerContent"`,
    `    :id="ctx.contentId"`,
    contentRole !== null ? `    role="${contentRole}"` : null,
    `    data-${cssPrefix}-content`,
    `    v-bind="$attrs"`,
    `  >`,
    `    <slot />`,
    `  </div>`,
    `</template>`,
  ];
  return [
    `<script setup lang="ts">`,
    `// @generated:start imports`,
    `import { use${name}Context } from "./use${name}.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start defineOptions`,
    `// Conditional render via v-if disables Vue's automatic attribute`,
    `// fallthrough; we apply $attrs explicitly on the rendered host.`,
    `defineOptions({ inheritAttrs: false });`,
    `// @generated:end`,
    ``,
    `// @generated:start ctx`,
    `const ctx = use${name}Context();`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    `</script>`,
    ``,
    ...templateLines.filter((line): line is string => line !== null),
    ``,
  ].join("\n");
}

function emitComposable(
  ir: ComponentIR,
  surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
): string {
  const name = ir.name;
  const dataMarker = `data-${ir.cssPrefix}-trigger`;
  const openTriggersList = JSON.stringify(surface.openTriggers);
  const anchorRelation = surface.anchor?.relation ?? "describedby";

  // Policy-derived dismissal-array assembly. For each declared
  // dismissal mode:
  //   - public + runtime-toggleable modes (escape, blur,
  //     outside-click) gate behind `options.${closeOnProp}?.()` so
  //     toggling the prop at runtime re-mounts the controller.
  //   - internal-only modes (pointer-leave) are always-on.
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
    `import type { ComputedRef } from "vue";`,
    `import { createCompoundContext } from "../../primitives/index.js";`,
    `import { useAnchoredSurface, type SurfaceRefCallback, type SurfaceTriggerHandlers, type SurfaceTriggerProps } from "../../primitives/surfaces/useAnchoredSurface.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start types`,
    `export interface Use${name}Options {`,
    `  open: () => boolean | undefined;`,
    `  defaultOpen?: boolean;`,
    `  onOpenChange?: (open: boolean) => void;`,
    `  disabled?: () => boolean;`,
    ...optionsInterfaceLines,
    `}`,
    ``,
    `export interface ${name}ContextValue {`,
    `  open: ComputedRef<boolean>;`,
    `  contentId: string;`,
    `  registerAnchor: SurfaceRefCallback;`,
    `  registerAnchorRefOnly: SurfaceRefCallback;`,
    `  registerContent: SurfaceRefCallback;`,
    `  getTriggerHandlers: () => SurfaceTriggerHandlers;`,
    `  triggerProps: ComputedRef<SurfaceTriggerProps>;`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start types`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start context`,
    `export const [provide${name}Context, use${name}Context] =`,
    `  createCompoundContext<${name}ContextValue>("${name}");`,
    `// @generated:end`,
    ``,
    `// @generated:start hook`,
    `export function use${name}(options: Use${name}Options) {`,
    `  const dismissal = () => [`,
    `      ${dismissalExpr}`,
    `    ].filter((d): d is Exclude<typeof d, null> => d !== null);`,
    ``,
    `  return useAnchoredSurface({`,
    `    open: options.open,`,
    `    defaultOpen: options.defaultOpen,`,
    `    onOpenChange: options.onOpenChange,`,
    `    openTriggers: () => ${openTriggersList},`,
    `    dismissal,`,
    `    anchorRelation: "${anchorRelation}",`,
    `    disabled: options.disabled,`,
    `    dataMarker: "${dataMarker}",`,
    `  });`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    ``,
  ].join("\n");
}
