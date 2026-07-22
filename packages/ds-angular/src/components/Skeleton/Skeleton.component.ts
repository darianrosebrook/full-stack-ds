// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SkeletonVariant = "block" | "text" | "avatar" | "media" | "dataviz" | "actions";
export type SkeletonAnimate = "shimmer" | "wipe" | "pulse" | "none";
export type SkeletonDensity = "compact" | "regular" | "spacious";
export type SkeletonLines = number | { min: number; max: number };
export type SkeletonRadius = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-skeleton",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()" [attr.role]="((decorative ?? true) ? 'presentation' : 'status')" [attr.aria-busy]="((decorative ?? true) ? 'false' : 'true')" [attr.aria-hidden]="((decorative ?? true) ? 'true' : 'false')" [attr.aria-label]="ariaLabel"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonComponent {
  @Input() variant?: SkeletonVariant = "block";
  @Input() animate?: SkeletonAnimate = "shimmer";
  @Input() density?: SkeletonDensity = "regular";
  @Input() aspectRatio?: string;
  @Input() lines?: SkeletonLines;
  @Input() radius?: SkeletonRadius;
  @Input() decorative?: boolean = true;
  @Input() ariaLabel?: string;
  @Input() class?: string;

  classes(): string {
    return [
      "skeleton",
      (this.variant ?? "block") ? `skeleton--${(this.variant ?? "block")}` : null,
      (this.animate ?? "shimmer") ? `skeleton--${(this.animate ?? "shimmer")}` : null,
      (this.density ?? "regular") ? `skeleton--${(this.density ?? "regular")}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
