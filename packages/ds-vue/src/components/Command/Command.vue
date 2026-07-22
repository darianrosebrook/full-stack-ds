<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useCommand } from "./useCommand.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  label?: string;
  shouldFilter?: boolean;
  filter?: ((value: string, search: string) => number) | undefined;
  class?: string;
  "data-testid"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  defaultOpen: undefined,
  placeholder: "Search...",
  emptyMessage: "No results found.",
  label: "Command palette",
  shouldFilter: true,
});
// @generated:end

// @generated:start hook
const behavior = useCommand({
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
  search: () => props.search,
  defaultSearch: props.defaultSearch,
  onSearchChange: props.onSearchChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "command",
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <Teleport to="body">
    <div :class="classNames" role="dialog" :data-testid="props['data-testid']" @click.self="behavior.setOpen(false)">
      <div v-if="behavior.open.value" :class="'command__overlay'" aria-hidden="true"></div>
      <div v-if="behavior.open.value" :class="'command__dialog'" role="dialog" aria-modal="true" :aria-label="props.label">
        <div :class="'command__inputWrapper'">
          <span :class="'command__searchIcon'" aria-hidden="true"></span>
          <input :class="'command__input'" type="search" role="combobox" aria-autocomplete="list" aria-controls="fsds-command-listbox" @change="(e) => behavior.setSearch((e.target as HTMLInputElement).value)" :aria-expanded="behavior.open.value" :placeholder="props.placeholder" :value="behavior.search.value" />
        </div>
        <div :class="'command__list'" role="listbox" id="fsds-command-listbox">
          <div :class="'command__empty'"></div>
          <div :class="'command__group'">
            <div :class="'command__groupHeading'"></div>
            <div :class="'command__groupItems'">
              <div :class="'command__item'" role="option">
                <span :class="'command__itemIcon'"></span>
                <div :class="'command__itemContent'">
                  <span :class="'command__itemLabel'"></span>
                  <span :class="'command__itemDescription'"></span>
                </div>
              </div>
            </div>
          </div>
          <div :class="'command__separator'" role="separator" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
