<script lang="ts">
// @generated:start imports
import { useAccordion } from "./useAccordion.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type AccordionType = "single" | "multiple";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  disabled?: boolean;
  class?: string;
  children?: import('svelte').Snippet;
}

let { type = "single", value, defaultValue, onValueChange, collapsible = false, disabled, class: className, children }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useAccordion({
  value: () => value,
  defaultValue: () => defaultValue,
  onValueChange: () => onValueChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "accordion",
    type ? `accordion--${type}` : null,
    disabled ? "accordion--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  <div class={'accordion__item'}>
    <h3 class={'accordion__header'}>
      <button class={'accordion__trigger'} type="button" aria-expanded={Boolean(behavior.openness)}>
        {@render children?.()}
        <span class={'accordion__chevron'}></span>
      </button>
    </h3>
    <div class={'accordion__content'}>
      <div class={'accordion__contentInner'}>
        {@render children?.()}
      </div>
    </div>
  </div>
</div>
