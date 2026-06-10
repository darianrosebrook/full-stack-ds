// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useDetails } from "./useDetails.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DetailsVariant = "default" | "inline" | "compact";
export type DetailsIcon = "left" | "right" | "none";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-details",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<details [ngClass]="classes()" [open]="behavior.open()">
  <summary [ngClass]="'details__summary'">
    <span [ngClass]="'details__summaryContent'">
      <span [ngClass]="'details__icon'"></span>
      <span [ngClass]="'details__summaryText'">
        {{ summary }}
      </span>
    </span>
  </summary>
  <ng-container *ngIf="behavior.open()">
    <div [ngClass]="'details__content'">
      <ng-content />
    </div>
  </ng-container>
</details>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsComponent {
  @Input() summary!: string;
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() onOpenChange?: (open: boolean) => void;
  @Input() disabled?: boolean;
  @Input() variant?: DetailsVariant;
  @Input() icon?: DetailsIcon;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useDetails({
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "details",
      this.variant ? `details--${this.variant}` : null,
      this.icon ? `details--${this.icon}` : null,
      this.behavior.open() ? "details--open" : null,
      this.disabled ? "details--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );
}

@Component({
  selector: "fsds-details-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["details__content", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
