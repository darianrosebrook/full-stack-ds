// @generated:start imports
import { Component, Input, computed, DestroyRef, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgClass } from "@angular/common";
import { StackComponent } from "../../primitives/index.js";
import { useCalendar } from "./useCalendar.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CalendarMode = "single" | "range";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
@Component({
  selector: "fsds-calendar",
  standalone: true,
  imports: [NgClass],
  template: `<div [ngClass]="classes()" role="application">
  <div [ngClass]="'calendar__header'">
    <button [ngClass]="'calendar__nav'" aria-label="Previous month"></button>
    <span [ngClass]="'calendar__caption'"></span>
    <button [ngClass]="'calendar__nav'" aria-label="Next month"></button>
  </div>
  <table [ngClass]="'calendar__grid'" role="grid" aria-label="Calendar">
    <tbody>
      <tr>
        <td [ngClass]="'calendar__cell'" role="gridcell">
          <button [ngClass]="'calendar__day'"></button>
        </td>
      </tr>
    </tbody>
  </table>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent {
  @Input() value?: Date | Date[] | null;
  @Input() defaultValue?: Date | Date[] | null;
  @Input() mode?: CalendarMode = "single";
  @Input() disabled?: boolean;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() locale?: string = "en-US";
  @Input() shouldCloseOnSelect?: boolean = true;
  @Input() class?: string;
  @Input() onChange?: (value: Date | Date[] | null) => void;

  private destroyRef = inject(DestroyRef);
  protected behavior = useCalendar({
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    shouldCloseOnSelect: this.shouldCloseOnSelect,
    destroyRef: this.destroyRef,
  });

  classes = computed(() =>
    [
      "calendar",
      this.mode ? `calendar--${this.mode}` : null,
      this.disabled ? "calendar--disabled" : null,
      this.class,
    ].filter(Boolean).join(" "),
  );
}

@Component({
  selector: "fsds-calendar-header",
  standalone: true,
  imports: [NgClass, StackComponent],
  template: `<fsds-stack as="header" [ngClass]="classes()"><ng-content /></fsds-stack>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarHeaderComponent {
  @Input() class?: string;
  @Input() dataTestid?: string;

  classes(): string {
    return ["calendar__header", this.class].filter(Boolean).join(" ");
  }
}
// @generated:end

// @custom:start trailing

// @custom:end
