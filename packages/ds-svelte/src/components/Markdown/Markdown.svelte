<script lang="ts">
// @generated:start imports
import { parseMarkdown, type MarkdownBlock, type MarkdownMark } from "../../primitives/markdown/markdown.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  content: string;
  class?: string;
}

let { content, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "markdown",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} data-fsds-component="markdown">{#each parseMarkdown(content ?? "") as block, blockIndex}{@render markdownBlock(block, blockIndex)}{/each}</div>

{#snippet markdownBlock(block: MarkdownBlock, blockIndex: number)}
  {#if block.kind === "heading"}
    <h2 class="markdown__heading" data-block-kind="heading" data-block-kind-level={block.level}>{#each block.children as mark, markIndex}{@render markdownMark(mark, markIndex)}{/each}</h2>
  {:else if block.kind === "paragraph"}
    <p class="markdown__paragraph" data-block-kind="paragraph">{#each block.children as mark, markIndex}{@render markdownMark(mark, markIndex)}{/each}</p>
  {:else if block.kind === "list"}
    {#if block.ordered}
      <ol class="markdown__orderedList" data-block-kind="orderedList">{#each block.items as item, itemIndex}{@render markdownBlock(item, itemIndex)}{/each}</ol>
    {:else}
      <ul class="markdown__unorderedList" data-block-kind="unorderedList">{#each block.items as item, itemIndex}{@render markdownBlock(item, itemIndex)}{/each}</ul>
    {/if}
  {:else if block.kind === "listItem"}
    <li class="markdown__listItem" data-block-kind="listItem">{#each block.children as mark, markIndex}{@render markdownMark(mark, markIndex)}{/each}</li>
  {:else if block.kind === "codeBlock"}
    <pre class="markdown__codeBlock" data-block-kind="codeBlock" data-language={block.language}>{block.text}</pre>
  {:else if block.kind === "blockquote"}
    <blockquote class="markdown__blockquote" data-block-kind="blockquote">{#each block.children as mark, markIndex}{@render markdownMark(mark, markIndex)}{/each}</blockquote>
  {/if}
{/snippet}

{#snippet markdownMark(mark: MarkdownMark, markIndex: number)}
  {#if mark.kind === "text"}
    {mark.text}
  {:else if mark.kind === "code"}
    <code class="markdown__code" data-mark-kind="code">{mark.text}</code>
  {:else if mark.kind === "emphasis"}
    <em class="markdown__emphasis" data-mark-kind="emphasis">{#each mark.children as child, childIndex}{@render markdownMark(child, childIndex)}{/each}</em>
  {:else if mark.kind === "strong"}
    <strong class="markdown__strong" data-mark-kind="strong">{#each mark.children as child, childIndex}{@render markdownMark(child, childIndex)}{/each}</strong>
  {:else if mark.kind === "link"}
    {#if mark.href === null}
      <span>{#each mark.children as child, childIndex}{@render markdownMark(child, childIndex)}{/each}</span>
    {:else}
      <a class="markdown__link" data-mark-kind="link" href={mark.href}>{#each mark.children as child, childIndex}{@render markdownMark(child, childIndex)}{/each}</a>
    {/if}
  {/if}
{/snippet}
