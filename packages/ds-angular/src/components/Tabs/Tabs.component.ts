// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useTabs } from "./useTabs.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-tabs",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <div [ngClass]="'tabs__list'" role="tablist">
    <button [ngClass]="'tabs__tab'" role="tab" type="button" [attr.aria-selected]="behavior.activeTab()"></button>
    <span [ngClass]="'tabs__indicator'" aria-hidden="true"></span>
  </div>
  <div [ngClass]="'tabs__panel'">
    <ng-content />
  </div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  @Input() value?: string;
  @Input() defaultValue?: string;
  @Input() orientation?: TabsOrientation = "horizontal";
  @Input() activationMode?: TabsActivationMode = "automatic";
  @Input() loop?: boolean = true;
  @Input() unmountInactive?: boolean;
  @Input() idBase?: string;
  @Input() class?: string;
  @Input() onValueChange?: (value: string) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = useTabs({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "tabs",
      this.orientation ? `tabs--${this.orientation}` : null,
      this.activationMode ? `tabs--${this.activationMode}` : null,
      this.class,
    ].filter(Boolean).join(" "),
  );

  protected handleActiveTabChange(event: Event): void {
    this.behavior.setActiveTab((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: "fsds-tabs-list",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="ul" variant="horizontal" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsListComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["tabs__list", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-tabs-tab",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsTabComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["tabs__tab", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-tabs-panel",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPanelComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["tabs__panel", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
