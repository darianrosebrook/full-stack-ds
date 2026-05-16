// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { useTooltip } from "./useTooltip.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
export type TooltipTrigger = "hover" | "focus" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-tooltip",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<ng-container *ngIf="behavior.open()">
  <div [ngClass]="classes()" role="tooltip">
    <ng-content />
  </div>
</ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  @Input() content!: unknown;
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() placement?: TooltipPlacement;
  @Input() trigger?: TooltipTrigger = "hover";
  @Input() delay?: number;
  @Input() disabled?: boolean;
  @Input() closeOnEscape?: boolean = true;
  @Input() closeOnBlur?: boolean = true;
  @Input() class?: string;
  @Input() onOpenChange?: (value: boolean) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = useTooltip({
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    closeOnEscape: this.closeOnEscape,
    closeOnBlur: this.closeOnBlur,
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "tooltip",
      this.placement ? `tooltip--${this.placement}` : null,
      this.disabled ? "tooltip--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleOpenChange(event: Event): void {
    this.behavior.setOpen((event.target as HTMLInputElement).checked);
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
