<script setup lang="ts">
// @generated:start imports
import { computed, onMounted, onUnmounted } from "vue";
import { useTabsContext } from "./useTabs.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  value: string;
  disabled?: boolean;
  class?: string;
  "data-testid"?: string;
}

const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const ctx = useTabsContext();

const isActive = computed(() => ctx.activeTab.value === props.value);

const classNames = computed(() =>
  [
    "tabs__tab",
    isActive.value && "tabs__tab--active",
    props.class,
  ]
    .filter(Boolean)
    .join(" "),
);
// @generated:end

// @generated:start trailing
onMounted(() => {
  ctx.registerTab(props.value);
});

onUnmounted(() => {
  ctx.unregisterTab(props.value);
});
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <button
    role="tab"
    type="button"
    :class="classNames"
    :data-value="props.value"
    :data-testid="props['data-testid']"
    :id="`${ctx.idBase}-tab-${props.value}`"
    :aria-controls="`${ctx.idBase}-panel-${props.value}`"
    :aria-selected="isActive"
    :tabindex="isActive ? 0 : -1"
    :disabled="props.disabled"
    @click="ctx.setActiveTab(props.value)"
  >
    <slot />
  </button>
</template>
