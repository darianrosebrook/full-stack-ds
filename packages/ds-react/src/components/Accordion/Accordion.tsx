// @generated:start imports
import { type HTMLAttributes, type KeyboardEvent, type ReactNode, useCallback, useId, useRef } from "react";
import { useAccordion } from "./useAccordion";
import { createCompoundContext } from "../../primitives/hooks";
import "./Accordion.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AccordionType = "single" | "multiple";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "collapsible" | "data-testid" | "defaultValue" | "disabled" | "onValueChange" | "type" | "value"> {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface AccordionContextValue {
  openness: string | string[];
  toggleItem: (value: string) => void;
  isItemOpen: (value: string) => boolean;
  type: "single" | "multiple";
  collapsible: boolean;
  disabled: boolean;
  idBase: string;
}

const [AccordionContextProvider, useAccordionContext] = createCompoundContext<AccordionContextValue>("Accordion");
export { useAccordionContext };

export interface AccordionItemProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AccordionItem({
  children,
  className,
  "data-testid": testId,
}: AccordionItemProps) {
  const classNames = ["accordion__item", className].filter(Boolean).join(" ");
  return (
    <div className={classNames} data-testid={testId}>
      {children}
    </div>
  );
}

export interface AccordionTriggerProps {
  value: string;
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AccordionTrigger({
  value,
  children,
  className,
  "data-testid": testId,
}: AccordionTriggerProps) {
  const ctx = useAccordionContext();
  const isOpen = ctx.isItemOpen(value);
  const classNames = [
    "accordion__trigger",
    isOpen && "accordion__trigger--open",
    className,
  ].filter(Boolean).join(" ");

  return (
    <h3 className="accordion__header">
      <button
        type="button"
        className={classNames}
        data-disclosure-trigger=""
        data-value={value}
        id={`${ctx.idBase}-trigger-${value}`}
        aria-controls={`${ctx.idBase}-content-${value}`}
        aria-expanded={isOpen}
        disabled={ctx.disabled}
        data-testid={testId}
        onClick={() => ctx.toggleItem(value)}
      >
        {children}
        <span className="accordion__chevron" />
      </button>
    </h3>
  );
}

export interface AccordionContentProps {
  value: string;
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AccordionContent({
  value,
  children,
  className,
  "data-testid": testId,
}: AccordionContentProps) {
  const ctx = useAccordionContext();
  const isOpen = ctx.isItemOpen(value);
  const classNames = ["accordion__content", className].filter(Boolean).join(" ");

  return (
    <div
      role="region"
      className={classNames}
      id={`${ctx.idBase}-content-${value}`}
      aria-labelledby={`${ctx.idBase}-trigger-${value}`}
      hidden={!isOpen ? true : undefined}
      data-testid={testId}
    >
      <div className="accordion__contentInner">
        {children}
      </div>
    </div>
  );
}
// @generated:end

// @generated:start component
export function Accordion({
  value: controlledValue,
  defaultValue,
  onValueChange,
  type = "single",
  disabled,
  className,
  "data-testid": testId,
  children,
  collapsible = false,
  ...rest
}: AccordionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { openness, setOpenness } = useAccordion({
    value: controlledValue,
    defaultValue,
    onValueChange,
  });
  const idBase = useId();

  const isItemOpen = useCallback(
    (itemValue: string) =>
      Array.isArray(openness)
        ? openness.includes(itemValue)
        : openness === itemValue,
    [openness],
  );

  const toggleItem = useCallback(
    (itemValue: string) => {
      if (type === "multiple") {
        const current = Array.isArray(openness) ? openness : [];
        const next = current.includes(itemValue)
          ? current.filter((v) => v !== itemValue)
          : [...current, itemValue];
        setOpenness(next);
      } else {
        const current = typeof openness === "string" ? openness : "";
        const next = current === itemValue && collapsible ? "" : itemValue;
        setOpenness(next);
      }
    },
    [openness, setOpenness, type, collapsible],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const key = e.key;
      if (
        key !== "ArrowDown" &&
        key !== "ArrowUp" &&
        key !== "Home" &&
        key !== "End"
      ) {
        return;
      }
      const root = rootRef.current;
      if (!root) return;
      const triggers = Array.from(
        root.querySelectorAll<HTMLButtonElement>("[data-disclosure-trigger]"),
      ).filter((el) => !el.disabled);
      if (triggers.length === 0) return;
      const currentIndex = triggers.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      let nextIndex = currentIndex;
      if (key === "ArrowDown") {
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % triggers.length;
      } else if (key === "ArrowUp") {
        nextIndex =
          currentIndex < 0
            ? triggers.length - 1
            : (currentIndex - 1 + triggers.length) % triggers.length;
      } else if (key === "Home") {
        nextIndex = 0;
      } else {
        nextIndex = triggers.length - 1;
      }
      e.preventDefault();
      triggers[nextIndex]?.focus();
    },
    [],
  );

  const classNames = [
    "accordion",
    type && `accordion--${type}`,
    disabled && "accordion--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AccordionContextProvider
      value={{
        openness,
        toggleItem,
        isItemOpen,
        type: type ?? "single",
        collapsible: collapsible ?? false,
        disabled: disabled ?? false,
        idBase,
      }}
    >
      <div
        ref={rootRef}
        className={classNames}
        data-testid={testId}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    </AccordionContextProvider>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
