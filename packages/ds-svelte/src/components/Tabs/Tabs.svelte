<script lang="ts">
// @generated:start imports
import { useTabs } from "./useTabs.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type TabsOrientation = "horizontal" | "vertical";
type TabsActivationMode = "automatic" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  loop?: boolean;
  unmountInactive?: boolean;
  idBase?: string;
  class?: string;
  children?: import('svelte').Snippet;
}

let { value, defaultValue, onValueChange, orientation = "horizontal", activationMode = "automatic", loop = true, unmountInactive, idBase, class: className, children }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useTabs({
  value: () => value,
  defaultValue: () => defaultValue,
  onValueChange: () => onValueChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "tabs",
    orientation ? `tabs--${orientation}` : null,
    activationMode ? `tabs--${activationMode}` : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  <div class={'tabs__list'} role="tablist">
    <button class={'tabs__tab'} role="tab" type="button" aria-selected={behavior.activeTab}></button>
    <span class={'tabs__indicator'} aria-hidden="true"></span>
  </div>
  <div class={'tabs__panel'}>
    {@render children?.()}
  </div>
</div>
