// @generated:start imports
import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertNoticeStatus = "info" | "success" | "warning" | "error";
export type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-alert-notice",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack role="alert" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertNoticeComponent {
  @Input() status?: AlertNoticeStatus;
  @Input() level?: AlertNoticeLevel;
  @Input() dismissible?: boolean;
  @Input() icon?: unknown;

  classes(): string {
    const parts: Array<string | null | undefined> = ["alert-notice"];
    if (this.status) parts.push(`alert-notice--${this.status}`);
    if (this.level) parts.push(`alert-notice--${this.level}`);
    return parts.filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-alert-notice-body",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertNoticeBodyComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["alert-notice__body", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-alert-notice-title",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="h3" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertNoticeTitleComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["alert-notice__title", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
