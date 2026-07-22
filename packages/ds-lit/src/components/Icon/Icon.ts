// @generated:start imports
import { LitElement, html, css, nothing, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { resolveIcon } from "@full-stack-ds/iconography";
import { ifDefined } from 'lit/directives/if-defined.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20, "lg": 24, "xl": 32 };

export class IconElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .icon {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: 0;
      --fsds-box-model-width: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: var(--fsds-semantic-glyph-size-medium-extent, 16px);
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-icon-size-sm: var(--fsds-core-icon-size-sm, 16px);
      --fsds-icon-size-md: var(--fsds-core-icon-size-md, 20px);
      --fsds-icon-size-lg: var(--fsds-core-icon-size-lg, 24px);
      --fsds-icon-size-xl: var(--fsds-core-icon-size-xl, 32px);
      --fsds-icon-color-foreground-default: var(--fsds-semantic-color-foreground-primary, #141414);
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-sizing: border-box;
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      color: var(--fsds-icon-color-foreground-default);
    }

    .icon--sm {
      width: var(--fsds-icon-size-sm);
      height: var(--fsds-icon-size-sm);
    }

    .icon--md {
      width: var(--fsds-icon-size-md);
      height: var(--fsds-icon-size-md);
    }

    .icon--lg {
      width: var(--fsds-icon-size-lg);
      height: var(--fsds-icon-size-lg);
    }

    .icon--xl {
      width: var(--fsds-icon-size-xl);
      height: var(--fsds-icon-size-xl);
    }
  `;

  @property({ type: String }) name!: string;
  @property({ attribute: false }) size?: "sm" | "md" | "lg" | "xl" = "md";

  private computeClasses(): string {
    return [
      "icon",
      (this.size ?? "md") ? `icon--${(this.size ?? "md")}` : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    const iconGlyphPx = ICON_GLYPH_SIZE_HINTS[(this.size ?? "md")];
    const iconGlyph = resolveIcon(this.name, iconGlyphPx ?? Number.NaN);
    return html`<span class="${this.computeClasses()}" aria-hidden="true">
  ${iconGlyph ? svg`
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" data-fsds-icon=${iconGlyph.name} viewBox=${iconGlyph.viewBox} width=${iconGlyphPx ?? iconGlyph.size} height=${iconGlyphPx ?? iconGlyph.size}>
    ${iconGlyph.paths.map((glyphPath) => svg`<path d=${ifDefined(glyphPath.d)} fill=${ifDefined(glyphPath.fill)} stroke=${ifDefined(glyphPath.stroke)} stroke-width=${ifDefined(glyphPath.strokeWidth)} stroke-linecap=${ifDefined(glyphPath.strokeLineCap)} stroke-linejoin=${ifDefined(glyphPath.strokeLineJoin)} stroke-dasharray=${ifDefined(glyphPath.strokeDasharray)} fill-rule=${ifDefined(glyphPath.fillRule)} clip-rule=${ifDefined(glyphPath.clipRule)} />`)}
  </svg>
  ` : nothing}
</span>`;
  }
}

customElements.define('fsds-icon', IconElement);
// @generated:end

// @custom:start trailing

// @custom:end