// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useCommand } from "./useCommand";
import "./Command.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface CommandProps extends Omit<HTMLAttributes<HTMLDivElement>, "aria-label" | "aria-labelledby" | "children" | "className" | "data-testid" | "defaultOpen" | "defaultSearch" | "emptyMessage" | "filter" | "label" | "onOpenChange" | "onSearchChange" | "open" | "placeholder" | "search" | "shouldFilter"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  label?: string;
  shouldFilter?: boolean;
  filter?: ((value: string, search: string) => number) | undefined;
  className?: string;
  "data-testid"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
// @generated:end

// @generated:start subcomponents
export interface CommandListProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function CommandList({
  children,
  className,
  "data-testid": testId,
}: CommandListProps) {
  const classNames = ["command__list", className].filter(Boolean).join(" ");
  return (
    <Stack as="ul" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface CommandGroupProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function CommandGroup({
  children,
  className,
  "data-testid": testId,
}: CommandGroupProps) {
  const classNames = ["command__group", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface CommandItemProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function CommandItem({
  children,
  className,
  "data-testid": testId,
}: CommandItemProps) {
  const classNames = ["command__item", className].filter(Boolean).join(" ");
  return (
    <Stack as="li" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Command({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  search: controlledSearch,
  defaultSearch,
  onSearchChange,
  className,
  "data-testid": testId,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  label = "Command palette",
  shouldFilter = true,
  filter,
  ...rest
}: CommandProps) {
  const { open, setOpen, search, setSearch } = useCommand({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    search: controlledSearch,
    defaultSearch,
    onSearchChange,
  });

  const classNames = [
    "command",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} role="dialog" data-testid={testId} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }} {...rest}>
    {open && (
      <div className="command__overlay" aria-hidden="true" />
    )}
    {open && (
      <div className="command__dialog" role="dialog" aria-modal="true" aria-label={label} aria-labelledby={ariaLabelledBy}>
        <div className="command__inputWrapper">
          <span className="command__searchIcon" aria-hidden="true" />
          <input className="command__input" type="search" role="combobox" aria-autocomplete="list" aria-controls="fsds-command-listbox" onChange={(e) => setSearch(e.target.value)} aria-expanded={open} placeholder={placeholder} value={search} />
        </div>
        <div className="command__list" role="listbox" id="fsds-command-listbox">
          <div className="command__empty" />
          <div className="command__group">
            <div className="command__groupHeading" />
            <div className="command__groupItems">
              <div className="command__item" role="option">
                <span className="command__itemIcon" />
                <div className="command__itemContent">
                  <span className="command__itemLabel" />
                  <span className="command__itemDescription" />
                </div>
              </div>
            </div>
          </div>
          <div className="command__separator" role="separator" aria-hidden="true" />
        </div>
      </div>
    )}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
