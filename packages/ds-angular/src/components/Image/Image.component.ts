// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ImageAspectRatio = "square" | "video" | "photo" | "wide" | "portrait";
export type ImageObjectFit = "cover" | "contain" | "fill" | "scale-down" | "none";
export type ImageLoading = "lazy" | "eager";
export type ImageRadius = "none" | "sm" | "md" | "lg" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-image",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<img [ngClass]="classes()" [src]="src" [alt]="alt" [width]="width" [height]="height" [loading]="loading" [sizes]="sizes" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  @Input() src?: string;
  @Input() alt!: string;
  @Input() width?: number;
  @Input() height?: number;
  @Input() aspectRatio?: ImageAspectRatio;
  @Input() objectFit?: ImageObjectFit;
  @Input() objectPosition?: string;
  @Input() loading?: ImageLoading;
  @Input() sizes?: string;
  @Input() radius?: ImageRadius;
  @Input() showPlaceholder?: boolean;
  @Input() fallbackSrc?: string;
  @Input() class?: string;
  @Input() size?: string;

  classes(): string {
    return [
      "image",
      this.radius ? `image--${this.radius}` : null,
      this.size ? `image--${this.size}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
