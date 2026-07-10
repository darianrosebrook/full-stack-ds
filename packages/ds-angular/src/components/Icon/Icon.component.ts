// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf, NgFor } from "@angular/common";
import { resolveIcon } from "@full-stack-ds/iconography";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20, "lg": 24, "xl": 32 };

@Component({
  selector: "fsds-icon",
  standalone: true,
  imports: [NgClass, NgIf, NgFor],
  template: `<span [ngClass]="classes()" aria-hidden="true">
  <ng-container *ngIf="iconGlyph as glyph">
    <svg fill="none" xmlns="http://www.w3.org/2000/svg" [attr.data-fsds-icon]="glyph.name" [attr.viewBox]="glyph.viewBox" [attr.width]="(this.iconGlyphPx ?? glyph.size)" [attr.height]="(this.iconGlyphPx ?? glyph.size)">
      <ng-container *ngFor="let glyphPath of glyph.paths">
        <path [attr.d]="glyphPath.d" [attr.fill]="glyphPath.fill" [attr.stroke]="glyphPath.stroke" [attr.stroke-width]="glyphPath.strokeWidth" [attr.stroke-linecap]="glyphPath.strokeLineCap" [attr.stroke-linejoin]="glyphPath.strokeLineJoin" [attr.stroke-dasharray]="glyphPath.strokeDasharray" [attr.fill-rule]="glyphPath.fillRule" [attr.clip-rule]="glyphPath.clipRule" />
      </ng-container>
    </svg>
  </ng-container>
</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() name!: string;
  @Input() size?: "sm" | "md" | "lg" | "xl" = "md";
  @Input() class?: string;

  classes(): string {
    return [
      "icon",
      this.size ? `icon--${this.size}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }

  get iconGlyphPx(): number | undefined {
    return ICON_GLYPH_SIZE_HINTS[(this.size ?? "")];
  }

  get iconGlyph() {
    return resolveIcon(this.name, this.iconGlyphPx ?? Number.NaN);
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
