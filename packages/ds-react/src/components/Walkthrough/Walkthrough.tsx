// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useWalkthrough } from "./useWalkthrough";
import "./Walkthrough.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type WalkthroughPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type WalkthroughStepSpec = { anchor: string; title: string; description?: string };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface WalkthroughProps {
  steps?: WalkthroughStepSpec[];
  index?: number;
  defaultIndex?: number;
  onStepChange?: (index: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  label?: string;
  storageKey?: string;
  autoStart?: boolean;
  closeOnOutsideClick?: boolean;
  placement?: WalkthroughPlacement;
  className?: string;
  "data-testid"?: string;
  slots?: {
    description?: ReactNode;
    title?: ReactNode;
  };
}
// @generated:end

// @generated:start subcomponents
export interface WalkthroughContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function WalkthroughContent({
  children,
  className,
  "data-testid": testId,
}: WalkthroughContentProps) {
  const classNames = ["walkthrough__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface WalkthroughTitleProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function WalkthroughTitle({
  children,
  className,
  "data-testid": testId,
}: WalkthroughTitleProps) {
  const classNames = ["walkthrough__title", className].filter(Boolean).join(" ");
  return (
    <Stack as="h3" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface WalkthroughDescriptionProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function WalkthroughDescription({
  children,
  className,
  "data-testid": testId,
}: WalkthroughDescriptionProps) {
  const classNames = ["walkthrough__description", className].filter(Boolean).join(" ");
  return (
    <Stack as="p" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Walkthrough({
  index: controlledIndex,
  defaultIndex,
  onStepChange,
  placement = "auto",
  className,
  "data-testid": testId,
  steps,
  onComplete,
  onSkip,
  label = "Feature tour",
  storageKey,
  autoStart = false,
  closeOnOutsideClick = false,
  slots,
  ...rest
}: WalkthroughProps) {
  const { step, setStep } = useWalkthrough({
    index: controlledIndex,
    defaultIndex,
    onStepChange,
    closeOnOutsideClick,
  });

  const classNames = [
    "walkthrough",
    placement && `walkthrough--${placement}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} role="status" aria-label={label} data-testid={testId} {...rest}>
    <div className="walkthrough__content">
      <h3 className="walkthrough__title">
        {slots?.title}
      </h3>
      <p className="walkthrough__description">
        {slots?.description}
      </p>
    </div>
    <div className="walkthrough__controls">
      <button className="walkthrough__skip" type="button" />
      <button className="walkthrough__prev" type="button" />
      <div className="walkthrough__dots">
        <button className="walkthrough__dot" type="button" />
      </div>
      <span className="walkthrough__counter" />
      <button className="walkthrough__next" type="button" />
    </div>
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
