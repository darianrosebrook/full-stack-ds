<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useSelect } from "./useSelect.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  options: SelectOption[];
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
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  size: "md",
});
// @generated:end

// @generated:start hook
const behavior = useSelect({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onChange: props.onChange,
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "select",
  props.size ? `select--${props.size}` : null,
  props.position ? `select--${props.position}` : null,
  behavior.open.value ? "select--open" : null,
  props.disabled ? "select--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="combobox" aria-haspopup="listbox" aria-controls="fsds-select-listbox" :aria-expanded="behavior.open.value" :aria-disabled="props.disabled" :data-testid="props['data-testid']">
    <button :class="'select__trigger'" type="button" :disabled="props.disabled">
      <span :class="'select__text'"></span>
    </button>
    <div v-if="behavior.open.value" :class="'select__content'" role="listbox" id="fsds-select-listbox">
      <div v-if="props.searchable" :class="'select__search'">
        <input type="text" />
      </div>
      <div :class="'select__options'">
        <div :class="'select__option'" role="option"></div>
      </div>
      <div v-if="props.empty" :class="'select__emptyState'"></div>
    </div>
  </div>
</template>
