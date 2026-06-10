<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useToast } from "./useToast.js";
import { useAutoDismiss } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastPoliteness = "polite" | "assertive";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  variant?: ToastVariant;
  politeness?: ToastPoliteness;
  action?: unknown;
  duration?: number | null;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  open: undefined,
  variant: "info",
  politeness: "polite",
});
// @generated:end

// @generated:start hook
const behavior = useToast({
  open: () => props.open,
  onOpenChange: props.onOpenChange,
});

const autoDismiss = useAutoDismiss({
  open: () => Boolean(behavior.open.value),
  durationMs: () => props.duration === undefined ? 6000 : props.duration,
  onDismiss: () => behavior.setOpen(false),
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "toast",
  props.variant ? `toast--${props.variant}` : null,
  props.politeness ? `toast--${props.politeness}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" aria-live="polite" aria-label="Notifications" role="alert" :data-testid="props['data-testid']" v-on="autoDismiss.pauseListeners">
    <div v-if="behavior.open.value" :class="'toast__item'" role="status">
      <div :class="'toast__row'">
        <div v-if="props.title" :class="'toast__title'"></div>
        <div :class="'toast__description'">
          <slot />
        </div>
        <div v-if="props.action" :class="'toast__action'"></div>
        <button :class="'toast__close'" type="button" aria-label="Dismiss" @click="() => behavior.setOpen(!behavior.open.value)"></button>
      </div>
    </div>
  </div>
</template>
