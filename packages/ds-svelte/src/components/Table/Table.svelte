<script lang="ts">
// @generated:start imports
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  responsive?: boolean;
  ariaLabel?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { responsive, ariaLabel, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "table",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<Stack class={classes}>
  {@render children?.()}
</Stack>
