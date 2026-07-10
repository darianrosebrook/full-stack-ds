<script lang="ts">
// @generated:start imports
import { resolveIcon } from "@full-stack-ds/iconography";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start props
interface Props {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  class?: string;
}

let { name, size = "md", class: className }: Props = $props();
// @generated:end

// @generated:start iconGlyph
const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20, "lg": 24, "xl": 32 };
const iconGlyphPx = $derived(ICON_GLYPH_SIZE_HINTS[size]);
const iconGlyph = $derived(resolveIcon(name, iconGlyphPx ?? Number.NaN));
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "icon",
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<span class={classes} aria-hidden="true">
  {#if iconGlyph}
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" data-fsds-icon={iconGlyph.name} viewBox={iconGlyph.viewBox} width={iconGlyphPx ?? iconGlyph.size} height={iconGlyphPx ?? iconGlyph.size}>
    {#each iconGlyph.paths as glyphPath, glyphIndex (glyphIndex)}
      <path d={glyphPath.d} fill={glyphPath.fill} stroke={glyphPath.stroke} stroke-width={glyphPath.strokeWidth} stroke-linecap={glyphPath.strokeLineCap} stroke-linejoin={glyphPath.strokeLineJoin} stroke-dasharray={glyphPath.strokeDasharray} fill-rule={glyphPath.fillRule} clip-rule={glyphPath.clipRule} />
    {/each}
  </svg>
  {/if}
</span>
