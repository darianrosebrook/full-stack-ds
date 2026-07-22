/**
 * Angular standalone component emission, IR-driven.
 *
 * Output shape (inline-template Angular 17+ standalone component):
 *
 *   // @generated:start imports
 *   import { Component, Input, computed, ChangeDetectionStrategy } from '@angular/core';
 *   import { NgClass } from '@angular/common';
 *   import { StackComponent } from '@full-stack-ds/angular/primitives';
 *   // @generated:end
 *   // @custom:start imports
 *   // @custom:end
 *
 *   // @generated:start types
 *   export type ButtonSize = 'small' | 'medium' | 'large';
 *   // @generated:end
 *   // @custom:start types
 *   // @custom:end
 *
 *   // @generated:start component
 *   @Component({ ... })
 *   export class ButtonComponent {
 *     @Input() size?: ButtonSize = 'medium';
 *     classes = computed(() => { ... });
 *   }
 *   // @generated:end
 *   // @custom:start trailing
 *   // @custom:end
 */
import type {
  BindingExpression,
  BindingPredicateOp,
  ComponentIR,
  DomNodeIR,
  IterationIR,
  NormalizedChannelIR,
  PropTypeIR,
  ResolvedPropIR,
} from "../../ir.js";
import { TABLE_COMPOSITION_TAGS, canonicalTsType } from "../../ir.js";
import {
  emitNonReactTypeAliases,
  translateNonReactType,
} from "../../non-react-types.js";
import { renderSections, type Section } from "../../preserve.js";
import { resolveSurfaceAutoDismiss } from "../../semantics.js";
import { toKebab as sharedToKebab } from "../../contract.js";
import { resolveComponentRefImports } from "../component-ref-imports.js";
import {
  collectIconGlyphNodes,
  ICON_GLYPH_PATH_ATTRS,
  ICONOGRAPHY_MODULE,
  iconGlyphPxExpr,
  iconGlyphSizeHintsLiteral,
} from "../icon-glyph.js";
import {
  isCompoundStateContainer,
  isDisclosureContainer,
  getInteractiveItemPart,
  getMultipleItemPart,
  getRegionPart,
  getGroupHostPart,
  getGroupHostOrnamentPart,
} from "../react/hook-source.js";

// Props we don't emit as @Input() — either Angular handles them natively
// (class/style) or they are React idioms with no Angular equivalent
// (children → ng-content, className → host binding via classRecipe).
const ANGULAR_RESERVED = new Set(["class", "style", "children", "className"]);

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Emit an Angular 17+ standalone component source file for a `ComponentIR`.
 *
 * Sections use the same ids as React/Vue so preservation round-trips
 * cleanly if a user has already edited a Vue version and copies the
 * custom regions over.
 */
export function generateAngularComponentSource(ir: ComponentIR): string {
  // Compound-state-container (Tabs-shaped): emit a fully wired root component
  // that provides the context token to its children.
  if (isDisclosureContainer(ir)) {
    return generateAngularDisclosureStateRootSource(ir);
  }
  if (isCompoundStateContainer(ir)) {
    return generateAngularCompoundStateRootSource(ir);
  }

  const importsBody = ir.dom ? generateDomTreeImports(ir) : generateImports(ir);
  const typesBody = generateTypes(ir);
  const compoundClasses = ir.compoundParts
    .map((part) => generateCompoundPartComponent(ir, part))
    .join("\n\n");
  const componentBody =
    (ir.dom ? generateDomTreeComponent(ir) : generateComponent(ir)) +
    (compoundClasses ? "\n\n" + compoundClasses : "");

  const blank = (): Section => ({ kind: "between", body: "" });
  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    { kind: "generated", id: "types", body: typesBody },
    blank(),
    { kind: "custom", id: "types", body: "" },
    blank(),
    { kind: "generated", id: "component", body: componentBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
    blank(),
  ];

  return renderSections(sections, "line");
}

// ---------------------------------------------------------------------------
// Compound-state-container (Tabs-shaped) generation
// ---------------------------------------------------------------------------

/**
 * Generate the root Angular component for a compound-state-container (Tabs).
 * This component:
 *   - Calls useTabs() to get signal-based state
 *   - Provides the TabsContextToken via `providers` so child components can inject it
 *   - Exposes orientation/activationMode/loop/unmountInactive as WritableSignals
 *     so child components can track them reactively via Angular's signal system
 *   - Renders a plain <div> wrapper with BEM classes and <ng-content />
 */
function generateAngularCompoundStateRootSource(ir: ComponentIR): string {
  const { name, classRecipe } = ir;
  const channel = ir.behavior.normalizedChannels[0];
  const channelName = channel?.name ?? "activeTab";
  const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);
  const setterName = `set${capitalize(channelName)}`;

  const importsBody = [
    `import { Component, Input, OnChanges, SimpleChanges, computed, signal, forwardRef, inject, DestroyRef, ChangeDetectionStrategy } from "@angular/core";`,
    `import { NgClass } from "@angular/common";`,
    `import { use${name}, ${name}ContextToken } from "./use${name}.js";`,
  ].join("\n");

  const typesBody = emitNonReactTypeAliases(ir).join("\n");

  // Build @Input declarations
  const propLines: string[] = [];
  const declaredProps = new Set<string>();
  for (const p of ir.styledProps) {
    if (ANGULAR_RESERVED.has(p.name)) continue;
    const propLine = generateInputProp(p);
    if (propLine) {
      propLines.push(propLine);
      declaredProps.add(p.name);
    }
  }
  for (const dim of Object.keys(ir.variants)) {
    if (declaredProps.has(dim) || ANGULAR_RESERVED.has(dim)) continue;
    propLines.push(`  @Input() ${dim}?: string;`);
    declaredProps.add(dim);
  }
  if (!declaredProps.has("idBase")) {
    propLines.push(`  @Input() idBase?: string;`);
    declaredProps.add("idBase");
  }
  if (!declaredProps.has("unmountInactive")) {
    propLines.push(`  @Input() unmountInactive?: boolean = true;`);
    declaredProps.add("unmountInactive");
  }
  if (!declaredProps.has("loop")) {
    propLines.push(`  @Input() loop?: boolean = true;`);
    declaredProps.add("loop");
  }
  if (!declaredProps.has("class")) {
    propLines.push(`  @Input() class?: string;`);
    declaredProps.add("class");
  }
  // onChange handler for the channel
  if (channel && !declaredProps.has(channel.changeHandlerProp)) {
    const valueType = channel.valueType ?? "unknown";
    propLines.push(`  @Input() ${channel.changeHandlerProp}?: (value: ${valueType}) => void;`);
  }

  // Build class modifiers
  // FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: default-aware, see
  // `angularPropAccessor`'s doc comment.
  const styledByNameForClasses = new Map(ir.styledProps.map((p) => [p.name, p]));
  const classModifierLines: string[] = [];
  for (const mod of classRecipe.valueModifiers) {
    const acc = defaultAwareAngularClassPropAccessor(mod.propName, styledByNameForClasses);
    classModifierLines.push(
      `      ${acc} ? \`${classRecipe.base}--${mod.valuePrefix ?? ""}\${${acc}}\` : null,`,
    );
  }
  for (const mod of classRecipe.booleanModifiers) {
    const acc = defaultAwareAngularClassPropAccessor(mod.safeName, styledByNameForClasses);
    classModifierLines.push(
      `      ${acc} ? "${classRecipe.base}--${mod.safeName}" : null,`,
    );
  }

  // Hook call options
  const hookOptions: string[] = [];
  if (channel) {
    hookOptions.push(`    ${channel.valueProp}: () => this.${channel.valueProp},`);
    if (channel.defaultValueProp) {
      hookOptions.push(`    ${channel.defaultValueProp}: this.${channel.defaultValueProp},`);
    }
    hookOptions.push(`    ${channel.changeHandlerProp}: (v) => this.${channel.changeHandlerProp}?.(v),`);
  }
  hookOptions.push(`    idBase: this.idBase,`);
  hookOptions.push(`    destroyRef: this.destroyRef,`);

  // Build the contextValue object that is provided to child components.
  // Config values (orientation, activationMode, loop, unmountInactive) are
  // exposed as WritableSignals on the component so child components can
  // reactively read them with Angular's signal system.
  const contextValueLines: string[] = [
    `    get ${channelName}() { return self.behavior.${channelName}; },`,
    `    ${setterName}: (v) => self.behavior.${setterName}(v),`,
    `    registerTab: (v) => self.behavior.registerTab(v),`,
    `    unregisterTab: (v) => self.behavior.unregisterTab(v),`,
    `    get registeredTabs() { return self.behavior.registeredTabs; },`,
    `    get idBase() { return self.behavior.idBase; },`,
    `    // Config signals — child components read these to stay reactive`,
    `    get orientation() { return self._orientation; },`,
    `    get activationMode() { return self._activationMode; },`,
    `    get loop() { return self._loop; },`,
    `    get unmountInactive() { return self._unmountInactive; },`,
  ];

  // Build the hook options — channel values use signal-based getters
  // so createControllableState can track them reactively.
  const hookOptionsSignal: string[] = [];
  if (channel) {
    // Pass controlled value as a getter reading from _controlledValue signal
    // so createControllableState tracks it as a reactive dependency.
    hookOptionsSignal.push(`    ${channel.valueProp}: () => this._controlledValue(),`);
    if (channel.defaultValueProp) {
      hookOptionsSignal.push(`    ${channel.defaultValueProp}: this.${channel.defaultValueProp},`);
    }
    hookOptionsSignal.push(`    ${channel.changeHandlerProp}: (v) => this.${channel.changeHandlerProp}?.(v),`);
  }
  hookOptionsSignal.push(`    idBase: this.idBase,`);
  hookOptionsSignal.push(`    destroyRef: this.destroyRef,`);

  const componentBody = [
    `@Component({`,
    `  selector: "fsds-${toKebab(name)}",`,
    `  standalone: true,`,
    `  imports: [NgClass],`,
    `  providers: [`,
    `    {`,
    `      provide: ${name}ContextToken,`,
    `      useFactory: () => {`,
    `        // "self" is resolved at provide-time (same injector) so the token`,
    `        // value is the component instance itself acting as context.`,
    `        const self = inject(forwardRef(() => ${name}Component));`,
    `        const ctx: import("./use${name}.js").${name}ContextValue = {`,
    ...contextValueLines.map(l => `          ${l}`),
    `        };`,
    `        return ctx;`,
    `      },`,
    `      deps: [],`,
    `    },`,
    `  ],`,
    `  template: \`<div [ngClass]="classes()"><ng-content /></div>\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${name}Component implements OnChanges {`,
    ...propLines,
    ``,
    `  // Signal mirrors of @Input values — reactive so computed() and child`,
    `  // components can track them as signal dependencies.`,
    `  // Controlled value: updated in ngOnChanges when the parent changes [value].`,
    `  _controlledValue = signal<string | undefined>(undefined);`,
    `  // Config signals — exposed to children via context getters.`,
    `  _orientation = signal<"horizontal" | "vertical">("horizontal");`,
    `  _activationMode = signal<"automatic" | "manual">("automatic");`,
    `  _loop = signal<boolean>(true);`,
    `  _unmountInactive = signal<boolean>(true);`,
    ``,
    `  ngOnChanges(changes: SimpleChanges): void {`,
    ...(channel ? [
      `    if (changes["${channel.valueProp}"]) this._controlledValue.set(this.${channel.valueProp});`,
    ] : []),
    `    if (changes["orientation"]) this._orientation.set(this.orientation ?? "horizontal");`,
    `    if (changes["activationMode"]) this._activationMode.set(this.activationMode ?? "automatic");`,
    `    if (changes["loop"]) this._loop.set(this.loop ?? true);`,
    `    if (changes["unmountInactive"]) this._unmountInactive.set(this.unmountInactive ?? true);`,
    `  }`,
    ``,
    `  private destroyRef = inject(DestroyRef);`,
    `  protected behavior = use${name}({`,
    ...hookOptionsSignal,
    `  });`,
    ``,
    `  classes = computed(() =>`,
    `    [`,
    `      "${classRecipe.base}",`,
    ...classModifierLines,
    `      this.class,`,
    `    ].filter(Boolean).join(" "),`,
    `  );`,
    `}`,
  ].join("\n");

  const blank = (): Section => ({ kind: "between", body: "" });
  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    { kind: "generated", id: "types", body: typesBody },
    blank(),
    { kind: "custom", id: "types", body: "" },
    blank(),
    { kind: "generated", id: "component", body: componentBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
    blank(),
  ];

  return renderSections(sections, "line");
}

// ---------------------------------------------------------------------------
// Repeated-disclosure lowering (Accordion-shaped)
// ---------------------------------------------------------------------------

/** DFS for the DOM node whose part matches `partName`. */
function angularFindDomNode(
  root: NonNullable<ComponentIR["dom"]>,
  partName: string,
): NonNullable<ComponentIR["dom"]> | undefined {
  const stack: NonNullable<ComponentIR["dom"]>[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.part === partName) return node;
    if (node.children) stack.push(...node.children);
  }
  return undefined;
}

/** Returns the DOM node whose direct child has `part === partName`. */
function angularFindParentOf(
  root: NonNullable<ComponentIR["dom"]>,
  partName: string,
): NonNullable<ComponentIR["dom"]> | undefined {
  const stack: NonNullable<ComponentIR["dom"]>[] = [root];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.children?.some((c) => c.part === partName)) return node;
    if (node.children) stack.push(...node.children);
  }
  return undefined;
}

/**
 * Root component for a repeated-disclosure container (Accordion). Provides the
 * disclosure context token: exposes the openness signal, per-item toggle/open,
 * and reactive type/collapsible/disabled signals. Hosts arrow-key navigation.
 */
function generateAngularDisclosureStateRootSource(ir: ComponentIR): string {
  const { name, classRecipe } = ir;
  const channel = ir.behavior.normalizedChannels[0];
  const channelName = channel?.name ?? "openness";
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  const setterName = `set${cap(channelName)}`;
  const hasCollapsible = ir.styledProps.some((p) => p.name === "collapsible");
  const hasDisabled = ir.styledProps.some((p) => p.name === "disabled");

  const importsBody = [
    `import { Component, Input, OnChanges, SimpleChanges, ElementRef, computed, signal, forwardRef, inject, DestroyRef, ChangeDetectionStrategy } from "@angular/core";`,
    `import { NgClass } from "@angular/common";`,
    `import { use${name}, ${name}ContextToken } from "./use${name}.js";`,
  ].join("\n");

  const typesBody = emitNonReactTypeAliases(ir).join("\n");

  const propLines: string[] = [];
  const declaredProps = new Set<string>();
  for (const p of ir.styledProps) {
    if (ANGULAR_RESERVED.has(p.name)) continue;
    const propLine = generateInputProp(p);
    if (propLine) {
      propLines.push(propLine);
      declaredProps.add(p.name);
    }
  }
  for (const dim of Object.keys(ir.variants)) {
    if (declaredProps.has(dim) || ANGULAR_RESERVED.has(dim)) continue;
    propLines.push(`  @Input() ${dim}?: string;`);
    declaredProps.add(dim);
  }
  if (!declaredProps.has("class")) {
    propLines.push(`  @Input() class?: string;`);
    declaredProps.add("class");
  }
  if (channel && !declaredProps.has(channel.changeHandlerProp)) {
    const valueType = channel.valueType ?? "unknown";
    propLines.push(`  @Input() ${channel.changeHandlerProp}?: (value: ${valueType}) => void;`);
  }

  // FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: default-aware, see
  // `angularPropAccessor`'s doc comment.
  const styledByNameForClasses = new Map(ir.styledProps.map((p) => [p.name, p]));
  const classModifierLines: string[] = [];
  for (const mod of classRecipe.valueModifiers) {
    const acc = defaultAwareAngularClassPropAccessor(mod.propName, styledByNameForClasses);
    classModifierLines.push(
      `      ${acc} ? \`${classRecipe.base}--${mod.valuePrefix ?? ""}\${${acc}}\` : null,`,
    );
  }
  for (const mod of classRecipe.booleanModifiers) {
    const acc = defaultAwareAngularClassPropAccessor(mod.safeName, styledByNameForClasses);
    classModifierLines.push(
      `      ${acc} ? "${classRecipe.base}--${mod.safeName}" : null,`,
    );
  }

  const hookOptionsSignal: string[] = [];
  if (channel) {
    hookOptionsSignal.push(`    ${channel.valueProp}: () => this._controlledValue(),`);
    if (channel.defaultValueProp) {
      hookOptionsSignal.push(`    ${channel.defaultValueProp}: this.${channel.defaultValueProp},`);
    }
    hookOptionsSignal.push(`    ${channel.changeHandlerProp}: (v) => this.${channel.changeHandlerProp}?.(v),`);
  }
  hookOptionsSignal.push(`    destroyRef: this.destroyRef,`);

  const contextValueLines: string[] = [
    `    get ${channelName}() { return self.behavior.${channelName}; },`,
    `    toggleItem: (v: string) => self.toggleItem(v),`,
    `    isItemOpen: (v: string) => self.isItemOpen(v),`,
    `    get type() { return self._type; },`,
    `    get collapsible() { return self._collapsible; },`,
    `    get disabled() { return self._disabled; },`,
    `    get idBase() { return self.idBase; },`,
  ];

  const componentBody = [
    `@Component({`,
    `  selector: "fsds-${toKebab(name)}",`,
    `  standalone: true,`,
    `  imports: [NgClass],`,
    `  providers: [`,
    `    {`,
    `      provide: ${name}ContextToken,`,
    `      useFactory: () => {`,
    `        const self = inject(forwardRef(() => ${name}Component));`,
    `        const ctx: import("./use${name}.js").${name}ContextValue = {`,
    ...contextValueLines.map((l) => `          ${l}`),
    `        };`,
    `        return ctx;`,
    `      },`,
    `      deps: [],`,
    `    },`,
    `  ],`,
    `  template: \`<div [ngClass]="classes()" (keydown)="handleKeyDown($event)"><ng-content /></div>\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${name}Component implements OnChanges {`,
    ...propLines,
    ``,
    `  _controlledValue = signal<string | string[] | undefined>(undefined);`,
    `  _type = signal<"single" | "multiple">("single");`,
    `  _collapsible = signal<boolean>(false);`,
    `  _disabled = signal<boolean>(false);`,
    `  readonly idBase = \`${name.toLowerCase()}-\${++_${name.toLowerCase()}IdCounter}\`;`,
    ``,
    `  ngOnChanges(changes: SimpleChanges): void {`,
    ...(channel ? [`    if (changes["${channel.valueProp}"]) this._controlledValue.set(this.${channel.valueProp});`] : []),
    `    if (changes["type"]) this._type.set((this.type as "single" | "multiple") ?? "single");`,
    ...(hasCollapsible ? [`    if (changes["collapsible"]) this._collapsible.set(this.collapsible ?? false);`] : []),
    ...(hasDisabled ? [`    if (changes["disabled"]) this._disabled.set(this.disabled ?? false);`] : []),
    `  }`,
    ``,
    `  private destroyRef = inject(DestroyRef);`,
    `  private elRef = inject(ElementRef<HTMLElement>);`,
    `  protected behavior = use${name}({`,
    ...hookOptionsSignal,
    `  });`,
    ``,
    `  isItemOpen(itemValue: string): boolean {`,
    `    const v = this.behavior.${channelName}();`,
    `    return Array.isArray(v) ? v.includes(itemValue) : v === itemValue;`,
    `  }`,
    ``,
    `  toggleItem(itemValue: string): void {`,
    `    const v = this.behavior.${channelName}();`,
    `    if (this._type() === "multiple") {`,
    `      const current = Array.isArray(v) ? v : [];`,
    `      this.behavior.${setterName}(`,
    `        current.includes(itemValue)`,
    `          ? current.filter((x) => x !== itemValue)`,
    `          : [...current, itemValue],`,
    `      );`,
    `    } else {`,
    `      const current = typeof v === "string" ? v : "";`,
    hasCollapsible
      ? `      this.behavior.${setterName}(current === itemValue && this._collapsible() ? "" : itemValue);`
      : `      this.behavior.${setterName}(itemValue);`,
    `    }`,
    `  }`,
    ``,
    `  handleKeyDown(e: KeyboardEvent): void {`,
    `    const key = e.key;`,
    `    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") {`,
    `      return;`,
    `    }`,
    `    const host = this.elRef.nativeElement as HTMLElement;`,
    `    const triggers = Array.from(`,
    `      host.querySelectorAll<HTMLButtonElement>("[data-disclosure-trigger]"),`,
    `    ).filter((el) => !el.disabled);`,
    `    if (triggers.length === 0) return;`,
    `    const currentIndex = triggers.indexOf(document.activeElement as HTMLButtonElement);`,
    `    let nextIndex = currentIndex;`,
    `    if (key === "ArrowDown") {`,
    `      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % triggers.length;`,
    `    } else if (key === "ArrowUp") {`,
    `      nextIndex = currentIndex < 0 ? triggers.length - 1 : (currentIndex - 1 + triggers.length) % triggers.length;`,
    `    } else if (key === "Home") {`,
    `      nextIndex = 0;`,
    `    } else {`,
    `      nextIndex = triggers.length - 1;`,
    `    }`,
    `    e.preventDefault();`,
    `    triggers[nextIndex]?.focus();`,
    `  }`,
    ``,
    `  classes = computed(() =>`,
    `    [`,
    `      "${classRecipe.base}",`,
    ...classModifierLines,
    `      this.class,`,
    `    ].filter(Boolean).join(" "),`,
    `  );`,
    `}`,
  ].join("\n");

  const counterPrelude = `let _${name.toLowerCase()}IdCounter = 0;`;

  const blank = (): Section => ({ kind: "between", body: "" });
  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    blank(),
    { kind: "custom", id: "imports", body: "" },
    blank(),
    { kind: "generated", id: "types", body: [counterPrelude, typesBody].filter((s) => s.length > 0).join("\n\n") },
    blank(),
    { kind: "custom", id: "types", body: "" },
    blank(),
    { kind: "generated", id: "component", body: componentBody },
    blank(),
    { kind: "custom", id: "trailing", body: "" },
    blank(),
  ];

  return renderSections(sections, "line");
}

/** Sub-component files (Item/Trigger/Content) for a disclosure container. */
export function generateAngularDisclosureStateParts(
  ir: ComponentIR,
): Array<{ name: string; content: string }> {
  if (!isDisclosureContainer(ir)) return [];
  const { name, cssPrefix } = ir;
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  const itemPart = getInteractiveItemPart(ir);
  const regionPart = getRegionPart(ir);
  const multiplePart = getMultipleItemPart(ir);
  if (!itemPart || !regionPart || !multiplePart || !ir.dom) return [];

  const itemNode = angularFindDomNode(ir.dom, itemPart.name);
  const headerNode = angularFindParentOf(ir.dom, itemPart.name);
  const headerPartName = headerNode?.part;
  const headerTag = headerNode?.tag ?? "div";
  const chevronPartName = itemNode?.children?.find(
    (c) => c.part !== undefined && c.tag !== "slot" && c.tag !== "children",
  )?.part;
  const innerNode = angularFindDomNode(ir.dom, regionPart.name);
  const innerChild = innerNode?.children?.find(
    (c) => c.part !== undefined && c.tag !== "slot" && c.tag !== "children",
  );
  const innerPartName = innerChild?.part;
  const innerTag = innerChild?.tag ?? "div";

  const itemName = `${name}${cap(multiplePart.name)}`;
  const triggerName = `${name}${cap(itemPart.name)}`;
  const contentName = `${name}${cap(regionPart.name)}`;

  const itemCssClass = `${cssPrefix}__${multiplePart.name}`;
  const triggerCssClass = `${cssPrefix}__${itemPart.name}`;
  const contentCssClass = `${cssPrefix}__${regionPart.name}`;

  // Item component (passive wrapper)
  const itemContent = [
    `// @generated:start imports`,
    `import { Component, Input, ChangeDetectionStrategy } from "@angular/core";`,
    `import { NgClass } from "@angular/common";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start component`,
    `@Component({`,
    `  selector: "fsds-${toKebab(itemName)}",`,
    `  standalone: true,`,
    `  imports: [NgClass],`,
    `  template: \`<div [ngClass]="classes()"><ng-content /></div>\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${itemName}Component {`,
    `  @Input() class?: string;`,
    `  @Input() dataTestid?: string;`,
    ``,
    `  classes(): string {`,
    `    return ["${itemCssClass}", this.class].filter(Boolean).join(" ");`,
    `  }`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
  ].join("\n");

  // Trigger component
  const triggerTemplateOpen = headerPartName ? `<${headerTag} class="${cssPrefix}__${headerPartName}">` : "";
  const triggerTemplateClose = headerPartName ? `</${headerTag}>` : "";
  const chevronMarkup = chevronPartName ? `<span class="${cssPrefix}__${chevronPartName}"></span>` : "";
  const triggerContent = [
    `// @generated:start imports`,
    `import { Component, Input, computed, ChangeDetectionStrategy } from "@angular/core";`,
    `import { NgClass } from "@angular/common";`,
    `import { use${name}Context } from "./use${name}.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start component`,
    `@Component({`,
    `  selector: "fsds-${toKebab(triggerName)}",`,
    `  standalone: true,`,
    `  imports: [NgClass],`,
    `  template: \`${triggerTemplateOpen}<button`,
    `  type="button"`,
    `  [ngClass]="classes()"`,
    `  data-disclosure-trigger`,
    `  [attr.data-value]="value"`,
    `  [attr.id]="ctx.idBase + '-trigger-' + value"`,
    `  [attr.aria-controls]="ctx.idBase + '-content-' + value"`,
    `  [attr.aria-expanded]="isOpen()"`,
    `  [disabled]="ctx.disabled()"`,
    `  (click)="ctx.toggleItem(value)"`,
    `><ng-content />${chevronMarkup}</button>${triggerTemplateClose}\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${triggerName}Component {`,
    `  @Input({ required: true }) value!: string;`,
    `  @Input() class?: string;`,
    `  @Input() dataTestid?: string;`,
    ``,
    `  protected ctx = use${name}Context();`,
    ``,
    `  isOpen = computed(() => this.ctx.isItemOpen(this.value));`,
    ``,
    `  classes = computed(() =>`,
    `    [`,
    `      "${triggerCssClass}",`,
    `      this.isOpen() && "${triggerCssClass}--open",`,
    `      this.class,`,
    `    ].filter(Boolean).join(" "),`,
    `  );`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
  ].join("\n");

  // Content component
  const contentInnerOpen = innerPartName ? `<${innerTag} class="${cssPrefix}__${innerPartName}">` : "";
  const contentInnerClose = innerPartName ? `</${innerTag}>` : "";
  const contentContent = [
    `// @generated:start imports`,
    `import { Component, Input, computed, ChangeDetectionStrategy } from "@angular/core";`,
    `import { NgClass } from "@angular/common";`,
    `import { use${name}Context } from "./use${name}.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start component`,
    `@Component({`,
    `  selector: "fsds-${toKebab(contentName)}",`,
    `  standalone: true,`,
    `  imports: [NgClass],`,
    `  template: \`<div`,
    `  role="region"`,
    `  [ngClass]="classes()"`,
    `  [attr.id]="ctx.idBase + '-content-' + value"`,
    `  [attr.aria-labelledby]="ctx.idBase + '-trigger-' + value"`,
    `  [attr.hidden]="!isOpen() ? true : null"`,
    `>${contentInnerOpen}<ng-content />${contentInnerClose}</div>\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${contentName}Component {`,
    `  @Input({ required: true }) value!: string;`,
    `  @Input() class?: string;`,
    `  @Input() dataTestid?: string;`,
    ``,
    `  protected ctx = use${name}Context();`,
    ``,
    `  isOpen = computed(() => this.ctx.isItemOpen(this.value));`,
    ``,
    `  classes = computed(() =>`,
    `    ["${contentCssClass}", this.class].filter(Boolean).join(" "),`,
    `  );`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
  ].join("\n");

  return [
    { name: itemName, content: itemContent },
    { name: triggerName, content: triggerContent },
    { name: contentName, content: contentContent },
  ];
}

/**
 * Returns an array of `{ name, content }` for the sub-component files emitted
 * for a compound-state-container (e.g. TabsList, TabsTab, TabsPanel).
 *
 * These are separate @Component classes that inject the context token provided
 * by the root component.
 */
export function generateAngularCompoundStateParts(
  ir: ComponentIR,
): Array<{ name: string; content: string }> {
  if (!isCompoundStateContainer(ir) || isDisclosureContainer(ir)) return [];

  const { name, cssPrefix } = ir;
  const itemPart = getInteractiveItemPart(ir);
  const regionPart = getRegionPart(ir);
  const groupPart = getGroupHostPart(ir);
  const ornamentPart = getGroupHostOrnamentPart(ir);

  if (!itemPart || !regionPart) return [];

  const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);
  const listName = `${name}${capitalize(groupPart?.name ?? "List")}`;
  const tabName = `${name}${capitalize(itemPart.name)}`;
  const panelName = `${name}${capitalize(regionPart.name)}`;

  const channel = ir.behavior.normalizedChannels[0];
  const channelName = channel?.name ?? "activeTab";
  const setterName = `set${capitalize(channelName)}`;
  const listCssClass = `${cssPrefix}__${groupPart?.name ?? "list"}`;
  const tabCssClass = `${cssPrefix}__${itemPart.name}`;
  const panelCssClass = `${cssPrefix}__${regionPart.name}`;

  // ---------------------------------------------------------------------------
  // TabsList component
  // ---------------------------------------------------------------------------
  const listContent = [
    `// @generated:start imports`,
    `import { Component, Input, ElementRef, inject, ChangeDetectionStrategy } from "@angular/core";`,
    `import { NgClass } from "@angular/common";`,
    `import { use${name}Context } from "./use${name}.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start component`,
    `@Component({`,
    `  selector: "fsds-${toKebab(listName)}",`,
    `  standalone: true,`,
    `  imports: [NgClass],`,
    `  template: \`<div`,
    `  #listEl`,
    `  role="tablist"`,
    `  [ngClass]="classes()"`,
    `  [attr.aria-orientation]="ctx.orientation()"`,
    `  (keydown)="handleKeyDown($event)"`,
    `><ng-content />${ornamentPart ? `<span [ngClass]="'${cssPrefix}__${ornamentPart.name}'" aria-hidden="true"></span>` : ""}</div>\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${listName}Component {`,
    `  @Input() class?: string;`,
    `  @Input() dataTestid?: string;`,
    ``,
    `  protected ctx = use${name}Context();`,
    `  private elRef = inject(ElementRef<HTMLElement>);`,
    ``,
    `  classes(): string {`,
    `    return ["${listCssClass}", this.class].filter(Boolean).join(" ");`,
    `  }`,
    ``,
    `  handleKeyDown(e: KeyboardEvent): void {`,
    `    const tabs = this.ctx.registeredTabs();`,
    `    if (tabs.length === 0) return;`,
    `    const currentIndex = tabs.indexOf(this.ctx.${channelName}());`,
    `    const isHorizontal = this.ctx.orientation() !== "vertical";`,
    `    let nextIndex = currentIndex;`,
    ``,
    `    if (`,
    `      (isHorizontal && e.key === "ArrowRight") ||`,
    `      (!isHorizontal && e.key === "ArrowDown")`,
    `    ) {`,
    `      e.preventDefault();`,
    `      nextIndex = this.ctx.loop()`,
    `        ? (currentIndex + 1) % tabs.length`,
    `        : Math.min(currentIndex + 1, tabs.length - 1);`,
    `    } else if (`,
    `      (isHorizontal && e.key === "ArrowLeft") ||`,
    `      (!isHorizontal && e.key === "ArrowUp")`,
    `    ) {`,
    `      e.preventDefault();`,
    `      nextIndex = this.ctx.loop()`,
    `        ? (currentIndex - 1 + tabs.length) % tabs.length`,
    `        : Math.max(currentIndex - 1, 0);`,
    `    } else if (e.key === "Home") {`,
    `      e.preventDefault();`,
    `      nextIndex = 0;`,
    `    } else if (e.key === "End") {`,
    `      e.preventDefault();`,
    `      nextIndex = tabs.length - 1;`,
    `    } else if (e.key === "Enter" || e.key === " ") {`,
    `      if (this.ctx.activationMode() === "manual") {`,
    `        e.preventDefault();`,
    `        const host = this.elRef.nativeElement as HTMLElement;`,
    `        const focusedBtn = host.querySelector<HTMLButtonElement>('[role="tab"]:focus');`,
    `        if (focusedBtn) {`,
    `          const val = focusedBtn.getAttribute("data-value");`,
    `          if (val) this.ctx.${setterName}(val);`,
    `        }`,
    `      }`,
    `      return;`,
    `    } else {`,
    `      return;`,
    `    }`,
    ``,
    `    const targetValue = tabs[nextIndex];`,
    `    if (this.ctx.activationMode() === "automatic") {`,
    `      this.ctx.${setterName}(targetValue);`,
    `    }`,
    `    const host = this.elRef.nativeElement as HTMLElement;`,
    `    const btn = host.querySelector<HTMLButtonElement>(`,
    `      \`[role="tab"][data-value="\${targetValue}"]\`,`,
    `    );`,
    `    btn?.focus();`,
    `  }`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
  ].join("\n");

  // ---------------------------------------------------------------------------
  // TabsTab component
  // ---------------------------------------------------------------------------
  const tabContent = [
    `// @generated:start imports`,
    `import { Component, Input, OnInit, OnDestroy, computed, inject, DestroyRef, ChangeDetectionStrategy } from "@angular/core";`,
    `import { NgClass } from "@angular/common";`,
    `import { use${name}Context } from "./use${name}.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start component`,
    `@Component({`,
    `  selector: "fsds-${toKebab(tabName)}",`,
    `  standalone: true,`,
    `  imports: [NgClass],`,
    `  template: \`<button`,
    `  role="tab"`,
    `  type="button"`,
    `  [ngClass]="classes()"`,
    `  [attr.data-value]="value"`,
    `  [attr.id]="ctx.idBase + '-tab-' + value"`,
    `  [attr.aria-controls]="ctx.idBase + '-panel-' + value"`,
    `  [attr.aria-selected]="isActive()"`,
    `  [attr.tabindex]="isActive() ? 0 : -1"`,
    `  [disabled]="disabled"`,
    `  (click)="ctx.${setterName}(value)"`,
    `><ng-content /></button>\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${tabName}Component implements OnInit, OnDestroy {`,
    `  @Input({ required: true }) value!: string;`,
    `  @Input() disabled?: boolean;`,
    `  @Input() class?: string;`,
    `  @Input() dataTestid?: string;`,
    ``,
    `  protected ctx = use${name}Context();`,
    ``,
    `  isActive = computed(() => this.ctx.${channelName}() === this.value);`,
    ``,
    `  classes = computed(() =>`,
    `    [`,
    `      "${tabCssClass}",`,
    `      this.isActive() && "${tabCssClass}--active",`,
    `      this.class,`,
    `    ].filter(Boolean).join(" "),`,
    `  );`,
    ``,
    `  ngOnInit(): void {`,
    `    this.ctx.registerTab(this.value);`,
    `  }`,
    ``,
    `  ngOnDestroy(): void {`,
    `    this.ctx.unregisterTab(this.value);`,
    `  }`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
  ].join("\n");

  // ---------------------------------------------------------------------------
  // TabsPanel component
  // ---------------------------------------------------------------------------
  const panelContent = [
    `// @generated:start imports`,
    `import { Component, Input, computed, inject, ChangeDetectionStrategy } from "@angular/core";`,
    `import { NgClass, NgIf } from "@angular/common";`,
    `import { use${name}Context } from "./use${name}.js";`,
    `// @generated:end`,
    ``,
    `// @custom:start imports`,
    ``,
    `// @custom:end`,
    ``,
    `// @generated:start component`,
    `@Component({`,
    `  selector: "fsds-${toKebab(panelName)}",`,
    `  standalone: true,`,
    `  imports: [NgClass, NgIf],`,
    `  template: \`<div`,
    `  *ngIf="!ctx.unmountInactive() || isActive()"`,
    `  role="tabpanel"`,
    `  [ngClass]="classes()"`,
    `  [attr.id]="ctx.idBase + '-panel-' + value"`,
    `  [attr.aria-labelledby]="ctx.idBase + '-tab-' + value"`,
    `  [attr.tabindex]="0"`,
    `  [attr.hidden]="!isActive() ? true : null"`,
    `><ng-content /></div>\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${panelName}Component {`,
    `  @Input({ required: true }) value!: string;`,
    `  @Input() class?: string;`,
    `  @Input() dataTestid?: string;`,
    ``,
    `  protected ctx = use${name}Context();`,
    ``,
    `  isActive = computed(() => this.ctx.${channelName}() === this.value);`,
    ``,
    `  classes = computed(() =>`,
    `    ["${panelCssClass}", this.class].filter(Boolean).join(" "),`,
    `  );`,
    `}`,
    `// @generated:end`,
    ``,
    `// @custom:start trailing`,
    ``,
    `// @custom:end`,
  ].join("\n");

  return [
    { name: listName, content: listContent },
    { name: tabName, content: tabContent },
    { name: panelName, content: panelContent },
  ];
}

/**
 * Emit an additional @Component class for a compound part (e.g.
 * ModalHeader, ModalBody). Stateless wrapper: one BEM block class plus
 * the part's semantic element where applicable.
 */
function generateCompoundPartComponent(
  ir: ComponentIR,
  part: { name: string; semanticElement?: string; layoutVariant?: string; nativeTag?: string },
): string {
  const subName = `${ir.name}${part.name[0].toUpperCase()}${part.name.slice(1)}`;
  const className = `${subName}Component`;
  const cssClass = `${ir.cssPrefix}__${part.name}`;

  // Native-tag branch: emit an attribute selector so the host element
  // IS the native tag, supplied by the consumer's template. This is
  // the only way to host native table children inside <thead>/<tbody>
  // — element selectors (<fsds-table-row>) are invalid table content
  // and would be hoisted out by the browser parser.
  //
  // Selector convention: <nativeTag>[fsdsComponentNamePartName]
  //   e.g. `tr[fsdsTableRow]` for the row part of a Table component.
  // Consumer writes: `<tr fsdsTableRow>...</tr>`.
  if (part.nativeTag && TABLE_COMPOSITION_TAGS.has(part.nativeTag)) {
    const tag = part.nativeTag;
    // PascalCase attribute name from the subcomponent name. Angular
    // attribute selectors use camelCase by convention, so `TableRow`
    // becomes `fsdsTableRow` (lowercase first letter after the prefix).
    const attrSelector = `fsds${subName}`;
    return [
      `@Component({`,
      `  selector: "${tag}[${attrSelector}]",`,
      `  standalone: true,`,
      `  imports: [NgClass],`,
      `  template: \`<ng-content />\`,`,
      `  host: {`,
      `    "[class]": "classes()",`,
      `  },`,
      `  changeDetection: ChangeDetectionStrategy.OnPush,`,
      `})`,
      `export class ${className} {`,
      `  @Input() class?: string;`,
      `  @Input() dataTestid?: string;`,
      ``,
      `  classes(): string {`,
      `    return ["${cssClass}", this.class].filter(Boolean).join(" ");`,
      `  }`,
      `}`,
    ].join("\n");
  }

  const selector = toKebab(subName);
  const asAttr =
    part.semanticElement && part.semanticElement !== "div"
      ? ` as="${part.semanticElement}"`
      : "";
  const variantAttr =
    part.layoutVariant === "horizontal" ? ` variant="horizontal"` : "";
  const template = `<fsds-stack${asAttr}${variantAttr} [ngClass]="classes()"><ng-content /></fsds-stack>`;

  return [
    `@Component({`,
    `  selector: "fsds-${selector}",`,
    `  standalone: true,`,
    `  imports: [NgClass, StackComponent],`,
    `  template: \`${template}\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${className} {`,
    `  @Input() class?: string;`,
    `  @Input() dataTestid?: string;`,
    ``,
    // Plain getter (not computed signal): the class list only references
    // @Input properties, which aren't signals. A computed() would cache
    // the initial value forever.
    `  classes(): string {`,
    `    return ["${cssClass}", this.class].filter(Boolean).join(" ");`,
    `  }`,
    `}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

function generateImports(ir: ComponentIR): string {
  const coreNames = ["Component", "Input", "ChangeDetectionStrategy"];

  // `computed` is only used when the component has behavior channels (and
  // therefore signal-backed reads in the classes computation). Stack-only
  // and compound-part components emit a plain getter and don't need it.
  if (ir.behavior.normalizedChannels.length > 0) {
    coreNames.push("computed");
  }

  // HostBinding is needed when the root element is not the default host
  if (ir.root.element !== "div") {
    coreNames.push("HostBinding");
  }

  const lines: string[] = [
    `import { ${coreNames.join(", ")} } from "@angular/core";`,
    `import { NgClass } from "@angular/common";`,
    `import { StackComponent } from "../../primitives/index.js";`,
  ];

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Type aliases
// ---------------------------------------------------------------------------

function generateTypes(ir: ComponentIR): string {
  return emitNonReactTypeAliases(ir).join("\n");
}

// ---------------------------------------------------------------------------
// Component class
// ---------------------------------------------------------------------------

function generateComponent(ir: ComponentIR): string {
  const selector = toKebab(ir.name);
  const className = `${ir.name}Component`;
  const template = generateTemplate(ir);

  const lines: string[] = [
    `@Component({`,
    `  selector: "fsds-${selector}",`,
    `  standalone: true,`,
    `  imports: [NgClass, StackComponent],`,
    `  template: \`${template}\`,`,
    `  changeDetection: ChangeDetectionStrategy.OnPush,`,
    `})`,
    `export class ${className} {`,
  ];

  // @Input() decorators (event handlers excluded — use @Output EventEmitter instead)
  const declaredProps = new Set<string>();
  for (const p of ir.styledProps) {
    if (ANGULAR_RESERVED.has(p.name)) continue;
    const propLine = generateInputProp(p);
    if (propLine) {
      lines.push(propLine);
      declaredProps.add(p.name);
    }
  }

  // Variant dimensions referenced in classes computed but not present as
  // styled props need their own @Input declarations so `this.<dim>` resolves.
  for (const dim of Object.keys(ir.variants)) {
    if (declaredProps.has(dim) || ANGULAR_RESERVED.has(dim)) continue;
    lines.push(`  @Input() ${dim}?: string;`);
    declaredProps.add(dim);
  }

  // classes = computed(() => ...)
  lines.push(``);
  lines.push(...generateClassesComputed(ir));

  lines.push(`}`);
  return lines.join("\n");
}

function generateInputProp(p: ResolvedPropIR): string | null {
  const type = lowerAngularPropType(p.propType);
  const defaultPart = p.defaultExpr !== undefined ? ` = ${p.defaultExpr}` : "";
  // Required props with no default need a definite-assignment assertion to
  // satisfy strictPropertyInitialization; optional props use `?:`.
  let modifier: string;
  if (p.required) {
    modifier = defaultPart ? ":" : "!:";
  } else {
    modifier = "?:";
  }
  // Function-typed props (callbacks like `onDismiss?: () => void`) are
  // consumer-callback inputs, NOT @Output() EventEmitters. Angular's
  // canonical event-source is the EventEmitter, but here the contract
  // declares a prop the consumer *passes in* — the component invokes
  // it on click. The dom-tree's events field references these via
  // `(click)="onDismiss && onDismiss()"`, so the @Input must exist or
  // the template fails ngc strictTemplates. Pre-IR-DOM-BINDING-
  // CAPABILITY-01 these were silently dropped and the rail caught the
  // ensuing template error.
  return `  @Input() ${p.safeName}${modifier} ${type}${defaultPart};`;
}

function generateClassesComputed(ir: ComponentIR): string[] {
  const { classRecipe } = ir;
  // FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: default-aware, see
  // `angularPropAccessor`'s doc comment.
  const styledByName = new Map(ir.styledProps.map((p) => [p.name, p]));
  // Stack-only components read only @Input properties (plain JS, not
  // signals). A computed() would cache the initial value forever; emit a
  // plain method that re-evaluates on every call instead.
  const lines: string[] = [
    `  classes(): string {`,
    `    const parts: Array<string | null | undefined> = ["${classRecipe.base}"];`,
  ];

  for (const mod of classRecipe.valueModifiers) {
    const acc = defaultAwareAngularClassPropAccessor(mod.safeName, styledByName);
    lines.push(
      `    if (${acc}) parts.push(\`${classRecipe.base}--${mod.valuePrefix ?? ""}\${${acc}}\`);`,
    );
  }

  for (const mod of classRecipe.booleanModifiers) {
    const acc = defaultAwareAngularClassPropAccessor(mod.safeName, styledByName);
    lines.push(
      `    if (${acc}) parts.push("${classRecipe.base}--${mod.safeName}");`,
    );
  }

  lines.push(`    return parts.filter(Boolean).join(" ");`);
  lines.push(`  }`);
  return lines;
}

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------

function generateTemplate(ir: ComponentIR): string {
  const { root } = ir;
  const asAttr = root.element !== "div" ? ` as="${root.element}"` : "";
  const roleAttr = root.effectiveRole ? ` role="${root.effectiveRole}"` : "";
  return `<fsds-stack${asAttr}${roleAttr} [ngClass]="classes()"><ng-content /></fsds-stack>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Use the shared toKebab from contract.ts so Angular selectors match other
// codegen outputs. The previous local implementation inserted a hyphen before
// *every* capital letter and produced names like `fsds-o-t-p` that didn't
// match consumers (e.g., Lit test files use plan.testId via the shared util).
function toKebab(name: string): string {
  return sharedToKebab(name);
}

/**
 * Map React-convention type strings to Angular-safe equivalents via the
 * shared non-React translator (same logic as Vue / Lit / Svelte).
 */
function angularType(typeStr: string): string {
  return translateNonReactType(typeStr);
}

/**
 * Lower a framework-neutral PropTypeIR into an Angular/TS type expression. Reads
 * the structured `propType` (ref from `propType.to`, fallback via the legacy
 * string path on `propType.raw`, V1 kinds via the canonical string) so output is
 * byte-identical. (CODEGEN-PROP-TYPE-IR-PILOT-01, slice 2)
 */
function lowerAngularPropType(pt: PropTypeIR): string {
  switch (pt.kind) {
    case "ref":
      return angularType(pt.to);
    case "fallback":
      return angularType(pt.raw);
    default:
      return angularType(canonicalTsType(pt));
  }
}

// ---------------------------------------------------------------------------
// DOM-tree-driven component (B.2c)
// ---------------------------------------------------------------------------

/** Walk a DomNodeIR tree and return true if any node has ifProp === "children". */
function treeHasChildrenGuard(node: DomNodeIR): boolean {
  if (node.ifProp === "children") return true;
  return node.children.some(treeHasChildrenGuard);
}

/** Walk a DomNodeIR tree and return true if any node will render a
 *  `*ngIf` (i.e. has a non-null `ifProp`). Used to decide whether
 *  `NgIf` belongs in the standalone component's imports list.
 *  ICON-CATALOG-RUNTIME-DELIVERY-01: an `iconGlyph` node also emits a
 *  `*ngIf="... as glyph"` null-guard around the svg. */
function treeUsesNgIf(node: DomNodeIR): boolean {
  if (node.ifProp) return true;
  if (node.iconGlyph) return true;
  return node.children.some(treeUsesNgIf);
}

/** Walk a DomNodeIR tree and return true if any node declares
 *  iteration. Used to decide whether `NgFor` belongs in the
 *  standalone component's imports list.
 *  ICON-CATALOG-RUNTIME-DELIVERY-01: an `iconGlyph` node also emits a
 *  `*ngFor` loop over the resolved glyph's path records. */
function treeUsesNgFor(node: DomNodeIR): boolean {
  if (node.iteration) return true;
  if (node.iconGlyph) return true;
  return node.children.some(treeUsesNgFor);
}

/** Walk a DomNodeIR tree and return true if any node has count
 *  iteration. Count iteration needs a class-body `arrayFromCount`
 *  helper because Angular templates can't construct arrays inline. */
function treeUsesCountIteration(node: DomNodeIR): boolean {
  if (node.iteration?.kind === "count") return true;
  return node.children.some(treeUsesCountIteration);
}

/** Walk a DomNodeIR tree and return true if any binding uses the
 *  `predicate:memberOf` operator. Angular templates can't reference
 *  the global `Array` object, so memberOf is lowered to a component
 *  helper method (`this.memberOf(L, R)`) injected only when needed.
 *  BINDING-EXPRESSION-V2-PREDICATE-01.
 *
 *  Source fact: Angular template parser rejects bare `Array.isArray`.
 *  Applies by: presence of `predicate:memberOf` in any binding
 *  expression on this DomNodeIR subtree.
 *  Removable when: Angular emitter has a generic mechanism for
 *  template-safe lowering of any global call. */
function treeUsesMemberOfPredicate(node: DomNodeIR): boolean {
  const checkExpr = (expr: BindingExpression): boolean => {
    if (expr.kind === "predicate") {
      if (expr.op === "memberOf") return true;
      return checkExpr(expr.left) || checkExpr(expr.right);
    }
    return false;
  };
  for (const binding of Object.values(node.bindings)) {
    if (checkExpr(binding)) return true;
  }
  return node.children.some(treeUsesMemberOfPredicate);
}

function generateDomTreeImports(ir: ComponentIR): string {
  const coreNames = [
    "Component",
    "Input",
    "computed",
    "DestroyRef",
    "inject",
    "ChangeDetectionStrategy",
  ];
  if (
    resolveSurfaceAutoDismiss(ir) &&
    ir.behavior.normalizedChannels.some((c) => c.valueType === "boolean")
  ) {
    coreNames.push("effect");
  }
  // When any dom node uses `if: "children"`, the component needs AfterContentInit
  // and ElementRef to detect content projection at runtime.
  if (ir.dom && treeHasChildrenGuard(ir.dom)) {
    coreNames.push("AfterContentInit", "ElementRef");
  }
  // Only import NgIf when the rendered template will actually use
  // `*ngIf`. Declaring it otherwise triggers ngc NG8113 (unused
  // directive in standalone imports) and clutters the public API
  // surface of the standalone component. Same pattern for NgFor
  // when `iterate` directives are present in the dom tree
  // (IR-DOM-ITERATE-CAPABILITY-01).
  const usesNgIf = ir.dom ? treeUsesNgIf(ir.dom) : false;
  const usesNgFor = ir.dom ? treeUsesNgFor(ir.dom) : false;
  const usesNgSwitch = Boolean(ir.root.polymorphicTagProp);
  const commonNames = ["NgClass"];
  if (usesNgIf) commonNames.push("NgIf");
  if (usesNgFor) commonNames.push("NgFor");
  if (usesNgSwitch) commonNames.push("NgSwitch", "NgSwitchCase");
  const commonImports = commonNames.join(", ");
  const lines: string[] = [
    `import { ${coreNames.join(", ")} } from "@angular/core";`,
    `import { ${commonImports} } from "@angular/common";`,
  ];
  if (ir.compoundParts.length > 0) {
    lines.push(`import { StackComponent } from "../../primitives/index.js";`);
  }
  // componentRef: import the referenced standalone component class
  // (CODEGEN-RECURSIVE-COMPOSITION-01). It is also added to the @Component
  // imports[] array; the template addresses it by selector.
  for (const refImport of resolveComponentRefImports(ir.name, ir.dom, "angular")) {
    lines.push(
      `import { ${refImport.identifier} } from "${refImport.specifier}";`,
    );
  }
  if (ir.behavior.normalizedChannels.length > 0) {
    lines.push(`import { use${ir.name} } from "./use${ir.name}.js";`);
  }
  if (
    resolveSurfaceAutoDismiss(ir) &&
    ir.behavior.normalizedChannels.some((c) => c.valueType === "boolean")
  ) {
    lines.push(`import { createAutoDismiss } from "../../primitives/index.js";`);
  }
  // iconGlyph: import the catalog resolver from the committed package-root
  // module of @full-stack-ds/iconography (ICON-CATALOG-RUNTIME-DELIVERY-01).
  // Structural — driven by IR `iconGlyph` facts, never per-component lore.
  if (ir.dom && collectIconGlyphNodes(ir.dom).length > 0) {
    lines.push(`import { resolveIcon } from "${ICONOGRAPHY_MODULE}";`);
  }
  return lines.join("\n");
}

function generateDomTreeComponent(ir: ComponentIR): string {
  if (!ir.dom) throw new Error("generateDomTreeComponent requires ir.dom");

  const selector = toKebab(ir.name);
  const className = `${ir.name}Component`;
  const channels = ir.behavior.normalizedChannels;
  const channelByName = new Map(channels.map((c) => [c.name, c]));
  const hasHook = channels.length > 0;

  const overlayClickTrigger = ir.behavior.normalizedDismissalTriggers.find(
    (t) => t.event === "overlayClick",
  );
  const booleanChannel = channels.find((c) => c.valueType === "boolean");
  const autoDismissActive = Boolean(
    resolveSurfaceAutoDismiss(ir) && booleanChannel,
  );

  const styledByName = new Map(ir.styledProps.map((p) => [p.name, p]));

  // ICON-CATALOG-RUNTIME-DELIVERY-01: glyph nodes get a module-scope
  // size-hints const (when the glyph has sizeHints) plus a pair of class
  // getters resolving the requested pixel size and the catalog lookup.
  // Collected before the template renders so the getter names are known
  // for the node-identity lookup in `renderAngularDomNode`.
  const iconGlyphNodes = collectIconGlyphNodes(ir.dom);
  const iconGlyphIdents = new Map<
    DomNodeIR,
    { glyphGetter: string; pxGetter: string | undefined }
  >();
  for (const { node, glyph, suffix } of iconGlyphNodes) {
    const hintsIdent = glyph.sizeHints
      ? `ICON_GLYPH_SIZE_HINTS${suffix}`
      : undefined;
    // FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: @Input() size is
    // optional-typed even when the contract declares a default
    // (class-field initializers only apply once, at construction), so a
    // bare `this.size` index into Record<string, number> both fails
    // TS2538 AND, if defaulted with the empty string instead of the
    // contract default, silently misses the hints map and falls through
    // to the natural SVG size. Fall back to the resolved prop's contract
    // default (e.g. Icon's `size` default "md") so undefined resolves to
    // the same hint react's parameter default resolves to; `""` only
    // when the prop declares no contract default.
    const sizeDefaultExpr = styledByName.get(glyph.sizePropName ?? "")?.defaultExpr;
    const pxExpr = iconGlyphPxExpr(
      glyph,
      glyph.sizePropName
        ? `(this.${glyph.sizePropName} ?? ${sizeDefaultExpr ?? '""'})`
        : undefined,
      hintsIdent,
    );
    const pxGetter = pxExpr === undefined ? undefined : `iconGlyphPx${suffix}`;
    iconGlyphIdents.set(node, { glyphGetter: `iconGlyph${suffix}`, pxGetter });
  }

  const ctx: AngularRenderContext = {
    classRecipe: ir.classRecipe.base,
    channelByName,
    styledByName,
    isRoot: true,
    autoDismissPause: autoDismissActive,
    rootPolymorphicTag: ir.root.polymorphicTagProp,
    iconGlyphIdents,
    ...(overlayClickTrigger && booleanChannel
      ? {
          overlayClickSetter: `set${capitalizeAngular(booleanChannel.name)}`,
          overlayClickEnabledProp: overlayClickTrigger.enabledByProp,
        }
      : {}),
  };
  const template = renderAngularDomNode(ir.dom, ctx, 0);
  const hasChildrenGuard = treeHasChildrenGuard(ir.dom);
  const usesMemberOf = treeUsesMemberOfPredicate(ir.dom);
  const usesNgIf = treeUsesNgIf(ir.dom);
  const usesNgFor = treeUsesNgFor(ir.dom);
  const usesCountIteration = treeUsesCountIteration(ir.dom);
  const decoratorImports = ["NgClass"];
  if (usesNgIf) decoratorImports.push("NgIf");
  if (usesNgFor) decoratorImports.push("NgFor");
  if (ir.root.polymorphicTagProp) {
    decoratorImports.push("NgSwitch", "NgSwitchCase");
  }
  // componentRef: each referenced standalone component class must be in the
  // @Component imports[] so Angular resolves its selector in this template.
  for (const refImport of resolveComponentRefImports(ir.name, ir.dom, "angular")) {
    decoratorImports.push(refImport.identifier);
  }

  const lines: string[] = [];
  // ICON-CATALOG-RUNTIME-DELIVERY-01: module-scope size-hints maps, one per
  // glyph node that declares `sizeHints`, emitted ahead of the decorator
  // (matching the React emitter's module-scope const placement).
  for (const { glyph, suffix } of iconGlyphNodes) {
    if (glyph.sizeHints) {
      lines.push(
        `const ICON_GLYPH_SIZE_HINTS${suffix}: Record<string, number> = ` +
          `${iconGlyphSizeHintsLiteral(glyph.sizeHints)};`,
      );
      lines.push(``);
    }
  }
  lines.push(`@Component({`);
  lines.push(`  selector: "fsds-${selector}",`);
  lines.push(`  standalone: true,`);
  lines.push(`  imports: [${decoratorImports.join(", ")}],`);
  lines.push(`  template: \`${template}\`,`);
  lines.push(`  changeDetection: ChangeDetectionStrategy.OnPush,`);
  lines.push(`})`);
  // When the dom tree has a children guard, the class implements AfterContentInit
  // so it can detect content projection and toggle `hasContent` for *ngIf.
  if (hasChildrenGuard) {
    lines.push(`export class ${className} implements AfterContentInit {`);
  } else {
    lines.push(`export class ${className} {`);
  }

  // @Input declarations for all styled props (skipping reserved + event handlers)
  const declaredProps = new Set<string>();
  for (const p of ir.styledProps) {
    if (ANGULAR_RESERVED.has(p.name)) continue;
    const propLine = generateInputProp(p);
    if (propLine) {
      lines.push(propLine);
      declaredProps.add(p.name);
    }
  }
  // The dom-tree path's classes computed references `this.class` (the user's
  // arbitrary className passthrough). Declare it explicitly here since the
  // reserved set excludes it from the loop above.
  lines.push(`  @Input() class?: string;`);
  // Event handlers (channel onChange) — emit as @Input callbacks. Angular
  // typically uses @Output for events, but for design-system parity (the
  // contract says onChange is a callback), we keep @Input.
  for (const ch of channels) {
    if (declaredProps.has(ch.changeHandlerProp)) continue;
    const valueType = ch.valueType ?? "unknown";
    lines.push(
      `  @Input() ${ch.changeHandlerProp}?: (value: ${valueType}) => void;`,
    );
    declaredProps.add(ch.changeHandlerProp);
  }
  for (const dim of Object.keys(ir.variants)) {
    if (declaredProps.has(dim) || ANGULAR_RESERVED.has(dim)) continue;
    lines.push(`  @Input() ${dim}?: string;`);
    declaredProps.add(dim);
  }

  if (hasHook) {
    lines.push(``);
    lines.push(`  private destroyRef = inject(DestroyRef);`);
    // Build the hook call
    lines.push(`  protected behavior = use${ir.name}({`);
    for (const ch of channels) {
      lines.push(`    ${ch.valueProp}: () => this.${ch.valueProp},`);
      if (ch.defaultValueProp) {
        lines.push(`    ${ch.defaultValueProp}: this.${ch.defaultValueProp},`);
      }
      lines.push(
        `    ${ch.changeHandlerProp}: (v) => this.${ch.changeHandlerProp}?.(v),`,
      );
    }
    // Forward dismissal-trigger enabledBy props.
    for (const trigger of ir.behavior.normalizedDismissalTriggers) {
      if (!trigger.enabledByProp) continue;
      lines.push(
        `    ${trigger.enabledByProp}: this.${trigger.enabledByProp},`,
      );
    }
    lines.push(`    destroyRef: this.destroyRef,`);
    lines.push(`  });`);
    // Ephemeral-surface auto-dismiss (WCAG 2.2.1). The effect tracks the
    // behavior's open signal; sync() restarts/clears the timer; pause
    // listeners land on the template root.
    const autoDismissPolicy = resolveSurfaceAutoDismiss(ir);
    const autoDismissChannel = autoDismissPolicy
      ? channels.find((c) => c.valueType === "boolean")
      : undefined;
    if (autoDismissPolicy && autoDismissChannel) {
      lines.push(
        ``,
        `  protected autoDismiss = createAutoDismiss({`,
        `    open: () => Boolean(this.behavior.${autoDismissChannel.name}()),`,
        `    durationMs: () => this.${autoDismissPolicy.durationProp} === undefined ? ${autoDismissPolicy.defaultMs ?? "undefined"} : this.${autoDismissPolicy.durationProp},`,
        `    onDismiss: () => this.behavior.set${capitalizeAngular(autoDismissChannel.name)}(false),`,
        `    destroyRef: this.destroyRef,`,
        `  });`,
        `  private autoDismissEffect = effect(() => this.autoDismiss.sync());`,
      );
    }
  }

  // classes computed
  lines.push(``);
  lines.push(...generateDomTreeClassesComputed(ir));

  // Helper handler methods. Named `handle<Name>Change` (NOT `on<Name>Change`)
  // to avoid colliding with the @Input() change-handler prop of the same
  // shape (the contract's onChange/onOpenChange/etc).
  //
  // Only emit handlers for primitive value types (string/number/boolean)
  // that map directly to `<input>` event semantics. Complex types like
  // Date or Date[] (Calendar) need consumer-side conversion — emitting a
  // string-to-Date setter call here produces a TS error under strict mode.
  // Templates currently don't bind these handlers anyway; consumers wire
  // their own when they need custom input handling.
  const PRIMITIVE_VALUE_TYPES = new Set(["string", "number", "boolean"]);
  const handlerChannels = channelsNeedingInputHandlers(ir);
  for (const ch of channels) {
    if (!PRIMITIVE_VALUE_TYPES.has(ch.valueType ?? "")) continue;
    // Host-aware lowering inlines a toggle for non-form hosts; only form
    // hosts still route through the element-state handler.
    if (!handlerChannels.has(ch.name)) continue;
    const handlerName = `handle${capitalizeAngular(ch.name)}Change`;
    const setter = `set${capitalizeAngular(ch.name)}`;
    const valueExpr =
      ch.valueType === "boolean"
        ? `(event.target as HTMLInputElement).checked`
        : ch.valueType === "number"
          ? `Number((event.target as HTMLInputElement).value)`
          : `(event.target as HTMLInputElement).value`;
    lines.push(``);
    lines.push(`  protected ${handlerName}(event: Event): void {`);
    lines.push(`    this.behavior.${setter}(${valueExpr});`);
    lines.push(`  }`);
  }

  // IR-DOM-ITERATE-CAPABILITY-01: count iteration needs a class-body
  // helper to materialize an array of length N for *ngFor's source.
  // Angular template parsers reject `new Array(n)` / `Array(n)` inline,
  // so we emit a memoized method. The helper is only injected when
  // some node in the dom tree actually has kind="count" iteration.
  if (usesCountIteration) {
    lines.push(``);
    lines.push(
      `  // Materializes an array of length N for *ngFor count-iteration.`,
    );
    lines.push(
      `  // Memoized by length so re-renders don't churn the iteration source.`,
    );
    lines.push(`  private _arrayFromCountCache = new Map<number, ReadonlyArray<undefined>>();`);
    lines.push(`  protected arrayFromCount(n: number | undefined): ReadonlyArray<undefined> {`);
    lines.push(`    const len = typeof n === "number" && n > 0 ? Math.floor(n) : 0;`);
    lines.push(`    let arr = this._arrayFromCountCache.get(len);`);
    lines.push(`    if (!arr) {`);
    lines.push(`      arr = Array.from({ length: len });`);
    lines.push(`      this._arrayFromCountCache.set(len, arr);`);
    lines.push(`    }`);
    lines.push(`    return arr;`);
    lines.push(`  }`);
  }

  // BINDING-EXPRESSION-V2-PREDICATE-01: predicate:memberOf helper.
  // Angular templates cannot reference the global `Array` object, so
  // `predicate:memberOf` lowers to a method call on the component
  // instance. The helper is only injected when at least one
  // `predicate:memberOf` appears in the IR. Identical runtime
  // semantics to the inline form used in React/Svelte/Lit.
  if (usesMemberOf) {
    lines.push(``);
    lines.push(
      `  // BindingExpressionV2 predicate:memberOf helper. Adapts to the runtime`,
    );
    lines.push(
      `  // shape of \`selection\`: scalar equality when not an array, set`,
    );
    lines.push(
      `  // membership otherwise. Used for channels typed \`T | T[]\`.`,
    );
    lines.push(
      `  protected memberOf(candidate: unknown, selection: unknown): boolean {`,
    );
    lines.push(
      `    return Array.isArray(selection) ? selection.includes(candidate) : candidate === selection;`,
    );
    lines.push(`  }`);
  }

  // Inject content-projection detection when the dom tree has an `if: "children"` node.
  // Mirrors Vue's `v-if="$slots.default"` / Svelte's `{#if children}`.
  if (hasChildrenGuard) {
    lines.push(``);
    lines.push(
      `  // Tracks whether any content has been projected — used by *ngIf="hasContent".`,
    );
    lines.push(`  protected hasContent = false;`);
    lines.push(`  private _el = inject(ElementRef<HTMLElement>);`);
    lines.push(``);
    lines.push(`  ngAfterContentInit(): void {`);
    lines.push(
      `    // Check for any non-whitespace child nodes projected into this component.`,
    );
    lines.push(
      `    const nodes = Array.from((this._el.nativeElement as HTMLElement).childNodes);`,
    );
    lines.push(`    this.hasContent = nodes.some((n) =>`);
    lines.push(`      n.nodeType === Node.ELEMENT_NODE ||`);
    lines.push(
      `      (n.nodeType === Node.TEXT_NODE && n.textContent?.trim() !== ""),`,
    );
    lines.push(`    );`);
    lines.push(`  }`);
  }

  // ICON-CATALOG-RUNTIME-DELIVERY-01: getters resolving the requested
  // pixel size (when the glyph has a size binding) and the catalog
  // lookup. Angular idiom is a getter — re-evaluates on every read, so
  // it stays reactive to @Input changes without a signal/computed()
  // dependency (glyph nodes appear on Stack-only components with no
  // behavior channels, same as `classes()` above). A miss (unknown icon
  // name) leaves the getter `undefined` and the template's `*ngIf`
  // null-guard renders nothing. `Number.NaN` deliberately matches no
  // authored size, so resolveIcon falls back to the smallest authored
  // variant.
  for (const { node, glyph, suffix } of iconGlyphNodes) {
    const { glyphGetter, pxGetter } = iconGlyphIdents.get(node)!;
    const hintsIdent = glyph.sizeHints
      ? `ICON_GLYPH_SIZE_HINTS${suffix}`
      : undefined;
    // FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: fall back to the resolved
    // prop's contract default (not `""`) — see the identical comment on
    // the sibling collection loop above for the full rationale.
    const sizeDefaultExpr2 = styledByName.get(glyph.sizePropName ?? "")?.defaultExpr;
    const pxExpr = iconGlyphPxExpr(
      glyph,
      glyph.sizePropName
        ? `(this.${glyph.sizePropName} ?? ${sizeDefaultExpr2 ?? '""'})`
        : undefined,
      hintsIdent,
    );
    lines.push(``);
    if (pxGetter && pxExpr !== undefined) {
      lines.push(`  get ${pxGetter}(): number | undefined {`);
      lines.push(`    return ${pxExpr};`);
      lines.push(`  }`);
      lines.push(``);
    }
    lines.push(`  get ${glyphGetter}() {`);
    lines.push(
      `    return resolveIcon(this.${glyph.namePropName}, ` +
        `${pxGetter ? `this.${pxGetter} ?? Number.NaN` : "Number.NaN"});`,
    );
    lines.push(`  }`);
  }

  lines.push(`}`);
  return lines.join("\n");
}

function generateDomTreeClassesComputed(ir: ComponentIR): string[] {
  const { classRecipe } = ir;
  const channels = ir.behavior.normalizedChannels;
  const channelValueProps = new Set(channels.map((c) => c.valueProp));
  const channelNames = new Set(channels.map((c) => c.name));
  // FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: default-aware, see
  // `angularPropAccessor`'s doc comment.
  const styledByName = new Map(ir.styledProps.map((p) => [p.name, p]));
  // Angular's computed() only re-runs when tracked signal dependencies
  // change. Components with no behavior channels (e.g. AnimatedCard) read
  // only plain @Input properties — non-signals — so the computation would
  // cache the initial value forever. Emit a getter method instead so each
  // call reflects current @Input values.
  const hasSignalDeps = channels.length > 0;
  const lines: string[] = hasSignalDeps
    ? [
        `  classes = computed(() =>`,
        `    [`,
        `      "${classRecipe.base}",`,
      ]
    : [
        `  classes(): string {`,
        `    return [`,
        `      "${classRecipe.base}",`,
      ];
  for (const mod of classRecipe.valueModifiers) {
    const acc = defaultAwareAngularClassPropAccessor(mod.propName, styledByName);
    lines.push(
      `      ${acc} ? \`${classRecipe.base}--${mod.valuePrefix ?? ""}\${${acc}}\` : null,`,
    );
  }
  for (const mod of classRecipe.booleanModifiers) {
    // Resolve the modifier's display value:
    // - When name matches channel valueProp (e.g. checked), use behavior.<channelName>()
    // - When name matches channel name (e.g. open with valueProp isOpen), use behavior.<name>()
    // - Otherwise reference the @Input prop directly
    if (channelValueProps.has(mod.propName)) {
      const ch = channels.find((c) => c.valueProp === mod.propName)!;
      lines.push(
        `      this.behavior.${ch.name}() ? "${classRecipe.base}--${mod.safeName}" : null,`,
      );
    } else if (channelNames.has(mod.propName)) {
      lines.push(
        `      this.behavior.${mod.propName}() ? "${classRecipe.base}--${mod.safeName}" : null,`,
      );
    } else {
      const acc = defaultAwareAngularClassPropAccessor(mod.safeName, styledByName);
      lines.push(
        `      ${acc} ? "${classRecipe.base}--${mod.safeName}" : null,`,
      );
    }
  }
  lines.push(`      this.class,`);
  if (hasSignalDeps) {
    lines.push(`    ].filter(Boolean).join(" "),`);
    lines.push(`  );`);
  } else {
    lines.push(`    ].filter(Boolean).join(" ");`);
    lines.push(`  }`);
  }
  return lines;
}

interface AngularRenderContext {
  classRecipe: string;
  channelByName: Map<string, NormalizedChannelIR>;
  /** Prop-name → resolved styled-prop lookup, mirroring the lit emitter's `styledByName`. Populated at root construction and carried into nested contexts via the `{ ...ctx }` spread. */
  styledByName: Map<string, { type: string; defaultExpr?: string }>;
  isRoot: boolean;
  /** When true, bind auto-dismiss pause listeners on the template root. */
  autoDismissPause?: boolean;
  overlayClickSetter?: string;
  overlayClickEnabledProp?: string;
  /**
   * Identifier names introduced by enclosing `*ngFor` iterations. After
   * BINDING-EXPRESSION-V2-01 the binding-side `prop:X` lowering no
   * longer consults this set — iteration locals reach the emitter as
   * `iterationLocal`-kind bindings via `ctx.enclosingIteration`. The
   * field is retained so future `if:` migration off this scope set can
   * happen separately if needed.
   */
  iterationScope?: Set<string>;
  /**
   * Nearest enclosing iteration directive. Resolution target for
   * `iterationLocal`-kind bindings.
   */
  enclosingIteration?: IterationIR;
  rootPolymorphicTag?: {
    propName: string;
    defaultTag: string;
    allowedTags: string[];
  };
  /**
   * Getter identifiers for nodes carrying `iconGlyph`
   * (ICON-CATALOG-RUNTIME-DELIVERY-01), keyed by node identity.
   * `glyphGetter` names the class getter resolving the catalog record via
   * `resolveIcon(...)`; `pxGetter` names the requested-pixel getter
   * (undefined when the glyph has no size binding). Populated once at the
   * root call from `collectIconGlyphNodes`; empty when the tree has no
   * glyph nodes.
   */
  iconGlyphIdents?: Map<DomNodeIR, { glyphGetter: string; pxGetter: string | undefined }>;
}

function renderAngularDomNode(
  node: DomNodeIR,
  ctx: AngularRenderContext,
  indent: number,
): string {
  const pad = " ".repeat(indent);

  if (node.tag === "slot" || node.tag === "children") {
    if (node.slotName) {
      return `${pad}<ng-content select="[slot=${node.slotName}]" />`;
    }
    return `${pad}<ng-content />`;
  }

  // IR-DOM-ITERATE-CAPABILITY-01: extend iterationScope for this node
  // and every descendant. Bindings on the iterated node and its subtree
  // resolve `prop:item` / `prop:index` as bare locals from the *ngFor
  // template scope, not via `safePropertyExpr` (which would route them
  // through the component-class accessor and prefix reserved names
  // with `this.`).
  if (node.iteration) {
    const extendedScope = new Set(ctx.iterationScope ?? []);
    extendedScope.add(node.iteration.indexVar);
    if (node.iteration.itemVar !== undefined) {
      extendedScope.add(node.iteration.itemVar);
    }
    ctx = {
      ...ctx,
      iterationScope: extendedScope,
      enclosingIteration: node.iteration,
    };
  }

  const attrs: string[] = [];
  const classParts: string[] = [];
  if (node.part) classParts.push(`'${ctx.classRecipe}__${node.part}'`);

  for (const [key, value] of Object.entries(node.attrs)) {
    if (key === "class" || key === "className") {
      classParts.push(`'${value}'`);
      continue;
    }
    attrs.push(`${key}="${escapeAngularAttr(value)}"`);
  }

  // IR-DOM-BINDING-CAPABILITY-01: event bindings lower to Angular's
  // `(eventname)="..."` syntax. Distinct from attribute bindings because
  // Angular's template parser rejects `onClick` / `[onClick]` as event-
  // property attributes (security disallow). For `prop:X` events emit
  // `(click)="X && X()"` so the no-op case is silent; for `channel:X`
  // events the existing channel-onChange path in renderAngularBinding
  // produces `(click)="behavior.X()"`. Legacy `bindings.onX` is filtered
  // below to avoid double-emit.
  for (const [eventName, expr] of Object.entries(node.events)) {
    const rendered = renderAngularEvent(eventName, expr, ctx, node.tag);
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  // componentRef: look up each binding's IR classification (prop vs host attr)
  // so the emitter picks syntax without guessing (normal-form property 4).
  const refBindingByAttr = new Map(
    (node.componentInstance?.bindings ?? []).map((b) => [b.sourceAttr, b]),
  );
  for (const [key, expr] of Object.entries(node.bindings)) {
    // Dual-pathway dedup: parseDomNode mirrored `bindings.onX` to
    // `events.<x>` for back-compat. The canonical events loop above
    // already emitted the handler — skip the legacy attribute pass.
    if (/^on[A-Z]/.test(key)) {
      const evt = key.slice(2).toLowerCase();
      if (node.events[evt]) continue;
    }
    const rendered = renderAngularBinding(
      key,
      expr,
      ctx,
      node.tag,
      refBindingByAttr.get(key),
    );
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  // IR-DOM-CSS-VAR-BINDING-01: lower `cssVarBindings` to Angular's
  // `[style.--fsds-foo]="expr"` per-property binding (one attr per
  // CSS variable). Angular 9+ accepts arbitrary CSS custom-property
  // names through the `[style.<name>]` syntax. A literal `style` attr
  // coexisting with cssVarBindings is rejected by the IR builder, so
  // we don't need to compose with an existing `style` declaration.
  for (const { varName, value } of node.cssVarBindings) {
    const valueExpr = renderAngularBindingValue(value, ctx);
    if (valueExpr === null) continue;
    attrs.push(`[style.${varName}]="${valueExpr}"`);
  }

  // DOM-PROPERTY-REFLECTION-IR-CHECKBOX-INDETERMINATE-01: propertyBindings
  // are DOM-property-only facts (e.g. `indeterminate`) with no HTML
  // attribute form. Angular's bare `[key]="expr"` syntax already binds a
  // DOM property directly (not via setAttribute) — the same mechanism
  // already used for `[checked]`/`[disabled]`/`[value]` above via
  // `angularAttrBinding`'s default branch. No ElementRef/effect() escape
  // hatch is needed: reusing `renderAngularBinding` guarantees these keys
  // never take the `[attr.x]` branch (they aren't `data-`/`aria-` prefixed
  // and won't appear in ANGULAR_ATTR_BINDING_OVERRIDES_BY_TAG), so the
  // property (not attribute) form is what gets emitted.
  for (const [key, expr] of Object.entries(node.propertyBindings)) {
    const rendered = renderAngularBinding(key, expr, ctx, node.tag);
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  if (ctx.isRoot) {
    attrs.unshift(`[ngClass]="classes()"`);
    if (ctx.autoDismissPause) {
      attrs.push(
        `(pointerenter)="autoDismiss.pauseListeners.pointerenter()"`,
        `(pointerleave)="autoDismiss.pauseListeners.pointerleave()"`,
        `(focusin)="autoDismiss.pauseListeners.focusin()"`,
        `(focusout)="autoDismiss.pauseListeners.focusout()"`,
      );
    }
  } else if (
    ctx.overlayClickSetter &&
    (node.part === "overlay" || node.part === "backdrop")
  ) {
    // The overlay child node owns the dismissal click and the
    // `role="presentation"` hook the generated test queries by. Putting the
    // handler here (instead of on the root) means inner content clicks
    // don't bubble through a target===currentTarget guard, which never
    // matches when the test clicks the overlay child directly.
    const guardExpr = ctx.overlayClickEnabledProp
      ? `${ctx.overlayClickEnabledProp} !== false && behavior.${ctx.overlayClickSetter}(false)`
      : `behavior.${ctx.overlayClickSetter}(false)`;
    attrs.push(`role="presentation"`);
    attrs.push(`(click)="${guardExpr}"`);
    if (classParts.length > 0) {
      if (classParts.length === 1) {
        attrs.unshift(`[ngClass]="${classParts[0]}"`);
      } else {
        attrs.unshift(`[ngClass]="[${classParts.join(", ")}]"`);
      }
    }
  } else if (classParts.length > 0) {
    if (classParts.length === 1) {
      attrs.unshift(`[ngClass]="${classParts[0]}"`);
    } else {
      attrs.unshift(`[ngClass]="[${classParts.join(", ")}]"`);
    }
  }

  let ifWrap = "";
  if (node.ifProp) {
    // Angular's *ngIf belongs to the structural directive system. Wrap the
    // element in <ng-container *ngIf="..."> to avoid placing *ngIf on the
    // root element which complicates class binding.
    ifWrap = node.ifProp; // handled below
  }

  const childCtx: AngularRenderContext = { ...ctx, isRoot: false };
  const renderedChildren = node.children.map((c) =>
    renderAngularDomNode(c, childCtx, indent + 2),
  );

  // IR-DOM-BINDING-CAPABILITY-01: content binding lowers to Angular's
  // `{{ expr }}` interpolation as the element's text content. Mutually
  // exclusive with children — parseDomNode rejects the combination.
  const contentLines: string[] = [];
  if (node.content) {
    const contentExpr = renderAngularBindingValue(node.content, ctx);
    if (contentExpr !== null) {
      contentLines.push(`${" ".repeat(indent + 2)}{{ ${contentExpr} }}`);
    }
  }

  // ICON-CATALOG-RUNTIME-DELIVERY-01: a glyph node's svg surface comes
  // from the resolved catalog record — data-fsds-icon + viewBox +
  // width/height attrs here, one <path> per glyph path record as the
  // only content (the svg has no IR children — enforced upstream). The
  // `*ngIf="... as glyph" ` guard (applied below, once `body` is built)
  // aliases the getter so attrs and the *ngFor loop read the narrowed
  // non-undefined local rather than re-invoking the getter (and
  // re-risking a TS-narrowing mismatch across separate reads).
  const iconGlyphEntry = ctx.iconGlyphIdents?.get(node);
  const iconGlyphChildLines: string[] = [];
  if (iconGlyphEntry) {
    const { pxGetter } = iconGlyphEntry;
    attrs.push(`[attr.data-fsds-icon]="glyph.name"`);
    attrs.push(`[attr.viewBox]="glyph.viewBox"`);
    const sizeExpr = pxGetter
      ? `(this.${pxGetter} ?? glyph.size)`
      : `glyph.size`;
    attrs.push(`[attr.width]="${sizeExpr}"`);
    attrs.push(`[attr.height]="${sizeExpr}"`);
    const childPad = " ".repeat(indent + 2);
    const pathAttrs = ICON_GLYPH_PATH_ATTRS.map(
      ({ recordKey, svgAttr }) => `[attr.${svgAttr}]="glyphPath.${recordKey}"`,
    ).join(" ");
    iconGlyphChildLines.push(
      `${childPad}<ng-container *ngFor="let glyphPath of glyph.paths">`,
      `${childPad}  <path ${pathAttrs} />`,
      `${childPad}</ng-container>`,
    );
  }

  const allChildren = [
    ...contentLines,
    ...renderedChildren,
    ...iconGlyphChildLines,
  ];

  // componentRef: render the referenced component by its selector
  // (`fsds-<kebab>`, matching how that component declares its own selector).
  // The class is imported and added to the standalone `imports: []` array by
  // the dom-tree generator; bindings reach the component's @Input via the
  // `[prop]=` property form, driven by the IR's ComponentInstanceIR
  // classification (see angularAttrBinding's refBinding path).
  const tag = node.componentRef
    ? `fsds-${toKebab(node.componentRef)}`
    : node.tag;

  const renderElementBody = (tagName: string, extraAttrs: string[] = []): string => {
    const branchAttrs = [...attrs, ...extraAttrs];
    const branchSelfCloses = VOID_HTML_ELEMENTS_ANGULAR.has(tagName);
    if (allChildren.length === 0 && branchSelfCloses) {
      return `${pad}<${tagName}${formatAngularAttrs(branchAttrs)} />`;
    }
    if (allChildren.length === 0) {
      return `${pad}<${tagName}${formatAngularAttrs(branchAttrs)}></${tagName}>`;
    }
    return [
      `${pad}<${tagName}${formatAngularAttrs(branchAttrs)}>`,
      ...allChildren,
      `${pad}</${tagName}>`,
    ].join("\n");
  };

  let body: string;
  if (ctx.isRoot && ctx.rootPolymorphicTag && !node.componentRef) {
    const switchExpr = safePropertyExpr(ctx.rootPolymorphicTag.propName);
    body = [
      `${pad}<ng-container [ngSwitch]="${switchExpr} || '${ctx.rootPolymorphicTag.defaultTag}'">`,
      ...ctx.rootPolymorphicTag.allowedTags.map((tagName) =>
        renderElementBody(tagName, [`*ngSwitchCase="'${tagName}'"`]).replace(/^/gm, "  "),
      ),
      `${pad}</ng-container>`,
    ].join("\n");
  } else {
    body = renderElementBody(tag);
  }

  let withIfGuard = body;
  if (ifWrap) {
    if (ifWrap === "children") {
      // Guard the label wrapper on content-projection presence, mirroring
      // Vue's `v-if="$slots.default"` and Svelte's `{#if children}`.
      // Angular doesn't expose a synchronous "was anything projected?" API
      // without querying the DOM. We emit `*ngIf="hasContent"` and let the
      // class body generator inject `hasContent` + an `ngAfterContentInit` hook
      // that reads the host element's text/child nodes to determine presence.
      withIfGuard = [
        `${pad}<ng-container *ngIf="hasContent">`,
        body.replace(/^/gm, "  "),
        `${pad}</ng-container>`,
      ].join("\n");
    } else {
      const matchingChannel = [...ctx.channelByName.values()].find(
        (c) => c.valueProp === ifWrap || c.name === ifWrap,
      );
      const expr = matchingChannel
        ? `behavior.${matchingChannel.name}()`
        : ifWrap;
      const condition = node.ifNegated ? `!${expr}` : expr;
      withIfGuard = [
        `${pad}<ng-container *ngIf="${condition}">`,
        body.replace(/^/gm, "  "),
        `${pad}</ng-container>`,
      ].join("\n");
    }
  }

  // iconGlyph null-guard: an unknown icon name resolves the getter to
  // undefined and the svg (whose attrs/paths dereference the aliased
  // `glyph` local) must not render at all. `*ngIf="getter as glyph"`
  // both narrows and aliases in one directive — Angular's idiom for
  // "guard on a value, then reuse it without re-invoking the getter".
  if (iconGlyphEntry) {
    withIfGuard = [
      `${pad}<ng-container *ngIf="${iconGlyphEntry.glyphGetter} as glyph">`,
      withIfGuard.replace(/^/gm, "  "),
      `${pad}</ng-container>`,
    ].join("\n");
  }

  // IR-DOM-ITERATE-CAPABILITY-01: apply the *ngFor wrap as the outermost
  // layer using <ng-container *ngFor>. Doctrine: iteration outside,
  // if-guard inside — each iteration re-evaluates *ngIf against the
  // per-iteration scope. Angular's microsyntax for *ngFor:
  //   *ngFor="let item of items; let index = index"
  //     - left `index` is the local alias bound from the right side's
  //       built-in `index` template-variable name (which Angular
  //       exposes as the 0-based iteration index).
  //   *ngFor="let _ of arrayN; let index = index"
  //     - for count iteration we need an array-of-length-N as the
  //       source. We emit it inline via the class field `_${sourceProp}Range`
  //       to avoid `new Array(n)` expressions in templates (Angular's
  //       template parser rejects `new` and most JS-side constructions).
  //     - Simpler: bind it as `arrayFromCount(${sourceProp})` where
  //       `arrayFromCount` is a class-body helper injected when at
  //       least one count iteration is present.
  //
  // To keep this commit a pure no-op for existing components, the
  // count-iteration helper is only injected when the dom tree
  // actually has a count iteration somewhere. The helper detection
  // lives in generateRootComponent / generateClassBody; this emitter
  // produces the bare call.
  if (node.iteration) {
    const { kind, source, indexVar, itemVar } = node.iteration;
    // PRODUCTION-ARRAY-ITERATION-CONSUMER-01: route iteration source
    // through the binding-value renderer. Angular templates accept bare
    // identifiers, but `safePropertyExpr` prefixes Angular-reserved
    // names with `this.`, and channel-driven sources resolve to
    // `behavior.X()` rather than the raw `@Input X`. Going through the
    // value renderer keeps the dispatch source-uniform.
    const sourceExpr = renderAngularBindingValue(source, ctx);
    if (sourceExpr === null) {
      throw new Error(
        `Angular emitter: iteration source could not be lowered (source kind=${source.kind})`,
      );
    }
    // FIX-COUNT-ITERATION-DEFAULT-THREADING-01 / FIX-UNDEFINED-PROP-
    // ACCESSOR-DEFAULTING-01: an array- or count-kind iteration source
    // that is a bare prop binding must fall back to the prop's CONTRACT
    // default when the input resolves to `undefined` at runtime (parity
    // with react's parameter default / vue's withDefaults / svelte's
    // `export let`). Originally this call site applied its own `??
    // default` on top of a bare `sourceExpr`; now that
    // `angularPropAccessor` (reached via `renderAngularBindingValue`) is
    // itself default-aware, `sourceExpr` already carries `(x ??
    // contractDefault)` for any prop with a declared default — stacking
    // a second `?? []` here is redundant at best (the lit sibling of
    // this fix caught the array-kind case as a `tsc` TS2869 unreachable-
    // branch error for Select.options/Walkthrough.steps; Angular's
    // inline template isn't type-checked the same way, but the
    // redundant fallback is the same defect). `arrayFromCount` itself
    // stays a plain shared helper (undefined -> 0) because it's memoized
    // across every count-iteration call site in the component and must
    // not hardcode one specific prop's default. Bare-prop sources with
    // NO contract default fall through to the unwrapped/helper
    // undefined->0 behavior — `sourceExpr` itself already reflects that
    // (accessor only wraps props that declare a default).
    const sourceHasAccessorDefault =
      source.kind === "prop" &&
      ctx.styledByName.get(source.prop)?.defaultExpr !== undefined;
    const ngForExpr =
      kind === "array"
        ? `let ${itemVar} of (${sourceHasAccessorDefault ? sourceExpr : `${sourceExpr} ?? []`}); let ${indexVar} = index`
        : `let _ of arrayFromCount(${sourceExpr}); let ${indexVar} = index`;
    return [
      `${pad}<ng-container *ngFor="${ngForExpr}">`,
      withIfGuard.replace(/^/gm, "  "),
      `${pad}</ng-container>`,
    ].join("\n");
  }
  return withIfGuard;
}

// Angular's `[prop]="expr"` binds a DOM *property* — fine for things like
// `[disabled]`, `[hidden]`, etc., but invalid for arbitrary attributes like
// `data-*` and `aria-*`. Those need the `[attr.name]="expr"` form, which
// binds an HTML attribute. Additionally, `as` is reserved in Angular
// templates (microsyntax for *ngFor), so any expression that evaluates to a
// bare `as` parses as a keyword — using `[attr.X]` form sidesteps that.
//
// Some bindings name a real HTML attribute but are NOT a writable IDL
// property on the chosen element. Example: `<label form="...">` — the
// HTML spec gives `HTMLLabelElement.form` as read-only (it reflects the
// containing form), so Angular's `[form]` property binding fails ngc
// strictTemplates (NG8002). The contract intent is to set the HTML
// attribute, not the IDL property, so we coerce to `[attr.X]` here.
//
// Source of truth: HTMLLabelElement.form is read-only per HTML spec
// (https://html.spec.whatwg.org/#htmllabelelement). Maintained as a
// per-tag attribute set; entries here are derived from real DOM-IDL
// facts, not from "tests are failing".
const ANGULAR_ATTR_BINDING_OVERRIDES_BY_TAG: Record<string, ReadonlySet<string>> = {
  label: new Set(["form"]),
  svg: new Set(["height", "width"]),
};

function angularAttrBinding(
  attr: string,
  tag?: string,
  refBinding?: { kind: "prop" | "attribute"; targetProp?: string },
): string {
  // componentRef: the IR already CLASSIFIED this binding against the target's
  // prop surface (ComponentInstanceIR). kind:"prop" → `[targetProp]=` property
  // binding (reaches the @Input); kind:"attribute" → `[attr.X]=` host attribute
  // passthrough. The emitter never guesses prop-vs-attribute (normal-form
  // property 4) — it reads the resolved fact.
  if (refBinding) {
    return refBinding.kind === "prop"
      ? `[${refBinding.targetProp}]`
      : `[attr.${attr}]`;
  }
  if (attr === "role" || attr.startsWith("data-") || attr.startsWith("aria-")) {
    return `[attr.${attr}]`;
  }
  if (tag && ANGULAR_ATTR_BINDING_OVERRIDES_BY_TAG[tag]?.has(attr)) {
    return `[attr.${attr}]`;
  }
  return `[${attr}]`;
}

// Angular templates reserve certain identifiers as microsyntax keywords:
// `as` (used by *ngIf/*ngFor for aliasing), `let`, `of`, etc. Any prop
// whose name matches one of those parses as a keyword when emitted as a
// bare expression. Prefixing with `this.` disambiguates without changing
// semantics — Angular accepts both `foo` and `this.foo` for component
// properties.
const ANGULAR_TEMPLATE_KEYWORDS = new Set([
  "as",
  "let",
  "of",
  "in",
  "trackBy",
  "true",
  "false",
  "null",
  "undefined",
]);

function safePropertyExpr(prop: string): string {
  return ANGULAR_TEMPLATE_KEYWORDS.has(prop) ? `this.${prop}` : prop;
}

/**
 * Lower a `prop:X` reference to an Angular template expression. When `X`
 * is an in-scope iteration alias (item/index introduced by an enclosing
 * `*ngFor`), emit the bare identifier — Angular's *ngFor introduces
 * those names as template locals distinct from component-class fields.
 * The class-field path is via `safePropertyExpr`, which prefixes
 * Angular-reserved names with `this.`; iteration aliases must NOT take
 * that path (a future contract that picks `let` or `of` as an alias
 * name is the author's bug, but our codegen shouldn't silently emit
 * `this.let` for a template local). IR-DOM-ITERATE-CAPABILITY-01.
 */
/**
 * FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: mirrors the lit emitter's
 * `litPropAccessor` defaulting. Angular `@Input() x?: T = default`
 * applies the class-field default once at construction; a later explicit
 * `undefined` assignment does not re-run it, so a bare `this.x` read
 * downstream can observe `undefined` even though the contract declares a
 * default — unlike react (parameter default), vue (`withDefaults`), and
 * svelte (`export let`), whose defaulting is parameter-evaluation, not
 * one-shot field initialization. When the resolved prop carries a
 * contract `defaultExpr`, wrap the read as `(x ?? default)` so every
 * downstream consumer — conditional/predicate bindings, class modifiers,
 * future binding kinds — inherits parity from the accessor primitive.
 * Props with no contract default keep the bare read.
 */
function angularPropAccessor(propName: string, ctx: AngularRenderContext): string {
  // Post-V2 (BINDING-EXPRESSION-V2-01): iteration locals reach the
  // emitter as `iterationLocal`-kind bindings and never as `prop:`
  // bindings; the legacy `iterationScope.has(propName)` shortcut is
  // intentionally removed.
  return defaultAwareAngularTemplatePropAccessor(propName, ctx.styledByName);
}

/**
 * Shared default-wrapping logic behind `angularPropAccessor`, for
 * ANGULAR TEMPLATE expressions (inline `template:` strings), where bare
 * identifiers resolve implicitly against the component instance —
 * `safePropertyExpr` only prefixes `this.` for template-keyword
 * collisions (`as`, `let`, …). Factored out so the handful of
 * template-producing call sites that only have `ir.styledProps` in scope
 * (running before an `AngularRenderContext` exists) can apply the
 * identical defaulting rule without threading a full render context
 * through generation functions that don't otherwise need one.
 *
 * NOT for TypeScript class-body code (`computed(() => …)`, `classes()`
 * methods) — those need `defaultAwareAngularClassPropAccessor` below,
 * which always emits `this.` because bare identifiers don't resolve to
 * instance fields outside a template.
 */
function defaultAwareAngularTemplatePropAccessor(
  propName: string,
  styledByName: ReadonlyMap<string, { type: string; defaultExpr?: string }>,
): string {
  const bare = safePropertyExpr(propName);
  const defaultExpr = styledByName.get(propName)?.defaultExpr;
  return defaultExpr === undefined
    ? bare
    : `(${bare} ?? ${angularTemplateSafeDefaultExpr(defaultExpr)})`;
}

/**
 * `ResolvedPropIR.defaultExpr` is a TypeScript-source literal (ir.ts
 * `defaultExpr()`): double-quoted for string props (`"Dismiss"`) or
 * JSON.stringify'd for array props (`[{"value":"alpha",...}]`, whose keys
 * and string values are also double-quoted). Every Angular `[attr]="..."`
 * template binding this accessor feeds into is itself `"`-delimited at
 * the HTML-tokenizer level — splicing a double-quoted literal in
 * verbatim prematurely closes that attribute (confirmed via a runtime
 * probe: OTP's `[attr.aria-label]="(label ?? "One-time password")"`
 * broke the Angular JIT compiler with "Opening tag not terminated").
 * This is the exact defect class `renderAngularBindingValue`'s `literal`
 * case already works around (DOM-PROPERTY-REFLECTION-IR-CHECKBOX-
 * INDETERMINATE-01) — swap every `"` for `'`. JSON strings never contain
 * a raw (unescaped) `"` internally, so this is a safe 1:1 substitution
 * for the string/array shapes `defaultExpr` can take; boolean/number
 * defaultExprs contain no quotes and pass through unchanged. Known limit
 * (shared with the `literal` case): a default value containing an
 * apostrophe would still break — no corpus default does today.
 */
function angularTemplateSafeDefaultExpr(defaultExpr: string): string {
  return defaultExpr.includes('"') ? defaultExpr.replace(/"/g, "'") : defaultExpr;
}

/**
 * FIX-UNDEFINED-PROP-ACCESSOR-DEFAULTING-01: default-aware prop accessor
 * for TypeScript CLASS-BODY code (the `classes()` / `computed(() => …)`
 * class-modifier generators), where a bare identifier does NOT resolve
 * to the instance field — `this.` is required. Distinct from
 * `defaultAwareAngularTemplatePropAccessor`, which is for inline
 * Angular template strings where `this.` is implicit and only added for
 * keyword collisions.
 */
function defaultAwareAngularClassPropAccessor(
  propName: string,
  styledByName: ReadonlyMap<string, { type: string; defaultExpr?: string }>,
): string {
  const bare = `this.${propName}`;
  const defaultExpr = styledByName.get(propName)?.defaultExpr;
  return defaultExpr === undefined ? bare : `(${bare} ?? ${defaultExpr})`;
}

/**
 * Append a dotted property path to a base Angular template expression.
 * BINDING-EXPRESSION-V2-PATH-01.
 */
function appendPath(base: string, path: readonly string[] | undefined): string {
  if (!path || path.length === 0) return base;
  return `${base}.${path.join(".")}`;
}

/**
 * Resolve an `iterationLocal`-kind binding to the Angular `*ngFor`
 * template-local name. The Angular emit shape is
 * `*ngFor="let item of items; let index = index"` — the bare
 * identifier matches the iteration's declared `itemVar` / `indexVar`.
 */
function angularIterationLocalName(
  local: "index" | "item",
  ctx: AngularRenderContext,
): string | null {
  const it = ctx.enclosingIteration;
  if (!it) return null;
  if (local === "index") return it.indexVar;
  return it.itemVar ?? null;
}

const ANGULAR_FORM_HOSTS = new Set(["input", "textarea", "select"]);

/** Channels whose onChange is bound on a form host somewhere in the dom tree. */
function channelsNeedingInputHandlers(ir: ComponentIR): Set<string> {
  const out = new Set<string>();
  const visit = (node: DomNodeIR | undefined): void => {
    if (!node) return;
    const isFormHost = ANGULAR_FORM_HOSTS.has(node.tag);
    const collect = (expr: BindingExpression): void => {
      if (expr.kind === "channel" && isFormHost) out.add(expr.channel);
    };
    for (const expr of Object.values(node.events)) collect(expr);
    for (const [name, expr] of Object.entries(node.bindings)) {
      if (name.startsWith("on")) collect(expr);
    }
    for (const child of node.children) visit(child);
  };
  visit(ir.dom);
  return out;
}

/**
 * Host-aware channel event lowering (FIX-CHANNEL-EVENT-LOWERING-001):
 * reading element state (.checked/.value) is only valid on form hosts.
 * A channel click on a button/div host toggles the boolean channel,
 * matching react/vue/svelte/react-native.
 */
function angularChannelEventBinding(
  eventName: string,
  ch: NormalizedChannelIR,
  tag: string | undefined,
): string {
  if (ch.callbackKind === "event") {
    return `(${eventName})="${ch.changeHandlerProp}?.($event)"`;
  }
  if (!ANGULAR_FORM_HOSTS.has(tag ?? "") && ch.valueType === "boolean") {
    const setter = `set${capitalizeAngular(ch.name)}`;
    return `(${eventName})="behavior.${setter}(!behavior.${ch.name}())"`;
  }
  const handlerName = `handle${capitalizeAngular(ch.name)}Change`;
  return `(${eventName})="${handlerName}($event)"`;
}

function renderAngularBinding(
  attr: string,
  expr: BindingExpression,
  ctx: AngularRenderContext,
  tag?: string,
  refBinding?: { kind: "prop" | "attribute"; targetProp?: string },
): string | null {
  switch (expr.kind) {
    case "prop":
      return `${angularAttrBinding(attr, tag, refBinding)}="${appendPath(angularPropAccessor(expr.prop, ctx), expr.path)}"`;
    case "literal":
      return `${attr}="${escapeAngularAttr(expr.value)}"`;
    case "iterationLocal": {
      const name = angularIterationLocalName(expr.local, ctx);
      return name ? `${angularAttrBinding(attr, tag, refBinding)}="${appendPath(name, expr.path)}"` : null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") {
        return `${angularAttrBinding(attr, tag, refBinding)}="${appendPath(`behavior.${ch.name}()`, expr.path)}"`;
      }
      if (expr.field === "defaultValue") {
        if (!ch.defaultValueProp) return null;
        return `${angularAttrBinding(attr, tag, refBinding)}="${safePropertyExpr(ch.defaultValueProp)}"`;
      }
      // onChange synthesis — bind to a method on the component.
      // Event-shaped channels pass the raw event to the consumer's
      // @Input handler; consumer drives state externally.
      const eventName = mapJsxEventToAngular(attr);
      return angularChannelEventBinding(eventName, ch, tag);
    }
    case "predicate": {
      // BINDING-EXPRESSION-V2-PREDICATE-01. `lowered` is already a valid
      // Angular template-expression string (comparison operators, prop
      // accessors, JSON.stringify'd literals with real embedded quotes) —
      // NOT HTML text. escapeAngularAttr would corrupt embedded `"` (e.g.
      // from a literal operand) into `&quot;`, which Angular's expression
      // parser reads as literal entity characters, not a quote — breaking
      // the expression (confirmed via runtime probe: aria-checked read
      // "false" for a checked, non-indeterminate Checkbox instead of
      // "true"). The outer `[attr]="..."` delimiter is parsed by
      // Angular's own template compiler, same as the unescaped channel/
      // prop branches above (DOM-PROPERTY-REFLECTION-IR-CHECKBOX-
      // INDETERMINATE-01 found this via Checkbox's aria-checked, the
      // first conditional binding with a literal string operand used in
      // attribute position).
      const lowered = renderAngularPredicate(expr, ctx);
      return lowered === null
        ? null
        : `${angularAttrBinding(attr, tag)}="${lowered}"`;
    }
    case "conditional": {
      const lowered = renderAngularBindingValue(expr, ctx);
      return lowered === null
        ? null
        : `${angularAttrBinding(attr, tag)}="${lowered}"`;
    }
  }
}

/**
 * Lower a content binding to the bare Angular template expression that
 * goes inside `{{ ... }}`. Mirrors the prop/channel/literal switch in
 * renderAngularBinding but without the attribute scaffolding.
 */
function renderAngularBindingValue(
  expr: BindingExpression,
  ctx: AngularRenderContext,
): string | null {
  switch (expr.kind) {
    case "prop":
      return appendPath(angularPropAccessor(expr.prop, ctx), expr.path);
    case "literal":
      // Single-quoted, not JSON.stringify's double-quoted form: this
      // result gets spliced into `[attr]="..."` (conditional/predicate/
      // style callers), a "-delimited Angular template attribute. A
      // double-quoted literal would prematurely close that attribute for
      // Angular's template lexer, which reads attribute values with an
      // HTML-attribute tokenizer BEFORE parsing the expression inside —
      // confirmed via a runtime probe on Checkbox's aria-checked
      // conditional (the first literal-string operand used in attribute
      // position): the "false"-branch silently evaluated wrong because
      // `&quot;` inside the parsed expression is literal entity text, not
      // a quote character (DOM-PROPERTY-REFLECTION-IR-CHECKBOX-
      // INDETERMINATE-01). Single quotes have no such collision in any
      // of this function's call sites.
      return `'${expr.value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
    case "iterationLocal": {
      const name = angularIterationLocalName(expr.local, ctx);
      return name ? appendPath(name, expr.path) : null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") return appendPath(`behavior.${ch.name}()`, expr.path);
      if (expr.field === "defaultValue" && ch.defaultValueProp) {
        return safePropertyExpr(ch.defaultValueProp);
      }
      return null;
    }
    case "predicate":
      // BINDING-EXPRESSION-V2-PREDICATE-01.
      return renderAngularPredicate(expr, ctx);
    case "conditional": {
      const condition = renderAngularBindingValue(expr.condition, ctx);
      const whenTrue = renderAngularBindingValue(expr.whenTrue, ctx);
      const whenFalse = renderAngularBindingValue(expr.whenFalse, ctx);
      if (condition === null || whenTrue === null || whenFalse === null) return null;
      return `(${condition} ? ${whenTrue} : ${whenFalse})`;
    }
  }
}

/**
 * Lower a predicate-kind binding to an Angular template-expression
 * string. Operand accessors come from `renderAngularBindingValue` so
 * they pick up the idiomatic Angular shapes (`X` for props on this,
 * `behavior.X()` for channel signals via standard `()` invocation,
 * iter locals from `*ngFor`).
 */
function renderAngularPredicate(
  expr: BindingExpression & { kind: "predicate" },
  ctx: AngularRenderContext,
): string | null {
  const left = renderAngularBindingValue(expr.left, ctx);
  const right = renderAngularBindingValue(expr.right, ctx);
  if (left === null || right === null) return null;
  return loweredAngularPredicate(expr.op, left, right);
}

function loweredAngularPredicate(op: BindingPredicateOp, left: string, right: string): string {
  switch (op) {
    case "eq":
      return `(${left} === ${right})`;
    case "contains":
      return `((${left} ?? []).includes(${right}))`;
    case "memberOf":
      // Angular template expressions cannot reference globals like
      // `Array`, so memberOf delegates to a component-instance helper
      // method (`this.memberOf`) injected by the class generator when
      // any predicate:memberOf appears in the IR. The helper has
      // identical runtime semantics to the React/Svelte/Lit inline
      // form: `Array.isArray(s) ? s.includes(c) : c === s`.
      return `memberOf(${left}, ${right})`;
  }
}

/**
 * Lower an entry from `node.events` (keyed by unprefixed event name like
 * `click`) into Angular's `(eventname)="..."` form. For `prop:X` events
 * we emit `(click)="X && X()"` so that an unset handler is a silent
 * no-op rather than a runtime "is not a function" throw. Channel-routed
 * events delegate to the existing onChange logic.
 */
function renderAngularEvent(
  eventName: string,
  expr: BindingExpression,
  ctx: AngularRenderContext,
  tag?: string,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `(${eventName})="${angularPropAccessor(expr.prop, ctx)} && ${angularPropAccessor(expr.prop, ctx)}()"`;
    case "literal":
      // Rare — usually events should be wired to a callback. Pass the
      // literal through as the expression body.
      return `(${eventName})="${escapeAngularAttr(expr.value)}"`;
    case "iterationLocal": {
      // Iteration locals are values, not callables. Drop the binding —
      // the IR validator would already have rejected a contract that
      // routes iter:index to an event.
      void ctx;
      return null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      return angularChannelEventBinding(eventName, ch, tag);
    }
    case "predicate":
      // BINDING-EXPRESSION-V2-PREDICATE-01: validator rejects this at
      // IR-build; the case keeps the switch exhaustive.
      return null;
    case "conditional":
      return null;
  }
}

function mapJsxEventToAngular(attr: string): string {
  if (attr === "onChange") return "change";
  if (attr === "onClick") return "click";
  if (attr === "onInput") return "input";
  if (attr === "onKeyDown") return "keydown";
  if (attr === "onFocus") return "focus";
  if (attr === "onBlur") return "blur";
  if (attr.startsWith("on") && attr.length > 2) {
    return attr.slice(2).toLowerCase();
  }
  return attr;
}

function escapeAngularAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}

function formatAngularAttrs(attrs: string[]): string {
  if (attrs.length === 0) return "";
  return " " + attrs.join(" ");
}

function capitalizeAngular(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

const VOID_HTML_ELEMENTS_ANGULAR = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
