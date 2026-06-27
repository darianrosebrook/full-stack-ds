<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type CodeSnippetElement = "code" | "kbd" | "samp";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  text: string;
  as?: CodeSnippetElement;
  class?: string;
}

let { text, as = "code", class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "code-snippet",
    as ? `code-snippet--${as}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<svelte:element this={as ?? "code"} class={classes} spellcheck="false">{text}</svelte:element>
