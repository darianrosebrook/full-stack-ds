// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useWalkthrough } from "./useWalkthrough.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type WalkthroughStepSpec = { anchor: string; title: string; description?: string };
export type WalkthroughPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-walkthrough",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()" role="status" [attr.aria-label]="label">
  <div [ngClass]="'walkthrough__content'">
    <h3 [ngClass]="'walkthrough__title'">
      <ng-content select="[slot=title]" />
    </h3>
    <p [ngClass]="'walkthrough__description'">
      <ng-content select="[slot=description]" />
    </p>
  </div>
  <div [ngClass]="'walkthrough__controls'">
    <button [ngClass]="'walkthrough__skip'" type="button"></button>
    <button [ngClass]="'walkthrough__prev'" type="button"></button>
    <div [ngClass]="'walkthrough__dots'">
      <button [ngClass]="'walkthrough__dot'" type="button"></button>
    </div>
    <span [ngClass]="'walkthrough__counter'"></span>
    <button [ngClass]="'walkthrough__next'" type="button"></button>
  </div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalkthroughComponent {
  @Input() steps?: WalkthroughStepSpec[];
  @Input() index?: number;
  @Input() defaultIndex?: number = 0;
  @Input() label?: string = "Feature tour";
  @Input() storageKey?: string;
  @Input() autoStart?: boolean = false;
  @Input() closeOnOutsideClick?: boolean = false;
  @Input() placement?: WalkthroughPlacement = "auto";
  @Input() class?: string;
  @Input() onStepChange?: (value: number) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = useWalkthrough({
    index: () => this.index,
    defaultIndex: this.defaultIndex,
    onStepChange: (v) => this.onStepChange?.(v),
    closeOnOutsideClick: this.closeOnOutsideClick,
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "walkthrough",
      this.placement ? `walkthrough--${this.placement}` : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleStepChange(event: Event): void {
    this.behavior.setStep(Number((event.target as HTMLInputElement).value));
  }
}

@Component({
  selector: "fsds-walkthrough-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalkthroughContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["walkthrough__content", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-walkthrough-title",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="h3" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalkthroughTitleComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["walkthrough__title", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-walkthrough-description",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="p" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalkthroughDescriptionComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["walkthrough__description", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
