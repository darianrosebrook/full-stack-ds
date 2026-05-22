// @generated:start imports
import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertIntent = "info" | "success" | "warning" | "danger";
export type AlertLevel = "inline" | "section" | "page";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-alert",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack role="alert" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  @Input() intent?: AlertIntent;
  @Input() level?: AlertLevel;
  @Input() dismissible?: boolean;
  @Input() dismissLabel?: string = "Dismiss";
  @Input() icon?: unknown;

  classes(): string {
    const parts: Array<string | null | undefined> = ["alert"];
    if (this.intent) parts.push(`alert--${this.intent}`);
    if (this.level) parts.push(`alert--${this.level}`);
    return parts.filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-alert-body",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertBodyComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["alert__body", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-alert-title",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="h3" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertTitleComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["alert__title", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
