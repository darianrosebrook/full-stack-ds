import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withoutDesign, compareArtifacts } from './design-contract-recon.mjs';

test('the causal intervention removes only design metadata and leaves its input untouched', () => {
  const source = { name: 'Card', tokens: { radius: { literal: '8px' } }, styles: { media: {
    'border-radius': { resolvesTo: 'radius', fallback: '8px', platforms: ['web', 'ios'],
      design: { property: 'shape.radius', slot: 'card.design.media.shape.radius' } },
    overflow: { literal: 'visible', platforms: ['web'] },
  } } };
  const original = structuredClone(source);
  const expected = structuredClone(source);
  delete expected.styles.media['border-radius'].design;
  assert.deepEqual(withoutDesign(source), expected);
  assert.deepEqual(source, original);
});

test('artifact comparison detects a changed consumer when its token data is unchanged', () => {
  const before = { native: { tokens: 'radius=8', style: 'radius=read(radius)' } };
  const after = { native: { tokens: 'radius=8', style: 'radius=0' } };
  const observation = compareArtifacts(before, after).native;
  assert.equal(observation.equal, false);
  assert.notEqual(observation.before, observation.after);
  assert.equal(compareArtifacts(before, structuredClone(before)).native.equal, true);
});

test('missing targets and empty evidence cannot establish unchanged output', () => {
  assert.throws(() => compareArtifacts({ native: 'a' }, {}), /same targets/);
  assert.throws(() => compareArtifacts({}, {}), /empty target set/);
});
