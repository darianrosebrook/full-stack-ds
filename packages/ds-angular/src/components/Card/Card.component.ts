// @generated:start imports
import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CardStatus = "completed" | "in-progress" | "planned" | "deprecated" | "category" | "complexity";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-card",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  @Input() interactive?: boolean;
  @Input() status?: CardStatus;

  classes(): string {
    const parts: Array<string | null | undefined> = ["card"];
    if (this.status) parts.push(`card--${this.status}`);
    return parts.filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-card-header",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="header" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeaderComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["card__header", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-card-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["card__content", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-card-footer",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="footer" variant="horizontal" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardFooterComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["card__footer", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-card-description",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="p" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDescriptionComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["card__description", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
