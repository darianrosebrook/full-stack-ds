// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { tokenizeCode } from '../../primitives/highlight/tokenize.js';
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
      --fsds-code-block-color-background-default: var(--fsds-semantic-color-background-secondary, #f7f7f7);
      --fsds-code-block-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-code-block-color-border-default: var(--fsds-semantic-color-border-subtle, #d0d0d0);
      --fsds-code-block-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-code-block-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 6px);
      --fsds-code-block-size-border-default: var(--fsds-semantic-shape-control-border-default-width, 1px);
      --fsds-code-block-size-font-size-default: var(--fsds-core-typography-ramp-3, 0.875rem);
      --fsds-code-block-typography-line-height-default: var(--fsds-semantic-typography-line-height-body, 1.5);
      --fsds-code-block-token-color-plain: var(--fsds-semantic-color-foreground-syntax-plain, #141414);
      --fsds-code-block-token-color-comment: var(--fsds-semantic-color-foreground-syntax-comment-color, #474647);
      --fsds-code-block-token-color-keyword: var(--fsds-semantic-color-foreground-syntax-keyword, #013ab0);
      --fsds-code-block-token-color-definition: var(--fsds-semantic-color-foreground-syntax-definition, #900909);
      --fsds-code-block-token-color-punctuation: var(--fsds-semantic-color-foreground-syntax-punctuation, #013ab0);
      --fsds-code-block-token-color-property: var(--fsds-semantic-color-foreground-syntax-property, #6c3a00);
      --fsds-code-block-token-color-static: var(--fsds-semantic-color-foreground-syntax-static, #900909);
      --fsds-code-block-token-color-string: var(--fsds-semantic-color-foreground-syntax-string, #900909);
      --fsds-code-block-token-color-tag: var(--fsds-semantic-color-foreground-syntax-tag, #900909);
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
      background-color: var(--fsds-code-block-color-background-default, #f7f7f7);
      border-color: var(--fsds-code-block-color-border-default, #d0d0d0);
      border-style: solid;
      border-width: var(--fsds-code-block-size-border-default, 1px);
      border-radius: var(--fsds-code-block-size-radius-default, 6px);
      color: var(--fsds-code-block-color-foreground-primary, #141414);
      font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
      font-size: var(--fsds-code-block-size-font-size-default, 0.875rem);
      line-height: var(--fsds-code-block-typography-line-height-default, 1.5);
      margin: 0;
      overflow-x: auto;
      padding: var(--fsds-code-block-size-padding-default, 16px);
      tab-size: 2;
      white-space: pre;
    }

    .code-block__code {
      display: block;
      font-family: inherit;
      font-size: inherit;
    }

    .code-block__token[data-token="plain"] {
      color: var(--fsds-code-block-token-color-plain, #141414);
    }

    .code-block__token[data-token="comment"] {
      color: var(--fsds-code-block-token-color-comment, #474647);
    }

    .code-block__token[data-token="keyword"] {
      color: var(--fsds-code-block-token-color-keyword, #013ab0);
    }

    .code-block__token[data-token="definition"] {
      color: var(--fsds-code-block-token-color-definition, #900909);
    }

    .code-block__token[data-token="punctuation"] {
      color: var(--fsds-code-block-token-color-punctuation, #013ab0);
    }

    .code-block__token[data-token="property"] {
      color: var(--fsds-code-block-token-color-property, #6c3a00);
    }

    .code-block__token[data-token="static"] {
      color: var(--fsds-code-block-token-color-static, #900909);
    }

    .code-block__token[data-token="string"] {
      color: var(--fsds-code-block-token-color-string, #900909);
    }

    .code-block__token[data-token="tag"] {
      color: var(--fsds-code-block-token-color-tag, #900909);
    }
  `;

  @property({ type: String }) code!: string;
  @property({ type: String }) language!: CodeBlockLanguage;
  @property({ type: Boolean }) highlight?: boolean = true;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "code-block");
  }

  private computeClasses(): string {
    return [
      "code-block",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<pre class="${this.computeClasses()}" data-language=${ifDefined(this.language)}>
  <code class=${'code-block__code'} spellcheck="false" data-language=${ifDefined(this.language)}>${(this.highlight ?? true) ? tokenizeCode(this.code, this.language).map((token, tokenIndex) => html`<span class=${'code-block__token'} data-token=${token.kind}>${token.text}</span>`) : this.code}</code>
</pre>`;
  }
}

customElements.define('fsds-code-block', CodeBlockElement);

// @generated:end

// @custom:start trailing

// @custom:end