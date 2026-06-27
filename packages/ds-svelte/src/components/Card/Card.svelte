<script lang="ts">
// @generated:start imports
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type CardStatus = "completed" | "in-progress" | "planned" | "deprecated" | "category" | "complexity";
type CardDensity = "default" | "inset";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  interactive?: boolean;
  status?: CardStatus;
  density?: CardDensity;
  class?: string;
  children?: import('svelte').Snippet;
}

let { interactive, status, density = "default", class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "card",
    status ? `card--${status}` : null,
    density ? `card--${density}` : null,
    interactive ? "card--interactive" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<Stack role="group" class={classes}>
  {@render children?.()}
</Stack>
