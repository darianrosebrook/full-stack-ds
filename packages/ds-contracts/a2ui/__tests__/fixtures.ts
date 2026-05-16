/**
 * Hand-authored expected A2UI descriptor fragments used as an independent
 * oracle for the deriver. Written from reading the contract, not from running
 * the deriver. When the deriver or a contract changes, revise these by hand —
 * never regenerate from code.
 *
 * Assertions are intentionally sparse: pin the fields the agent actually relies
 * on (name, category, accepts/enum per pinned prop, event routing) and let
 * free-form `description` text flow through unchecked.
 */

export interface PinnedProp {
  type: string;
  accepts: string[];
  enum?: string[];
}

export interface PinnedEvent {
  source: 'channel' | 'event';
  key: string;
  valueType?: string;
  valueProp?: string;
  onChangeProp?: string;
}

export interface PinnedComponent {
  name: string;
  category: string;
  props: Record<string, PinnedProp>;
  events?: Record<string, PinnedEvent>;
  /** Props that MUST NOT appear in the derived descriptor. */
  excludedProps: string[];
}

// ---------------------------------------------------------------------------
// Synthetic pinned expectations
// These use hand-authored synthetic contracts (not the corpus) so the oracle
// stays isolated from whether a specific corpus contract has been upgraded yet.
// ---------------------------------------------------------------------------

export const syntheticButton: PinnedComponent = {
  name: 'Button',
  category: 'action',
  props: {
    kind: {
      type: 'ButtonKind',
      accepts: ['enum'],
      enum: ['default', 'primary', 'secondary', 'tertiary', 'link', 'danger', 'brand'],
    },
    type: {
      type: '"button" | "submit" | "reset"',
      accepts: ['enum'],
      enum: ['button', 'submit', 'reset'],
    },
    disabled: { type: 'boolean', accepts: ['boolean'] },
    full: { type: 'boolean', accepts: ['boolean'] },
    small: { type: 'boolean', accepts: ['boolean'] },
  },
  excludedProps: ['children', 'className', 'aria-disabled', 'onClick', 'onKeyDown'],
};

export const syntheticInput: PinnedComponent = {
  name: 'Input',
  category: 'form-field',
  props: {
    value: { type: 'string | number', accepts: ['string', 'number'] },
    initialValue: { type: 'string | number', accepts: ['string', 'number'] },
    type: {
      type: '"number" | "text" | "password" | "email" | "tel" | "url"',
      accepts: ['enum'],
      enum: ['number', 'text', 'password', 'email', 'tel', 'url'],
    },
    disabled: { type: 'boolean', accepts: ['boolean'] },
    multiline: { type: 'boolean', accepts: ['boolean'] },
    label: { type: 'ReactNode', accepts: ['node-ref'] },
    leftAddOn: { type: 'ReactNode', accepts: ['node-ref'] },
  },
  events: {
    value: {
      source: 'channel',
      key: 'value',
      valueType: 'string | number',
      valueProp: 'value',
      onChangeProp: 'onChange',
    },
  },
  excludedProps: [
    'className',
    'onChange',
    'onFocus',
    'onBlur',
    'inputProps',
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'data-testid',
  ],
};

export const syntheticCheckbox: PinnedComponent = {
  name: 'Checkbox',
  category: 'form-field',
  props: {
    // Named type `CheckedState` not in `contract.types` — deriver falls back to string.
    checked: { type: 'CheckedState', accepts: ['string'] },
    disabled: { type: 'boolean', accepts: ['boolean'] },
    label: { type: 'string', accepts: ['string'] },
    errorText: { type: 'ReactNode', accepts: ['node-ref'] },
    helperText: { type: 'ReactNode', accepts: ['node-ref'] },
  },
  events: {
    checked: {
      source: 'channel',
      key: 'checked',
      valueType: 'boolean | "indeterminate"',
      valueProp: 'checked',
      onChangeProp: 'onChange',
    },
  },
  excludedProps: [
    'id',
    'className',
    'inputProps',
    'onChange',
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'data-testid',
  ],
};
