// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
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
  selector: "fsds-breadcrumbs",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<nav [ngClass]="classes()" [attr.aria-label]="ariaLabel">
  <ol [ngClass]="'breadcrumbs__list'">
    <ng-content />
  </ol>
</nav>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  @Input() ariaLabel?: string = "Breadcrumb";
  @Input() separator?: string;
  @Input() class?: string;

  classes(): string {
    return [
      "breadcrumbs",
      this.class,
    ].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-breadcrumbs-list",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="ul" variant="horizontal" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsListComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["breadcrumbs__list", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
