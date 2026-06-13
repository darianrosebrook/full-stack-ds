// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useCalendar } from "./useCalendar";
import "./Calendar.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CalendarMode = "single" | "range";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "daysShown" | "defaultValue" | "disabled" | "locale" | "maxDate" | "minDate" | "mode" | "onChange" | "shouldCloseOnSelect" | "value"> {
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
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents
export interface CalendarHeaderProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function CalendarHeader({
  children,
  className,
  "data-testid": testId,
}: CalendarHeaderProps) {
  const classNames = ["calendar__header", className].filter(Boolean).join(" ");
  return (
    <Stack as="header" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Calendar({
  value: controlledValue,
  defaultValue,
  onChange,
  mode = "single",
  disabled,
  className,
  "data-testid": testId,
  minDate,
  maxDate,
  locale = "en-US",
  shouldCloseOnSelect = true,
  daysShown = 42,
  ...rest
}: CalendarProps) {
  const { value, setValue } = useCalendar({
    value: controlledValue,
    defaultValue,
    onChange,
    shouldCloseOnSelect,
  });

  const classNames = [
    "calendar",
    mode && `calendar--${mode}`,
    disabled && "calendar--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} role="application" data-testid={testId} {...rest}>
    <div className="calendar__header">
      <button className="calendar__nav" aria-label="Previous month" />
      <span className="calendar__caption" />
      <button className="calendar__nav" aria-label="Next month" />
    </div>
    <table className="calendar__grid" role="grid" aria-label="Calendar">
      <tbody>
        <tr>
          {Array.from({ length: daysShown }, (_, index) => (
            <td className="calendar__cell" role="gridcell" data-calendar-index={index} key={index}>
              <button className="calendar__day" />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
