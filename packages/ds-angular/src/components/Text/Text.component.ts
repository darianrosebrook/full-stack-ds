// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgSwitch, NgSwitchCase } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TextElement = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TextVariant = "display" | "headline" | "title" | "body" | "caption" | "overline" | "code";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type TextWeight = "light" | "normal" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-text",
  standalone: true,
  imports: [NgClass, NgSwitch, NgSwitchCase],
  template: `<ng-container [ngSwitch]="this.as || 'p'">
  <p [ngClass]="classes()" *ngSwitchCase="'p'"></p>
  <span [ngClass]="classes()" *ngSwitchCase="'span'"></span>
  <div [ngClass]="classes()" *ngSwitchCase="'div'"></div>
  <h1 [ngClass]="classes()" *ngSwitchCase="'h1'"></h1>
  <h2 [ngClass]="classes()" *ngSwitchCase="'h2'"></h2>
  <h3 [ngClass]="classes()" *ngSwitchCase="'h3'"></h3>
  <h4 [ngClass]="classes()" *ngSwitchCase="'h4'"></h4>
  <h5 [ngClass]="classes()" *ngSwitchCase="'h5'"></h5>
  <h6 [ngClass]="classes()" *ngSwitchCase="'h6'"></h6>
</ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextComponent {
  @Input() as?: TextElement;
  @Input() variant?: TextVariant;
  @Input() size?: TextSize;
  @Input() weight?: TextWeight;
  @Input() align?: TextAlign;
  @Input() transform?: TextTransform;
  @Input() truncate?: boolean;
  @Input() class?: string;

  classes(): string {
    return [
      "text",
      this.variant ? `text--${this.variant}` : null,
      this.size ? `text--${this.size}` : null,
      this.weight ? `text--${this.weight}` : null,
      this.align ? `text--${this.align}` : null,
      this.transform ? `text--${this.transform}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
