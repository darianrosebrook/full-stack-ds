/** Bounded experiment, not a CI gate or a baseline of accepted defects.
 * Run after codegen and token builds. Exit 0 means measurements completed;
 * inspect report.json for findings. Missing evidence/prerequisites fail closed.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';
import { chromium } from '@playwright/test';
import { listComponentContracts } from '../packages/ds-codegen/dist/contracts-fs.js';
import { mergeBoxModelDefaults, emitBoxModelBoundaryCss } from '../packages/ds-codegen/dist/box-model.js';
import { buildComponentIR, computeCssBlocks } from '../packages/ds-codegen/dist/ir.js';
import { emitCss, emitTokensCss } from '../packages/ds-codegen/dist/css.js';
import { createContractValidator } from '../packages/ds-codegen/dist/validate.js';
import { generateReactNativeComponentSource } from '../packages/ds-codegen/dist/frameworks/react-native/component-source.js';
import { createSwiftUIEmitter } from '../packages/ds-codegen/dist/frameworks/swift/swiftui/factory.js';
import { generateJetpackComposeComponentSource, generateJetpackComposeTokensFile } from '../packages/ds-codegen/dist/frameworks/jetpack-compose/component-source.js';
import { toFigmaComponentDescriptor } from '../packages/ds-codegen/dist/frameworks/figma/factory.js';
import { validateComponentTokenConsumption } from '../packages/ds-codegen/dist/validation/component-token-consumption.js';
import { validateContractSemantics } from '../packages/ds-codegen/dist/validation/semantic.js';
import { validateContractTokens } from '../packages/ds-codegen/dist/validation/tokens.js';
import { validateContractStyles, validateStylesSelectorCollisions } from '../packages/ds-codegen/dist/validation/styles.js';
import { validateContractFallbackCompleteness, validateContractFallbackStale } from '../packages/ds-codegen/dist/validation/fallback-completeness.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const targets = json(resolve(ROOT, 'fsds.targets.json')).targets;
const validator = createContractValidator({ contractsRoot: resolve(ROOT, 'packages/ds-contracts') });
const require = createRequire(import.meta.url);

export function withoutDesign(contract) {
  const result = structuredClone(contract);
  for (const block of Object.values(result.styles ?? {})) for (const entry of Object.values(block)) delete entry.design;
  return result;
}

export function compareArtifacts(before, after) {
  assert.deepEqual(Object.keys(before).sort(), Object.keys(after).sort(), 'Both runs must measure the same targets');
  assert.ok(Object.keys(before).length > 0, 'An empty target set is not evidence');
  return Object.fromEntries(Object.keys(before).map(target => [target, {
    before: hash(before[target]), after: hash(after[target]), equal: hash(before[target]) === hash(after[target]),
  }]));
}

function load(entry) {
  const contract = json(entry.absPath);
  assert.equal(validator.validateComponent(contract).ok, true, entry.name);
  for (const side of ['tokens', 'styles']) {
    const file = entry.absPath.replace('.contract.json', `.${side}.json`);
    contract[side] = existsSync(file) ? json(file) : {};
    const result = side === 'tokens' ? validator.validateTokens(contract[side]) : validator.validateStyles(contract[side]);
    assert.equal(result.ok, true, JSON.stringify(result));
  }
  contract.tokens = mergeBoxModelDefaults(contract.tokens, undefined, contract.morphology);
  return contract;
}

function nativeArtifacts(ir) {
  const admitted = id => targets.some(target => target.id === id && (!target.components || target.components.includes(ir.name)));
  const out = {};
  if (admitted('react-native')) out['react-native'] = generateReactNativeComponentSource(ir);
  if (admitted('swiftui')) out.swiftui = createSwiftUIEmitter().emitComponent(ir, {}).map(file => file.contents).join('\n');
  if (admitted('jetpack-compose')) out['jetpack-compose'] = {
    component: generateJetpackComposeComponentSource(ir), tokens: generateJetpackComposeTokensFile(ir),
  };
  return out;
}

// Execute real token resolution and generated style construction. Only the RN
// registration boundary is replaced; this is not a device/layout measurement.
function evaluateTs(source, dependencies = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === 'react' || name === 'react/jsx-runtime') return require(name);
    throw new Error(`Unmeasured dependency: ${name}`);
  } });
  return module.exports;
}

function nativeStyles(files, theme) {
  const runtime = evaluateTs(readFileSync(resolve(ROOT, 'packages/ds-react-native/src/tokens/index.tsx'), 'utf8'));
  const tokens = evaluateTs(files.tokensFile, { '../../tokens': runtime });
  const styles = evaluateTs(files.stylesFile, {
    '../../tokens': runtime, './Card.tokens': tokens, 'react-native': { StyleSheet: { create: value => value } },
  });
  return JSON.parse(JSON.stringify(styles.createCardStyles(theme)));
}

async function webFacts(page, contract, overrides = {}) {
  const ir = buildComponentIR(contract);
  const css = [emitBoxModelBoundaryCss(), emitTokensCss(ir), emitCss(ir)].join('\n').replace(/^@import[^;]+;/gm, '');
  await page.setContent('<div class="card" data-fsds-component="card" data-fsds-box><div class="card__media"></div><div id="overflow-witness"></div></div>');
  await page.addStyleTag({ content: css });
  await page.addStyleTag({ content: '.card {position:relative;width:200px;height:100px;padding:0;border:0;gap:0; margin:40px; --fsds-box-model-padding:0;} .card__media {width:60px;height:40px;} #overflow-witness {position:absolute;left:210px;top:20px;width:20px;height:20px;background:red;}' });
  await page.locator('.card').evaluate((element, values) => {
    for (const [name, value] of Object.entries(values)) element.style.setProperty(name, value);
  }, overrides);
  return page.locator('.card').evaluate(element => {
    const style = getComputedStyle(element), bounds = element.getBoundingClientRect();
    return { radius: style.borderTopLeftRadius, overflow: style.overflow,
      mediaRadius: getComputedStyle(element.querySelector('.card__media')).borderTopLeftRadius,
      outsideChildHit: document.elementFromPoint(bounds.left + 220, bounds.top + 30)?.id === 'overflow-witness' };
  });
}

export async function runRecon(out) {
  mkdirSync(out, { recursive: true });
  const write = (name, value) => writeFileSync(resolve(out, name), typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`);
  const entries = listComponentContracts(resolve(ROOT, 'packages/ds-contracts'));
  assert.ok(entries.length > 0, 'Missing corpus');
  const corpus = entries.map(load);
  const allContracts = new Map(corpus.map(contract => [contract.name, contract]));
  const erasure = corpus.map(contract => {
    const before = buildComponentIR(contract), after = buildComponentIR(withoutDesign(contract));
    const figmaBefore = toFigmaComponentDescriptor(before), figmaAfter = toFigmaComponentDescriptor(after);
    return { component: contract.name, bindings: before.designBindings.length,
      native: compareArtifacts(nativeArtifacts(before), nativeArtifacts(after)),
      defaultsEqual: hash(before.cssBlocks) === hash(after.cssBlocks),
      tokenScopesEqual: hash(before.tokenScopes) === hash(after.tokenScopes),
      figmaDefaultsEqual: hash(figmaBefore.css) === hash(figmaAfter.css) };
  });
  write('metadata-erasure.json', erasure);
  const card = corpus.find(contract => contract.name === 'Card');
  assert.ok(card, 'Missing Card witness');
  const files = nativeArtifacts(buildComponentIR(card));
  assert.ok(files.swiftui && files['react-native'], 'Card requires both native targets');
  write('Card.swift', files.swiftui);
  write('Card.styles.ts', files['react-native'].stylesFile);
  const browser = await chromium.launch({ headless: true });
  const chromiumVersion = browser.version();
  let web, clippingReport;
  try {
    const page = await browser.newPage();
    web = { defaults: await webFacts(page, card), erased: await webFacts(page, withoutDesign(card)),
      absolute: await webFacts(page, card, { '--fsds-card-size-radius-default': '20px' }),
      percentage: await webFacts(page, card, { '--fsds-card-size-radius-default': '50%' }),
      independentMedia: await webFacts(page, card, { '--fsds-card-design-media-shape-radius': '23px' }) };
    // Both inputs explicitly request all declared platforms. Changing only this
    // property must change clipping, or be rejected as unsupported.
    const clipping = {};
    for (const overflow of ['visible', 'hidden']) {
      const input = structuredClone(card);
      input.styles.root.overflow = { literal: overflow, platforms: ['web', 'ios', 'android'],
        design: { property: 'layout.overflow', slot: 'card.design.root.layout.overflow' } };
      const validation = validator.validateStyles(input.styles);
      assert.equal(validation.ok, true, JSON.stringify(validation));
      const validationIssues = [
        ...validateContractSemantics(input, { allContracts }), ...validateContractTokens(input),
        ...validateContractStyles(input), ...validateStylesSelectorCollisions(input),
        ...validateContractFallbackCompleteness(input), ...validateContractFallbackStale(input),
        ...validateComponentTokenConsumption(input, ROOT),
      ];
      clipping[overflow] = { schemaAccepted: validation.ok,
        validationIssues,
        platformCss: Object.fromEntries(['web', 'ios', 'android'].map(platformTarget => [platformTarget,
          computeCssBlocks(input, 'card', { platformTarget }).find(block => block.selector === '.card')?.declarations.overflow])),
        web: await webFacts(page, input), native: nativeArtifacts(buildComponentIR(input)),
        erasedNative: nativeArtifacts(buildComponentIR(withoutDesign(input))) };
    }
    assert.equal(clipping.visible.web.outsideChildHit, true, 'Visible clipping control must expose the outside child');
    assert.equal(clipping.hidden.web.outsideChildHit, false, 'Hidden clipping control must suppress the outside child');
    clippingReport = { visible: clipping.visible.web, hidden: clipping.hidden.web,
      schemaAccepted: ['visible', 'hidden'].every(value => clipping[value].schemaAccepted),
      validationIssues: { visible: clipping.visible.validationIssues, hidden: clipping.hidden.validationIssues },
      platformCss: { visible: clipping.visible.platformCss, hidden: clipping.hidden.platformCss },
      nativeComparison: compareArtifacts(clipping.visible.native, clipping.hidden.native),
      erasedNativeComparison: compareArtifacts(clipping.visible.erasedNative, clipping.hidden.erasedNative) };
    write('clipping.json', clippingReport);
    await page.screenshot({ path: resolve(out, 'clipping-hidden.png') });
  } finally { await browser.close(); }
  const rn = Object.fromEntries(['8px', '20px', '50%'].map(value => [value,
    nativeStyles(files['react-native'], { tokens: { 'card.size.radius.default': value } }).root.borderRadius]));
  rn.independentMedia = nativeStyles(files['react-native'], { tokens: { 'card.design.media.shape.radius': '23px' } });
  write('web.json', web);
  write('react-native.json', rn);

  // Compile the actual token runtime and freshly generated Card. The expression
  // below matches Card's suffix lookup and nil-coalescing at its radius consumer.
  assert.ok(files.swiftui.includes('private var radius: CGFloat { pxSlot("size.radius.default") ?? 0 }'), 'Re-adjudicate changed Swift radius consumer');
  write('main.swift', `import Foundation\nimport SwiftUI\nvar observations: [String: Any] = [:]\nfor value in ["8px", "20px", "50%"] {\n let tokens = resolveFsdsLayeredTokens(CardTokens.scopes, FsdsTheme(tokens: ["card.size.radius.default": .string(value)]), layers: ["root"])\n let raw = tokens.first { $0.key.hasSuffix("size.radius.default") }?.value\n observations[value] = ["parsed": raw?.px.map { Double($0) } as Any? ?? NSNull(), "consumerRadius": Double(raw?.px ?? 0)]\n}\nlet data = try JSONSerialization.data(withJSONObject: observations, options: [.sortedKeys])\nprint(String(data: data, encoding: .utf8)!)\n`);
  const executable = resolve(out, 'swift-radius-probe');
  execFileSync('swiftc', [resolve(ROOT, 'packages/ds-swiftui/Sources/DsSwiftUI/Tokens/FsdsTheme.swift'), resolve(out, 'Card.swift'), resolve(out, 'main.swift'), '-o', executable], { encoding: 'utf8', timeout: 120000 });
  const swift = JSON.parse(execFileSync(executable, { encoding: 'utf8' }));
  write('swift.json', swift);
  assert.deepEqual(web.defaults, web.erased, 'Metadata removal must retain the sampled Web defaults');
  assert.equal(web.absolute.radius, '20px', 'Absolute radius positive control');
  assert.equal(web.independentMedia.radius, web.defaults.radius, 'Part override must leave root unchanged');
  assert.equal(web.independentMedia.mediaRadius, '23px', 'Part override positive control');
  assert.equal(rn['20px'], 20, 'RN absolute radius positive control');
  assert.equal(swift['20px'].consumerRadius, 20, 'Swift absolute radius positive control');

  const nativeOnly = structuredClone(card);
  nativeOnly.styles.root['border-radius'].platforms = ['ios'];
  let nativeOnlyRejection = null;
  try { buildComponentIR(nativeOnly); } catch (error) { nativeOnlyRejection = error.message; }
  const tracked = execFileSync('git', ['ls-files', 'packages/ds-codegen/src', 'packages/ds-contracts', 'packages/ds-react-native/src/tokens', 'packages/ds-swiftui/Sources/DsSwiftUI/Tokens', 'fsds.targets.json'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n');
  const sourceHashes = Object.fromEntries(tracked.map(file => [file, hash(readFileSync(resolve(ROOT, file), 'utf8'))]));
  write('source-hashes.json', sourceHashes);
  const report = { schema: 'fsds.design-contract-recon.v1',
    head: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(),
    sourceHash: hash(sourceHashes), probeHash: hash(readFileSync(fileURLToPath(import.meta.url), 'utf8')),
    node: process.version, chromium: chromiumVersion,
    swiftCompiler: execFileSync('swiftc', ['--version'], { encoding: 'utf8' }).trim(),
    measuredComponents: erasure.length, measuredBindings: erasure.reduce((sum, row) => sum + row.bindings, 0),
    metadataChangedNative: erasure.filter(row => Object.values(row.native).some(result => !result.equal)).map(row => row.component),
    metadataChangedDefaults: erasure.filter(row => !row.defaultsEqual || !row.tokenScopesEqual || !row.figmaDefaultsEqual).map(row => row.component),
    nativeOnlyRejection, web, rnRadius: { absolute: rn['20px'], percentage: rn['50%'] }, swift,
    clipping: clippingReport,
    ceiling: 'Web facts use Chromium and generated CSS on a controlled DOM; RN observes style construction; Swift executes token resolution, not device geometry. Corpus erasure compares emitted bytes, not native behavior.',
  };
  write('report.json', report);
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outputArg = process.argv.find(arg => arg.startsWith('--out='));
  await runRecon(outputArg ? resolve(outputArg.slice(6)) : resolve(ROOT, 'tmp/design-contract-recon'));
}
