// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useToast } from "./useToast.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastPoliteness = "polite" | "assertive";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-toast",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()" aria-live="polite" aria-label="Notifications">
  <ng-container *ngIf="behavior.open()">
    <div [ngClass]="'toast__item'" role="status">
      <div [ngClass]="'toast__row'">
        <ng-container *ngIf="title">
          <div [ngClass]="'toast__title'"></div>
        </ng-container>
        <div [ngClass]="'toast__description'">
          <ng-content />
        </div>
        <ng-container *ngIf="action">
          <div [ngClass]="'toast__action'"></div>
        </ng-container>
        <button [ngClass]="'toast__close'" type="button" aria-label="Dismiss" (click)="handleOpenChange($event)"></button>
      </div>
    </div>
  </ng-container>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  @Input() open?: boolean;
  @Input() onOpenChange?: (open: boolean) => void;
  @Input() title?: string;
  @Input() variant?: ToastVariant = "info";
  @Input() politeness?: ToastPoliteness = "polite";
  @Input() action?: unknown;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useToast({
    open: () => this.open,
    onOpenChange: (v) => this.onOpenChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "toast",
      this.variant ? `toast--${this.variant}` : null,
      this.politeness ? `toast--${this.politeness}` : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleOpenChange(event: Event): void {
    this.behavior.setOpen((event.target as HTMLInputElement).checked);
  }
}

@Component({
  selector: "fsds-toast-item",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="li" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastItemComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["toast__item", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-toast-title",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="h3" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastTitleComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["toast__title", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-toast-description",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="p" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastDescriptionComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["toast__description", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
