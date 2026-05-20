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
  selector: "fsds-avatar",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  @Input() src?: string;
  @Input() name!: string;
  @Input() priority?: boolean;
  @Input() class?: string;
  @Input() size?: string;

  classes(): string {
    return [
      "avatar",
      this.size ? `avatar--${this.size}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
