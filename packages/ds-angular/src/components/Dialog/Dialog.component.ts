// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useDialog } from "./useDialog.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-dialog",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <ng-container *ngIf="behavior.openness()">
    <div [ngClass]="'dialog__backdrop'" aria-hidden="true" role="presentation" (click)="closeOnBackdropClick !== false && behavior.setOpenness(false)"></div>
  </ng-container>
  <ng-container *ngIf="behavior.openness()">
    <div [ngClass]="'dialog__modal'" role="dialog" aria-modal="true" aria-labelledby="dialog-title-id" aria-describedby="dialog-body-id">
      <div [ngClass]="'dialog__header'">
        <h2 [ngClass]="'dialog__title'">
          <ng-content select="[slot=title]" />
        </h2>
        <button [ngClass]="'dialog__closeButton'" type="button" aria-label="Close dialog" (click)="behavior.setOpenness(!behavior.openness())"></button>
      </div>
      <div [ngClass]="'dialog__body'">
        <ng-content />
      </div>
      <div [ngClass]="'dialog__footer'"></div>
    </div>
  </ng-container>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent implements OnInit, OnDestroy {
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() onOpenChange?: (open: boolean) => void;
  @Input() modal?: boolean = true;
  @Input() size?: DialogSize = "md";
  @Input() dismissible?: boolean = true;
  @Input() closeOnEscape?: boolean = true;
  @Input() closeOnBackdropClick?: boolean = true;
  @Input() initialFocus?: string;
  @Input() returnFocus?: string;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useDialog({
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    closeOnEscape: this.closeOnEscape,
    closeOnBackdropClick: this.closeOnBackdropClick,
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "dialog",
      (this.size ?? "md") ? `dialog--${(this.size ?? "md")}` : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

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
  selector: "fsds-dialog-header",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="header" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogHeaderComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["dialog__header", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-dialog-title",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="h3" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogTitleComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["dialog__title", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-dialog-body",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogBodyComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["dialog__body", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-dialog-footer",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="footer" variant="horizontal" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFooterComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["dialog__footer", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
