<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CodeSnippetElement = "code" | "kbd" | "samp";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  text: string;
  as?: CodeSnippetElement;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  as: "code",
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "code-snippet",
  props.as ? `code-snippet--${props.as}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <component :is="props.as ?? 'code'" :class="classNames" spellcheck="false" :data-testid="props['data-testid']">
    {{ props.text }}
  </component>
</template>
