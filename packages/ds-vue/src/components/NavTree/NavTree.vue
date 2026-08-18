<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { resolveIcon } from "@full-stack-ds/iconography";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type NavTreeIconSize = "sm" | "md";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  label: string;
  href?: string;
  icon?: string;
  iconSize?: NavTreeIconSize;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  iconSize: "sm",
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "nav-tree",
  props.iconSize ? `nav-tree--${props.iconSize}` : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @generated:start iconGlyph
const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20 };
const iconGlyphPx = computed(() => ICON_GLYPH_SIZE_HINTS[props.iconSize]);
const iconGlyph = computed(() => resolveIcon(props.icon ?? "", iconGlyphPx.value ?? Number.NaN));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <li :class="classNames" role="listitem" :data-testid="props['data-testid']" data-fsds-component="nav-tree">
    <div :class="'nav-tree__heading'">
      <span v-if="props.icon" :class="'nav-tree__icon'" aria-hidden="true">
        <svg v-if="iconGlyph" fill="none" xmlns="http://www.w3.org/2000/svg" :data-fsds-icon="iconGlyph.name" :viewBox="iconGlyph.viewBox" :width="iconGlyphPx ?? iconGlyph.size" :height="iconGlyphPx ?? iconGlyph.size">
          <path v-for="(glyphPath, glyphIndex) in iconGlyph.paths" :key="glyphIndex" :d="glyphPath.d" :fill="glyphPath.fill" :stroke="glyphPath.stroke" :stroke-width="glyphPath.strokeWidth" :stroke-linecap="glyphPath.strokeLineCap" :stroke-linejoin="glyphPath.strokeLineJoin" :stroke-dasharray="glyphPath.strokeDasharray" :fill-rule="glyphPath.fillRule" :clip-rule="glyphPath.clipRule" />
        </svg>
      </span>
      <a v-if="props.href" :class="'nav-tree__headingLink'" :href="props.href">
        {{ props.label }}
      </a>
      <span v-if="!props.href" :class="'nav-tree__headingLabel'">
        {{ props.label }}
      </span>
    </div>
    <ul :class="'nav-tree__list'">
      <slot />
    </ul>
  </li>
</template>
