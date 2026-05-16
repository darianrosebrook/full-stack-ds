<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useDetails } from "./useDetails.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DetailsVariant = "default" | "inline" | "compact";
export type DetailsIcon = "left" | "right" | "none";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  summary: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  variant?: DetailsVariant;
  icon?: DetailsIcon;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = defineProps<Props>();
// @generated:end

// @generated:start hook
const behavior = useDetails({
  open: () => props.open,
  defaultOpen: props.defaultOpen,
  onOpenChange: props.onOpenChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "details",
  props.variant ? `details--${props.variant}` : null,
  props.icon ? `details--${props.icon}` : null,
  behavior.open.value ? "details--open" : null,
  props.disabled ? "details--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <details :class="classNames" :open="behavior.open.value" role="group" :data-testid="props['data-testid']">
    <summary :class="'details__summary'">
      <span :class="'details__summaryContent'">
        <span :class="'details__icon'"></span>
        <span :class="'details__summaryText'">
          {{ props.summary }}
        </span>
      </span>
    </summary>
    <div v-if="behavior.open.value" :class="'details__content'">
      <slot />
    </div>
  </details>
</template>
