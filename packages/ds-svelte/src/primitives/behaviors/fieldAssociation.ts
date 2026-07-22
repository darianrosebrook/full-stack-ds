import { getContext, setContext } from 'svelte';

/**
 * Field-association context (FEAT-A11Y-LABEL-ID-ASSOCIATION-01).
 *
 * A field composer (Field) provides the generated id its label's `for`
 * points at, plus the id list its help/error regions contribute, so the
 * form control rendered into its control snippet can wire `id` and
 * `aria-describedby` without the consumer threading ids by hand.
 *
 * The context value is a GETTER so reads stay reactive: the provider closes
 * over a `$derived` object, and consumers calling the getter inside their
 * template re-evaluate when the field's status/slots change.
 *
 * Controls that declare `fieldAssociation: "control"` in their contract
 * consume this via `useFieldAssociation()` and bind the values onto their
 * root element. Outside a provider the consumer getter is undefined and the
 * control renders no generated ids — standalone usage is unchanged.
 */
export interface FieldAssociation {
  /** Generated id for the slotted control element (the label's `for` target). */
  controlId: string;
  /** Space-joined describedby id list, or undefined when nothing applies. */
  describedBy: string | undefined;
}

const FIELD_ASSOCIATION_KEY = Symbol('fsds-field-association');

export function provideFieldAssociation(value: () => FieldAssociation): void {
  setContext(FIELD_ASSOCIATION_KEY, value);
}

export function useFieldAssociation(): (() => FieldAssociation) | undefined {
  return getContext<(() => FieldAssociation) | undefined>(
    FIELD_ASSOCIATION_KEY,
  );
}
