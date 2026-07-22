import { createContext, useContext } from "react";

/**
 * Field-association context (FEAT-A11Y-LABEL-ID-ASSOCIATION-01).
 *
 * A field composer (Field) provides the generated id its label's `for`
 * points at, plus the id list its help/error regions contribute, so the
 * form control slotted into its control region can wire `id` and
 * `aria-describedby` without the consumer threading ids by hand.
 *
 * Controls that declare `fieldAssociation: "control"` in their contract
 * consume this via `useFieldAssociation()` and bind the values onto their
 * root element. Outside a provider the hook returns `null` and the control
 * renders no generated ids — standalone usage is unchanged.
 */
export interface FieldAssociation {
  /** Generated id for the slotted control element (the label's `for` target). */
  controlId: string;
  /** Space-joined describedby id list, or undefined when nothing applies. */
  describedBy: string | undefined;
}

export const FieldAssociationContext = createContext<FieldAssociation | null>(
  null,
);
FieldAssociationContext.displayName = "FieldAssociationContext";

export function useFieldAssociation(): FieldAssociation | null {
  return useContext(FieldAssociationContext);
}
