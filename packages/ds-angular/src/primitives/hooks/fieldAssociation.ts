import { Injectable } from '@angular/core';

/**
 * Field-association service (FEAT-A11Y-LABEL-ID-ASSOCIATION-01).
 *
 * A field composer (Field) provides this at its component injector
 * (`providers: [FieldAssociationService]`) and connects a getter over its
 * generated ids; a form control projected into the composer's content sits
 * inside the composer's element-injector chain and can therefore inject the
 * SAME instance optionally, binding `id` / `aria-describedby` on its root.
 *
 * The connected source is a GETTER so reads reflect the composer's current
 * state (status switches help↔error) on every change-detection pass.
 * Standalone controls inject `{ optional: true }`, get null, and render no
 * generated ids — unchanged behavior outside a composer.
 */
export interface FieldAssociation {
  /** Generated id for the projected control element (the label's `for` target). */
  controlId: string;
  /** Space-joined describedby id list, or undefined when nothing applies. */
  describedBy: string | undefined;
}

@Injectable()
export class FieldAssociationService {
  private source: (() => FieldAssociation) | undefined;

  /** Connect the composer's id source. Returns `this` for field-initializer chaining. */
  connect(source: () => FieldAssociation): this {
    this.source = source;
    return this;
  }

  get current(): FieldAssociation | undefined {
    return this.source?.();
  }
}
