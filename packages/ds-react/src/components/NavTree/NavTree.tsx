// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import { resolveIcon } from "@full-stack-ds/iconography";
import "./NavTree.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type NavTreeIconSize = "sm" | "md";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface NavTreeProps {
  label: string;
  href?: string;
  icon?: string;
  iconSize?: NavTreeIconSize;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface NavTreeListProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function NavTreeList({
  children,
  className,
  "data-testid": testId,
}: NavTreeListProps) {
  const classNames = ["nav-tree__list", className].filter(Boolean).join(" ");
  return (
    <Stack as="ul" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface NavTreeItemProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function NavTreeItem({
  children,
  className,
  "data-testid": testId,
}: NavTreeItemProps) {
  const classNames = ["nav-tree__item", className].filter(Boolean).join(" ");
  return (
    <Stack as="li" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20 };

export function NavTree({
  iconSize = "sm",
  className,
  "data-testid": testId,
  children,
  label,
  href,
  icon,
  ...rest
}: NavTreeProps) {
  const classNames = [
    "nav-tree",
    iconSize && `nav-tree--${iconSize}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconGlyphPx = ICON_GLYPH_SIZE_HINTS[iconSize];
  const iconGlyph = resolveIcon(icon ?? "", iconGlyphPx ?? Number.NaN);

  return (
  <Stack layout="native" as="li" className={`${classNames}`} role="listitem" data-testid={testId} data-fsds-component="nav-tree" {...rest}>
    <div className="nav-tree__heading">
      {icon ? (
        <span className="nav-tree__icon" aria-hidden="true">
          {iconGlyph ? (
            <svg fill="none" xmlns="http://www.w3.org/2000/svg" data-fsds-icon={iconGlyph.name} viewBox={iconGlyph.viewBox} width={iconGlyphPx ?? iconGlyph.size} height={iconGlyphPx ?? iconGlyph.size}>
              {iconGlyph.paths.map((glyphPath, glyphIndex) => (
                <path key={glyphIndex} d={glyphPath.d} fill={glyphPath.fill} stroke={glyphPath.stroke} strokeWidth={glyphPath.strokeWidth} strokeLinecap={glyphPath.strokeLineCap} strokeLinejoin={glyphPath.strokeLineJoin} strokeDasharray={glyphPath.strokeDasharray} fillRule={glyphPath.fillRule} clipRule={glyphPath.clipRule} />
              ))}
            </svg>
          ) : null}
        </span>
      ) : null}
      {href ? (
        <a className="nav-tree__headingLink" href={href}>
          {label}
        </a>
      ) : null}
      {!href ? (
        <span className="nav-tree__headingLabel">
          {label}
        </span>
      ) : null}
    </div>
    <ul className="nav-tree__list">
      {children}
    </ul>
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end
