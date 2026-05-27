<script setup lang="ts">
// @generated:start imports
import { computed } from "vue";
import { useCalendar } from "./useCalendar.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CalendarMode = "single" | "range";
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
  daysShown?: number;
  class?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start defineProps
const props = withDefaults(defineProps<Props>(), {
  mode: "single",
  locale: "en-US",
  shouldCloseOnSelect: true,
  daysShown: 42,
});
// @generated:end

// @generated:start hook
const behavior = useCalendar({
  value: () => props.value,
  defaultValue: props.defaultValue,
  onChange: props.onChange,
  shouldCloseOnSelect: props.shouldCloseOnSelect,
});
// @generated:end

// @generated:start classes
const classNames = computed(() => [
  "calendar",
  props.mode ? `calendar--${props.mode}` : null,
  props.disabled ? "calendar--disabled" : null,
  props.class,
].filter(Boolean).join(" "));
// @generated:end

// @custom:start trailing

// @custom:end
</script>

<template>
  <div :class="classNames" role="application" :data-testid="props['data-testid']">
    <div :class="'calendar__header'">
      <button :class="'calendar__nav'" aria-label="Previous month"></button>
      <span :class="'calendar__caption'"></span>
      <button :class="'calendar__nav'" aria-label="Next month"></button>
    </div>
    <table :class="'calendar__grid'" role="grid" aria-label="Calendar">
      <tbody>
        <tr>
          <td v-for="(_, index) in Array(props.daysShown)" :key="index" :class="'calendar__cell'" role="gridcell" :data-calendar-index="index">
            <button :class="'calendar__day'"></button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
