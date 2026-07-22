// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useSelect } from "./useSelect";
import "./Select.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SelectSize = "sm" | "md" | "lg";

export type SelectOption = { value: string; label: string; disabled?: boolean };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "defaultOpen" | "defaultValue" | "disabled" | "empty" | "filterFn" | "multiple" | "onChange" | "onOpenChange" | "open" | "options" | "position" | "searchable" | "size" | "value"> {
  options?: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiple?: boolean;
  disabled?: boolean;
  size?: SelectSize;
  filterFn?: ((option: SelectOption, searchTerm: string) => boolean);
  searchable?: boolean;
  empty?: boolean;
  position?: string;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents
export interface SelectTriggerProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SelectTrigger({
  children,
  className,
  "data-testid": testId,
}: SelectTriggerProps) {
  const classNames = ["select__trigger", className].filter(Boolean).join(" ");
  return (
    <Stack as="button" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface SelectContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SelectContent({
  children,
  className,
  "data-testid": testId,
}: SelectContentProps) {
  const classNames = ["select__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface SelectOptionProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SelectOption({
  children,
  className,
  "data-testid": testId,
}: SelectOptionProps) {
  const classNames = ["select__option", className].filter(Boolean).join(" ");
  return (
    <Stack as="li" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Select({
  value: controlledValue,
  defaultValue = "beta",
  onChange,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  size = "md",
  position,
  disabled,
  className,
  "data-testid": testId,
  options = [{"value":"alpha","label":"Alpha"},{"value":"beta","label":"Beta"},{"value":"gamma","label":"Gamma"}],
  multiple,
  filterFn,
  searchable,
  empty,
  ...rest
}: SelectProps) {
  const { selection, setSelection, open, setOpen } = useSelect({
    value: controlledValue,
    defaultValue,
    onChange,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  const classNames = [
    "select",
    size && `select--${size}`,
    position && `select--${position}`,
    open && "select--open",
    disabled && "select--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <Stack layout="native" className={`${classNames}`} role="combobox" aria-haspopup="listbox" aria-controls="fsds-select-listbox" aria-expanded={open} aria-disabled={disabled} data-testid={testId} {...rest}>
    <button className="select__trigger" type="button" onClick={() => setOpen(!open)} disabled={disabled}>
      <span className="select__text" />
    </button>
    {open && (
      <div className="select__content" role="listbox" id="fsds-select-listbox">
        {searchable && (
          <div className="select__search">
            <input type="text" />
          </div>
        )}
        <div className="select__options">
          {(options ?? []).map((item, index) => (
            <div className="select__option" role="option" aria-selected={(Array.isArray(selection) ? selection.includes(item.value) : item.value === selection)} data-value={item.value} key={index}>
              <span>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        {empty && (
          <div className="select__emptyState" />
        )}
      </div>
    )}
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
