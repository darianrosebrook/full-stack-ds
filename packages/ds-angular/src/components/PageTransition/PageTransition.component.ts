// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-page-transition",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <ng-content />
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTransitionComponent {
  @Input() transitionName?: string;
  @Input() duration?: number;
  @Input() enabled?: boolean = true;
  @Input() class?: string;

  classes(): string {
    return [
      "page-transition",
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
