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
