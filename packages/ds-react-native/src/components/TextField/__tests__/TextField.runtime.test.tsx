// Hand-authored runtime proof for ARCH-COMPOSER-SLOT-PROJECTION-001 on the
// second composer shape: TextField OWNS its native input (a bound `field` part)
// while projecting label/description/error as named slots. The generated
// TextField.test.tsx is a type-surface smoke test only. Lives outside the
// generated `<Name>.test.tsx` path so codegen never overwrites it.
import { describe, it, expect } from "vitest";
import TestRenderer from "react-test-renderer";
import { Text, TextInput } from "react-native";
import { TextField } from "../TextField";

function textsEqual(tree: TestRenderer.ReactTestRenderer, value: string): number {
  return tree.root.findAll(
    (node) => node.children.length === 1 && node.children[0] === value,
  ).length;
}

describe("TextField RN — named-slot projection over an owned input (runtime)", () => {
  it("projects each named slot once and still renders its own input", () => {
    let tree: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      tree = TestRenderer.create(
        <TextField
          name="email"
          slots={{
            label: <Text>Email address</Text>,
            description: <Text>We never share it</Text>,
            error: <Text>Required</Text>,
          }}
        />,
      );
    });
    // Each slot's content appears exactly once — not sprayed into every region.
    expect(textsEqual(tree!, "Email address")).toBe(1);
    expect(textsEqual(tree!, "We never share it")).toBe(1);
    expect(textsEqual(tree!, "Required")).toBe(1);
    // The composer still renders its OWN bound input (host instance), proving
    // the input is a real `field` part, not a slot.
    const inputs = tree!.root.findAllByType(TextInput);
    expect(inputs.length).toBe(1);
  });

  it("renders the input even when no slots are provided", () => {
    let tree: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      tree = TestRenderer.create(<TextField name="bare" />);
    });
    expect(tree!.root.findAllByType(TextInput).length).toBe(1);
  });
});
