<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useTabsContext } from "./useTabs.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  value: string;
  class?: string;
  "data-testid"?: string;
}

const props = defineProps<Props>();
// @generated:end

// @generated:start classes
const ctx = useTabsContext();

const isActive = computed(() => ctx.activeTab.value === props.value);

const classNames = computed(() =>
  ["tabs__panel", props.class].filter(Boolean).join(" "),
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div
    v-if="!ctx.unmountInactive || isActive"
    role="tabpanel"
    :class="classNames"
    :id="`${ctx.idBase}-panel-${props.value}`"
    :aria-labelledby="`${ctx.idBase}-tab-${props.value}`"
    :tabindex="0"
    :data-testid="props['data-testid']"
    :hidden="!isActive ? true : undefined"
  >
    <slot />
  </div>
</template>
