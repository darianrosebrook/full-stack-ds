// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { parseMarkdown, type MarkdownBlock, type MarkdownMark } from '../../primitives/markdown/markdown.js';
import { type TemplateResult } from 'lit';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class MarkdownElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .markdown {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-markdown-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-markdown-typography-font-size-default: var(--fsds-core-typography-ramp-3, 0.875rem);
      --fsds-markdown-typography-line-height-default: var(--fsds-semantic-typography-line-height-body, 1.5);
    }

    .markdown {
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
      color: var(--fsds-markdown-color-foreground-default, #141414);
      font-size: var(--fsds-markdown-typography-font-size-default, 0.875rem);
      line-height: var(--fsds-markdown-typography-line-height-default, 1.5);
    }

    .markdown__codeBlock {
      white-space: pre;
    }
  `;

  @property({ type: String }) content!: string;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("data-fsds-component", "markdown");
  }

  private computeClasses(): string {
    return [
      "markdown",
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}">${renderMarkdownBlocks(this.content)}</div>`;
  }
}

customElements.define('fsds-markdown', MarkdownElement);

function renderMarkdownBlocks(source: string): TemplateResult[] {
  return parseMarkdown(source ?? "").map((block, blockIndex) =>
    renderMarkdownBlock(block, blockIndex),
  );
}

function renderMarkdownBlock(block: MarkdownBlock, key: number): TemplateResult {
  switch (block.kind) {
    case "heading":
      return html`<h2 class="markdown__heading" data-block-kind="heading" data-block-kind-level=${block.level}>${block.children.map((mark, markIndex) => renderMarkdownMark(mark, markIndex))}</h2>`;
    case "paragraph":
      return html`<p class="markdown__paragraph" data-block-kind="paragraph">${block.children.map((mark, markIndex) => renderMarkdownMark(mark, markIndex))}</p>`;
    case "list":
      return block.ordered
        ? html`<ol class="markdown__orderedList" data-block-kind="orderedList">${block.items.map((item, itemIndex) => renderMarkdownBlock(item, itemIndex))}</ol>`
        : html`<ul class="markdown__unorderedList" data-block-kind="unorderedList">${block.items.map((item, itemIndex) => renderMarkdownBlock(item, itemIndex))}</ul>`;
    case "listItem":
      return html`<li class="markdown__listItem" data-block-kind="listItem">${block.children.map((mark, markIndex) => renderMarkdownMark(mark, markIndex))}</li>`;
    case "codeBlock":
      return html`<pre class="markdown__codeBlock" data-block-kind="codeBlock" data-language=${block.language}>${block.text}</pre>`;
    case "blockquote":
      return html`<blockquote class="markdown__blockquote" data-block-kind="blockquote">${block.children.map((mark, markIndex) => renderMarkdownMark(mark, markIndex))}</blockquote>`;
  }
}

function renderMarkdownMark(mark: MarkdownMark, key: number): TemplateResult {
  switch (mark.kind) {
    case "text":
      return html`${mark.text}`;
    case "code":
      return html`<code class="markdown__code" data-mark-kind="code">${mark.text}</code>`;
    case "emphasis":
      return html`<em class="markdown__emphasis" data-mark-kind="emphasis">${mark.children.map((child, childIndex) => renderMarkdownMark(child, childIndex))}</em>`;
    case "strong":
      return html`<strong class="markdown__strong" data-mark-kind="strong">${mark.children.map((child, childIndex) => renderMarkdownMark(child, childIndex))}</strong>`;
    case "link":
      return mark.href === null
        ? html`${mark.children.map((child, childIndex) => renderMarkdownMark(child, childIndex))}`
        : html`<a class="markdown__link" data-mark-kind="link" href=${mark.href}>${mark.children.map((child, childIndex) => renderMarkdownMark(child, childIndex))}</a>`;
  }
}

// @generated:end

// @custom:start trailing

// @custom:end