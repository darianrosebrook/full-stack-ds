// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CodeBlockLanguage = "bash" | "css" | "html" | "javascript" | "json" | "jsx" | "markdown" | "plaintext" | "tsx" | "typescript";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class CodeBlockElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .code-block {
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
      --fsds-code-block-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-code-block-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-code-block-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-code-block-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-code-block-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-code-block-size-border-default: var(--fsds-semantic-shape-control-border-defaultWidth, 1px);
      --fsds-code-block-size-fontSize-default: var(--fsds-core-typography-ramp-3, 0.875rem);
      --fsds-code-block-typography-lineHeight-default: var(--fsds-semantic-typography-line-height-body, 1.5);
    }

    .code-block {
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
      background-color: var(--fsds-code-block-color-background-default);
      border-color: var(--fsds-code-block-color-border-default);
      border-style: solid;
      border-width: var(--fsds-code-block-size-border-default);
      border-radius: var(--fsds-code-block-size-radius-default);
      color: var(--fsds-code-block-color-foreground-primary);
      font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
      font-size: var(--fsds-code-block-size-fontSize-default);
      line-height: var(--fsds-code-block-typography-lineHeight-default);
      margin: 0;
      overflow-x: auto;
      padding: var(--fsds-code-block-size-padding-default);
      tab-size: 2;
      white-space: pre;
    }

    .code-block__code {
      display: block;
      font-family: inherit;
      font-size: inherit;
    }
  `;

  @property({ type: String }) code!: string;
  @property({ type: String }) language!: CodeBlockLanguage;

  private computeClasses(): string {
    return [
      "code-block",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<pre class="${this.computeClasses()}" data-language=${ifDefined(this.language)}>
  <code class=${'code-block__code'} spellcheck="false" data-language=${ifDefined(this.language)}>${this.code}</code>
</pre>`;
  }
}

customElements.define('fsds-code-block', CodeBlockElement);
// @generated:end

// @custom:start trailing

// @custom:end