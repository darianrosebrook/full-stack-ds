// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatSize = "sm" | "md" | "lg";
export type StatTrend = "up" | "down" | "neutral";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-stat",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()">
  <ng-content />
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatComponent {
  @Input() size?: StatSize = "md";
  @Input() trend?: StatTrend;
  @Input() class?: string;

  classes(): string {
    return [
      "stat",
      (this.size ?? "md") ? `stat--${(this.size ?? "md")}` : null,
      this.trend ? `stat--${this.trend}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
