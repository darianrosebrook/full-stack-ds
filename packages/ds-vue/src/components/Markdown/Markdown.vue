<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { parseMarkdown, type MarkdownBlock, type MarkdownMark } from "../../primitives/markdown/markdown.js";
import { h, Fragment, defineComponent, type VNode } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  content: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start markdownHelpers
function renderMarkdownBlock(block: MarkdownBlock): VNode {
  switch (block.kind) {
    case "heading":
      return h("h2", { class: "markdown__heading", "data-block-kind": "heading", "data-block-kind-level": block.level }, block.children.map(renderMarkdownMark));
    case "paragraph":
      return h("p", { class: "markdown__paragraph", "data-block-kind": "paragraph" }, block.children.map(renderMarkdownMark));
    case "list":
      return block.ordered
        ? h("ol", { class: "markdown__orderedList", "data-block-kind": "orderedList" }, block.items.map(renderMarkdownBlock))
        : h("ul", { class: "markdown__unorderedList", "data-block-kind": "unorderedList" }, block.items.map(renderMarkdownBlock));
    case "listItem":
      return h("li", { class: "markdown__listItem", "data-block-kind": "listItem" }, block.children.map(renderMarkdownMark));
    case "codeBlock":
      return h("pre", { class: "markdown__codeBlock", "data-block-kind": "codeBlock", "data-language": block.language }, block.text);
    case "blockquote":
      return h("blockquote", { class: "markdown__blockquote", "data-block-kind": "blockquote" }, block.children.map(renderMarkdownMark));
  }
}

function renderMarkdownMark(mark: MarkdownMark): VNode {
  switch (mark.kind) {
    case "text":
      return h("span", mark.text);
    case "code":
      return h("code", { class: "markdown__code", "data-mark-kind": "code" }, mark.text);
    case "emphasis":
      return h("em", { class: "markdown__emphasis", "data-mark-kind": "emphasis" }, mark.children.map(renderMarkdownMark));
    case "strong":
      return h("strong", { class: "markdown__strong", "data-mark-kind": "strong" }, mark.children.map(renderMarkdownMark));
    case "link":
      return mark.href === null
        ? h("span", mark.children.map(renderMarkdownMark))
        : h("a", { class: "markdown__link", "data-mark-kind": "link", href: mark.href }, mark.children.map(renderMarkdownMark));
  }
}

// A defineComponent-wrapped local component is the unambiguous Vue
// shape for template-mounted recursive render trees.
const MarkdownTree = defineComponent({
  setup: () => () => h(Fragment, null, parseMarkdown(props.content ?? "").map(renderMarkdownBlock)),
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "markdown",
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" :data-testid="props['data-testid']" data-fsds-component="markdown">
    <MarkdownTree />
  </div>
</template>
