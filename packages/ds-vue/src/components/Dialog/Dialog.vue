<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useDialog } from "./useDialog.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  size?: DialogSize;
  dismissible?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  initialFocus?: string;
  returnFocus?: string;
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
  modal: true,
  size: "md",
  dismissible: true,
  closeOnEscape: true,
  closeOnBackdropClick: true,
});
// @generated:end

// @generated:start hook
const behavior = useDialog({
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
  closeOnEscape: props.closeOnEscape,
  closeOnBackdropClick: props.closeOnBackdropClick,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "dialog",
  props.size ? `dialog--${props.size}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="dialog" :data-testid="props['data-testid']" @click.self="props.closeOnBackdropClick !== false && behavior.setOpenness(false)">
    <div v-if="behavior.openness.value" :class="'dialog__backdrop'" aria-hidden="true"></div>
    <div v-if="behavior.openness.value" :class="'dialog__modal'" role="dialog" aria-modal="true" aria-labelledby="dialog-title-id" aria-describedby="dialog-body-id">
      <div :class="'dialog__header'">
        <h2 :class="'dialog__title'">
          <slot name="title" />
        </h2>
        <button :class="'dialog__closeButton'" type="button" aria-label="Close dialog"></button>
      </div>
      <div :class="'dialog__body'">
        <slot />
      </div>
      <div :class="'dialog__footer'"></div>
    </div>
  </div>
</template>
