// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useShowMore } from "./useShowMore.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-show-more",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()">
  <div [ngClass]="'show-more__content'">
    <ng-content />
  </div>
  <button [ngClass]="'show-more__trigger'" type="button" (click)="handleExpandedChange($event)" [attr.aria-expanded]="behavior.expanded()">
    {{ showMoreLabel }}
  </button>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowMoreComponent {
  @Input() expanded?: boolean;
  @Input() defaultExpanded?: boolean;
  @Input() onExpandedChange?: (expanded: boolean) => void;
  @Input() maxLines?: number = 3;
  @Input() showMoreLabel?: string = "Show more";
  @Input() showLessLabel?: string = "Show less";
  @Input() class?: string;

  private destroyRef = inject(DestroyRef);
  protected behavior = useShowMore({
    expanded: () => this.expanded,
    defaultExpanded: this.defaultExpanded,
    onExpandedChange: (v) => this.onExpandedChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "show-more",
      this.behavior.expanded() ? "show-more--expanded" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleExpandedChange(event: Event): void {
    this.behavior.setExpanded((event.target as HTMLInputElement).checked);
  }
}

@Component({
  selector: "fsds-show-more-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowMoreContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["show-more__content", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-show-more-trigger",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="button" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowMoreTriggerComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["show-more__trigger", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
