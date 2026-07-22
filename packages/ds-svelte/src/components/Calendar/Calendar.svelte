<script lang="ts">
// @generated:start imports
import { useCalendar } from "./useCalendar.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
type CalendarMode = "single" | "range";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
interface Props {
  value?: Date | Date[] | null;
  defaultValue?: Date | Date[] | null;
  onChange?: (value: Date | Date[] | null) => void;
  mode?: CalendarMode;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
  shouldCloseOnSelect?: boolean;
  days?: Date[];
  class?: string;
}

let { value, defaultValue, onChange, mode = "single", disabled, minDate, maxDate, locale = "en-US", shouldCloseOnSelect = true, days, class: className }: Props = $props();
// @generated:end

// @generated:start hook
const behavior = useCalendar({
  value: () => value,
  defaultValue: () => defaultValue,
  onChange: () => onChange,
  shouldCloseOnSelect: () => shouldCloseOnSelect,
});
// @generated:end

// @generated:start classes
const classes = $derived(
  [
    "calendar",
    mode ? `calendar--${mode}` : null,
    disabled ? "calendar--disabled" : null,
    className,
  ].filter(Boolean).join(" ")
);
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<div class={classes} role="application">
  <div class={'calendar__header'}>
    <button class={'calendar__nav'} aria-label="Previous month"></button>
    <span class={'calendar__caption'}></span>
    <button class={'calendar__nav'} aria-label="Next month"></button>
  </div>
  <table class={'calendar__grid'} role="grid" aria-label="Calendar">
    <tbody>
      <tr>
        {#each (days ?? []) as item, index (index)}
        <td class={'calendar__cell'} role="gridcell" data-calendar-index={index}>
          <button class={'calendar__day'} onclick={() => behavior.setValue(item)}></button>
        </td>
        {/each}
      </tr>
    </tbody>
  </table>
</div>
