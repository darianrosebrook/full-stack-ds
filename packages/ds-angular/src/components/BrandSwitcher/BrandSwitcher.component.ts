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
  selector: "fsds-brand-switcher",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()">
  <ng-content />
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandSwitcherComponent {
  @Input() showAutoCycle?: boolean = false;
  @Input() showDensity?: boolean = false;
  @Input() showFonts?: boolean = false;
  @Input() compact?: boolean = false;
  @Input() sticky?: boolean = false;
  @Input() enableKeyboard?: boolean = true;
  @Input() class?: string;

  classes(): string {
    return [
      "brand-switcher",
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
