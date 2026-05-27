<script lang="ts">
// @generated:start imports
import { useShuttle } from "./useShuttle.svelte.js";
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
}

let { ariaLabel, value, defaultValue = ["alpha","beta","gamma"], onValueChange, class: className }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useShuttle({
  value: () => value,
  defaultValue: () => defaultValue,
  onValueChange: () => onValueChange,
});
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

<ul class={classes} role="listbox" aria-label={ariaLabel}>
  {#each (behavior.selection ?? []) as item, index (index)}
  <li class={'shuttle__item'} role="option">
    <span>{item}</span>
  </li>
  {/each}
</ul>
