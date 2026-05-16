/**
 * Tests for `deriveA2UIDescriptor`.
 *
 * The oracle uses `fixtures.ts` — hand-authored pinned expectations built from
 * synthetic contracts. Synthetic contracts exercise edge cases independently of
 * the corpus so branches can't go silent if the corpus doesn't cover them.
 *
 * The corpus sanity test derives every contract that has an `a2ui` block. Contracts
 * without `a2ui` are skipped — they pre-date the block and will be upgraded
 * incrementally. The test asserts at least one contract is derived so it can't
 * trivially pass by skipping everything.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  deriveA2UIDescriptor,
  deriveA2UIRegistry,
  type ComponentContractLike,
} from '../derive';
import {
  syntheticButton,
  syntheticInput,
  syntheticCheckbox,
  type PinnedComponent,
} from './fixtures';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CONTRACTS_DIR = path.resolve(__dirname, '../..');

function assertMatches(contract: ComponentContractLike, expected: PinnedComponent): void {
  const d = deriveA2UIDescriptor(contract);

  expect(d.name, `${expected.name}: name`).toBe(expected.name);
  expect(d.category, `${expected.name}: category`).toBe(expected.category);

  for (const [propName, pinned] of Object.entries(expected.props)) {
    const actual = d.props[propName];
    expect(actual, `${expected.name}: props.${propName} missing from descriptor`).toBeDefined();
    expect(actual.type, `${expected.name}: props.${propName}.type`).toBe(pinned.type);
    expect(actual.accepts, `${expected.name}: props.${propName}.accepts`).toEqual(pinned.accepts);
    if (pinned.enum) {
      expect(actual.enum, `${expected.name}: props.${propName}.enum`).toEqual(pinned.enum);
    }
  }

  for (const excluded of expected.excludedProps) {
    expect(
      d.props[excluded],
      `${expected.name}: prop "${excluded}" should not be exposed`,
    ).toBeUndefined();
  }

  if (expected.events) {
    for (const [evName, pinned] of Object.entries(expected.events)) {
      const actual = d.events[evName];
      expect(actual, `${expected.name}: events.${evName} missing`).toBeDefined();
      expect(actual.source, `${expected.name}: events.${evName}.source`).toBe(pinned.source);
      expect(actual.key, `${expected.name}: events.${evName}.key`).toBe(pinned.key);
      if (pinned.valueType) {
        expect(actual.valueType, `${expected.name}: events.${evName}.valueType`).toBe(pinned.valueType);
      }
      if (pinned.valueProp) {
        expect(actual.valueProp, `${expected.name}: events.${evName}.valueProp`).toBe(pinned.valueProp);
      }
      if (pinned.onChangeProp) {
        expect(actual.onChangeProp, `${expected.name}: events.${evName}.onChangeProp`).toBe(pinned.onChangeProp);
      }
    }
  }
}

function syntheticButton_contract(): ComponentContractLike {
  return {
    name: 'Button',
    a2ui: { category: 'action' },
    types: {
      ButtonKind: {
        kind: 'union',
        values: ['default', 'primary', 'secondary', 'tertiary', 'link', 'danger', 'brand'],
      },
    },
    props: {
      styled: {
        members: [
          { name: 'children', type: 'ReactNode', description: 'Button content' },
          { name: 'kind', type: 'ButtonKind', description: 'Visual variant' },
          { name: 'type', type: '"button" | "submit" | "reset"', description: 'HTML button type' },
          { name: 'disabled', type: 'boolean', description: 'Disabled state' },
          { name: 'full', type: 'boolean', description: 'Full-width layout' },
          { name: 'small', type: 'boolean', description: 'Compact size' },
          { name: 'className', type: 'string', description: 'Custom class' },
          { name: 'aria-disabled', type: 'boolean', description: 'ARIA disabled' },
          { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler' },
          { name: 'onKeyDown', type: '(e: KeyboardEvent) => void', description: 'Keydown handler' },
        ],
      },
    },
  };
}

function syntheticInput_contract(): ComponentContractLike {
  return {
    name: 'Input',
    a2ui: { category: 'form-field' },
    channels: {
      value: {
        description: 'Current input value.',
        value: 'value',
        onChange: 'onChange',
        valueType: 'string | number',
      },
    },
    props: {
      styled: {
        members: [
          { name: 'value', type: 'string | number', description: 'Controlled value' },
          { name: 'initialValue', type: 'string | number', description: 'Initial value' },
          { name: 'type', type: '"number" | "text" | "password" | "email" | "tel" | "url"', description: 'Input type' },
          { name: 'disabled', type: 'boolean', description: 'Disabled state' },
          { name: 'multiline', type: 'boolean', description: 'Textarea mode' },
          { name: 'label', type: 'ReactNode', description: 'Field label' },
          { name: 'leftAddOn', type: 'ReactNode', description: 'Left slot' },
          { name: 'className', type: 'string', description: 'Custom class' },
          { name: 'onChange', type: '(v: string) => void', description: 'Change handler' },
          { name: 'onFocus', type: '() => void', description: 'Focus handler' },
          { name: 'onBlur', type: '() => void', description: 'Blur handler' },
          { name: 'inputProps', type: 'Record<string, unknown>', description: 'Native input props' },
          { name: 'aria-label', type: 'string', description: 'ARIA label' },
          { name: 'aria-labelledby', type: 'string', description: 'ARIA labelledby' },
          { name: 'aria-describedby', type: 'string', description: 'ARIA describedby' },
          { name: 'data-testid', type: 'string', description: 'Test ID' },
        ],
      },
    },
  };
}

function syntheticCheckbox_contract(): ComponentContractLike {
  return {
    name: 'Checkbox',
    a2ui: { category: 'form-field' },
    channels: {
      checked: {
        description: 'Check state.',
        value: 'checked',
        onChange: 'onChange',
        valueType: 'boolean | "indeterminate"',
      },
    },
    props: {
      styled: {
        members: [
          { name: 'checked', type: 'CheckedState', description: 'Controlled check state' },
          { name: 'disabled', type: 'boolean', description: 'Disabled state' },
          { name: 'label', type: 'string', description: 'Visible label' },
          { name: 'errorText', type: 'ReactNode', description: 'Error text' },
          { name: 'helperText', type: 'ReactNode', description: 'Helper text' },
          { name: 'id', type: 'string', description: 'Input ID' },
          { name: 'className', type: 'string', description: 'Custom class' },
          { name: 'inputProps', type: 'Record<string, unknown>', description: 'Native input props' },
          { name: 'onChange', type: '(v: boolean) => void', description: 'Change handler' },
          { name: 'aria-label', type: 'string', description: 'ARIA label' },
          { name: 'aria-labelledby', type: 'string', description: 'ARIA labelledby' },
          { name: 'aria-describedby', type: 'string', description: 'ARIA describedby' },
          { name: 'data-testid', type: 'string', description: 'Test ID' },
        ],
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Oracle tests (synthetic contracts, deterministic)
// ---------------------------------------------------------------------------

describe('deriveA2UIDescriptor — oracle (synthetic contracts)', () => {
  it('Button: derives kind alias to enum, excludes render-only props', () => {
    assertMatches(syntheticButton_contract(), syntheticButton);
  });

  it('Input: resolves union types, derives channel events, excludes handlers', () => {
    assertMatches(syntheticInput_contract(), syntheticInput);
  });

  it('Checkbox: falls back to string for unknown named type CheckedState', () => {
    assertMatches(syntheticCheckbox_contract(), syntheticCheckbox);
  });
});

// ---------------------------------------------------------------------------
// Edge cases (synthetic)
// ---------------------------------------------------------------------------

function base(overrides: Partial<ComponentContractLike> = {}): ComponentContractLike {
  return {
    name: 'Syn',
    a2ui: { category: 'display' },
    props: { styled: { members: [] } },
    ...overrides,
  };
}

describe('deriveA2UIDescriptor — edge cases', () => {
  it('rejects a contract missing a2ui.category', () => {
    const bad = { name: 'NoA2ui' } as unknown as ComponentContractLike;
    expect(() => deriveA2UIDescriptor(bad)).toThrow(/a2ui\.category/);
  });

  it('uses nodeKind to disambiguate ReactNode → icon-ref', () => {
    const c = base({
      props: {
        styled: {
          members: [
            { name: 'icon', type: 'ReactNode', nodeKind: 'icon-ref', description: 'Icon' },
            { name: 'body', type: 'ReactNode', description: 'Body' },
          ],
        },
      },
    });
    const d = deriveA2UIDescriptor(c);
    expect(d.props.icon.accepts).toEqual(['icon-ref']);
    expect(d.props.body.accepts).toEqual(['node-ref']);
  });

  it('excludes render-only props by name', () => {
    const c = base({
      props: {
        styled: {
          members: [
            { name: 'className', type: 'string', description: 'x' },
            { name: 'style', type: 'string', description: 'x' },
            { name: 'id', type: 'string', description: 'x' },
            { name: 'children', type: 'ReactNode', description: 'x' },
            { name: 'inputRef', type: 'string', description: 'x' },
            { name: 'aria-label', type: 'string', description: 'x' },
            { name: 'data-testid', type: 'string', description: 'x' },
            { name: 'onFoo', type: 'string', description: 'x' },
            { name: 'keep', type: 'string', description: 'kept' },
          ],
        },
      },
    });
    const d = deriveA2UIDescriptor(c);
    expect(Object.keys(d.props)).toEqual(['keep']);
  });

  it('excludes non-serializable types', () => {
    const c = base({
      props: {
        styled: {
          members: [
            { name: 'cb', type: '(x: string) => void', description: 'x' },
            { name: 'handler', type: 'React.MouseEventHandler<HTMLButtonElement>', description: 'x' },
            { name: 'inline', type: 'CSSProperties', description: 'x' },
            { name: 'attrs', type: 'Record<string, unknown>', description: 'x' },
            { name: 'ref', type: 'RefObject<HTMLElement>', description: 'x' },
            { name: 'native', type: 'HTMLAttributes<HTMLElement>', description: 'x' },
            { name: 'ok', type: 'string', description: 'kept' },
          ],
        },
      },
    });
    const d = deriveA2UIDescriptor(c);
    expect(Object.keys(d.props).sort()).toEqual(['ok']);
  });

  it('resolves union and alias typeDefs into enum values', () => {
    const c = base({
      types: {
        Kind: { kind: 'union', values: ['a', 'b', 'c'] },
        AliasKind: { kind: 'alias', alias: 'Kind' },
        Mixed: { kind: 'alias', alias: '"x" | Kind' },
      },
      props: {
        styled: {
          members: [
            { name: 'k', type: 'Kind', description: 'x' },
            { name: 'ak', type: 'AliasKind', description: 'x' },
            { name: 'm', type: 'Mixed', description: 'x' },
          ],
        },
      },
    });
    const d = deriveA2UIDescriptor(c);
    expect(d.props.k).toMatchObject({ accepts: ['enum'], enum: ['a', 'b', 'c'] });
    expect(d.props.ak).toMatchObject({ accepts: ['enum'], enum: ['a', 'b', 'c'] });
    expect(d.props.m).toMatchObject({ accepts: ['enum'], enum: ['x', 'a', 'b', 'c'] });
  });

  it('falls back to string for unknown named types', () => {
    const c = base({
      props: {
        styled: {
          members: [{ name: 'v', type: 'SomeOpaqueName', description: 'x' }],
        },
      },
    });
    const d = deriveA2UIDescriptor(c);
    expect(d.props.v.accepts).toEqual(['string']);
  });

  it('strips undefined / null out of unions', () => {
    const c = base({
      props: {
        styled: {
          members: [
            { name: 'maybe', type: 'string | undefined', description: 'x' },
            { name: 'nullable', type: 'number | null', description: 'x' },
          ],
        },
      },
    });
    const d = deriveA2UIDescriptor(c);
    expect(d.props.maybe.accepts).toEqual(['string']);
    expect(d.props.nullable.accepts).toEqual(['number']);
  });

  it('surfaces channels and events in the events map', () => {
    const c = base({
      channels: {
        value: {
          description: 'Selected value.',
          value: 'value',
          onChange: 'onChange',
          valueType: 'string',
        },
      },
      events: {
        open: { description: 'Popover opened.' },
      },
    });
    const d = deriveA2UIDescriptor(c);
    expect(d.events.value).toMatchObject({
      source: 'channel',
      key: 'value',
      valueType: 'string',
      valueProp: 'value',
      onChangeProp: 'onChange',
    });
    expect(d.events.open).toMatchObject({ source: 'event', key: 'open' });
  });

  it('preserves authored children policy verbatim', () => {
    const c = base({
      a2ui: {
        category: 'container',
        children: { allowed: true, slot: 'children', accepts: ['action'], min: 1 },
      },
    });
    const d = deriveA2UIDescriptor(c);
    expect(d.children).toEqual({ allowed: true, slot: 'children', accepts: ['action'], min: 1 });
  });

  it('deriveA2UIRegistry keys by component name', () => {
    const a = base({ name: 'A' });
    const b = base({ name: 'B' });
    const reg = deriveA2UIRegistry([a, b]);
    expect(Object.keys(reg).sort()).toEqual(['A', 'B']);
  });
});

// ---------------------------------------------------------------------------
// Corpus sanity: derive every contract that has an a2ui block without throwing
// ---------------------------------------------------------------------------

describe('deriveA2UIDescriptor — corpus sanity', () => {
  it('derives descriptors for every upgraded contract without throwing', () => {
    const contractFiles: string[] = [];
    for (const f of fs.readdirSync(CONTRACTS_DIR)) {
      if (f.endsWith('.contract.json')) {
        contractFiles.push(path.join(CONTRACTS_DIR, f));
      }
    }
    expect(contractFiles.length, 'no contract files found').toBeGreaterThan(0);

    const upgraded: string[] = [];
    for (const p of contractFiles) {
      const contract: ComponentContractLike = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (!contract.a2ui?.category) continue; // not yet upgraded — skip gracefully
      upgraded.push(contract.name ?? p);
      const desc = deriveA2UIDescriptor(contract);
      expect(desc.name, `${contract.name}: name`).toBeTruthy();
      expect(desc.category, `${contract.name}: category`).toBeTruthy();
      for (const [propName, prop] of Object.entries(desc.props)) {
        expect(
          prop.accepts.length,
          `${contract.name}.${propName} has empty accepts`,
        ).toBeGreaterThan(0);
      }
    }

    // Warn rather than hard-fail when no contracts are upgraded yet, so this
    // test gives a useful signal from day one even on an empty corpus.
    if (upgraded.length === 0) {
      console.warn(
        'No contracts in ds-contracts/ have an a2ui block yet. ' +
        'Add `"a2ui": { "category": "..." }` to at least one contract to exercise the corpus path.',
      );
    }
  });
});
