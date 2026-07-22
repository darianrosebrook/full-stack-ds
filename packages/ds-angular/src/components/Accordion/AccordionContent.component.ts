// @generated:start imports
import { Component, Input, computed, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { useAccordionContext } from "./useAccordion.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-accordion-content",
  standalone: true,
  imports: [NgClass],
  template: `<div
  role="region"
  [ngClass]="classes()"
  [attr.id]="ctx.idBase + '-content-' + value"
  [attr.aria-labelledby]="ctx.idBase + '-trigger-' + value"
  [attr.hidden]="!isOpen() ? true : null"
><div class="accordion__contentInner"><ng-content /></div></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionContentComponent {
  @Input({ required: true }) value!: string;
  @Input() class?: string;
  @Input() dataTestid?: string;

  protected ctx = useAccordionContext();

  isOpen = computed(() => this.ctx.isItemOpen(this.value));

  classes = computed(() =>
    ["accordion__content", this.class].filter(Boolean).join(" "),
  );
}
// @generated:end

// @custom:start trailing

// @custom:end