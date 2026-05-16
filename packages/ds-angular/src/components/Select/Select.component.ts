// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useSelect } from "./useSelect.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SelectOption = { value: string; label: string; disabled?: boolean };
export type SelectSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-select",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()" role="combobox" aria-haspopup="listbox" [attr.aria-expanded]="behavior.open()" [attr.aria-disabled]="disabled">
  <button [ngClass]="'select__trigger'" type="button" [disabled]="disabled">
    <span [ngClass]="'select__text'"></span>
  </button>
  <ng-container *ngIf="behavior.open()">
    <div [ngClass]="'select__content'" role="listbox">
      <ng-container *ngIf="searchable">
        <div [ngClass]="'select__search'">
          <input type="text" />
        </div>
      </ng-container>
      <div [ngClass]="'select__options'">
        <div [ngClass]="'select__option'" role="option"></div>
      </div>
      <ng-container *ngIf="empty">
        <div [ngClass]="'select__emptyState'"></div>
      </ng-container>
    </div>
  </ng-container>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent {
  @Input() options!: SelectOption[];
  @Input() value?: string | string[];
  @Input() defaultValue?: string | string[];
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() multiple?: boolean;
  @Input() disabled?: boolean;
  @Input() size?: SelectSize = "md";
  @Input() filterFn?: ((option: SelectOption, searchTerm: string) => boolean);
  @Input() searchable?: boolean;
  @Input() empty?: boolean;
  @Input() class?: string;
  @Input() onChange?: (value: string | string[]) => void;
  @Input() onOpenChange?: (value: boolean) => void;
  @Input() position?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useSelect({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "select",
      this.size ? `select--${this.size}` : null,
      this.position ? `select--${this.position}` : null,
      this.behavior.open() ? "select--open" : null,
      this.disabled ? "select--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleOpenChange(event: Event): void {
    this.behavior.setOpen((event.target as HTMLInputElement).checked);
  }
}

@Component({
  selector: "fsds-select-trigger",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="button" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectTriggerComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["select__trigger", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-select-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["select__content", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-select-option",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="li" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["select__option", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
