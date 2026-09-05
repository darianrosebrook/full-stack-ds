<script lang="ts">
// @generated:start imports
import Icon from "../Icon/Icon.svelte";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type StatusIntent = "info" | "success" | "warning" | "danger" | "error";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  status: StatusIntent;
  class?: string;
  children?: import('svelte').Snippet;
}

let { status, class: className, children }: Props = $props();
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "status",
    status ? `status--${status}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<span class={classes} data-fsds-component="status">
  <Icon class={'status__icon'} size="sm" name={(status === "info" ? "info" : (status === "success" ? "check" : (status === "warning" ? "triangle-alert" : (status === "danger" ? "triangle-alert" : "triangle-alert"))))} />
  <span class={'status__label'}>
    {@render children?.()}
  </span>
</span>
