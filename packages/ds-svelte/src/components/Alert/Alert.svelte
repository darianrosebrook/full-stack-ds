<script lang="ts">
// @generated:start imports
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type AlertIntent = "info" | "success" | "warning" | "danger";
type AlertLevel = "inline" | "section" | "page";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  intent?: AlertIntent;
  level?: AlertLevel;
  dismissible?: boolean;
  icon?: unknown;
  class?: string;
  children?: import('svelte').Snippet;
}

let { intent, level, dismissible, icon, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "alert",
    intent ? `alert--${intent}` : null,
    level ? `alert--${level}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<Stack role="alert" class={classes}>
  {@render children?.()}
</Stack>
