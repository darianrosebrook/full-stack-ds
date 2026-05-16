// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedCardAs = "article" | "div" | "li" | "a";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-animated-card",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()" [attr.data-as]="this.as">
  <ng-content />
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedCardComponent {
  @Input() as?: AnimatedCardAs;
  @Input() duration?: number;
  @Input() delay?: number;
  @Input() triggerOnScroll?: boolean;
  @Input() scrollStart?: string;
  @Input() enableHover?: boolean;
  @Input() href?: string;
  @Input() class?: string;

  classes(): string {
    return [
      "animated-card",
      this.as ? `animated-card--${this.as}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-animated-card-title",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="h3" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedCardTitleComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["animated-card__title", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
