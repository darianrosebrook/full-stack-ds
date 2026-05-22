<script lang="ts">
// @generated:start imports
import { useCheckbox } from "./useCheckbox.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type CheckboxSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  size?: CheckboxSize;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  class?: string;
}

let { size = "md", checked, defaultChecked, onChange, indeterminate, disabled, name, value, class: className }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useCheckbox({
  checked: () => checked,
  defaultChecked: () => defaultChecked,
  onChange: () => onChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "checkbox",
    size ? `checkbox--${size}` : null,
    behavior.checked ? "checkbox--checked" : null,
    disabled ? "checkbox--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<input class={classes} type="checkbox" onchange={(e) => behavior.setChecked((e.currentTarget as HTMLInputElement).checked)} checked={behavior.checked} disabled={disabled} role="checkbox" />
