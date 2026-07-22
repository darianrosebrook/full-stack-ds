<script lang="ts">
// @generated:start imports
import { useSelect } from "./useSelect.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type SelectOption = { value: string; label: string; disabled?: boolean };
type SelectSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  options?: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiple?: boolean;
  disabled?: boolean;
  size?: SelectSize;
  filterFn?: ((option: SelectOption, searchTerm: string) => boolean);
  searchable?: boolean;
  empty?: boolean;
  position?: string;
  class?: string;
}

let { options = [{"value":"alpha","label":"Alpha"},{"value":"beta","label":"Beta"},{"value":"gamma","label":"Gamma"}], value, defaultValue = "beta", onChange, open, defaultOpen = true, onOpenChange, multiple, disabled, size = "md", filterFn, searchable, empty, position, class: className }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useSelect({
  value: () => value,
  defaultValue: () => defaultValue,
  onChange: () => onChange,
  open: () => open,
  defaultOpen: () => defaultOpen,
  onOpenChange: () => onOpenChange,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "select",
    size ? `select--${size}` : null,
    position ? `select--${position}` : null,
    behavior.open ? "select--open" : null,
    disabled ? "select--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} role="combobox" aria-haspopup="listbox" aria-controls="fsds-select-listbox" aria-expanded={behavior.open} aria-disabled={disabled}>
  <button class={'select__trigger'} type="button" onclick={() => behavior.setOpen(!behavior.open)} disabled={disabled}>
    <span class={'select__text'}></span>
  </button>
  {#if behavior.open}
  <div class={'select__content'} role="listbox" id="fsds-select-listbox">
    {#if searchable}
    <div class={'select__search'}>
      <input type="text" />
    </div>
    {/if}
    <div class={'select__options'}>
      {#each (options ?? []) as item, index (index)}
      <div class={'select__option'} role="option" aria-selected={(Array.isArray(behavior.selection) ? behavior.selection.includes(item.value) : item.value === behavior.selection)} data-value={item.value}>
        <span>{item.label}</span>
      </div>
      {/each}
    </div>
    {#if empty}
    <div class={'select__emptyState'}></div>
    {/if}
  </div>
  {/if}
</div>
