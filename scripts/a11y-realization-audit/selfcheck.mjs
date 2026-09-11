#!/usr/bin/env node
/**
 * Self-check for the a11y-realization classifier (runs before audit.mjs in
 * the npm script, mirroring the behavior rail's realization.test.mjs).
 *
 * Pins the classifier's load-bearing behaviors with inline fixtures so a
 * classifier regression fails HERE, with a named assertion, before the audit
 * produces a misleading matrix. Each assertion states the behavior pinned.
 */
import {
  atomicKeys,
  classify,
  deriveObligations,
  relationshipTokens,
} from "./audit.mjs";

let failures = 0;
function check(name, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures += 1;
    console.error(`FAIL ${name}\n  expected ${e}\n  actual   ${a}`);
  }
}

// -- key parsing --------------------------------------------------------------
// "Enter|Space" is two atomic keys; Shift+Tab collapses to Tab (the trap owns both).
check("atomicKeys splits alternatives", atomicKeys("Enter|Space"), ["Enter", "Space"]);
check("atomicKeys folds Shift+Tab", atomicKeys("Shift+Tab"), ["Tab"]);

// -- obligation derivation ----------------------------------------------------
const derived = deriveObligations([
  {
    name: "Fixture",
    contract: {
      relationships: [
        { from: "label", to: "control", attribute: "for" },
        { from: "label", to: "control", attribute: "for" }, // duplicate — deduped
      ],
      a11y: { keyboard: [{ key: "ArrowDown" }] },
      focus: { strategy: "roving" },
    },
  },
]);
check(
  "derives relationship+keyboard+focus, deduped",
  derived,
  [
    {
      component: "Fixture",
      class: "relationship",
      key: "for",
      from: "label",
      to: "control",
      cssPrefix: "fixture",
    },
    { component: "Fixture", class: "keyboard", key: "ArrowDown" },
    { component: "Fixture", class: "focus", key: "roving" },
  ],
);

// -- relationship surfaces ----------------------------------------------------
// web-dom: `for` has framework spellings; other attrs match their own name.
check(
  "web-dom for tokens include htmlFor",
  relationshipTokens("web-dom", "for").includes("htmlFor"),
  true,
);
check(
  "web-dom default token is the attribute",
  relationshipTokens("web-dom", "aria-labelledby"),
  ["aria-labelledby"],
);
// native-mobile: labelledby maps to the RN prop; describedby has NO surface.
check(
  "native-mobile labelledby maps to accessibilityLabelledBy",
  relationshipTokens("native-mobile", "aria-labelledby").includes("accessibilityLabelledBy"),
  true,
);
check("native-mobile describedby excluded", relationshipTokens("native-mobile", "aria-describedby"), null);

// -- classification -----------------------------------------------------------
const rel = {
  component: "X",
  class: "relationship",
  key: "aria-labelledby",
  from: "dialog",
  to: "title",
  cssPrefix: "x",
};
check(
  "relationship realized only when the owned attribute points at the owned target id",
  classify(
    rel,
    "web-dom",
    '<section class="x__dialog" aria-labelledby="x-title"><h2 class="x__title" id="x-title">',
    new Set(),
  ).verdict,
  "realized",
);
check(
  "relationship unrealized when attribute absent",
  classify(
    rel,
    "web-dom",
    '<section class="x__dialog"><h2 class="x__title" id="x-title">',
    new Set(),
  ).verdict,
  "unrealized",
);
check(
  "relationship unrealized when the attribute exists on the wrong part",
  classify(
    rel,
    "web-dom",
    '<div class="x__root" aria-labelledby="x-title"><section class="x__dialog"><h2 class="x__title" id="x-title">',
    new Set(),
  ).verdict,
  "unrealized",
);
check(
  "relationship unrealized when the target id is missing",
  classify(
    rel,
    "web-dom",
    '<section class="x__dialog" aria-labelledby="x-title"><h2 class="x__title">',
    new Set(),
  ).verdict,
  "unrealized",
);
check(
  "relationship unrealized when the IDREF points at a different live id",
  classify(
    rel,
    "web-dom",
    '<section class="x__dialog" aria-labelledby="x-icon"><span class="x__icon" id="x-icon"><h2 class="x__title" id="x-title">',
    new Set(),
  ).verdict,
  "unrealized",
);
// Cross-primitive scan (FEAT-A11Y-RELATIONSHIP-STRAGGLERS-01): a relationship
// attribute wired in a directly-imported same-package primitive counts as
// realized (Svelte anchored-surface sets aria-controls/-expanded/-describedby
// in the primitive, not inline in the component).
check(
  "relationship realized via a directly-imported primitive body",
  classify(
    {
      component: "X",
      class: "relationship",
      key: "aria-controls",
      from: "trigger",
      to: "panel",
      cssPrefix: "x",
    },
    "web-dom",
    {
      own: '<button class="x__trigger"><section class="x__panel" id={panelId}>',
      relationship:
        '<button class="x__trigger"><section class="x__panel" id={panelId}>ariaProps["aria-controls"] = panelId',
    },
    new Set(),
  ).verdict,
  "realized",
);
// Compound emitters often place parts in separate files/classes and reflect
// attributes onto a custom-element host. The file/symbol boundary is the
// carrier in that case; a sibling class containing the same token must not
// satisfy the obligation.
const compoundBundle = {
  own: [
    'export class XTriggerElement { apply() { this.setAttribute("aria-labelledby", this.ctx.titleId); } }',
    'export class XTitleElement { apply() { this.setAttribute("id", this.ctx.titleId); } }',
  ].join("\n"),
  ownFiles: [
    {
      path: "/fixture/X.ts",
      source: [
        'export class XTriggerElement { apply() { this.setAttribute("aria-labelledby", this.ctx.titleId); } }',
        'export class XTitleElement { apply() { this.setAttribute("id", this.ctx.titleId); } }',
      ].join("\n"),
    },
  ],
};
compoundBundle.relationship = compoundBundle.own;
check(
  "programmatic compound host binding is owned by its part symbol",
  classify(
    { ...rel, from: "trigger" },
    "web-dom",
    compoundBundle,
    new Set(),
  ).verdict,
  "realized",
);
check(
  "programmatic binding on a sibling part cannot satisfy the declared carrier",
  classify(
    { ...rel, from: "root" },
    "web-dom",
    compoundBundle,
    new Set(),
  ).verdict,
  "unrealized",
);
check(
  "dynamic IDREF cannot claim the wrong endpoint merely because another part owns the id",
  classify(
    {
      component: "X",
      class: "relationship",
      key: "aria-labelledby",
      from: "trigger",
      to: "root",
      cssPrefix: "x",
    },
    "web-dom",
    compoundBundle,
    new Set(),
  ).verdict,
  "unrealized",
);
const angularGetterFixture = `<section class="x__dialog" [attr.aria-labelledby]="modalAriaLabelledby">
  <h2 class="x__title" [attr.id]="instanceId + '-title'">
</section>
get modalAriaLabelledby(): string {
  return this.instanceId + '-title';
}
get modalAriaDescribedby(): string {
  return this.instanceId + '-body';
}`;
check(
  "Angular carrier binding follows its exact IDREF getter",
  classify(rel, "web-dom", angularGetterFixture, new Set()).verdict,
  "realized",
);
check(
  "Angular carrier binding cannot borrow a target token from a sibling getter",
  classify(
    rel,
    "web-dom",
    angularGetterFixture.replace(
      '[attr.aria-labelledby]="modalAriaLabelledby"',
      '[attr.aria-labelledby]="modalAriaDescribedby"',
    ),
    new Set(),
  ).verdict,
  "unrealized",
);
const angularDecoratorBundle = {
  own: [
    "@Component({",
    '  template: `<div class="x" [attr.aria-labelledby]="instanceId + \'-title\'">',
    '    <h2 class="x__title" [attr.id]="instanceId + \'-title\'"></h2>',
    "  </div>`,",
    "})",
    "export class XComponent {}",
    "",
    "@Component({",
    '  template: `<span class="x__other" aria-labelledby="wrong"></span>`,',
    "})",
    "export class XOtherComponent {}",
  ].join("\n"),
  ownFiles: [],
};
angularDecoratorBundle.relationship = angularDecoratorBundle.own;
check(
  "Angular root carrier includes its own component decorator template",
  classify(
    { ...rel, from: "root", cssPrefix: "x" },
    "web-dom",
    angularDecoratorBundle,
    new Set(),
  ).verdict,
  "realized",
);
// Falsification: remove the primitive wiring and it reads unrealized again —
// the scan is not a blanket pass for anything that imports a primitive.
check(
  "relationship unrealized when neither own nor primitive carries the token",
  classify(
    {
      component: "X",
      class: "relationship",
      key: "aria-controls",
      from: "trigger",
      to: "panel",
      cssPrefix: "x",
    },
    "web-dom",
    {
      own: '<button class="x__trigger">',
      relationship: '<button class="x__trigger">/* no idref wiring */',
    },
    new Set(),
  ).verdict,
  "unrealized",
);
// The primitive-extended body must NOT leak into keyboard/focus: a shared
// roving/trap primitive's keydown tokens are visible ONLY through `own`, never
// through the relationship-scoped extension — otherwise every importer would
// falsely realize composite-keyboard obligations.
check(
  "keyboard NOT realized by a token present only in the primitive extension",
  classify(
    { component: "X", class: "keyboard", key: "ArrowDown" },
    "web-dom",
    { own: "<div>", relationship: "<div>onKeyDown={h}" },
    new Set(),
  ).verdict,
  "unrealized",
);
check(
  "native-mobile keyboard obligations are excluded, not unrealized",
  classify({ component: "X", class: "keyboard", key: "Enter" }, "native-mobile", "", new Set())
    .verdict,
  "excluded",
);

const kbEnterSpace = { component: "X", class: "keyboard", key: "Enter|Space" };
check(
  "Enter|Space realized natively on a contract button",
  classify(kbEnterSpace, "web-dom", "", new Set(["button"])).verdict,
  "realized",
);
check(
  "Enter|Space realized natively via native element in emitted source",
  classify(kbEnterSpace, "web-dom", "<button type=\"button\">", new Set()).verdict,
  "realized",
);
// A native button does not supply arrow navigation.
const choiceContract = {
  compositeControl: { part: "choice", channel: "selected", interactionModel: "collection-selection", commit: "change" },
  channels: { selected: { valueType: "string" } },
  props: { designed: { members: [{ name: "group", required: true }] } },
  anatomy: { dom: { tag: "fieldset", children: [{
    tag: "label", iterate: { kind: "array" }, children: [{
      tag: "input", part: "choice", attrs: { type: "radio" }, bindings: { name: "prop:group" },
    }],
  }] } },
  a11y: { keyboard: [{ key: "ArrowLeft|ArrowRight|ArrowUp|ArrowDown" }] },
};
const choiceObligation = contract => deriveObligations([{ name: "ChoiceSet", contract }])[0];
const radioObligation = choiceObligation(choiceContract);
for (const [family, binding] of [
  ["react", "name={group}"],
  ["vue", ':name="props.group"'],
  ["svelte", "name={group}"],
  ["lit", "name=${ifDefined(this.group)}"],
  ["angular", '[name]="group"'],
]) {
  check(`${family}: native radio carrier owns arrow keys`,
    classify(radioObligation, "web-dom", `<input class="choice-set__choice" type="radio" ${binding}>`, new Set()).via,
    "native radio carrier");
}
for (const [reason, source] of [
  ["role without native input", '<div class="choice-set__choice" role="radio" name={group}>'],
  ["wrong native type", '<input class="choice-set__choice" type="checkbox" name={group}>'],
  ["missing group name", '<input class="choice-set__choice" type="radio">'],
  ["per-item group name", '<input class="choice-set__choice" type="radio" name={item.group}>'],
  ["another carrier", '<input class="unrelated__choice" type="radio" name={group}>'],
  ["sibling name", '<input class="choice-set__choice" type="radio"><div name={group}>'],
]) {
  check(`${reason} cannot satisfy native radio arrows`,
    classify(radioObligation, "web-dom", source, new Set(["input"])).verdict,
    "unrealized");
}
for (const [reason, mutate] of [
  ["optional group", contract => { contract.props.designed.members[0].required = false; }],
  ["unrepeated input", contract => { delete contract.anatomy.dom.children[0].iterate; }],
  ["per-item group", contract => { contract.anatomy.dom.children[0].children[0].bindings.name = "iter:item.group"; }],
]) {
  const contract = structuredClone(choiceContract);
  mutate(contract);
  check(`${reason} does not derive a native radio carrier`, choiceObligation(contract).nativeRadio, undefined);
}
check(
  "ArrowDown NOT satisfied by native button",
  classify({ component: "X", class: "keyboard", key: "ArrowDown" }, "web-dom", "<button>", new Set(["button"]))
    .verdict,
  "unrealized",
);
check(
  "ArrowDown realized by explicit keydown handler",
  classify({ component: "X", class: "keyboard", key: "ArrowDown" }, "web-dom", "onKeyDown={h}", new Set())
    .verdict,
  "realized",
);
check(
  "Escape realized by dismissal primitive import",
  classify({ component: "X", class: "keyboard", key: "Escape" }, "web-dom", "import { useDismissal }", new Set())
    .verdict,
  "realized",
);
check(
  "Escape NOT realized by focus-trap alone... unless trap present counts only for Tab",
  classify({ component: "X", class: "keyboard", key: "Escape" }, "web-dom", "plain source", new Set())
    .verdict,
  "unrealized",
);

// focus strategies
check(
  "trap realized by focus-trap primitive",
  classify({ component: "X", class: "focus", key: "trap" }, "web-dom", "useFocusTrap(", new Set()).verdict,
  "realized",
);
check(
  "roving demands explicit key handling (never native)",
  classify({ component: "X", class: "focus", key: "roving" }, "web-dom", "<button>", new Set(["button"]))
    .verdict,
  "unrealized",
);

if (failures > 0) {
  console.error(`\n[a11y-rail selfcheck] ${failures} assertion(s) failed`);
  process.exit(1);
}
console.log("[a11y-rail selfcheck] all classifier assertions pass");
