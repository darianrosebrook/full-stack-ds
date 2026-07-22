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
  static override styles = css`
    :host { display: contents; }
    .calendar {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-calendar-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-calendar-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-calendar-color-foreground-muted: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-calendar-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-calendar-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-calendar-color-day-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-calendar-color-day-selected-background: var(--fsds-semantic-color-background-accent, #d9292b);
      --fsds-calendar-color-day-selected-foreground: var(--fsds-semantic-color-foreground-inverse, #fafafa);
      --fsds-calendar-color-day-range-background: var(--fsds-semantic-color-background-accentSubtle, #fceaea);
      --fsds-calendar-color-today-ring: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-calendar-color-focus-ring: var(--fsds-semantic-focus-ring-color, #d9292b);
      --fsds-calendar-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-calendar-size-cell: var(--fsds-core-spacing-size-08, 32px);
      --fsds-calendar-size-nav: var(--fsds-core-spacing-size-07, 24px);
      --fsds-calendar-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-calendar-size-radius-day: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-calendar-typography-caption-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-calendar-typography-day-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-calendar-typography-weekday-size: var(--fsds-semantic-typography-caption-02, 12px);
      --fsds-calendar-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-calendar-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
      --fsds-calendar-elevation-default: var(--fsds-semantic-elevation-surface-overlay, 0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1));
    }

    .calendar {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: inline-block;
      box-sizing: border-box;
      background-color: var(--fsds-calendar-color-background-default);
      color: var(--fsds-calendar-color-foreground-primary);
      border-color: var(--fsds-calendar-color-border-default);
      border-width: 1px;
      border-style: solid;
      padding: var(--fsds-calendar-size-padding-default);
      border-radius: var(--fsds-calendar-size-radius-default);
      box-shadow: var(--fsds-calendar-elevation-default);
    }

    .calendar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: var(--fsds-calendar-size-padding-default);
    }

    .calendar__nav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-calendar-size-nav);
      height: var(--fsds-calendar-size-nav);
      background: transparent;
      border: none;
      border-radius: var(--fsds-calendar-size-radius-day);
      cursor: pointer;
      color: var(--fsds-calendar-color-foreground-muted);
      font-size: var(--fsds-calendar-typography-caption-size);
      line-height: 1;
    }

    .calendar__nav:hover {
      background-color: var(--fsds-calendar-color-day-hover);
      color: var(--fsds-calendar-color-foreground-primary);
    }

    .calendar__caption {
      font-size: var(--fsds-calendar-typography-caption-size);
      font-weight: 600;
      color: var(--fsds-calendar-color-foreground-primary);
      line-height: 1.2;
    }

    .calendar__grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      width: 100%;
      border-spacing: 0;
    }

    .calendar__grid > * {
      display: contents;
    }

    .calendar__grid > * > * {
      display: contents;
    }

    .calendar__cell {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      min-width: var(--fsds-calendar-size-cell);
      padding: 0;
    }

    .calendar__day {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background: transparent;
      border: none;
      cursor: pointer;
      color: inherit;
      font-size: var(--fsds-calendar-typography-day-size);
      border-radius: var(--fsds-calendar-size-radius-day);
    }

    .calendar__day:hover {
      background-color: var(--fsds-calendar-color-day-hover);
    }

    .calendar__day:focus-visible {
      outline-width: var(--fsds-calendar-focus-ring-width);
      outline-color: var(--fsds-calendar-color-focus-ring);
      outline-offset: var(--fsds-calendar-focus-ring-offset);
      outline-style: solid;
    }

    .calendar__cell[aria-selected="true"] .calendar__day {
      background-color: var(--fsds-calendar-color-day-selected-background);
      color: var(--fsds-calendar-color-day-selected-foreground);
      font-weight: 600;
    }

    .calendar__cell[aria-current="date"] .calendar__day {
      box-shadow: inset 0 0 0 1px var(--fsds-calendar-color-today-ring);
      font-weight: 600;
    }
  `;

  @property({ attribute: false }) value?: Date | Date[] | null;
  @property({ attribute: false }) defaultValue?: Date | Date[] | null;
  @property({ attribute: false }) onChange?: (value: Date | Date[] | null) => void;
  @property({ type: String }) mode?: CalendarMode = "single";
  @property({ type: Boolean }) disabled?: boolean;
  @property({ attribute: false }) minDate?: Date;
  @property({ attribute: false }) maxDate?: Date;
  @property({ type: String }) locale?: string = "en-US";
  @property({ type: Boolean }) shouldCloseOnSelect?: boolean = true;
  @property({ type: Number }) daysShown?: number = 42;

  private behavior = new CalendarBehavior(this, {
    value: () => this.value,
    defaultValue: this.defaultValue,
    onChange: (v) => this.onChange?.(v),
    shouldCloseOnSelect: this.shouldCloseOnSelect,
  });

  private computeClasses(): string {
    return [
      "calendar",
      (this.mode ?? "single") ? `calendar--${(this.mode ?? "single")}` : null,
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
        ${Array.from({ length: (this.daysShown ?? 42) }, (_, index) => html`
        <td class=${'calendar__cell'} role="gridcell" data-calendar-index=${index}>
          <button class=${'calendar__day'}></button>
        </td>
        `)}
      </tr>
    </tbody>
  </table>
</div>`;
  }
}

customElements.define('fsds-calendar', CalendarElement);

export class CalendarHeaderElement extends LitElement {
  static override styles = css`
    :host { display: contents; }
    .calendar {
      --fsds-box-model-padding: 0;
      --fsds-box-model-padding-block: 0;
      --fsds-box-model-padding-block-start: 0;
      --fsds-box-model-padding-block-end: 0;
      --fsds-box-model-padding-inline: 0;
      --fsds-box-model-padding-inline-start: 0;
      --fsds-box-model-padding-inline-end: 0;
      --fsds-box-model-gap: var(--fsds-semantic-structure-size-gap, 8px);
      --fsds-box-model-width: auto;
      --fsds-box-model-min-width: 0;
      --fsds-box-model-max-width: none;
      --fsds-box-model-height: auto;
      --fsds-box-model-min-height: 0;
      --fsds-box-model-max-height: none;
      --fsds-calendar-color-background-default: var(--fsds-semantic-color-background-primary, #ffffff);
      --fsds-calendar-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-calendar-color-foreground-muted: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-calendar-color-border-default: var(--fsds-semantic-color-border-subtle, #cecece);
      --fsds-calendar-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-calendar-color-day-hover: var(--fsds-semantic-interaction-background-hover, #efefef);
      --fsds-calendar-color-day-selected-background: var(--fsds-semantic-color-background-accent, #d9292b);
      --fsds-calendar-color-day-selected-foreground: var(--fsds-semantic-color-foreground-inverse, #fafafa);
      --fsds-calendar-color-day-range-background: var(--fsds-semantic-color-background-accentSubtle, #fceaea);
      --fsds-calendar-color-today-ring: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-calendar-color-focus-ring: var(--fsds-semantic-focus-ring-color, #d9292b);
      --fsds-calendar-size-padding-default: var(--fsds-core-spacing-size-06, 16px);
      --fsds-calendar-size-cell: var(--fsds-core-spacing-size-08, 32px);
      --fsds-calendar-size-nav: var(--fsds-core-spacing-size-07, 24px);
      --fsds-calendar-size-radius-default: var(--fsds-semantic-shape-control-radius-default, 8px);
      --fsds-calendar-size-radius-day: var(--fsds-semantic-shape-radius-small, 4px);
      --fsds-calendar-typography-caption-size: var(--fsds-semantic-typography-body-02, 16px);
      --fsds-calendar-typography-day-size: var(--fsds-semantic-typography-body-03, 14px);
      --fsds-calendar-typography-weekday-size: var(--fsds-semantic-typography-caption-02, 12px);
      --fsds-calendar-focus-ring-width: var(--fsds-semantic-focus-ring-width, 2px);
      --fsds-calendar-focus-ring-offset: var(--fsds-semantic-focus-ring-offset, 2px);
      --fsds-calendar-elevation-default: var(--fsds-semantic-elevation-surface-overlay, 0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1));
    }

    .calendar {
      padding-block-start: var(--fsds-box-model-padding-block-start);
      padding-block-end: var(--fsds-box-model-padding-block-end);
      padding-inline-start: var(--fsds-box-model-padding-inline-start);
      padding-inline-end: var(--fsds-box-model-padding-inline-end);
      gap: var(--fsds-box-model-gap);
      width: var(--fsds-box-model-width);
      min-width: var(--fsds-box-model-min-width);
      max-width: var(--fsds-box-model-max-width);
      height: var(--fsds-box-model-height);
      min-height: var(--fsds-box-model-min-height);
      max-height: var(--fsds-box-model-max-height);
      display: inline-block;
      box-sizing: border-box;
      background-color: var(--fsds-calendar-color-background-default);
      color: var(--fsds-calendar-color-foreground-primary);
      border-color: var(--fsds-calendar-color-border-default);
      border-width: 1px;
      border-style: solid;
      padding: var(--fsds-calendar-size-padding-default);
      border-radius: var(--fsds-calendar-size-radius-default);
      box-shadow: var(--fsds-calendar-elevation-default);
    }

    .calendar__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: var(--fsds-calendar-size-padding-default);
    }

    .calendar__nav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--fsds-calendar-size-nav);
      height: var(--fsds-calendar-size-nav);
      background: transparent;
      border: none;
      border-radius: var(--fsds-calendar-size-radius-day);
      cursor: pointer;
      color: var(--fsds-calendar-color-foreground-muted);
      font-size: var(--fsds-calendar-typography-caption-size);
      line-height: 1;
    }

    .calendar__nav:hover {
      background-color: var(--fsds-calendar-color-day-hover);
      color: var(--fsds-calendar-color-foreground-primary);
    }

    .calendar__caption {
      font-size: var(--fsds-calendar-typography-caption-size);
      font-weight: 600;
      color: var(--fsds-calendar-color-foreground-primary);
      line-height: 1.2;
    }

    .calendar__grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      width: 100%;
      border-spacing: 0;
    }

    .calendar__grid > * {
      display: contents;
    }

    .calendar__grid > * > * {
      display: contents;
    }

    .calendar__cell {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      min-width: var(--fsds-calendar-size-cell);
      padding: 0;
    }

    .calendar__day {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      background: transparent;
      border: none;
      cursor: pointer;
      color: inherit;
      font-size: var(--fsds-calendar-typography-day-size);
      border-radius: var(--fsds-calendar-size-radius-day);
    }

    .calendar__day:hover {
      background-color: var(--fsds-calendar-color-day-hover);
    }

    .calendar__day:focus-visible {
      outline-width: var(--fsds-calendar-focus-ring-width);
      outline-color: var(--fsds-calendar-color-focus-ring);
      outline-offset: var(--fsds-calendar-focus-ring-offset);
      outline-style: solid;
    }

    .calendar__cell[aria-selected="true"] .calendar__day {
      background-color: var(--fsds-calendar-color-day-selected-background);
      color: var(--fsds-calendar-color-day-selected-foreground);
      font-weight: 600;
    }

    .calendar__cell[aria-current="date"] .calendar__day {
      box-shadow: inset 0 0 0 1px var(--fsds-calendar-color-today-ring);
      font-weight: 600;
    }
  `;

  override render() {
    return html`<fsds-stack as="header" class="calendar__header"><slot></slot></fsds-stack>`;
  }
}

customElements.define('fsds-calendar-header', CalendarHeaderElement);
// @generated:end

// @custom:start trailing

// @custom:end