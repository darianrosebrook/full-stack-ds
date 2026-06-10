// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Button } from "../Button";
import { FsdsThemeProvider } from "../../../tokens";
// @generated:end

// @generated:start tests
describe("Button React Native", () => {
  it("renders button semantics and press passthrough", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Button onPress={() => undefined} testID="subject">Save</Button>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("button");
    expect(subject.props.onPress).toEqual(expect.any(Function));
    expect(renderer!.root.findAll((node) => node.props.children === "Save").length).toBeGreaterThan(0);
  });
  it("realizes distinct variant backgrounds from token scopes", () => {
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = TestRenderer.create(
        <FsdsThemeProvider value={{"tokens":{"semantic.color.action.background.primary.default":"#101010","semantic.color.action.background.secondary.default":"#202020"}}}>
          <Button variant="primary" testID="variant-a">A</Button>
          <Button variant="secondary" testID="variant-b">B</Button>
        </FsdsThemeProvider>,
      );
    });
    const flatten = (style: unknown): Record<string, unknown> =>
      Object.assign({}, ...(Array.isArray(style) ? style.flat(Infinity) : [style]).filter(Boolean));
    const variantA = renderer!.root.findAllByProps({ testID: "variant-a" }).at(-1)!;
    const variantB = renderer!.root.findAllByProps({ testID: "variant-b" }).at(-1)!;
    expect(flatten(variantA.props.style).backgroundColor).toBe("#101010");
    expect(flatten(variantB.props.style).backgroundColor).toBe("#202020");
  });
});
// @generated:end
