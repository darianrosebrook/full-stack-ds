// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedTextAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
export type AnimatedTextVariant = "blur-in" | "fade-up" | "slide-in";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-animated-text",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()" [attr.data-text]="text"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedTextComponent {
  @Input() text!: string;
  @Input() as?: AnimatedTextAs;
  @Input() variant?: AnimatedTextVariant;
  @Input() duration?: number;
  @Input() stagger?: number;
  @Input() delay?: number;
  @Input() triggerOnScroll?: boolean;
  @Input() scrollStart?: string;
  @Input() class?: string;

  classes(): string {
    return [
      "animated-text",
      this.as ? `animated-text--${this.as}` : null,
      this.variant ? `animated-text--${this.variant}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
