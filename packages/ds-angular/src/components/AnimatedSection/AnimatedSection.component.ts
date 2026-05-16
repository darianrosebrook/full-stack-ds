// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedSectionAs = "section" | "div" | "article" | "main" | "aside" | "header" | "footer";
export type AnimatedSectionVariant = "fade-up" | "fade-in" | "slide-in" | "stagger-children";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-animated-section",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<section [ngClass]="classes()">
  <ng-content />
</section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedSectionComponent {
  @Input() as?: AnimatedSectionAs;
  @Input() variant?: AnimatedSectionVariant;
  @Input() duration?: number;
  @Input() stagger?: number;
  @Input() delay?: number;
  @Input() triggerOnScroll?: boolean;
  @Input() scrollStart?: string;
  @Input() class?: string;

  classes(): string {
    return [
      "animated-section",
      this.as ? `animated-section--${this.as}` : null,
      this.variant ? `animated-section--${this.variant}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
