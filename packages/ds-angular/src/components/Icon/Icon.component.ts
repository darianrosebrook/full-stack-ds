// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type IconDefinition = { iconName: string; prefix?: string; icon?: unknown };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-icon",
  standalone: true,
  imports: [NgClass],
  template: `<span [ngClass]="classes()" aria-hidden="true">
  <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" [attr.width]="width" [attr.height]="height">
    <circle cx="8.5" cy="8.5" r="8" stroke="currentColor" stroke-linecap="round" stroke-dasharray="2 4"></circle>
    <circle cx="8.5" cy="8.5" r="3" stroke="currentColor" stroke-linecap="round" stroke-dasharray=".125 3"></circle>
  </svg>
</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() icon!: IconDefinition;
  @Input() width?: number = 20;
  @Input() height?: number = 20;
  @Input() class?: string;

  classes(): string {
    return [
      "icon",
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
