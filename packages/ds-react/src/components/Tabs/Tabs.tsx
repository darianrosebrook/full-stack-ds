// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useTabs } from "./useTabs";
import "./Tabs.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TabsOrientation = "horizontal" | "vertical";

export type TabsActivationMode = "automatic" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
  loop?: boolean;
  unmountInactive?: boolean;
  idBase?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface TabsListProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TabsList({
  children,
  className,
  "data-testid": testId,
}: TabsListProps) {
  const classNames = ["tabs__list", className].filter(Boolean).join(" ");
  return (
    <Stack as="ul" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface TabsTabProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TabsTab({
  children,
  className,
  "data-testid": testId,
}: TabsTabProps) {
  const classNames = ["tabs__tab", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface TabsPanelProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TabsPanel({
  children,
  className,
  "data-testid": testId,
}: TabsPanelProps) {
  const classNames = ["tabs__panel", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  activationMode = "automatic",
  className,
  "data-testid": testId,
  children,
  loop = true,
  unmountInactive,
  idBase,
  ...rest
}: TabsProps) {
  const { activeTab, setActiveTab } = useTabs({
    value: controlledValue,
    defaultValue,
    onValueChange,
  });

  const classNames = [
    "tabs",
    orientation && `tabs--${orientation}`,
    activationMode && `tabs--${activationMode}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    <div className="tabs__list" role="tablist">
      <button className="tabs__tab" role="tab" type="button" aria-selected={activeTab !== undefined ? (String(activeTab) as "true" | "false") : undefined} />
      <span className="tabs__indicator" aria-hidden="true" />
    </div>
    <div className="tabs__panel">
      {children}
    </div>
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
