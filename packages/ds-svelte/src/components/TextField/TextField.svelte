<script lang="ts">
// @generated:start imports
import { useTextField } from "./useTextField.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  label?: unknown;
  description?: unknown;
  error?: unknown;
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
  children?: import('svelte').Snippet;
}

let { label, description, error, type, value, defaultValue, onChange, invalid, disabled, required, name, ariaDescribedby, class: className, children }: Props = $props();
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
  {#if label}
  <label class={'text-field__label'}>
    {@render children?.()}
  </label>
  {/if}
  <input class={'text-field__field'} onchange={(e) => behavior.setValue((e.currentTarget as HTMLInputElement).value)} type={type} value={behavior.value} disabled={disabled} name={name} required={required} aria-invalid={invalid} aria-describedby={ariaDescribedby} />
  {#if description}
  <span class={'text-field__description'}>
    {@render children?.()}
  </span>
  {/if}
  {#if error}
  <span class={'text-field__error'} role="alert">
    {@render children?.()}
  </span>
  {/if}
</div>
