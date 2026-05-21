<script lang="ts">
// @generated:start imports
import { useField } from "./useField.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type FieldStatus = "idle" | "validating" | "valid" | "invalid";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  name: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (value: unknown) => void;
  validate?: ((value: unknown, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
  label?: unknown;
  helpText?: unknown;
  error?: string;
  status?: FieldStatus;
  validating?: boolean;
  class?: string;
  children?: import('svelte').Snippet;
}

let { name, id, required, disabled, readOnly, value, defaultValue, onChange, validate, label, helpText, error, status, validating, class: className, children }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useField({
  value: () => value,
  defaultValue: () => defaultValue,
  onChange: () => onChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "field",
    status ? `field--${status}` : null,
    disabled ? "field--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} role="group">
  <div class={'field__header'}>
    {#if label}
    <label class={'field__label'}>
      {@render children?.()}
    </label>
    {/if}
  </div>
  <div class={'field__control'}>
    {@render children?.()}
  </div>
  <div class={'field__meta'}>
    {#if helpText}
    <span class={'field__help'}></span>
    {/if}
    {#if error}
    <span class={'field__error'}></span>
    {/if}
    {#if validating}
    <span class={'field__validatingIndicator'}></span>
    {/if}
  </div>
</div>
