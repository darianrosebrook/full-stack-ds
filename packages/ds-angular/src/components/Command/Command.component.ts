// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useCommand } from "./useCommand.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-command",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <ng-container *ngIf="behavior.open()">
    <div [ngClass]="'command__overlay'" aria-hidden="true" role="presentation" (click)="behavior.setOpen(false)"></div>
  </ng-container>
  <ng-container *ngIf="behavior.open()">
    <div [ngClass]="'command__dialog'" role="dialog" aria-modal="true" [attr.aria-label]="label">
      <div [ngClass]="'command__inputWrapper'">
        <span [ngClass]="'command__searchIcon'" aria-hidden="true"></span>
        <input [ngClass]="'command__input'" type="search" role="combobox" aria-autocomplete="list" aria-controls="fsds-command-listbox" (change)="handleSearchChange($event)" [attr.aria-expanded]="behavior.open()" [placeholder]="placeholder" [value]="behavior.search()" />
      </div>
      <div [ngClass]="'command__list'" role="listbox" id="fsds-command-listbox">
        <div [ngClass]="'command__empty'"></div>
        <div [ngClass]="'command__group'">
          <div [ngClass]="'command__groupHeading'"></div>
          <div [ngClass]="'command__groupItems'">
            <div [ngClass]="'command__item'" role="option">
              <span [ngClass]="'command__itemIcon'"></span>
              <div [ngClass]="'command__itemContent'">
                <span [ngClass]="'command__itemLabel'"></span>
                <span [ngClass]="'command__itemDescription'"></span>
              </div>
            </div>
          </div>
        </div>
        <div [ngClass]="'command__separator'" role="separator" aria-hidden="true"></div>
      </div>
    </div>
  </ng-container>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandComponent {
  @Input() open?: boolean;
  @Input() defaultOpen?: boolean;
  @Input() onOpenChange?: (open: boolean) => void;
  @Input() search?: string;
  @Input() defaultSearch?: string;
  @Input() onSearchChange?: (value: string) => void;
  @Input() placeholder?: string = "Search...";
  @Input() emptyMessage?: string = "No results found.";
  @Input() label?: string = "Command palette";
  @Input() shouldFilter?: boolean = true;
  @Input() filter?: ((value: string, search: string) => number) | undefined;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useCommand({
    open: () => this.open,
    defaultOpen: this.defaultOpen,
    onOpenChange: (v) => this.onOpenChange?.(v),
    search: () => this.search,
    defaultSearch: this.defaultSearch,
    onSearchChange: (v) => this.onSearchChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "command",
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleSearchChange(event: Event): void {
    this.behavior.setSearch((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: "fsds-command-list",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="ul" variant="horizontal" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandListComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["command__list", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-command-group",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandGroupComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["command__group", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-command-item",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="li" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandItemComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["command__item", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
