// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass, NgIf } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useAccordion } from "./useAccordion.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AccordionType = "single" | "multiple";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-accordion",
  standalone: true,
  imports: [NgClass, NgIf],
  template: `<div [ngClass]="classes()">
  <div [ngClass]="'accordion__item'">
    <h3 [ngClass]="'accordion__header'">
      <button [ngClass]="'accordion__trigger'" type="button" [attr.aria-expanded]="behavior.openness()">
        <ng-content />
        <span [ngClass]="'accordion__chevron'"></span>
      </button>
    </h3>
    <div [ngClass]="'accordion__content'">
      <div [ngClass]="'accordion__contentInner'">
        <ng-content />
      </div>
    </div>
  </div>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent {
  @Input() type?: AccordionType = "single";
  @Input() value?: string | string[];
  @Input() defaultValue?: string | string[];
  @Input() collapsible?: boolean = false;
  @Input() disabled?: boolean;
  @Input() class?: string;
  @Input() onValueChange?: (value: string | string[]) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = useAccordion({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onValueChange: (v) => this.onValueChange?.(v),
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "accordion",
      this.type ? `accordion--${this.type}` : null,
      this.disabled ? "accordion--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );
}

@Component({
  selector: "fsds-accordion-item",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="li" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionItemComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["accordion__item", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-accordion-trigger",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="button" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionTriggerComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["accordion__trigger", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-accordion-header",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="header" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionHeaderComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["accordion__header", this.class].filter(Boolean).join(" ");
  }
}

@Component({
  selector: "fsds-accordion-content",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionContentComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["accordion__content", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
