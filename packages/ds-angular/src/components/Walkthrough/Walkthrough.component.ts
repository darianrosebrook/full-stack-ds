// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgFor } from "@angular/common";
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
let nextInstanceId = 0;

@Component({
  selector: "fsds-walkthrough",
  standalone: true,
  imports: [NgClass, NgFor],
  template: `<div [ngClass]="classes()" role="status" [attr.aria-label]="(label ?? 'Feature tour')">
  <div [ngClass]="'walkthrough__content'" role="group" [attr.aria-labelledby]="instanceId + '-title'" [attr.aria-describedby]="instanceId + '-description'">
    <h3 [ngClass]="'walkthrough__title'" [attr.id]="instanceId + '-title'">
      <ng-content select="[slot=title]" />
    </h3>
    <p [ngClass]="'walkthrough__description'" [attr.id]="instanceId + '-description'">
      <ng-content select="[slot=description]" />
    </p>
  </div>
  <div [ngClass]="'walkthrough__controls'">
    <button [ngClass]="'walkthrough__skip'" type="button"></button>
    <button [ngClass]="'walkthrough__prev'" type="button"></button>
    <div [ngClass]="'walkthrough__dots'">
      <ng-container *ngFor="let item of ((steps ?? [{'anchor':'#step-1','title':'Welcome to the tour'},{'anchor':'#step-2','title':'Browse your dashboard'},{'anchor':'#step-3','title':'Configure preferences'}])); let index = index">
        <button [ngClass]="'walkthrough__dot'" type="button" [attr.aria-label]="item.title" [attr.data-step-index]="index"></button>
      </ng-container>
    </div>
    <span [ngClass]="'walkthrough__counter'"></span>
    <button [ngClass]="'walkthrough__next'" type="button"></button>
  </div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalkthroughComponent {
  @Input() steps?: WalkthroughStepSpec[] = [{"anchor":"#step-1","title":"Welcome to the tour"},{"anchor":"#step-2","title":"Browse your dashboard"},{"anchor":"#step-3","title":"Configure preferences"}];
  @Input() index?: number;
  @Input() defaultIndex?: number = 0;
  @Input() onStepChange?: (index: number) => void;
  @Input() onComplete?: () => void;
  @Input() onSkip?: () => void;
  @Input() label?: string = "Feature tour";
  @Input() storageKey?: string;
  @Input() autoStart?: boolean = false;
  @Input() closeOnOutsideClick?: boolean = false;
  @Input() placement?: WalkthroughPlacement = "auto";
  @Input() class?: string;

  protected readonly instanceId = `fsds-walkthrough-${nextInstanceId++}`;

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
      (this.placement ?? "auto") ? `walkthrough--${(this.placement ?? "auto")}` : null,
      this.class,
    ].filter(Boolean).join(" "),
  );
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
