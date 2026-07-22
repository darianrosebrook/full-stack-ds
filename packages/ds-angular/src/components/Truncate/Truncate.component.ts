// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useTruncate } from "./useTruncate.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-truncate",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <span [ngClass]="'truncate__content'" [style.--fsds-truncate-content-lines]="lines">
    <ng-content />
  </span>
  <ng-container *ngIf="expandable">
    <button [ngClass]="'truncate__toggle'" type="button" (click)="behavior.setExpanded(!behavior.expanded())" [attr.aria-expanded]="behavior.expanded()">
      {{ (behavior.expanded() ? (collapseText ?? 'Show less') : (expandText ?? 'Show more')) }}
    </button>
  </ng-container>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TruncateComponent {
  @Input() lines?: number;
  @Input() expandable?: boolean;
  @Input() expanded?: boolean;
  @Input() defaultExpanded?: boolean;
  @Input() onExpandedChange?: (expanded: boolean) => void;
  @Input() expandText?: string = "Show more";
  @Input() collapseText?: string = "Show less";
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useTruncate({
    expanded: () => this.expanded,
    defaultExpanded: this.defaultExpanded,
    onExpandedChange: (v) => this.onExpandedChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "truncate",
      this.behavior.expanded() ? "truncate--expanded" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );
}

@Component({
  selector: "fsds-truncate-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TruncateContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["truncate__content", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
