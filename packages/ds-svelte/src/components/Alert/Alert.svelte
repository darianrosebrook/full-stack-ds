<script lang="ts">
// @generated:start imports
import Button from "../Button/Button.svelte";
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
  onDismiss?: () => void;
  dismissLabel?: string;
  icon?: unknown;
  class?: string;
  children?: import('svelte').Snippet;
}

let { intent, level, dismissible, onDismiss, dismissLabel = "Dismiss", icon, class: className, children }: Props = $props();
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

<div class={classes} role="alert">
  {#if icon}
  <span class={'alert__icon'} aria-hidden="true">{icon}</span>
  {/if}
  {@render children?.()}
  {#if dismissible}
  <Button class={'alert__dismiss'} type="button" onClick={onDismiss} ariaLabel={dismissLabel} />
  {/if}
</div>
