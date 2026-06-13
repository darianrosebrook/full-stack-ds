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
    renderer = TestRenderer.create(<Button onClick={() => undefined} testID="subject">Save</Button>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("togglebutton");
    expect(subject.props.onPress).toEqual(expect.any(Function));
    expect(renderer!.root.findAll((node) => node.props.children === "Save").length).toBeGreaterThan(0);
  });
  it("maps aria-pressed to React Native toggle-button accessibility state", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Button ariaPressed={true} testID="subject">Save</Button>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("togglebutton");
    expect(subject.props.accessibilityState).toMatchObject({ selected: true });
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
    const restStyle = (node: { props: { style?: unknown } }): unknown =>
      typeof node.props.style === "function"
        ? (node.props.style as (state: { pressed: boolean }) => unknown)({ pressed: false })
        : node.props.style;
    const variantA = renderer!.root.findAllByProps({ testID: "variant-a" }).at(-1)!;
    const variantB = renderer!.root.findAllByProps({ testID: "variant-b" }).at(-1)!;
    expect(flatten(restStyle(variantA)).backgroundColor).toBe("#101010");
    expect(flatten(restStyle(variantB)).backgroundColor).toBe("#202020");
  });
  it("realizes pressed state styles via the style function", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Button testID="subject">Save</Button>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(typeof subject.props.style).toBe("function");
    const styleOf = subject.props.style as (state: { pressed: boolean }) => unknown;
    const flatten = (style: unknown): Record<string, unknown> =>
      Object.assign({}, ...(Array.isArray(style) ? style.flat(Infinity) : [style]).filter(Boolean));
    expect(flatten(styleOf({ pressed: true })).backgroundColor).toBe("#cecece");
    expect(flatten(styleOf({ pressed: false })).backgroundColor).toBe("#d9292b");
  });
});
// @generated:end
