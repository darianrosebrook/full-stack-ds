// @generated:start imports
import { type AnchorHTMLAttributes, type ReactNode } from "react";
import "./Links.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type LinkTarget = "_self" | "_blank" | "_parent" | "_top";

export type LinkSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface LinksProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "data-testid" | "disabled" | "href" | "rel" | "size" | "target"> {
  href?: string;
  target?: LinkTarget;
  rel?: string;
  size?: LinkSize;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Links({
  size,
  disabled,
  className,
  "data-testid": testId,
  children,
  href,
  target,
  rel,
  ...rest
}: LinksProps) {
  const classNames = [
    "links",
    size && `links--${size}`,
    disabled && "links--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <a className={`${classNames}`} href={href} target={target} rel={rel} data-testid={testId} {...rest}>
    {children}
  </a>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
