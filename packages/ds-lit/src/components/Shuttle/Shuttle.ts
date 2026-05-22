// @generated:start imports
import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { StackElement as _Stack } from '../../primitives/index.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class ShuttleElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .shuttle {
      --fsds-shuttle-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-shuttle-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-shuttle-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-shuttle-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-shuttle-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-shuttle-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-shuttle-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
    }
    
    .shuttle {
      background-color: var(--fsds-shuttle-color-background-default);
      color: var(--fsds-shuttle-color-foreground-secondary);
      border-color: var(--fsds-shuttle-color-border-accent);
      padding: var(--fsds-shuttle-size-padding-default);
      border-radius: var(--fsds-shuttle-size-radius-default);
    }
    
    .shuttle__item {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      color: var(--fsds-shuttle-color-foreground-primary);
      cursor: pointer;
    }
  `;

  @property({ attribute: 'aria-label', reflect: true })
  override ariaLabel: string | null = null;
  @property({ attribute: false })
  value?: string[];
  @property({ attribute: false })
  defaultValue?: string[];
  @property({ attribute: false })
  onValueChange?: (value: string[]) => void;

  override render() {
    return html`<fsds-stack role="listbox" class="shuttle"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-shuttle', ShuttleElement);

export class ShuttleItemElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .shuttle {
      --fsds-shuttle-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-shuttle-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-shuttle-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-shuttle-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-shuttle-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-shuttle-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-shuttle-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
    }
    
    .shuttle {
      background-color: var(--fsds-shuttle-color-background-default);
      color: var(--fsds-shuttle-color-foreground-secondary);
      border-color: var(--fsds-shuttle-color-border-accent);
      padding: var(--fsds-shuttle-size-padding-default);
      border-radius: var(--fsds-shuttle-size-radius-default);
    }
    
    .shuttle__item {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      color: var(--fsds-shuttle-color-foreground-primary);
      cursor: pointer;
    }
  `;

  override render() {
    return html`<fsds-stack as="li" class="shuttle__item"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-shuttle-item', ShuttleItemElement);
// @generated:end

// @custom:start trailing

// @custom:end