// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgSwitch, NgSwitchCase } from "@angular/common";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ListElement = "ul" | "ol" | "dl";
export type ListVariant = "default" | "unstyled" | "inline" | "divided" | "spaced";
export type ListMarker = "default" | "none" | "disc" | "circle" | "square" | "decimal" | "alpha" | "roman";
export type ListSpacing = "none" | "sm" | "md" | "lg";
export type ListSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-list",
  standalone: true,
  imports: [NgClass, NgSwitch, NgSwitchCase],
  template: `<ng-container [ngSwitch]="this.as || 'ul'">
  <ul [ngClass]="classes()" *ngSwitchCase="'ul'">
    <ng-content />
  </ul>
  <ol [ngClass]="classes()" *ngSwitchCase="'ol'">
    <ng-content />
  </ol>
  <dl [ngClass]="classes()" *ngSwitchCase="'dl'">
    <ng-content />
  </dl>
</ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() as?: ListElement;
  @Input() variant?: ListVariant = "default";
  @Input() marker?: ListMarker = "default";
  @Input() spacing?: ListSpacing;
  @Input() size?: ListSize;
  @Input() class?: string;

  classes(): string {
    return [
      "list",
      this.as ? `list--${this.as}` : null,
      this.variant ? `list--variant-${this.variant}` : null,
      this.marker ? `list--marker-${this.marker}` : null,
      this.spacing ? `list--spacing-${this.spacing}` : null,
      this.size ? `list--size-${this.size}` : null,
      this.class,
    ].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
