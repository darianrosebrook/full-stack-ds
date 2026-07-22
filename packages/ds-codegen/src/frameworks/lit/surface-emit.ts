/**
 * Lit emitter — Anchored Presence Surface path.
 *
 * Activated for any contract whose IR has a `surface` block of an
 * anchored-presence kind (Tooltip, Popover, ...). Surface kind
 * eligibility is decided by `isAnchoredPresenceKind` in shared
 * semantics, and per-kind policy (`AnchoredSurfacePolicy`) drives
 * default content role and public dismissal props. This emitter
 * MUST NOT branch on component identity or on `surface.kind` for
 * any rule that could be expressed by the policy.
 *
 * Emits a single `${Name}.ts` file containing three custom-element
 * classes plus their `customElements.define` registrations, and a
 * separate `${Name}Behavior.ts` file with the substrate composable.
 *
 *   <fsds-popover>
 *     <fsds-popover-trigger>
 *       <button>Open</button>          <!-- consumer-rendered host -->
 *     </fsds-popover-trigger>
 *     <fsds-popover-content>Body</fsds-popover-content>
 *   </fsds-popover>
 *
 * Host adoption is **slot-assignment based**, the Lit-native idiom.
 * The Trigger element exposes a default `<slot>` in its shadow root.
 * When the consumer slots a host element (e.g. a `<button>` or `<a>`)
 * into the Trigger, a `slotchange` listener captures the first
 * assigned element via `slot.assignedElements({ flatten: true })` and
 * passes it to the substrate via `setAnchor`. The substrate installs
 * DOM listeners directly on that consumer-owned element and writes
 * ARIA attributes via setAttribute.
 *
 * If no element is slotted, the Trigger falls back to rendering a
 * default `<button>` host inside its shadow root.
 *
 * No "asChild" prop, no separate adoption type. The slot's presence/
 * absence is the host-adoption signal. This mirrors React's asChild,
 * Vue's slot-props, and Svelte's split binding through Lit's native
 * slot-assignment API.
 *
 * Bypasses the legacy `ir.dom` and compound-state-container paths
 * entirely — this is forward-facing replacement, not augmentation.
 */
import type { ComponentIR, SurfaceIR } from "../../ir.js";
import {
  isAnchoredPresenceKind,
  resolveAnchoredSurfacePolicy,
  anchoredPortalsContentToBody,
  type AnchoredSurfacePolicy,
  type PublicDismissalProp,
} from "../../semantics.js";
import { emitLitInlineCss, escapeCssForLitTemplate } from "../../css.js";

/**
 * Build the inlined `static override styles` block for a surface
 * sub-class. Mirrors the helper in `component-source.ts` — Lit's
 * shadow DOM means the sibling `.css` file cannot be `@import`-ed,
 * so the component's full CSS is inlined into the shadow at codegen.
 */
function surfaceStaticStylesLine(
  ir: ComponentIR,
  hostRule = ":host { display: contents; }",
): string[] {
  const componentCss = emitLitInlineCss(ir);
  if (!componentCss) {
    return [`  static override styles = css\`${hostRule}\`;`];
  }
  const escaped = escapeCssForLitTemplate(componentCss);
  return [
    `  static override styles = css\``,
    `    ${hostRule}`,
    ...escaped.split("\n").map((line) => `    ${line}`.trimEnd() || "    "),
    `  \`;`,
  ];
}

export interface LitSurfaceFiles {
  componentFile: string;
  behaviorFile: string;
}

export function isSurfaceComponent(ir: ComponentIR): boolean {
  return ir.surface !== undefined && isAnchoredPresenceKind(ir.surface.kind);
}

export function generateLitSurfaceFiles(ir: ComponentIR): LitSurfaceFiles {
  const surface = ir.surface;
  if (!surface) {
    throw new Error(
      `generateLitSurfaceFiles called on ${ir.name} without ir.surface`,
    );
  }
  const policy = resolveAnchoredSurfacePolicy(surface);
  return {
    componentFile: emitComponentFile(ir, surface, policy),
    behaviorFile: emitBehaviorFile(ir, surface),
  };
}

function tagFor(name: string): string {
  // CamelCase → kebab-case + `fsds-` prefix to match the codebase
  // convention (Tabs → fsds-tabs, Tabs.List → fsds-tabs-list, etc.).
  return `fsds-${name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")}`;
}

function camelToKebab(name: string): string {
  // Used for Lit `@property({ attribute: "..." })` — the HTML
  // attribute form must be kebab-case (closeOnEscape → close-on-escape).
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function emitComponentFile(
  ir: ComponentIR,
  surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
): string {
  const name = ir.name;
  const cssPrefix = ir.cssPrefix;
  const rootTag = tagFor(name);
  const triggerTag = `${rootTag}-trigger`;
  const contentTag = `${rootTag}-content`;
  const contextName = `${name}Surface`;
  // Policy-derived default content role. Shared semantics owns the
  // tooltip→"tooltip", popover→null rule (and the contract-override
  // path).
  const contentRole = policy.defaultContentRole;
  const placementValues = ir.variants["placement"];
  const placementTypeAlias = placementValues
    ? `export type ${name}Placement = ${placementValues.map((v) => `"${v}"`).join(" | ")};\n`
    : "";

  // Positioning + portal are driven by the contract:
  //   - surface.positioning.strategy === "anchored" → the content
  //     custom element gets an AnchoredPositionController and applies
  //     fixed positioning + data-placement on its own host.
  //   - anchoredPortalsContentToBody(ir)                → the content
  //     host relocates itself to document.body while open (mirrors
  //     the Dialog root-portal idiom, applied to the content element
  //     instead of the root).
  // Both flags are independent.
  const positioningEnabled = surface.positioning?.strategy === "anchored";
  const portalEnabled = anchoredPortalsContentToBody(ir);
  const collision = surface.positioning?.collision ?? "flip-shift";

  const positioningImportLines = positioningEnabled
    ? [
        `import { AnchoredPositionController } from "../../primitives/surfaces/AnchoredPositionController.js";`,
      ]
    : [];

  return [
    `// @generated:start imports`,
    `import { LitElement, html, css, nothing, type PropertyValues } from "lit";`,
    `import { property, state } from "lit/decorators.js";`,
    `import { ref, createRef, type Ref } from "lit/directives/ref.js";`,
    `import {`,
    `  createCompoundContext,`,
    `  provideContext,`,
    `  ContextConsumerController,`,
    `} from "../../primitives/index.js";`,
    `import { AnchoredSurfaceController } from "../../primitives/surfaces/AnchoredSurfaceController.js";`,
    `import type { SurfaceDismissalMode } from "../../primitives/surfaces/SurfaceController.js";`,
    ...positioningImportLines,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start types`,
    placementTypeAlias.trimEnd(),
    `interface ${name}SurfaceContext {`,
    `  open: () => boolean;`,
    `  setOpen: (value: boolean) => void;`,
    `  contentId: string;`,
    `  controller: AnchoredSurfaceController;`,
    `  registerContent: (node: HTMLElement | null) => void;`,
    `  buildDismissal: () => readonly SurfaceDismissalMode[];`,
    positioningEnabled ? `  getAnchor: () => HTMLElement | null;` : null,
    positioningEnabled ? `  getPlacement: () => string | undefined;` : null,
    `}`,
    ``,
    `const ${contextName}_CTX = createCompoundContext<${name}SurfaceContext>("${name}Surface");`,
    ``,
    `let _surfaceIdCounter = 0;`,
    `// @generated:end`,
    ``,
    emitRootClass(ir, surface, policy, { name, cssPrefix, rootTag, contextName, placementValues, positioningEnabled }),
    ``,
    emitTriggerClass(ir, surface, { name, cssPrefix, triggerTag, contextName }),
    ``,
    emitContentClass(ir, surface, {
      name,
      cssPrefix,
      contentTag,
      contextName,
      contentRole,
      positioningEnabled,
      portalEnabled,
      collision,
    }),
    ``,
    `// @generated:start define`,
    `customElements.define("${rootTag}", ${name}Element);`,
    `customElements.define("${triggerTag}", ${name}TriggerElement);`,
    `customElements.define("${contentTag}", ${name}ContentElement);`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    ``,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

interface RootCtx {
  name: string;
  cssPrefix: string;
  rootTag: string;
  contextName: string;
  placementValues: string[] | undefined;
  positioningEnabled: boolean;
}

function emitRootClass(
  ir: ComponentIR,
  surface: SurfaceIR,
  policy: AnchoredSurfacePolicy,
  c: RootCtx,
): string {
  const { name, cssPrefix, contextName, placementValues, positioningEnabled } = c;

  // Policy-derived dismissal-array assembly. For each declared
  // dismissal mode:
  //   - public + runtime-toggleable modes (escape, blur,
  //     outside-click) gate behind `this.${closeOnProp} !== false`
  //     so toggling the property at runtime triggers a re-mount.
  //   - internal-only modes (pointer-leave, ...) are always-on.
  const dismissalParts = policy.publicDismissalProps.map((spec) =>
    spec.prop && spec.runtimeToggleable
      ? `this.${spec.prop} !== false ? "${spec.mode}" as const : null`
      : `"${spec.mode}" as const`,
  );
  const dismissalExpr = dismissalParts.join(",\n      ");

  // Policy-derived `@property` declarations for the consumer-facing
  // dismissal flags. Only modes whose prop is non-null surface as a
  // public property.
  const dismissalProps = policy.publicDismissalProps.filter(
    (spec): spec is PublicDismissalProp & { prop: string } =>
      spec.prop !== null,
  );
  const closeOnPropertyLines = dismissalProps.map(
    (spec) =>
      `  @property({ type: Boolean, attribute: "${camelToKebab(spec.prop)}" }) ${spec.prop}?: boolean;`,
  );
  // `updated()` calls requestRemount when any runtime-toggleable
  // dismissal flag changes, so the controller picks up the new array.
  const requestRemountChangedExpr = dismissalProps
    .filter((spec) => spec.runtimeToggleable)
    .map((spec) => `_changed.has("${spec.prop}")`)
    .join(" || ");

  const openTriggers = JSON.stringify(surface.openTriggers);

  return [
    `// @generated:start root-class`,
    `export class ${name}Element extends LitElement {`,
    ...surfaceStaticStylesLine(ir),
    ``,
    `  @property({ type: Boolean }) open?: boolean;`,
    `  @property({ type: Boolean }) defaultOpen?: boolean;`,
    `  @property({ attribute: false }) onOpenChange?: (open: boolean) => void;`,
    placementValues
      ? `  @property({ type: String }) placement?: ${name}Placement;`
      : "",
    `  @property({ type: Boolean }) disabled?: boolean;`,
    ...closeOnPropertyLines,
    ``,
    `  /** Uncontrolled open state. Used as the fallback when no`,
    `   *  controlled \`open\` prop is set. Not seeded via onOpenChange`,
    `   *  to avoid firing the consumer's callback for the initial`,
    `   *  value of \`defaultOpen\`. */`,
    `  @state() private _uncontrolledOpen = false;`,
    ``,
    `  private _contentId: string;`,
    `  private _surfaceController: AnchoredSurfaceController;`,
    `  private _contentEl: HTMLElement | null = null;`,
    ``,
    `  constructor() {`,
    `    super();`,
    `    _surfaceIdCounter += 1;`,
    `    this._contentId = \`surface-\${_surfaceIdCounter}\`;`,
    `    this._surfaceController = new AnchoredSurfaceController(this, {`,
    `      isOpen: () => this._isOpen(),`,
    `      setOpen: (next) => this._setOpen(next),`,
    `      openTriggers: ${openTriggers},`,
    `      // Getter form: each install() pulls the latest array so`,
    `      // toggles to closeOnEscape/closeOnBlur take effect once the`,
    `      // host calls requestRemount() in updated().`,
    `      dismissal: () => this._buildDismissal(),`,
    `      disabled: () => this.disabled === true,`,
    `    });`,
    `  }`,
    ``,
    `  private _isOpen(): boolean {`,
    `    return this.open === undefined ? this._uncontrolledOpen : this.open;`,
    `  }`,
    ``,
    `  private _setOpen(next: boolean): void {`,
    `    if (this.open === undefined) this._uncontrolledOpen = next;`,
    `    this.onOpenChange?.(next);`,
    `  }`,
    ``,
    `  /** Recomputed each cycle so close-on-escape/blur toggles can`,
    `   *  re-mount listeners by re-calling install via setAnchor. */`,
    `  private _buildDismissal(): readonly SurfaceDismissalMode[] {`,
    `    return [`,
    `      ${dismissalExpr}`,
    `    ].filter((d): d is Exclude<typeof d, null> => d !== null);`,
    `  }`,
    ``,
    `  override connectedCallback(): void {`,
    `    super.connectedCallback();`,
    `    // Seed uncontrolled state from defaultOpen WITHOUT firing`,
    `    // onOpenChange — the consumer didn't trigger this, the`,
    `    // initial-mount default did.`,
    `    if (this.defaultOpen !== undefined && this.open === undefined) {`,
    `      this._uncontrolledOpen = this.defaultOpen === true;`,
    `    }`,
    `    this._provideContext();`,
    `  }`,
    ``,
    `  override updated(_changed: PropertyValues): void {`,
    `    this._provideContext();`,
    `    // Public + runtime-toggleable dismissal props are read by the`,
    `    // controller via the dismissal getter; force a re-install`,
    `    // when any of them changes so the new array takes effect.`,
    requestRemountChangedExpr
      ? `    if (${requestRemountChangedExpr}) {`
      : null,
    requestRemountChangedExpr
      ? `      this._surfaceController.requestRemount();`
      : null,
    requestRemountChangedExpr ? `    }` : null,
    `  }`,
    ``,
    `  private _provideContext(): void {`,
    `    provideContext<{`,
    `      open: () => boolean;`,
    `      setOpen: (value: boolean) => void;`,
    `      contentId: string;`,
    `      controller: AnchoredSurfaceController;`,
    `      registerContent: (node: HTMLElement | null) => void;`,
    `      buildDismissal: () => readonly SurfaceDismissalMode[];`,
    positioningEnabled ? `      getAnchor: () => HTMLElement | null;` : null,
    positioningEnabled ? `      getPlacement: () => string | undefined;` : null,
    `    }>(this, ${contextName}_CTX.key, {`,
    `      open: () => this._isOpen(),`,
    `      setOpen: (next) => this._setOpen(next),`,
    `      contentId: this._contentId,`,
    `      controller: this._surfaceController,`,
    `      registerContent: (node) => {`,
    `        this._contentEl = node;`,
    `        this._surfaceController.setContent(node);`,
    `      },`,
    `      buildDismissal: () => this._buildDismissal(),`,
    positioningEnabled
      ? `      getAnchor: () => this._surfaceController.getAnchor(),`
      : null,
    positioningEnabled
      ? placementValues
        ? `      getPlacement: () => this.placement,`
        : `      getPlacement: () => undefined,`
      : null,
    `    });`,
    `  }`,
    ``,
    `  override render() {`,
    `    return html\`<span class="\${this._classes()}"><slot></slot></span>\`;`,
    `  }`,
    ``,
    `  private _classes(): string {`,
    `    return [`,
    `      "${cssPrefix}",`,
    placementValues
      ? `      this.placement ? \`${cssPrefix}--\${this.placement}\` : null,`
      : "",
    `      this.disabled ? "${cssPrefix}--disabled" : null,`,
    `    ].filter(Boolean).join(" ");`,
    `  }`,
    `}`,
    `// @generated:end`,
  ]
    .filter((line): line is string => line !== "" && line !== null)
    .join("\n");
}

interface TriggerCtx {
  name: string;
  cssPrefix: string;
  triggerTag: string;
  contextName: string;
}

function emitTriggerClass(
  ir: ComponentIR,
  surface: SurfaceIR,
  c: TriggerCtx,
): string {
  const { name, cssPrefix, contextName } = c;
  const anchorRelation = surface.anchor?.relation ?? "describedby";
  const ariaAttrForAnchor =
    anchorRelation === "describedby"
      ? "aria-describedby"
      : anchorRelation === "controls-expanded"
        ? "aria-controls"
        : anchorRelation === "labelledby"
          ? "aria-labelledby"
          : null;

  const clearAnchorAria = ariaAttrForAnchor
    ? `      this._anchor.removeAttribute("${ariaAttrForAnchor}");`
    : `      // no anchor-relation attribute to clean up`;

  const applyAriaState = (() => {
    if (ariaAttrForAnchor === "aria-describedby" || ariaAttrForAnchor === "aria-labelledby") {
      return [
        `    if (isOpen) anchor.setAttribute("${ariaAttrForAnchor}", ctx.contentId);`,
        `    else anchor.removeAttribute("${ariaAttrForAnchor}");`,
      ].join("\n");
    }
    if (ariaAttrForAnchor === "aria-controls") {
      return [
        `    anchor.setAttribute("aria-controls", ctx.contentId);`,
        `    anchor.setAttribute("aria-expanded", isOpen ? "true" : "false");`,
      ].join("\n");
    }
    return `    // no ARIA attribute to apply for relation="${anchorRelation}"`;
  })();

  return [
    `// @generated:start trigger-class`,
    `export class ${name}TriggerElement extends LitElement {`,
    ...surfaceStaticStylesLine(ir),
    ``,
    `  private _ctx = new ContextConsumerController<${name}SurfaceContext>(this, ${contextName}_CTX);`,
    ``,
    `  /** The element currently registered as the surface anchor.`,
    `   *  Either an element slotted by the consumer (host-adoption`,
    `   *  path) or the built-in default <button> in our shadow root`,
    `   *  (default-host path). */`,
    `  @state() private _anchor: HTMLElement | null = null;`,
    ``,
    `  /** True after the first slotchange where the consumer has`,
    `   *  provided their own host element. Controls whether we render`,
    `   *  the fallback <button> in shadow DOM. */`,
    `  @state() private _hasSlottedHost = false;`,
    ``,
    `  private _defaultHostRef: Ref<HTMLButtonElement> = createRef();`,
    ``,
    `  override disconnectedCallback(): void {`,
    `    if (this._anchor) {`,
    clearAnchorAria,
    `      this._anchor.removeAttribute("data-${cssPrefix}-trigger");`,
    `    }`,
    `    super.disconnectedCallback();`,
    `  }`,
    ``,
    `  private _onSlotChange(e: Event): void {`,
    `    const slot = e.target as HTMLSlotElement;`,
    `    const assigned = slot`,
    `      .assignedElements({ flatten: true })`,
    `      .filter((n): n is HTMLElement => n instanceof HTMLElement);`,
    `    const slotted = assigned[0] ?? null;`,
    `    this._hasSlottedHost = slotted !== null;`,
    `    if (slotted) {`,
    `      this._updateAnchor(slotted);`,
    `    } else if (this._defaultHostRef.value) {`,
    `      // No slotted host — re-bind to the default <button> which`,
    `      // becomes the anchor in this fallback path.`,
    `      this._updateAnchor(this._defaultHostRef.value);`,
    `    } else {`,
    `      this._updateAnchor(null);`,
    `    }`,
    `  }`,
    ``,
    `  private _updateAnchor(next: HTMLElement | null): void {`,
    `    if (next === this._anchor) {`,
    `      this._applyAriaState();`,
    `      return;`,
    `    }`,
    `    if (this._anchor) {`,
    clearAnchorAria,
    `      this._anchor.removeAttribute("data-${cssPrefix}-trigger");`,
    `    }`,
    `    this._anchor = next;`,
    `    if (next) next.setAttribute("data-${cssPrefix}-trigger", "");`,
    `    this._ctx.value.controller.setAnchor(next);`,
    `    this._applyAriaState();`,
    `  }`,
    ``,
    `  /** Reflect open state to ARIA on the anchor element. Re-runs`,
    `   *  every render cycle so open-state changes propagate to`,
    `   *  the consumer-rendered host without needing a re-bind. */`,
    `  private _applyAriaState(): void {`,
    `    const anchor = this._anchor;`,
    `    if (!anchor) return;`,
    `    const ctx = this._ctx.value;`,
    `    const isOpen = ctx.open();`,
    applyAriaState,
    `  }`,
    ``,
    `  override updated(): void {`,
    `    this._applyAriaState();`,
    `    // First-render: if no slotchange has fired yet (no consumer`,
    `    // child) and our default-host button is now in the DOM, bind`,
    `    // it as the anchor.`,
    `    if (!this._hasSlottedHost && !this._anchor && this._defaultHostRef.value) {`,
    `      this._updateAnchor(this._defaultHostRef.value);`,
    `    }`,
    `  }`,
    ``,
    `  override render() {`,
    `    return html\``,
    `      <slot @slotchange=\${this._onSlotChange}></slot>`,
    `      \${this._hasSlottedHost`,
    `        ? nothing`,
    `        : html\`<button type="button" \${ref(this._defaultHostRef)}><slot name="default-label"></slot></button>\`}`,
    `    \`;`,
    `  }`,
    `}`,
    `// @generated:end`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

interface ContentCtx {
  name: string;
  cssPrefix: string;
  contentTag: string;
  contextName: string;
  /** Policy-derived default ARIA role for the content host. `null`
   *  for surface kinds (e.g. popover) that should not carry a
   *  default role; in that case no role attribute is reflected. */
  contentRole: string | null;
  /** `surface.positioning.strategy === "anchored"` — content gets
   *  fixed positioning against the anchor rect via
   *  AnchoredPositionController. */
  positioningEnabled: boolean;
  /** `anchoredPortalsContentToBody(ir)` — content host relocates
   *  itself to document.body while open. */
  portalEnabled: boolean;
  collision: string;
}

function emitContentClass(
  ir: ComponentIR,
  _surface: SurfaceIR,
  c: ContentCtx,
): string {
  const {
    name,
    cssPrefix,
    contentRole,
    contextName,
    positioningEnabled,
    portalEnabled,
    collision,
  } = c;
  // Role-reflection branches: policy.defaultContentRole=null means
  // no role attribute is set or cleared. Popover and other
  // interactive surfaces omit role entirely.
  const setRoleLine =
    contentRole !== null
      ? `      this.setAttribute("role", "${contentRole}");`
      : null;
  const clearRoleLine =
    contentRole !== null ? `      this.removeAttribute("role");` : null;

  return [
    `// @generated:start content-class`,
    `export class ${name}ContentElement extends LitElement {`,
    ...surfaceStaticStylesLine(ir),
    ``,
    `  private _ctx = new ContextConsumerController<${name}SurfaceContext>(this, ${contextName}_CTX);`,
    `  // Context resolution walks parentElement ancestors. Once`,
    `  // portalled, this host is a direct child of document.body and`,
    `  // the walk to the ${name}Element provider would fail — but`,
    `  // the resolved context's closures (open/setOpen/registerContent/`,
    `  // getAnchor/...) all bind to the ROOT instance's \`this\`, not to`,
    `  // DOM adjacency, so a value resolved once while still in-tree`,
    `  // remains valid after relocation. Cache on first success.`,
    `  private _ctxCache: ${name}SurfaceContext | null = null;`,
    `  private _registered = false;`,
    positioningEnabled
      ? `  private _position: AnchoredPositionController;`
      : null,
    portalEnabled ? `  private _portalMoving = false;` : null,
    portalEnabled ? `  private _portaled = false;` : null,
    portalEnabled
      ? `  private _portalOriginParent: Node | null = null;`
      : null,
    portalEnabled ? `  private _portalOriginNext: Node | null = null;` : null,
    positioningEnabled ? `` : null,
    positioningEnabled ? `  constructor() {` : null,
    positioningEnabled ? `    super();` : null,
    positioningEnabled
      ? `    this._position = new AnchoredPositionController(this, {`
      : null,
    positioningEnabled
      ? `      anchor: () => this._ctxOrNull()?.getAnchor() ?? null,`
      : null,
    positioningEnabled ? `      content: () => this,` : null,
    positioningEnabled
      ? `      open: () => this._ctxOrNull()?.open() ?? false,`
      : null,
    positioningEnabled
      ? `      placement: () => (this._ctxOrNull()?.getPlacement() as "top" | "bottom" | "left" | "right" | undefined) ?? "auto",`
      : null,
    positioningEnabled ? `      collision: () => "${collision}",` : null,
    positioningEnabled
      ? `      onChange: () => this.requestUpdate(),`
      : null,
    positioningEnabled ? `    });` : null,
    positioningEnabled ? `  }` : null,
    ``,
    portalEnabled
      ? `  // The transient disconnect/reconnect pair fired by \`document.body.appendChild(this)\``
      : null,
    portalEnabled
      ? `  // below (moving an already-connected element re-fires both native callbacks`
      : null,
    portalEnabled
      ? `  // synchronously) must NOT reach Lit's own connectedCallback/disconnectedCallback —`
      : null,
    portalEnabled
      ? `  // those re-run every ReactiveController's hostConnected/hostDisconnected, which`
      : null,
    portalEnabled
      ? `  // for AnchoredPositionController and ContextConsumerController is real stateful`
      : null,
    portalEnabled
      ? `  // reconcile/subscribe work, not a no-op. Left unguarded, a move from inside`
      : null,
    portalEnabled
      ? `  // updated() would re-enter that reconcile synchronously mid-render and could`
      : null,
    portalEnabled
      ? `  // schedule a redundant update that outlives the current open/close transition.`
      : null,
    portalEnabled ? `  override connectedCallback(): void {` : null,
    portalEnabled ? `    if (this._portalMoving) return;` : null,
    portalEnabled ? `    super.connectedCallback();` : null,
    portalEnabled ? `  }` : null,
    portalEnabled ? `` : null,
    `  override disconnectedCallback(): void {`,
    portalEnabled ? `    if (this._portalMoving) return;` : null,
    portalEnabled
      ? `    // Genuine teardown (not a transient portal move): the element is`
      : null,
    portalEnabled
      ? `    // being permanently removed from the document (e.g. the consumer`
      : null,
    portalEnabled
      ? `    // removed the root, or cleared an ancestor's innerHTML), so there`
      : null,
    portalEnabled
      ? `    // is nothing to relocate back to — only reset portal bookkeeping.`
      : null,
    portalEnabled
      ? `    // Reinserting into \`_portalOriginParent\` here would be actively`
      : null,
    portalEnabled
      ? `    // harmful: that parent may be mid-removal in the very same`
      : null,
    portalEnabled
      ? `    // operation, and insertBefore into a still-connected node would`
      : null,
    portalEnabled
      ? `    // synchronously re-fire connectedCallback before this callback`
      : null,
    portalEnabled ? `    // has finished tearing down.` : null,
    portalEnabled ? `    this._portaled = false;` : null,
    portalEnabled ? `    this._portalOriginParent = null;` : null,
    portalEnabled ? `    this._portalOriginNext = null;` : null,
    `    if (this._registered) {`,
    `      this._ctxOrNull()?.registerContent(null);`,
    `      this._registered = false;`,
    `    }`,
    `    super.disconnectedCallback();`,
    `  }`,
    ``,
    `  private _ctxOrNull(): ${name}SurfaceContext | null {`,
    `    if (this._ctxCache) return this._ctxCache;`,
    `    try {`,
    `      this._ctxCache = this._ctx.value;`,
    `      return this._ctxCache;`,
    `    } catch {`,
    `      return null;`,
    `    }`,
    `  }`,
    ``,
    `  override updated(): void {`,
    `    const ctx = this._ctxOrNull();`,
    `    if (!ctx) return;`,
    `    // Lit does not cancel an already-scheduled update when the`,
    `    // host disconnects mid-flight; a stale updated() call landing`,
    `    // after a genuine disconnectedCallback must be a no-op — in`,
    `    // particular it must NOT re-portal this element to`,
    `    // document.body, which would resurrect an element that has`,
    `    // already torn down its registration and controllers.`,
    `    if (!this.isConnected) return;`,
    `    // Register the host element itself as the content node for`,
    `    // substrate purposes. The substrate uses content.contains(node)`,
    `    // for grace-path checks; if we registered the inner <div>`,
    `    // (which lives in shadow DOM), the browser would retarget`,
    `    // any cross-shadow event's relatedTarget to this host`,
    `    // anyway, so contains() would return false. Registering the`,
    `    // host directly avoids the retargeting mismatch.`,
    `    if (!this._registered) {`,
    `      this._registered = true;`,
    `      ctx.registerContent(this);`,
    `    }`,
    portalEnabled ? `    // FEAT-ANCHORED-SURFACE-XFW-01: relocate the content HOST to` : null,
    portalEnabled ? `    // document.body while open, mirroring the Dialog root-portal` : null,
    portalEnabled ? `    // idiom (see component-source.ts) but applied to the content` : null,
    portalEnabled ? `    // part instead of the whole component — the shadow root (and` : null,
    portalEnabled ? `    // its scoped styles) travels with the host, escaping any` : null,
    portalEnabled ? `    // ancestor transform/overflow/filter containing block.` : null,
    portalEnabled ? `    if (ctx.open() && !this._portaled && typeof document !== "undefined") {` : null,
    portalEnabled ? `      this._portalOriginParent = this.parentNode;` : null,
    portalEnabled ? `      this._portalOriginNext = this.nextSibling;` : null,
    portalEnabled ? `      this._portaled = true;` : null,
    portalEnabled ? `      this._portalMoving = true;` : null,
    portalEnabled ? `      document.body.appendChild(this);` : null,
    portalEnabled ? `      this._portalMoving = false;` : null,
    portalEnabled ? `    } else if (!ctx.open() && this._portaled) {` : null,
    portalEnabled ? `      if (this._portalOriginParent && this._portalOriginParent.isConnected) {` : null,
    portalEnabled ? `        this._portalMoving = true;` : null,
    portalEnabled ? `        this._portalOriginParent.insertBefore(this, this._portalOriginNext);` : null,
    portalEnabled ? `        this._portalMoving = false;` : null,
    portalEnabled ? `      }` : null,
    portalEnabled ? `      this._portaled = false;` : null,
    portalEnabled ? `      this._portalOriginParent = null;` : null,
    portalEnabled ? `      this._portalOriginNext = null;` : null,
    portalEnabled ? `    }` : null,
    `    // ARIA: reflect id + role + data marker to the host element`,
    `    // so they apply to the same node the substrate registered.`,
    `    if (ctx.open()) {`,
    `      this.setAttribute("id", ctx.contentId);`,
    setRoleLine,
    `      this.setAttribute("data-${cssPrefix}-content", "");`,
    positioningEnabled
      ? `      // Anchored positioning: fixed against the anchor rect,`
      : null,
    positioningEnabled
      ? `      // hidden until the first measurement completes (avoids a`
      : null,
    positioningEnabled ? `      // flash at (0, 0)).` : null,
    positioningEnabled ? `      const pos = this._position.state;` : null,
    positioningEnabled
      ? `      // The static :host rule is display: contents (no box), which`
      : null,
    positioningEnabled
      ? `      // would make position: fixed a layout no-op and let slotted`
      : null,
    positioningEnabled
      ? `      // content flow at the body. The open state needs a real box.`
      : null,
    positioningEnabled ? `      this.style.display = "block";` : null,
    positioningEnabled ? `      this.style.position = "fixed";` : null,
    positioningEnabled ? `      this.style.top = \`\${pos.top}px\`;` : null,
    positioningEnabled ? `      this.style.left = \`\${pos.left}px\`;` : null,
    positioningEnabled
      ? `      this.style.visibility = pos.ready ? "visible" : "hidden";`
      : null,
    positioningEnabled
      ? `      this.setAttribute("data-placement", pos.placement);`
      : null,
    `    } else {`,
    `      this.removeAttribute("id");`,
    clearRoleLine,
    `      this.removeAttribute("data-${cssPrefix}-content");`,
    positioningEnabled ? `      this.style.display = "";` : null,
    positioningEnabled ? `      this.style.position = "";` : null,
    positioningEnabled ? `      this.style.top = "";` : null,
    positioningEnabled ? `      this.style.left = "";` : null,
    positioningEnabled ? `      this.style.visibility = "";` : null,
    positioningEnabled ? `      this.removeAttribute("data-placement");` : null,
    `    }`,
    `  }`,
    ``,
    `  override render() {`,
    `    const ctx = this._ctxOrNull();`,
    `    if (!ctx || !ctx.open()) return nothing;`,
    `    return html\`<slot></slot>\`;`,
    `  }`,
    `}`,
    `// @generated:end`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function emitBehaviorFile(ir: ComponentIR, _surface: SurfaceIR): string {
  // Per the recon, Lit's `${Name}Behavior.ts` is the Lit-native
  // equivalent of useTooltip. For the surface path the substrate is
  // entirely consumed inside the LitElement classes themselves via
  // reactive controllers, so we still emit a small file that re-
  // exports the substrate types in case downstream consumers want
  // to type their own integrations against it. The file is
  // intentionally minimal — the public Tooltip API is the three
  // custom elements, not the behavior file.
  const name = ir.name;
  return [
    `// @generated:start imports`,
    `// Surface behavior for ${name} is hosted entirely inside the`,
    `// custom-element classes (see ${name}.ts). This module re-exports`,
    `// substrate types in case integrators need to type their own`,
    `// wrappers against the contract. The substrate itself remains`,
    `// internal to @full-stack-ds/lit.`,
    `export type { AnchoredSurfaceControllerOptions } from "../../primitives/surfaces/AnchoredSurfaceController.js";`,
    `export type {`,
    `  SurfaceOpenTrigger,`,
    `  SurfaceDismissalMode,`,
    `  SurfaceAnchorRelation,`,
    `} from "../../primitives/surfaces/SurfaceController.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
    ``,
  ].join("\n");
}
