// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useAccordion } from "./useAccordion";
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
export interface AccordionProps {
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
    <Stack as="li" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface AccordionTriggerProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AccordionTrigger({
  children,
  className,
  "data-testid": testId,
}: AccordionTriggerProps) {
  const classNames = ["accordion__trigger", className].filter(Boolean).join(" ");
  return (
    <Stack as="button" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface AccordionHeaderProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AccordionHeader({
  children,
  className,
  "data-testid": testId,
}: AccordionHeaderProps) {
  const classNames = ["accordion__header", className].filter(Boolean).join(" ");
  return (
    <Stack as="header" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface AccordionContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AccordionContent({
  children,
  className,
  "data-testid": testId,
}: AccordionContentProps) {
  const classNames = ["accordion__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
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
  const { openness, setOpenness } = useAccordion({
    value: controlledValue,
    defaultValue,
    onValueChange,
  });

  const classNames = [
    "accordion",
    type && `accordion--${type}`,
    disabled && "accordion--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    <div className="accordion__item">
      <h3 className="accordion__header">
        <button className="accordion__trigger" type="button" aria-expanded={openness !== undefined ? (String(openness) as "true" | "false") : undefined}>
          {children}
          <span className="accordion__chevron" />
        </button>
      </h3>
      <div className="accordion__content">
        <div className="accordion__contentInner">
          {children}
        </div>
      </div>
    </div>
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
