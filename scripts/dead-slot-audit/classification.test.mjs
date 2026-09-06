import assert from 'node:assert/strict';
import { auditWebArtifact, auditNativeDefinitions, auditComposeDefinitions } from './audit.mjs';
const slot = { slot: 'test.width', cssVar: '--fsds-test-width', web: true };
assert.deepEqual(auditWebArtifact([slot], ['.test { width: var(--fsds-test-width, 8px); --fsds-test-width: 9px; }']), []);
assert.deepEqual(auditWebArtifact([slot], ['.test { --fsds-test-width: 9px; }']), [
  'Missing property consumer: test.width', 'Unconsumed emitted declaration: --fsds-test-width',
]);
assert.deepEqual(auditWebArtifact([], ['.test { --a: var(--b); --b: 3px; }']), [
  'Unconsumed emitted declaration: --a', 'Unconsumed emitted declaration: --b',
]);
assert.deepEqual(auditWebArtifact([slot], ['.test { --fsds-test-width: 9px; --alias: var(--fsds-test-width); }', '.shared { width: var(--alias); }']), []);
assert.deepEqual(auditWebArtifact([{ ...slot, web: false }], ['.test { color: red; }']), []);
assert.deepEqual(auditWebArtifact([slot], ['/* width: var(--fsds-test-width) */ .test { content: "var(--fsds-test-width)"; }']), ['Missing property consumer: test.width']);
assert.ok(auditWebArtifact([], ['.test { --a: var(--b); --b: var(--a); width: var(--a); }']).some(issue => issue.startsWith('Cyclic declaration:')));
console.log('Component token artifact rejection checks passed.');

assert.deepEqual(auditNativeDefinitions([{values:[{name:'a'}]}],new Set(['a'])),[]);
assert.deepEqual(auditNativeDefinitions([{values:[{name:'a'}]}],new Set(['b'])),['Unconsumed emitted declaration: b','Missing consumed definition: a']);
assert.deepEqual(auditComposeDefinitions([{scope:'checked', values:[{name:'color'}]}], [{scope:'root', key:'color'}]), [
  'Unconsumed emitted declaration: root/color', 'Missing consumed definition: checked/color',
]);
assert.deepEqual(auditComposeDefinitions([{scope:'checked', values:[{name:'color'}]}], [{scope:'checked', key:'color'}]), []);
