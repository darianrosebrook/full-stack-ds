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
  host: { "data-fsds-component": "text" },
  template: `<ng-container [ngSwitch]="this.as || 'p'">
  <p [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'p'">
    <ng-content />
  </p>
  <span [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'span'">
    <ng-content />
  </span>
  <div [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'div'">
    <ng-content />
  </div>
  <h1 [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'h1'">
    <ng-content />
  </h1>
  <h2 [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'h2'">
    <ng-content />
  </h2>
  <h3 [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'h3'">
    <ng-content />
  </h3>
  <h4 [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'h4'">
    <ng-content />
  </h4>
  <h5 [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'h5'">
    <ng-content />
  </h5>
  <h6 [ngClass]="classes()" [attr.data-truncate]="(truncate ? 'true' : 'false')" data-fsds-box="" *ngSwitchCase="'h6'">
    <ng-content />
  </h6>
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
