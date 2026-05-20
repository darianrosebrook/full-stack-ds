// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AspectRatioPreset = "square" | "video" | "photo" | "wide" | "portrait";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-aspect-ratio",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()">
  <ng-content />
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AspectRatioComponent {
  @Input() ratio?: number;
  @Input() preset?: AspectRatioPreset;
  @Input() class?: string;

  classes(): string {
    return [
      "aspect-ratio",
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
