// @generated:start imports
import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useTruncate } from "./useTruncate";
import "./Truncate.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TruncateProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "collapseText" | "data-testid" | "defaultExpanded" | "expandText" | "expandable" | "expanded" | "lines" | "onExpandedChange"> {
  lines?: number;
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandText?: string;
  collapseText?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface TruncateContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TruncateContent({
  children,
  className,
  "data-testid": testId,
}: TruncateContentProps) {
  const classNames = ["truncate__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Truncate({
  expanded: controlledExpanded,
  defaultExpanded,
  onExpandedChange,
  className,
  "data-testid": testId,
  children,
  lines,
  expandable,
  expandText = "Show more",
  collapseText = "Show less",
  ...rest
}: TruncateProps) {
  const { expanded, setExpanded } = useTruncate({
    expanded: controlledExpanded,
    defaultExpanded,
    onExpandedChange,
  });

  const classNames = [
    "truncate",
    expanded && "truncate--expanded",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <Stack layout="native" className={`${classNames}`} data-testid={testId} {...rest}>
    <span className="truncate__content" style={{ "--fsds-truncate-content-lines": lines } as CSSProperties}>
      {children}
    </span>
    {expandable && (
      <button className="truncate__toggle" type="button" aria-expanded={expanded} />
    )}
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
