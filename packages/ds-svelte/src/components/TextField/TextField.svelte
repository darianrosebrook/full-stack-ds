<script lang="ts">
// @generated:start imports
import { useTextField } from "./useTextField.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  ariaDescribedby?: string;
  class?: string;
  description?: import('svelte').Snippet;
  error?: import('svelte').Snippet;
  label?: import('svelte').Snippet;
}

let { type, value, defaultValue, onChange, invalid, disabled, required, name, ariaDescribedby, class: className, description, error, label }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useTextField({
  value: () => value,
  defaultValue: () => defaultValue,
  onChange: () => onChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "text-field",
    invalid ? "text-field--invalid" : null,
    disabled ? "text-field--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes}>
  <label class={'text-field__label'}>
    {@render label?.()}
  </label>
  <input class={'text-field__field'} onchange={(e) => behavior.setValue((e.currentTarget as HTMLInputElement).value)} type={type} value={behavior.value} disabled={disabled} name={name} required={required} aria-invalid={invalid} aria-describedby={ariaDescribedby} />
  <span class={'text-field__description'}>
    {@render description?.()}
  </span>
  <span class={'text-field__error'} role="alert">
    {@render error?.()}
  </span>
</div>
