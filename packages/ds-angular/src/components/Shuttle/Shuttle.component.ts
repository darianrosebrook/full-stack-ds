// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgFor } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useShuttle } from "./useShuttle.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-shuttle",
  standalone: true,
  imports: [NgClass, NgFor],
  template: `<ul [ngClass]="classes()" role="listbox" [attr.aria-label]="ariaLabel">
  <ng-container *ngFor="let item of (behavior.selection() ?? []); let index = index">
    <li [ngClass]="'shuttle__item'" role="option">
      <span>
        {{ item }}
      </span>
    </li>
  </ng-container>
</ul>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShuttleComponent {
  @Input() ariaLabel?: string;
  @Input() value?: string[];
  @Input() defaultValue?: string[] = ["alpha","beta","gamma"];
  @Input() onValueChange?: (value: string[]) => void;
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useShuttle({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "shuttle",
      this.class,
    ].filter(Boolean).join(" "),
  );
}

@Component({
  selector: "fsds-shuttle-item",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="li" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShuttleItemComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["shuttle__item", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
