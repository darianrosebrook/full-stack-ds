// Hand-authored runtime proof for ARCH-COMPOSER-SLOT-PROJECTION-001 on RN.
// The GENERATED Field.test.tsx is a type-surface smoke test only — it does not
// render. This test renders the component and asserts that each named slot's
// content lands in its own region and that NO content is duplicated across
// regions (the original duplicate-children / double-region defect). It lives
// outside the generated `<Name>.test.tsx` path so codegen never overwrites it.
import { describe, it, expect } from "vitest";
import TestRenderer from "react-test-renderer";
import { Text } from "react-native";
import { Field } from "../Field";

function renderField() {
  let tree: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <Field
        name="email"
        slots={{
          label: <Text>Email address</Text>,
          control: <Text testID="the-control">control-input</Text>,
          help: <Text>Use a work email</Text>,
        }}
      />,
    );
  });
  return tree!;
}

function textsEqual(tree: TestRenderer.ReactTestRenderer, value: string): number {
  return tree.root.findAll(
    (node) => node.children.length === 1 && node.children[0] === value,
  ).length;
}

describe("Field RN — named-slot projection (runtime)", () => {
  it("renders each named slot's content exactly once", () => {
    const tree = renderField();
    // Each slot's content appears exactly once — not sprayed into every region.
    expect(textsEqual(tree, "Email address")).toBe(1);
    expect(textsEqual(tree, "control-input")).toBe(1);
    expect(textsEqual(tree, "Use a work email")).toBe(1);
  });

  it("routes the control slot to a single host (no double-region)", () => {
    const tree = renderField();
    // Count HOST instances only (string `type`): react-test-renderer's findAll
    // also matches the composite element passed as the slot prop, so a naive
    // testID match double-counts composite+host. The host is the real render.
    // The duplicate-children defect would surface the control host twice
    // (control region + label region both got the same children).
    const controlHosts = tree.root.findAll(
      (n) => n.props.testID === "the-control" && typeof n.type === "string",
    );
    expect(controlHosts).toHaveLength(1);
  });

  it("omits unprovided slots without crashing", () => {
    let tree: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <Field name="x" slots={{ control: <Text>only-control</Text> }} />,
      );
    });
    expect(textsEqual(tree!, "only-control")).toBe(1);
    // No error slot content provided → its region renders empty, not duplicated.
    expect(textsEqual(tree!, "only-control")).not.toBe(2);
  });
});
