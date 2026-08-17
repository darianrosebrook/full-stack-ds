<script lang="ts">
// @generated:start imports
import { tokenizeCode } from "../../primitives/highlight/tokenize.js";
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
  highlight?: boolean;
  class?: string;
}

let { code, language, highlight = true, class: className }: Props = $props();
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

<pre class={classes} data-language={language} data-fsds-component="code-block">
  <code class={'code-block__code'} spellcheck="false" data-language={language}>{#if highlight}{#each tokenizeCode(code, language) as token, tokenIndex}<span class="code-block__token" data-token={token.kind}>{token.text}</span>{/each}{:else}{code}{/if}</code>
</pre>
