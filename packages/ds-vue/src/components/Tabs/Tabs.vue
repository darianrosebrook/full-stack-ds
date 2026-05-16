<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useTabs } from "./useTabs.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  loop?: boolean;
  unmountInactive?: boolean;
  idBase?: string;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  orientation: "horizontal",
  activationMode: "automatic",
  loop: true,
});
// @generated:end

// @generated:start hook
const behavior = useTabs({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onValueChange: props.onValueChange,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "tabs",
  props.orientation ? `tabs--${props.orientation}` : null,
  props.activationMode ? `tabs--${props.activationMode}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="tablist" :data-testid="props['data-testid']">
    <div :class="'tabs__list'" role="tablist">
      <button :class="'tabs__tab'" role="tab" type="button" :aria-selected="behavior.activeTab.value === undefined ? undefined : Boolean(behavior.activeTab.value)"></button>
      <span :class="'tabs__indicator'" aria-hidden="true"></span>
    </div>
    <div :class="'tabs__panel'">
      <slot />
    </div>
  </div>
</template>
