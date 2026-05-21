<script lang="ts">
// @generated:start imports
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  ariaLabel?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  class?: string;
  children?: import('svelte').Snippet;
}

let { ariaLabel, value, defaultValue, onValueChange, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "shuttle",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<Stack role="listbox" class={classes}>
  {@render children?.()}
</Stack>
