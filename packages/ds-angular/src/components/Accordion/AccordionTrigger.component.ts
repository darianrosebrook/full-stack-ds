// @generated:start imports
import { Component, Input, computed, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { useAccordionContext } from "./useAccordion.js";
import { IconComponent } from "../Icon/Icon.component.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-accordion-trigger",
  standalone: true,
  imports: [NgClass, IconComponent],
  template: `<h3 class="accordion__header"><button
  type="button"
  [ngClass]="classes()"
  data-disclosure-trigger
  [attr.data-value]="value"
  [attr.id]="ctx.idBase + '-trigger-' + value"
  [attr.aria-controls]="ctx.idBase + '-content-' + value"
  [attr.aria-expanded]="isOpen()"
  [disabled]="ctx.disabled()"
  (click)="ctx.toggleItem(value)"
><ng-content /><fsds-icon [ngClass]="'accordion__chevron'" name="chevron-down" size="sm"></fsds-icon></button></h3>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionTriggerComponent {
  @Input({ required: true }) value!: string;
  @Input() class?: string;
  @Input() dataTestid?: string;

  protected ctx = useAccordionContext();

  isOpen = computed(() => this.ctx.isItemOpen(this.value));

  classes = computed(() =>
    [
      "accordion__trigger",
      this.isOpen() && "accordion__trigger--open",
      this.class,
    ].filter(Boolean).join(" "),
  );
}
// @generated:end

// @custom:start trailing

// @custom:end