<script lang="ts">
// @generated:start imports

// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type CodeBlockLanguage = "bash" | "css" | "html" | "javascript" | "json" | "jsx" | "markdown" | "plaintext" | "tsx" | "typescript";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  code: string;
  language: CodeBlockLanguage;
  class?: string;
}

let { code, language, class: className }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "code-block",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<pre class={classes} data-language={language}>
  <code class={'code-block__code'} spellcheck="false" data-language={language}>{code}</code>
</pre>
