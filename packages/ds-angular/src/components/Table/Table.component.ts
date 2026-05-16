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
  selector: "fsds-table",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent {
  @Input() responsive?: boolean;
  @Input() ariaLabel?: string;

  classes(): string {
    const parts: Array<string | null | undefined> = ["table"];
    return parts.filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-table-body",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableBodyComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["table__body", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-table-footer",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="footer" variant="horizontal" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableFooterComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["table__footer", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-table-header",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="header" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableHeaderComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["table__header", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
