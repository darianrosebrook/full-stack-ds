// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CodeSnippetAs = "code" | "kbd" | "samp";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class CodeSnippetElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .code-snippet {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-block-end: var(--fsds-semantic-surface-size-padding-block, 16px);
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-padding-inline-end: var(--fsds-semantic-surface-size-padding-inline, 16px);
      --fsds-box-model-gap: var(--fsds-semantic-display-size-gap, 4px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-code-snippet-color-background-default: var(--fsds-semantic-color-background-secondary, #d0d0d0);
      --fsds-code-snippet-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-code-snippet-color-border-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-code-snippet-size-padding-inline: var(--fsds-core-spacing-size-02, 2px);
      --fsds-code-snippet-size-padding-block: var(--fsds-core-spacing-size-01, 1px);
      --fsds-code-snippet-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-code-snippet-size-border-default: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-code-snippet-size-fontSize-default: var(--fsds-core-typography-ramp-3, 0.875rem);
      --fsds-code-snippet-typography-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-code-snippet-elevation-kbd: var(--fsds-semantic-elevation-surface-raised, 0 1px 1px rgba(0,0,0,0.14));
    }

    .code-snippet {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      background-color: var(--fsds-code-snippet-color-background-default, #d0d0d0);
      border-color: var(--fsds-code-snippet-color-border-default, #d0d0d0);
      border-style: solid;
      border-width: var(--fsds-code-snippet-size-border-default, 1px);
      border-radius: var(--fsds-code-snippet-size-radius-default, 6px);
      color: var(--fsds-code-snippet-color-foreground-primary, #141414);
      font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
      font-size: var(--fsds-code-snippet-size-fontSize-default, 0.875rem);
      line-height: var(--fsds-code-snippet-typography-lineHeight-default, 1.5);
      margin: 0;
      padding-block: var(--fsds-code-snippet-size-padding-block, 1px);
      padding-inline: var(--fsds-code-snippet-size-padding-inline, 2px);
      white-space: nowrap;
    }

    .code-snippet--kbd {
      box-shadow: var(--fsds-code-snippet-elevation-kbd, 0 1px 1px rgba(0,0,0,0.14));
      font-weight: var(--fsds-semantic-typography-font-weight-medium, 500);
    }

    .code-snippet--samp {
      background-color: transparent;
      border-color: transparent;
    }
  `;

  @property({ type: String }) text!: string;
  @property({ type: String }) as?: CodeSnippetAs = "code";

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "code-snippet");
  }

  private computeClasses(): string {
    return [
      "code-snippet",
      (this.as ?? "code") ? `code-snippet--${(this.as ?? "code")}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`${this.as === "kbd" ? html`<kbd class="${this.computeClasses()}" spellcheck="false">${this.text}</kbd>` : this.as === "samp" ? html`<samp class="${this.computeClasses()}" spellcheck="false">${this.text}</samp>` : html`<code class="${this.computeClasses()}" spellcheck="false">${this.text}</code>`}`;
  }
}

customElements.define('fsds-code-snippet', CodeSnippetElement);
// @generated:end

// @custom:start trailing

// @custom:end