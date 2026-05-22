// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useShowMore } from "./useShowMore";
import "./ShowMore.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface ShowMoreProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "defaultExpanded" | "expanded" | "maxLines" | "onExpandedChange" | "showLessLabel" | "showMoreLabel"> {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  maxLines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface ShowMoreContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ShowMoreContent({
  children,
  className,
  "data-testid": testId,
}: ShowMoreContentProps) {
  const classNames = ["show-more__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface ShowMoreTriggerProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ShowMoreTrigger({
  children,
  className,
  "data-testid": testId,
}: ShowMoreTriggerProps) {
  const classNames = ["show-more__trigger", className].filter(Boolean).join(" ");
  return (
    <Stack as="button" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function ShowMore({
  expanded: controlledExpanded,
  defaultExpanded,
  onExpandedChange,
  className,
  "data-testid": testId,
  children,
  maxLines = 3,
  showMoreLabel = "Show more",
  showLessLabel = "Show less",
  ...rest
}: ShowMoreProps) {
  const { expanded, setExpanded } = useShowMore({
    expanded: controlledExpanded,
    defaultExpanded,
    onExpandedChange,
  });

  const classNames = [
    "show-more",
    expanded && "show-more--expanded",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    <div className="show-more__content">
      {children}
    </div>
    <button className="show-more__trigger" type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
      {showMoreLabel}
    </button>
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
