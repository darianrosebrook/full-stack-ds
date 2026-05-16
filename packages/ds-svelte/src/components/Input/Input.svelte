<script lang="ts">
// @generated:start imports
import { useInput } from "./useInput.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  class?: string;
}

let { type, value, defaultValue, onChange, placeholder, disabled, invalid, required, name, class: className }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useInput({
  value: () => value,
  defaultValue: () => defaultValue,
  onChange: () => onChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "input",
    disabled ? "input--disabled" : null,
    invalid ? "input--invalid" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<input class={classes} value={behavior.value} onchange={(e) => behavior.setValue((e.currentTarget as HTMLInputElement).value)} disabled={disabled} aria-invalid={invalid} type={type} role="textbox" />
