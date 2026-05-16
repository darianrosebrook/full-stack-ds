<script lang="ts">
// @generated:start imports
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  class?: string;
  "data-testid"?: string;
  children?: import('svelte').Snippet;
}

let { class: className, "data-testid": dataTestid, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(["alert-notice__body", className].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<Stack class={classes} data-testid={dataTestid}>
  {@render children?.()}
</Stack>
