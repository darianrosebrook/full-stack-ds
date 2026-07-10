<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { resolveIcon } from "@full-stack-ds/iconography";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  size: "md",
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "icon",
  props.size ? `icon--${props.size}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @generated:start iconGlyph
const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20, "lg": 24, "xl": 32 };
const iconGlyphPx = computed(() => ICON_GLYPH_SIZE_HINTS[props.size]);
const iconGlyph = computed(() => resolveIcon(props.name, iconGlyphPx.value ?? Number.NaN));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <span :class="classNames" aria-hidden="true" :data-testid="props['data-testid']">
    <svg v-if="iconGlyph" fill="none" xmlns="http://www.w3.org/2000/svg" :data-fsds-icon="iconGlyph.name" :viewBox="iconGlyph.viewBox" :width="iconGlyphPx ?? iconGlyph.size" :height="iconGlyphPx ?? iconGlyph.size">
      <path v-for="(glyphPath, glyphIndex) in iconGlyph.paths" :key="glyphIndex" :d="glyphPath.d" :fill="glyphPath.fill" :stroke="glyphPath.stroke" :stroke-width="glyphPath.strokeWidth" :stroke-linecap="glyphPath.strokeLineCap" :stroke-linejoin="glyphPath.strokeLineJoin" :stroke-dasharray="glyphPath.strokeDasharray" :fill-rule="glyphPath.fillRule" :clip-rule="glyphPath.clipRule" />
    </svg>
  </span>
</template>
