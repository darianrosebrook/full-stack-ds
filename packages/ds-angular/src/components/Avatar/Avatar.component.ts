// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { ImageComponent } from "../Image/Image.component.js";
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
  imports: [NgClass, NgIf, ImageComponent],
  template: `<div [ngClass]="classes()" [attr.aria-label]="name">
  <ng-container *ngIf="src">
    <fsds-image [ngClass]="'avatar__image'" [src]="src" alt=""></fsds-image>
  </ng-container>
</div>`,
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
