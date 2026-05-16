// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { TabsBehavior } from './TabsBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class TabsElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property() value?: string;
  @property() defaultValue?: string;
  @property() orientation?: TabsOrientation = "horizontal";
  @property() activationMode?: TabsActivationMode = "automatic";
  @property({ type: Boolean }) loop?: boolean = true;
  @property({ type: Boolean }) unmountInactive?: boolean;
  @property() idBase?: string;
  @property({ attribute: false }) onValueChange?: (value: string) => void;

  private behavior = new TabsBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
  });

  private handleActiveTabChange(event: Event): void {
    this.behavior.setActiveTab((event.target as HTMLInputElement).value);
  }

  private computeClasses(): string {
    return [
      "tabs",
      this.orientation ? `tabs--${this.orientation}` : null,
      this.activationMode ? `tabs--${this.activationMode}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="tablist">
  <div class=${'tabs__list'} role="tablist">
    <button class=${'tabs__tab'} role="tab" type="button" aria-selected=${this.behavior.activeTab}></button>
    <span class=${'tabs__indicator'} aria-hidden="true"></span>
  </div>
  <div class=${'tabs__panel'}>
    <slot></slot>
  </div>
</div>`;
  }
}

customElements.define('fsds-tabs', TabsElement);

export class TabsListElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="ul" variant="horizontal" class="tabs__list"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-tabs-list', TabsListElement);

export class TabsTabElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="tabs__tab"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-tabs-tab', TabsTabElement);

export class TabsPanelElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack class="tabs__panel"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-tabs-panel', TabsPanelElement);
// @generated:end

// @custom:start trailing

// @custom:end