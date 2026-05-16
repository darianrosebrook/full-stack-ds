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
  selector: "fsds-slinky-cursor",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <div [ngClass]="'slinky-cursor__pest'"></div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlinkyCursorComponent {
  @Input() class?: string;

  classes(): string {
    return [
      "slinky-cursor",
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
