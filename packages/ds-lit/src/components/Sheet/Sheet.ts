// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { SheetBehavior } from './SheetBehavior.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SheetSide = "top" | "right" | "bottom" | "left";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class SheetElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-sheet, rgba(0,0,0,0.50));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textTitle: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textDescription: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-sheet-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-sheet-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-sizeTitle: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weightTitle: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-sheet-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-sheet-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .sheet {
      background-color: var(--fsds-sheet-color-background);
      border-color: var(--fsds-sheet-color-border);
      color: var(--fsds-sheet-color-textDescription);
      border-width: var(--fsds-sheet-border-width);
      border-radius: var(--fsds-sheet-border-radius);
      padding: var(--fsds-sheet-spacing-padding);
      gap: var(--fsds-sheet-spacing-gap);
      font-size: var(--fsds-sheet-text-sizeTitle);
      font-weight: var(--fsds-sheet-text-weightTitle);
      box-shadow: var(--fsds-sheet-shadow);
    
      &:hover {
        background-color: var(--fsds-sheet-color-backgroundHover);
      }
    }
  `;

  @property({ type: Boolean }) open?: boolean;
  @property({ type: Boolean }) defaultOpen?: boolean;
  @property({ attribute: false }) side?: SheetSide = "right";
  @property({ type: Boolean }) modal?: boolean = true;
  @property({ attribute: false }) onOpenChange?: (value: boolean) => void;

  private behavior = new SheetBehavior(this, {
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
  });

  private _handleOverlayClick = (): void => {
    this.behavior.setOpenness(false);
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleOverlayClick);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('click', this._handleOverlayClick);
    super.disconnectedCallback();
  }

  private computeClasses(): string {
    return [
      "sheet",
      this.side ? `sheet--${this.side}` : null,
      this.behavior.openness ? "sheet--open" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="dialog">
  ${this.behavior.openness ? html`
  <div class=${'sheet__overlay'} aria-hidden="true" data-fsds-channel-renders="openness"></div>
  ` : nothing}
  ${this.behavior.openness ? html`
  <div class=${'sheet__content'} role="dialog" aria-modal="true" aria-labelledby="sheet-title-id" aria-describedby="sheet-description-id" data-side=${ifDefined(this.side)} data-fsds-channel-renders="openness" @click=${(e: Event) => e.stopPropagation()}>
    <div class=${'sheet__header'}>
      <h2 class=${'sheet__title'}>
        <slot name="title"></slot>
      </h2>
      <p class=${'sheet__description'}>
        <slot name="description"></slot>
      </p>
      <button class=${'sheet__close'} type="button" aria-label="Close sheet"></button>
    </div>
    <div class=${'sheet__body'}>
      <slot></slot>
    </div>
    <div class=${'sheet__footer'}></div>
  </div>
  ` : nothing}
</div>`;
  }
}

customElements.define('fsds-sheet', SheetElement);

export class SheetContentElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-sheet, rgba(0,0,0,0.50));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textTitle: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textDescription: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-sheet-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-sheet-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-sizeTitle: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weightTitle: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-sheet-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-sheet-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .sheet {
      background-color: var(--fsds-sheet-color-background);
      border-color: var(--fsds-sheet-color-border);
      color: var(--fsds-sheet-color-textDescription);
      border-width: var(--fsds-sheet-border-width);
      border-radius: var(--fsds-sheet-border-radius);
      padding: var(--fsds-sheet-spacing-padding);
      gap: var(--fsds-sheet-spacing-gap);
      font-size: var(--fsds-sheet-text-sizeTitle);
      font-weight: var(--fsds-sheet-text-weightTitle);
      box-shadow: var(--fsds-sheet-shadow);
    
      &:hover {
        background-color: var(--fsds-sheet-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack class="sheet__content"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-content', SheetContentElement);

export class SheetHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-sheet, rgba(0,0,0,0.50));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textTitle: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textDescription: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-sheet-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-sheet-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-sizeTitle: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weightTitle: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-sheet-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-sheet-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .sheet {
      background-color: var(--fsds-sheet-color-background);
      border-color: var(--fsds-sheet-color-border);
      color: var(--fsds-sheet-color-textDescription);
      border-width: var(--fsds-sheet-border-width);
      border-radius: var(--fsds-sheet-border-radius);
      padding: var(--fsds-sheet-spacing-padding);
      gap: var(--fsds-sheet-spacing-gap);
      font-size: var(--fsds-sheet-text-sizeTitle);
      font-weight: var(--fsds-sheet-text-weightTitle);
      box-shadow: var(--fsds-sheet-shadow);
    
      &:hover {
        background-color: var(--fsds-sheet-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="sheet__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-header', SheetHeaderElement);

export class SheetTitleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-sheet, rgba(0,0,0,0.50));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textTitle: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textDescription: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-sheet-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-sheet-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-sizeTitle: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weightTitle: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-sheet-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-sheet-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .sheet {
      background-color: var(--fsds-sheet-color-background);
      border-color: var(--fsds-sheet-color-border);
      color: var(--fsds-sheet-color-textDescription);
      border-width: var(--fsds-sheet-border-width);
      border-radius: var(--fsds-sheet-border-radius);
      padding: var(--fsds-sheet-spacing-padding);
      gap: var(--fsds-sheet-spacing-gap);
      font-size: var(--fsds-sheet-text-sizeTitle);
      font-weight: var(--fsds-sheet-text-weightTitle);
      box-shadow: var(--fsds-sheet-shadow);
    
      &:hover {
        background-color: var(--fsds-sheet-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="h3" class="sheet__title"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-title', SheetTitleElement);

export class SheetDescriptionElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-sheet, rgba(0,0,0,0.50));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textTitle: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textDescription: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-sheet-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-sheet-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-sizeTitle: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weightTitle: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-sheet-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-sheet-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .sheet {
      background-color: var(--fsds-sheet-color-background);
      border-color: var(--fsds-sheet-color-border);
      color: var(--fsds-sheet-color-textDescription);
      border-width: var(--fsds-sheet-border-width);
      border-radius: var(--fsds-sheet-border-radius);
      padding: var(--fsds-sheet-spacing-padding);
      gap: var(--fsds-sheet-spacing-gap);
      font-size: var(--fsds-sheet-text-sizeTitle);
      font-weight: var(--fsds-sheet-text-weightTitle);
      box-shadow: var(--fsds-sheet-shadow);
    
      &:hover {
        background-color: var(--fsds-sheet-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="p" class="sheet__description"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-description', SheetDescriptionElement);

export class SheetBodyElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-sheet, rgba(0,0,0,0.50));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textTitle: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textDescription: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-sheet-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-sheet-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-sizeTitle: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weightTitle: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-sheet-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-sheet-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .sheet {
      background-color: var(--fsds-sheet-color-background);
      border-color: var(--fsds-sheet-color-border);
      color: var(--fsds-sheet-color-textDescription);
      border-width: var(--fsds-sheet-border-width);
      border-radius: var(--fsds-sheet-border-radius);
      padding: var(--fsds-sheet-spacing-padding);
      gap: var(--fsds-sheet-spacing-gap);
      font-size: var(--fsds-sheet-text-sizeTitle);
      font-weight: var(--fsds-sheet-text-weightTitle);
      box-shadow: var(--fsds-sheet-shadow);
    
      &:hover {
        background-color: var(--fsds-sheet-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack class="sheet__body"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-body', SheetBodyElement);

export class SheetFooterElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .sheet {
      --fsds-sheet-color-overlay: var(--fsds-semantic-overlay-scrim-sheet, rgba(0,0,0,0.50));
      --fsds-sheet-color-background: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-sheet-color-border: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-sheet-color-text: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textTitle: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-sheet-color-textDescription: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-sheet-border-width: var(--fsds-core-shape-border-width-hairline, 1px);
      --fsds-sheet-border-radius: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-sheet-size-width: 400px;
      --fsds-sheet-size-height: 300px;
      --fsds-sheet-size-close: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-padding: var(--fsds-core-spacing-size-06, 16px);
      --fsds-sheet-spacing-gap: var(--fsds-core-spacing-size-04, 8px);
      --fsds-sheet-text-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-sheet-text-sizeTitle: var(--fsds-semantic-typography-heading-06, 14px);
      --fsds-sheet-text-weightTitle: var(--fsds-semantic-typography-font-weight-medium, 500);
      --fsds-sheet-shadow: var(--fsds-semantic-elevation-surface-floating, 0 4px 24px rgba(0,0,0,0.12));
      --fsds-sheet-focus-width: var(--fsds-core-shape-border-width-thick, 2px);
      --fsds-sheet-focus-color: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-sheet-color-backgroundHover: var(--fsds-semantic-interaction-background-hover, #efefef);
    }
    
    .sheet {
      background-color: var(--fsds-sheet-color-background);
      border-color: var(--fsds-sheet-color-border);
      color: var(--fsds-sheet-color-textDescription);
      border-width: var(--fsds-sheet-border-width);
      border-radius: var(--fsds-sheet-border-radius);
      padding: var(--fsds-sheet-spacing-padding);
      gap: var(--fsds-sheet-spacing-gap);
      font-size: var(--fsds-sheet-text-sizeTitle);
      font-weight: var(--fsds-sheet-text-weightTitle);
      box-shadow: var(--fsds-sheet-shadow);
    
      &:hover {
        background-color: var(--fsds-sheet-color-backgroundHover);
      }
    }
  `;

  override render() {
    return html`<fsds-stack as="footer" variant="horizontal" class="sheet__footer"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-sheet-footer', SheetFooterElement);
// @generated:end

// @custom:start trailing

// @custom:end