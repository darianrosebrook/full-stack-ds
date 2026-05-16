// @generated:start imports
import { type ReactNode } from "react";
import "./BrandSwitcher.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface BrandSwitcherProps {
  showAutoCycle?: boolean;
  showDensity?: boolean;
  showFonts?: boolean;
  compact?: boolean;
  sticky?: boolean;
  enableKeyboard?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function BrandSwitcher({
  className,
  "data-testid": testId,
  children,
  showAutoCycle = false,
  showDensity = false,
  showFonts = false,
  compact = false,
  sticky = false,
  enableKeyboard = true,
  ...rest
}: BrandSwitcherProps) {
  const classNames = [
    "brand-switcher",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    {children}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
