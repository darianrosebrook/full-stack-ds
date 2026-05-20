// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-visually-hidden",
  standalone: true,
  imports: [NgClass],
  template: `<span [ngClass]="classes()">
  <ng-content />
</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisuallyHiddenComponent {
  @Input() focusable?: boolean;
  @Input() title?: string;
  @Input() class?: string;

  classes(): string {
    return [
      "visually-hidden",
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
