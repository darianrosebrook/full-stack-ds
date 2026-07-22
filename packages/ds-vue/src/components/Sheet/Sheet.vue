<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useSheet } from "./useSheet.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SheetSide = "top" | "right" | "bottom" | "left";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SheetSide;
  modal?: boolean;
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
  side: "right",
  modal: true,
});
// @generated:end

// @generated:start hook
const behavior = useSheet({
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "sheet",
  props.side ? `sheet--${props.side}` : null,
  behavior.openness.value ? "sheet--open" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <Teleport to="body">
    <div :class="classNames" role="dialog" :data-testid="props['data-testid']" @click.self="behavior.setOpenness(false)">
      <div v-if="behavior.openness.value" :class="'sheet__overlay'" aria-hidden="true"></div>
      <div v-if="behavior.openness.value" :class="'sheet__content'" role="dialog" aria-modal="true" aria-labelledby="sheet-title-id" aria-describedby="sheet-description-id" :data-side="props.side">
        <div :class="'sheet__header'">
          <h2 :class="'sheet__title'">
            <slot name="title" />
          </h2>
          <p :class="'sheet__description'">
            <slot name="description" />
          </p>
          <button :class="'sheet__close'" type="button" aria-label="Close sheet" @click="() => behavior.setOpenness(!behavior.openness.value)"></button>
        </div>
        <div :class="'sheet__body'">
          <slot />
        </div>
        <div :class="'sheet__footer'"></div>
      </div>
    </div>
  </Teleport>
</template>
