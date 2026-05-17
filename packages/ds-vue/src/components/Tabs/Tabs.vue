<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useTabs, provideTabsContext } from "./useTabs.js";
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
  unmountInactive: true,
});
// @generated:end

// @generated:start hook
const { activeTab, setActiveTab, registeredTabs, registerTab, unregisterTab, idBase } = useTabs({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onValueChange: props.onValueChange,
  idBase: props.idBase,
});

provideTabsContext({
  activeTab,
  setActiveTab,
  registeredTabs,
  registerTab,
  unregisterTab,
  idBase,
  get orientation() { return props.orientation ?? "horizontal"; },
  get activationMode() { return props.activationMode ?? "automatic"; },
  get loop() { return props.loop ?? true; },
  get unmountInactive() { return props.unmountInactive ?? true; },
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
  <div :class="classNames" :data-testid="props['data-testid']">
    <slot />
  </div>
</template>
