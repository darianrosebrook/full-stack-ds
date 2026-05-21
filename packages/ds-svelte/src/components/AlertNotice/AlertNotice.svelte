<script lang="ts">
// @generated:start imports
import { Stack } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type AlertNoticeStatus = "info" | "success" | "warning" | "error";
type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  status?: AlertNoticeStatus;
  level?: AlertNoticeLevel;
  dismissible?: boolean;
  icon?: unknown;
  class?: string;
  children?: import('svelte').Snippet;
}

let { status, level, dismissible, icon, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "alert-notice",
    status ? `alert-notice--${status}` : null,
    level ? `alert-notice--${level}` : null,
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
