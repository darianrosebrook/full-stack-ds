// Inspector section composed from the generated disclosure contract.
import type { ReactNode } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@full-stack-ds/react";

interface PropertySectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
  ariaLabel?: string;
}

export function PropertySection({ title, children, defaultOpen = true, action, ariaLabel }: PropertySectionProps) {
  return (
    <Accordion className="fsds-ps" type="single" collapsible
      defaultValue={defaultOpen ? "section" : ""} aria-label={ariaLabel ?? title}>
      <AccordionItem>
        <div className="fsds-ps__header">
          <AccordionTrigger value="section" className="fsds-ps__toggle">{title}</AccordionTrigger>
          {action && <div className="fsds-ps__action">{action}</div>}
        </div>
        <AccordionContent value="section" className="fsds-ps__body">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
