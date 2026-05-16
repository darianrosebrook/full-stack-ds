// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { usePopover } from "./usePopover.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
export type PopoverTriggerStrategy = "click" | "hover";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-popover",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <button [ngClass]="'popover__trigger'" type="button" aria-haspopup="true" [attr.aria-expanded]="behavior.open()" aria-controls="popover-content">
    <ng-content />
  </button>
  <ng-container *ngIf="behavior.open()">
    <div [ngClass]="'popover__content'" id="popover-content">
      <ng-content />
    </div>
  </ng-container>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() placement?: PopoverPlacement = "auto";
  @Input() triggerStrategy?: PopoverTriggerStrategy = "click";
  @Input() offset?: number = 8;
  @Input() closeOnOutsideClick?: boolean;
  @Input() closeOnEscape?: boolean;
  @Input() anchor?: HTMLElement | null;
  @Input() class?: string;
  @Input() onOpenChange?: (value: boolean) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = usePopover({
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    closeOnEscape: this.closeOnEscape,
    closeOnOutsideClick: this.closeOnOutsideClick,
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "popover",
      this.placement ? `popover--${this.placement}` : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleOpenChange(event: Event): void {
    this.behavior.setOpen((event.target as HTMLInputElement).checked);
  }
}

@Component({
  selector: "fsds-popover-trigger",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="button" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverTriggerComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["popover__trigger", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-popover-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["popover__content", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
