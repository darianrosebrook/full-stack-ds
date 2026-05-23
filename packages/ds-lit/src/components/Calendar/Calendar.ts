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
      --fsds-calendar-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-calendar-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-calendar-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-calendar-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-calendar-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-calendar-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-calendar-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-calendar-elevation-default: var(--fsds-semantic-elevation-default, none);
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
      background-color: var(--fsds-calendar-color-background-default);
      color: var(--fsds-calendar-color-foreground-primary);
      border-color: var(--fsds-calendar-color-border-default);
      border-width: 1px;
      border-style: solid;
      padding: var(--fsds-calendar-size-padding-default);
      border-radius: var(--fsds-calendar-size-radius-default);
      display: block;
      box-sizing: border-box;
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
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--fsds-calendar-color-foreground-primary);
    }
    
    .calendar__caption {
      font-weight: 600;
      color: var(--fsds-calendar-color-foreground-primary);
    }
    
    .calendar__grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      width: 100%;
      border-collapse: collapse;
    }
    
    .calendar__cell {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border-radius: var(--fsds-calendar-size-radius-default);
      padding: 0;
    }
    
    .calendar__cell:hover {
      background-color: var(--fsds-calendar-color-background-default);
    }
    
    .calendar__cell[aria-selected="true"] {
      background-color: var(--fsds-calendar-color-border-accent);
      color: #ffffff;
    }
    
    .calendar__day {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      color: inherit;
      border-radius: var(--fsds-calendar-size-radius-default);
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
      --fsds-calendar-color-background-default: var(--fsds-semantic-color-background-secondary, #efefef);
      --fsds-calendar-color-foreground-primary: var(--fsds-semantic-color-foreground-primary, #141414);
      --fsds-calendar-color-foreground-secondary: var(--fsds-semantic-color-foreground-secondary, #555555);
      --fsds-calendar-color-border-default: var(--fsds-semantic-color-border-light, #fceaea);
      --fsds-calendar-color-border-accent: var(--fsds-semantic-color-border-accent, #d9292b);
      --fsds-calendar-size-padding-default: var(--fsds-core-spacing-size-07, 24px);
      --fsds-calendar-size-radius-default: var(--fsds-core-shape-radius-medium, 8px);
      --fsds-calendar-elevation-default: var(--fsds-semantic-elevation-default, none);
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
      background-color: var(--fsds-calendar-color-background-default);
      color: var(--fsds-calendar-color-foreground-primary);
      border-color: var(--fsds-calendar-color-border-default);
      border-width: 1px;
      border-style: solid;
      padding: var(--fsds-calendar-size-padding-default);
      border-radius: var(--fsds-calendar-size-radius-default);
      display: block;
      box-sizing: border-box;
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
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--fsds-calendar-color-foreground-primary);
    }
    
    .calendar__caption {
      font-weight: 600;
      color: var(--fsds-calendar-color-foreground-primary);
    }
    
    .calendar__grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
      width: 100%;
      border-collapse: collapse;
    }
    
    .calendar__cell {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border-radius: var(--fsds-calendar-size-radius-default);
      padding: 0;
    }
    
    .calendar__cell:hover {
      background-color: var(--fsds-calendar-color-background-default);
    }
    
    .calendar__cell[aria-selected="true"] {
      background-color: var(--fsds-calendar-color-border-accent);
      color: #ffffff;
    }
    
    .calendar__day {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: transparent;
      border: none;
      cursor: pointer;
      color: inherit;
      border-radius: var(--fsds-calendar-size-radius-default);
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