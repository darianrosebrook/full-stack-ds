import { describe, expect, it } from 'vitest';
import { deriveA2UIDescriptor } from '../derive';
import type { ComponentContractLike } from '../derive';

// CODEGEN-PROP-TYPE-IR-PILOT-01, contract `a2ui-structured-source` (A4):
// A2UI derives the accepted value kind from a member's structured `propType`
// when present, and from the legacy TS-string `type` otherwise. Migrating a
// member from a TS string to the equivalent structured type must not change the
// projected agent-facing surface.

describe('A2UI derives accepts from structured propType (A4)', () => {
  it('maps each V1 kind to the right accepted value kind', () => {
    const c: ComponentContractLike = {
      name: 'Probe',
      a2ui: { category: 'action' },
      props: {
        designed: {
          members: [
            { name: 'label', propType: { kind: 'string' }, description: 'x' },
            { name: 'count', propType: { kind: 'number' }, description: 'x' },
            { name: 'open', propType: { kind: 'boolean' }, description: 'x' },
            { name: 'tone', propType: { kind: 'enum', values: ['info', 'warn'] }, description: 'x' },
            { name: 'body', propType: { kind: 'node', of: 'content' }, description: 'x' },
            { name: 'glyph', propType: { kind: 'node', of: 'icon' }, description: 'x' },
            { name: 'size', propType: { kind: 'ref', to: 'ProbeSize' }, description: 'x' },
          ],
        },
      },
      types: { ProbeSize: { kind: 'union', values: ['sm', 'lg'] } },
    };
    const d = deriveA2UIDescriptor(c);
    expect(d.props.label.accepts).toEqual(['string']);
    expect(d.props.count.accepts).toEqual(['number']);
    expect(d.props.open.accepts).toEqual(['boolean']);
    expect(d.props.tone.accepts).toEqual(['enum']);
    expect(d.props.tone.enum).toEqual(['info', 'warn']);
    expect(d.props.body.accepts).toEqual(['node-ref']);
    expect(d.props.glyph.accepts).toEqual(['icon-ref']);
    // a `ref` to a union alias resolves to an enum via the existing alias path
    expect(d.props.size.accepts).toEqual(['enum']);
    expect(d.props.size.enum).toEqual(['sm', 'lg']);
  });

  it('legacy styled members still derive from the TS-string type (fallback path)', () => {
    const c: ComponentContractLike = {
      name: 'Legacy',
      a2ui: { category: 'action' },
      props: {
        styled: {
          members: [
            { name: 'tone', type: "'info' | 'warn'", description: 'x' },
            { name: 'open', type: 'boolean', description: 'x' },
          ],
        },
      },
    };
    const d = deriveA2UIDescriptor(c);
    expect(d.props.tone.accepts).toEqual(['enum']);
    expect(d.props.tone.enum).toEqual(['info', 'warn']);
    expect(d.props.open.accepts).toEqual(['boolean']);
  });

  it('Button migration preserves its A2UI projection (structured == prior TS-string derivation)', () => {
    const types = { ButtonSize: { kind: 'union' as const, values: ['small', 'medium', 'large'] } };
    const styled: ComponentContractLike = {
      name: 'Button',
      a2ui: { category: 'action' },
      props: {
        styled: {
          members: [
            { name: 'size', type: 'ButtonSize', description: 'x' },
            { name: 'loading', type: 'boolean', description: 'x' },
            { name: 'ariaLabel', type: 'string', description: 'x' },
          ],
        },
      },
      types,
    };
    const designed: ComponentContractLike = {
      name: 'Button',
      a2ui: { category: 'action' },
      props: {
        designed: {
          members: [
            { name: 'size', propType: { kind: 'ref', to: 'ButtonSize' }, description: 'x' },
            { name: 'loading', propType: { kind: 'boolean' }, description: 'x' },
            { name: 'ariaLabel', propType: { kind: 'string' }, description: 'x' },
          ],
        },
      },
      types,
    };
    const a = deriveA2UIDescriptor(styled);
    const b = deriveA2UIDescriptor(designed);
    for (const k of ['size', 'loading', 'ariaLabel']) {
      expect(b.props[k].accepts).toEqual(a.props[k].accepts);
      expect(b.props[k].enum).toEqual(a.props[k].enum);
    }
  });
});

// CODEGEN-PROP-TYPE-IR-OBSERVED-TYPES-01 A4: callbacks are NOT agent capability.
// A2UI omits callback/void/promise props; collection/union/literal props project
// as their value kind (preserving the legacy TS-string projection).
describe('A2UI projection for V2 propType kinds (A4)', () => {
  it('omits callback props from the agent-settable surface, but keeps the channel event', () => {
    const c: ComponentContractLike = {
      name: 'ProbeV2',
      a2ui: { category: 'display' },
      props: {
        designed: {
          members: [
            { name: 'expanded', propType: { kind: 'boolean' }, description: 'Controlled expanded state.' },
            {
              name: 'onExpandedChange',
              propType: {
                kind: 'callback',
                params: [{ name: 'expanded', type: { kind: 'boolean' } }],
                returns: { kind: 'void' },
              },
              description: 'Called when expanded changes.',
            },
          ],
        },
      },
      channels: {
        expanded: { value: 'expanded', onChange: 'onExpandedChange', valueType: 'boolean' },
      },
    };
    const d = deriveA2UIDescriptor(c);
    // The callback is dropped from the prop capability surface...
    expect(d.props.onExpandedChange).toBeUndefined();
    expect(d.props.expanded.accepts).toEqual(['boolean']);
    // ...while the channel still projects the semantics as an event.
    expect(d.events.expanded).toBeDefined();
    expect(d.events.expanded.onChangeProp).toBe('onExpandedChange');
  });

  it('void and promise props are omitted; array/union/literal project as their value kind', () => {
    const c: ComponentContractLike = {
      name: 'ProbeV2Kinds',
      a2ui: { category: 'display' },
      props: {
        designed: {
          members: [
            { name: 'tags', propType: { kind: 'array', items: { kind: 'string' } }, description: 'String tags.' },
            { name: 'options', propType: { kind: 'array', items: { kind: 'ref', to: 'SelectOption' } }, description: 'Option objects.' },
            {
              name: 'value',
              propType: { kind: 'union', of: [{ kind: 'string' }, { kind: 'array', items: { kind: 'string' } }] },
              description: 'Single or multiple value.',
            },
            { name: 'mode', propType: { kind: 'literal', value: 'auto' }, description: 'Fixed literal.' },
            { name: 'reset', propType: { kind: 'void' }, description: 'Void marker.' },
            { name: 'load', propType: { kind: 'promise', of: { kind: 'void' } }, description: 'Async marker.' },
          ],
        },
      },
    };
    const d = deriveA2UIDescriptor(c);
    expect(d.props.tags.accepts).toEqual(['string']); // string[] -> element kind
    expect(d.props.options.accepts).toEqual(['string']); // SelectOption[] -> unknown ref -> scalar
    expect(d.props.value.accepts).toEqual(['string']); // string | string[] -> merged scalar
    expect(d.props.mode.accepts).toEqual(['enum']); // string literal -> enum-of-one
    expect(d.props.mode.enum).toEqual(['auto']);
    expect(d.props.reset).toBeUndefined(); // void omitted
    expect(d.props.load).toBeUndefined(); // promise omitted
  });
});
