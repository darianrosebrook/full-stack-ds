// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./Avatar.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "name" | "priority" | "size" | "src"> {
  src?: string;
  name: string;
  priority?: boolean;
  size?: string;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Avatar({
  size,
  className,
  "data-testid": testId,
  src,
  name,
  priority,
  ...rest
}: AvatarProps) {
  const classNames = [
    "avatar",
    size && `avatar--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <Stack layout="native" className={`${classNames}`} aria-label={name} role="img" data-testid={testId} {...rest}>
    {src && (
      <img className="avatar__image" src={src} alt={""} />
    )}
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
