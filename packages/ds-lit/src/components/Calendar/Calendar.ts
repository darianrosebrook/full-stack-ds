// @generated:start imports
import { LitElement, html, css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { CalendarBehavior } from './CalendarBehavior.js';
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CalendarMode = "single" | "range";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start component
export class CalendarElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  @property({ attribute: false }) value?: Date | Date[] | null;
  @property({ attribute: false }) defaultValue?: Date | Date[] | null;
  @property({ attribute: false }) mode?: CalendarMode = "single";
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: false }) minDate?: Date;
  @property({ attribute: false }) maxDate?: Date;
  @property({ type: String }) locale?: string = "en-US";
  @property({ type: Boolean }) shouldCloseOnSelect?: boolean = true;
  @property({ attribute: false }) onChange?: (value: Date | Date[] | null) => void;

  private behavior = new CalendarBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    shouldCloseOnSelect: this.shouldCloseOnSelect,
  });

  private computeClasses(): string {
    return [
      "calendar",
      this.mode ? `calendar--${this.mode}` : null,
      this.disabled ? "calendar--disabled" : null,
    ].filter(Boolean).join(" ");
  }

  override render() {
    return html`<div class="${this.computeClasses()}" role="application">
  <div class=${'calendar__header'}>
    <button class=${'calendar__nav'} aria-label="Previous month"></button>
    <span class=${'calendar__caption'}></span>
    <button class=${'calendar__nav'} aria-label="Next month"></button>
  </div>
  <table class=${'calendar__grid'} role="grid" aria-label="Calendar">
    <tbody>
      <tr>
        <td class=${'calendar__cell'} role="gridcell">
          <button class=${'calendar__day'}></button>
        </td>
      </tr>
    </tbody>
  </table>
</div>`;
  }
}

customElements.define('fsds-calendar', CalendarElement);

export class CalendarHeaderElement extends LitElement {
  static override styles = css`:host { display: contents; }`;

  override render() {
    return html`<fsds-stack as="header" class="calendar__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-calendar-header', CalendarHeaderElement);
// @generated:end

// @custom:start trailing

// @custom:end