// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy, effect, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useToast } from "./useToast.js";
import { createAutoDismiss } from "../../primitives/index.js";
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
let nextInstanceId = 0;

@Component({
  selector: "fsds-toast",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()" aria-label="Notifications" [attr.aria-live]="(politeness ?? 'polite')" (pointerenter)="autoDismiss.pauseListeners.pointerenter()" (pointerleave)="autoDismiss.pauseListeners.pointerleave()" (focusin)="autoDismiss.pauseListeners.focusin()" (focusout)="autoDismiss.pauseListeners.focusout()">
  <ng-container *ngIf="behavior.open()">
    <div [ngClass]="'toast__item'" role="status" [attr.aria-labelledby]="itemAriaLabelledby">
      <div [ngClass]="'toast__row'">
        <ng-container *ngIf="title">
          <div [ngClass]="'toast__title'" [attr.id]="instanceId + '-title'">
            {{ title }}
          </div>
        </ng-container>
        <div [ngClass]="'toast__description'">
          <ng-content />
        </div>
        <ng-container *ngIf="action">
          <div [ngClass]="'toast__action'"></div>
        </ng-container>
        <button [ngClass]="'toast__close'" type="button" aria-label="Dismiss" (click)="behavior.setOpen(!behavior.open())"></button>
      </div>
    </div>
  </ng-container>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() open?: boolean;
  @Input() onOpenChange?: (open: boolean) => void;
  @Input() title?: string;
  @Input() variant?: ToastVariant = "info";
  @Input() politeness?: ToastPoliteness = "polite";
  @Input() action?: unknown;
  @Input() duration?: number | null;
  @Input() class?: string;

  protected readonly instanceId = `fsds-toast-${nextInstanceId++}`;

  private destroyRef = inject(DestroyRef);
  protected behavior = useToast({
    open: () => this.open,
    onOpenChange: (v) => this.onOpenChange?.(v),
    destroyRef: this.destroyRef,
  });

  protected autoDismiss = createAutoDismiss({
    open: () => Boolean(this.behavior.open()),
    durationMs: () => this.duration === undefined ? 6000 : this.duration,
    onDismiss: () => this.behavior.setOpen(false),
    destroyRef: this.destroyRef,
  });
  private autoDismissEffect = effect(() => this.autoDismiss.sync());

  classes = computed(() =>
    [
      "toast",
      (this.variant ?? "info") ? `toast--${(this.variant ?? "info")}` : null,
      (this.politeness ?? "polite") ? `toast--${(this.politeness ?? "polite")}` : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  get itemAriaLabelledby(): string | undefined {
    return [this.title ? `${this.instanceId}-title` : null].filter(Boolean).join(" ") || undefined;
  }

  private _el = inject(ElementRef<HTMLElement>);
  private _portalOriginParent: Node | null = null;
  private _portalOriginNext: Node | null = null;

  ngOnInit(): void {
    if (typeof document === "undefined") return;
    const host = this._el.nativeElement as HTMLElement;
    this._portalOriginParent = host.parentNode;
    this._portalOriginNext = host.nextSibling;
    document.body.appendChild(host);
  }

  ngOnDestroy(): void {
    const host = this._el.nativeElement as HTMLElement;
    // Restore to the original position when it still exists so
    // Angular's own teardown removes it from the right place;
    // otherwise detach it directly.
    if (this._portalOriginParent && this._portalOriginParent.isConnected) {
      this._portalOriginParent.insertBefore(host, this._portalOriginNext);
    } else {
      host.parentNode?.removeChild(host);
    }
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
