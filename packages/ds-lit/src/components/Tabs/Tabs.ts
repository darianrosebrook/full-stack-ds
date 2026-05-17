// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { TabsBehavior } from './TabsBehavior.js';
import {
  createCompoundContext,
  provideContext,
  ContextConsumerController,
} from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";

export interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  registeredTabs: string[];
  idBase: string;
  orientation: "horizontal" | "vertical";
  activationMode: "automatic" | "manual";
  loop: boolean;
  unmountInactive: boolean;
}

const TABS_CTX = createCompoundContext<TabsContextValue>("Tabs");
export { TABS_CTX };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class TabsElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() value?: string;
  @property() defaultValue?: string;
  @property() orientation?: "horizontal" | "vertical" = "horizontal";
  @property() activationMode?: "automatic" | "manual" = "automatic";
  @property({ type: Boolean }) loop?: boolean = true;
  @property({ type: Boolean }) unmountInactive?: boolean;
  @property() idBase?: string;
  @property({ attribute: false }) onValueChange?: (value: string) => void;

  private behavior = new TabsBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
  });

  private _generatedIdBase: string | null = null;

  private get resolvedIdBase(): string {
    if (this.idBase) return this.idBase;
    if (!this._generatedIdBase) {
      this._generatedIdBase = "fsds-tabs-" + Math.random().toString(36).slice(2, 8);
    }
    return this._generatedIdBase;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Sync the behavior's internal state from defaultValue if no controlled
    // value was set. This handles the case where defaultValue is set after
    // element construction (property set order issue with class fields).
    if (this.value === undefined && this.defaultValue !== undefined) {
      this.behavior.activeTabState["_internal"] = this.defaultValue;
    }
    this._provideCtx();
  }

  override updated(): void {
    this._provideCtx();
  }

  private _provideCtx(): void {
    if (!this.isConnected) return;
    provideContext(this, TABS_CTX.key, {
      activeTab: this.behavior.activeTab,
      setActiveTab: (v: string) => { this.behavior.setActiveTab(v); this._provideCtx(); },
      registerTab: (v: string) => { this.behavior.registerTab(v); this._provideCtx(); },
      unregisterTab: (v: string) => { this.behavior.unregisterTab(v); this._provideCtx(); },
      registeredTabs: this.behavior.registeredTabs,
      idBase: this.resolvedIdBase,
      orientation: this.orientation ?? "horizontal",
      activationMode: this.activationMode ?? "automatic",
      loop: this.loop ?? true,
      unmountInactive: this.unmountInactive ?? true,
    });
  }

  override render() {
    const cssBase = "tabs";
    const orientation = this.orientation ?? "horizontal";
    const activationMode = this.activationMode ?? "automatic";
    const classes = [cssBase, `${cssBase}--${orientation}`, `${cssBase}--${activationMode}`].join(" ");
    return html`<div class="${classes}"><slot></slot></div>`;
  }
}

customElements.define('fsds-tabs', TabsElement);

export class TabsListElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  private _ctx = new ContextConsumerController(this, TABS_CTX);

  private _handleKeyDown = (e: KeyboardEvent): void => {
    let ctx: TabsContextValue;
    try { ctx = this._ctx.value; } catch { return; }
    const tabs = ctx.registeredTabs;
    if (tabs.length === 0) return;
    const currentIndex = tabs.indexOf(ctx.activeTab);
    const isHorizontal = ctx.orientation !== "vertical";
    let nextIndex = currentIndex;
    if ((isHorizontal && e.key === "ArrowRight") || (!isHorizontal && e.key === "ArrowDown")) {
      e.preventDefault();
      nextIndex = ctx.loop ? (currentIndex + 1) % tabs.length : Math.min(currentIndex + 1, tabs.length - 1);
    } else if ((isHorizontal && e.key === "ArrowLeft") || (!isHorizontal && e.key === "ArrowUp")) {
      e.preventDefault();
      nextIndex = ctx.loop ? (currentIndex - 1 + tabs.length) % tabs.length : Math.max(currentIndex - 1, 0);
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabs.length - 1;
    } else if (e.key === "Enter" || e.key === " ") {
      if (ctx.activationMode === "manual") {
        e.preventDefault();
        // Find the currently focused tab host (it has data-value and role="tab").
        const focusedTab = this.querySelector("[role=\"tab\"]:focus") as HTMLElement | null;
        const val = focusedTab?.getAttribute("data-value");
        if (val) ctx.setActiveTab(val);
      }
      return;
    } else {
      return;
    }
    const targetValue = tabs[nextIndex];
    if (ctx.activationMode === "automatic") {
      ctx.setActiveTab(targetValue);
    }
    // Focus the target tab host element (which now has role="tab" on the host).
    const targetTabHost = this.querySelector(`[data-value="${targetValue}"]`) as HTMLElement | null;
    targetTabHost?.focus();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._handleKeyDown);
  }

  override disconnectedCallback(): void {
    this.removeEventListener("keydown", this._handleKeyDown);
    super.disconnectedCallback();
  }

  override render() {
    let orientation = "horizontal";
    try { orientation = this._ctx.value.orientation; } catch { /* no context yet */ }
    return html`<div class="tabs__list" role="tablist" aria-orientation="${orientation}"><slot></slot></div>`;
  }
}

customElements.define('fsds-tabs-list', TabsListElement);

export class TabsTabElement extends LitElement {
  // Host element IS the tab — ARIA attrs on the host, slot-only shadow.
  static override styles = css`
    :host { display: inline-flex; cursor: pointer; }
    :host([disabled]), :host([aria-disabled="true"]) { cursor: not-allowed; pointer-events: none; }
  `;

  @property() value = "";
  @property({ type: Boolean }) disabled?: boolean;

  private _ctx = new ContextConsumerController(this, TABS_CTX);

  private _onClick = (): void => { if (!this.disabled) { try { this._ctx.value.setActiveTab(this.value); } catch { /* no context */ } } };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("click", this._onClick);
    // Register after the context is available (provider fires provideContext in connectedCallback).
    // Use a microtask so the provider has connected first.
    Promise.resolve().then(() => {
      if (!this.isConnected) return;
      try { this._ctx.value.registerTab(this.value); } catch { /* no context */ }
    });
  }

  override disconnectedCallback(): void {
    this.removeEventListener("click", this._onClick);
    try { this._ctx.value.unregisterTab(this.value); } catch { /* no context */ }
    super.disconnectedCallback();
  }

  private _updateHostAttrs(isActive: boolean, idBase: string): void {
    this.setAttribute("role", "tab");
    this.setAttribute("id", `${idBase}-tab-${this.value}`);
    this.setAttribute("aria-controls", `${idBase}-panel-${this.value}`);
    this.setAttribute("aria-selected", isActive ? "true" : "false");
    this.setAttribute("tabindex", isActive ? "0" : "-1");
    this.setAttribute("data-value", this.value);
    if (this.disabled) this.setAttribute("aria-disabled", "true");
    else this.removeAttribute("aria-disabled");
  }

  override render() {
    let isActive = false;
    let idBase = "";
    try {
      const ctx = this._ctx.value;
      isActive = ctx.activeTab === this.value;
      idBase = ctx.idBase;
    } catch { /* no context yet */ }
    this._updateHostAttrs(isActive, idBase);
    // Render slot only — host IS the interactive element, no nested button needed.
    const cssClasses = [`tabs__tab`, isActive ? `tabs__tab--active` : ""].filter(Boolean).join(" ");
    this.className = cssClasses;
    return html`<slot></slot>`;
  }
}

customElements.define('fsds-tabs-tab', TabsTabElement);

export class TabsPanelElement extends LitElement {
  static override styles = css`:host { display: block; } :host([hidden]) { display: none !important; }`;

  @property() value = "";

  private _ctx = new ContextConsumerController(this, TABS_CTX);

  private _updateHostAttrs(isActive: boolean, unmountInactive: boolean, idBase: string): void {
    this.setAttribute("role", "tabpanel");
    this.setAttribute("id", `${idBase}-panel-${this.value}`);
    this.setAttribute("aria-labelledby", `${idBase}-tab-${this.value}`);
    this.setAttribute("tabindex", "0");
    if (!unmountInactive) {
      // Keep all panels in the DOM; toggle hidden attribute.
      if (isActive) this.removeAttribute("hidden");
      else this.setAttribute("hidden", "");
    } else {
      this.removeAttribute("hidden");
    }
  }

  override render() {
    let isActive = false;
    let unmountInactive = true;
    let idBase = "";
    try {
      const ctx = this._ctx.value;
      isActive = ctx.activeTab === this.value;
      unmountInactive = ctx.unmountInactive;
      idBase = ctx.idBase;
    } catch { /* no context yet */ }
    this._updateHostAttrs(isActive, unmountInactive, idBase);
    if (unmountInactive && !isActive) return html``;
    return html`<div class="tabs__panel"><slot></slot></div>`;
  }
}

customElements.define('fsds-tabs-panel', TabsPanelElement);
// @generated:end

// @custom:start trailing

// @custom:end