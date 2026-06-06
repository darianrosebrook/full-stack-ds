// PropertySection — a collapsible accordion section for the properties panel,
// recreated from the interactive-ui-editor's PropertySection (which used Framer
// Motion) with a plain CSS grid-rows transition instead. Header click toggles;
// the chevron rotates; an optional `action` node (e.g. a `+` add button) sits in
// the header. Each section owns its open/closed state.
//
// The collapse animation uses `grid-template-rows: 0fr → 1fr` on a wrapper —
// the modern CSS pattern for animating to/from intrinsic height without JS
// measurement (replaces Framer's height:auto animation).

import { useState, type ReactNode } from "react";

interface PropertySectionProps {
  title: string;
  children: ReactNode;
  /** Initial open state (default open). */
  defaultOpen?: boolean;
  /** Optional node rendered at the right of the header (e.g. an add button). */
  action?: ReactNode;
  /** Accessible label for the region (defaults to title). */
  ariaLabel?: string;
}

export function PropertySection({
  title,
  children,
  defaultOpen = true,
  action,
  ariaLabel,
}: PropertySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={"fsds-ps" + (open ? " fsds-ps--open" : "")}
      aria-label={ariaLabel ?? title}
    >
      <div className="fsds-ps__header">
        <button
          type="button"
          className="fsds-ps__toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="fsds-ps__chevron" aria-hidden>
            ⌄
          </span>
          <h3 className="fsds-ps__title">{title}</h3>
        </button>
        {action && <div className="fsds-ps__action">{action}</div>}
      </div>
      {/* grid-rows 0fr↔1fr animates to intrinsic height with no JS measure */}
      <div className="fsds-ps__collapser" aria-hidden={!open}>
        <div className="fsds-ps__collapser-inner">
          <div className="fsds-ps__body">{children}</div>
        </div>
      </div>
    </section>
  );
}
