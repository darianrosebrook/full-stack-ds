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
  ComponentIR,
  DomNodeIR,
  IterationIR,
  NormalizedChannelIR,
  ResolvedPropIR,
} from "../../ir.js";
import { TABLE_COMPOSITION_TAGS } from "../../ir.js";
import {
  emitNonReactTypeAliases,
  translateNonReactType,
} from "../../non-react-types.js";
import { renderSections, type Section } from "../../preserve.js";
import { toKebab as sharedToKebab } from "../../contract.js";
import {
  isCompoundStateContainer,
  getInteractiveItemPart,
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
  const classModifierLines: string[] = [];
  for (const mod of classRecipe.valueModifiers) {
    classModifierLines.push(
      `      this.${mod.propName} ? \`${classRecipe.base}--\${this.${mod.propName}}\` : null,`,
    );
  }
  for (const mod of classRecipe.booleanModifiers) {
    classModifierLines.push(
      `      this.${mod.safeName} ? "${classRecipe.base}--${mod.safeName}" : null,`,
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
  if (!isCompoundStateContainer(ir)) return [];

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
  const type = angularType(p.type);
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
  // Stack-only components read only @Input properties (plain JS, not
  // signals). A computed() would cache the initial value forever; emit a
  // plain method that re-evaluates on every call instead.
  const lines: string[] = [
    `  classes(): string {`,
    `    const parts: Array<string | null | undefined> = ["${classRecipe.base}"];`,
  ];

  for (const mod of classRecipe.valueModifiers) {
    lines.push(
      `    if (this.${mod.safeName}) parts.push(\`${classRecipe.base}--\${this.${mod.safeName}}\`);`,
    );
  }

  for (const mod of classRecipe.booleanModifiers) {
    lines.push(
      `    if (this.${mod.safeName}) parts.push("${classRecipe.base}--${mod.safeName}");`,
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
 *  `NgIf` belongs in the standalone component's imports list. */
function treeUsesNgIf(node: DomNodeIR): boolean {
  if (node.ifProp) return true;
  return node.children.some(treeUsesNgIf);
}

/** Walk a DomNodeIR tree and return true if any node declares
 *  iteration. Used to decide whether `NgFor` belongs in the
 *  standalone component's imports list. */
function treeUsesNgFor(node: DomNodeIR): boolean {
  if (node.iteration) return true;
  return node.children.some(treeUsesNgFor);
}

/** Walk a DomNodeIR tree and return true if any node has count
 *  iteration. Count iteration needs a class-body `arrayFromCount`
 *  helper because Angular templates can't construct arrays inline. */
function treeUsesCountIteration(node: DomNodeIR): boolean {
  if (node.iteration?.kind === "count") return true;
  return node.children.some(treeUsesCountIteration);
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
  const commonNames = ["NgClass"];
  if (usesNgIf) commonNames.push("NgIf");
  if (usesNgFor) commonNames.push("NgFor");
  const commonImports = commonNames.join(", ");
  const lines: string[] = [
    `import { ${coreNames.join(", ")} } from "@angular/core";`,
    `import { ${commonImports} } from "@angular/common";`,
  ];
  if (ir.compoundParts.length > 0) {
    lines.push(`import { StackComponent } from "../../primitives/index.js";`);
  }
  if (ir.behavior.normalizedChannels.length > 0) {
    lines.push(`import { use${ir.name} } from "./use${ir.name}.js";`);
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
  const ctx: AngularRenderContext = {
    classRecipe: ir.classRecipe.base,
    channelByName,
    isRoot: true,
    ...(overlayClickTrigger && booleanChannel
      ? {
          overlayClickSetter: `set${capitalizeAngular(booleanChannel.name)}`,
          overlayClickEnabledProp: overlayClickTrigger.enabledByProp,
        }
      : {}),
  };
  const template = renderAngularDomNode(ir.dom, ctx, 0);
  const hasChildrenGuard = treeHasChildrenGuard(ir.dom);
  const usesNgIf = treeUsesNgIf(ir.dom);
  const usesNgFor = treeUsesNgFor(ir.dom);
  const usesCountIteration = treeUsesCountIteration(ir.dom);
  const decoratorImports = ["NgClass"];
  if (usesNgIf) decoratorImports.push("NgIf");
  if (usesNgFor) decoratorImports.push("NgFor");

  const lines: string[] = [];
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
  for (const ch of channels) {
    if (!PRIMITIVE_VALUE_TYPES.has(ch.valueType ?? "")) continue;
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

  lines.push(`}`);
  return lines.join("\n");
}

function generateDomTreeClassesComputed(ir: ComponentIR): string[] {
  const { classRecipe } = ir;
  const channels = ir.behavior.normalizedChannels;
  const channelValueProps = new Set(channels.map((c) => c.valueProp));
  const channelNames = new Set(channels.map((c) => c.name));
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
    lines.push(
      `      this.${mod.propName} ? \`${classRecipe.base}--\${this.${mod.propName}}\` : null,`,
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
      lines.push(
        `      this.${mod.safeName} ? "${classRecipe.base}--${mod.safeName}" : null,`,
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
  isRoot: boolean;
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
    const rendered = renderAngularEvent(eventName, expr, ctx);
    if (rendered === null) continue;
    attrs.push(rendered);
  }

  for (const [key, expr] of Object.entries(node.bindings)) {
    // Dual-pathway dedup: parseDomNode mirrored `bindings.onX` to
    // `events.<x>` for back-compat. The canonical events loop above
    // already emitted the handler — skip the legacy attribute pass.
    if (/^on[A-Z]/.test(key)) {
      const evt = key.slice(2).toLowerCase();
      if (node.events[evt]) continue;
    }
    const rendered = renderAngularBinding(key, expr, ctx, node.tag);
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

  if (ctx.isRoot) {
    attrs.unshift(`[ngClass]="classes()"`);
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
  const allChildren = [...contentLines, ...renderedChildren];

  const tag = node.tag;
  const isVoidEl = VOID_HTML_ELEMENTS_ANGULAR.has(tag);

  let body: string;
  if (allChildren.length === 0 && isVoidEl) {
    body = `${pad}<${tag}${formatAngularAttrs(attrs)} />`;
  } else if (allChildren.length === 0) {
    body = `${pad}<${tag}${formatAngularAttrs(attrs)}></${tag}>`;
  } else {
    body = [
      `${pad}<${tag}${formatAngularAttrs(attrs)}>`,
      ...allChildren,
      `${pad}</${tag}>`,
    ].join("\n");
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
    const ngForExpr =
      kind === "array"
        ? `let ${itemVar} of (${sourceExpr} ?? []); let ${indexVar} = index`
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
};

function angularAttrBinding(attr: string, tag?: string): string {
  if (attr.startsWith("data-") || attr.startsWith("aria-")) {
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
function angularPropAccessor(propName: string, ctx: AngularRenderContext): string {
  // Post-V2 (BINDING-EXPRESSION-V2-01): iteration locals reach the
  // emitter as `iterationLocal`-kind bindings and never as `prop:`
  // bindings; the legacy `iterationScope.has(propName)` shortcut is
  // intentionally removed.
  void ctx;
  return safePropertyExpr(propName);
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

function renderAngularBinding(
  attr: string,
  expr: BindingExpression,
  ctx: AngularRenderContext,
  tag?: string,
): string | null {
  switch (expr.kind) {
    case "prop":
      return `${angularAttrBinding(attr, tag)}="${appendPath(angularPropAccessor(expr.prop, ctx), expr.path)}"`;
    case "literal":
      return `${attr}="${escapeAngularAttr(expr.value)}"`;
    case "iterationLocal": {
      const name = angularIterationLocalName(expr.local, ctx);
      return name ? `${angularAttrBinding(attr, tag)}="${appendPath(name, expr.path)}"` : null;
    }
    case "channel": {
      const ch = ctx.channelByName.get(expr.channel);
      if (!ch) return null;
      if (expr.field === "value") {
        return `${angularAttrBinding(attr, tag)}="${appendPath(`behavior.${ch.name}()`, expr.path)}"`;
      }
      if (expr.field === "defaultValue") {
        if (!ch.defaultValueProp) return null;
        return `${angularAttrBinding(attr, tag)}="${safePropertyExpr(ch.defaultValueProp)}"`;
      }
      // onChange synthesis — bind to a method on the component.
      // Event-shaped channels pass the raw event to the consumer's
      // @Input handler; consumer drives state externally.
      const eventName = mapJsxEventToAngular(attr);
      if (ch.callbackKind === "event") {
        return `(${eventName})="${ch.changeHandlerProp}?.($event)"`;
      }
      const handlerName = `handle${capitalizeAngular(ch.name)}Change`;
      return `(${eventName})="${handlerName}($event)"`;
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
      return JSON.stringify(expr.value);
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
      if (ch.callbackKind === "event") {
        return `(${eventName})="${ch.changeHandlerProp}?.($event)"`;
      }
      const handlerName = `handle${capitalizeAngular(ch.name)}Change`;
      return `(${eventName})="${handlerName}($event)"`;
    }
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
