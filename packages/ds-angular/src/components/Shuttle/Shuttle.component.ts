// @generated:start imports
import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
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
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShuttleComponent {
  @Input() ariaLabel?: string;

  classes(): string {
    const parts: Array<string | null | undefined> = ["shuttle"];
    return parts.filter(Boolean).join(" ");
  }
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
