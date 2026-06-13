// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Chip } from "../Chip";
// @generated:end

// @generated:start tests
describe("Chip React Native", () => {
  it("renders button semantics and press passthrough", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Chip onPress={() => undefined} testID="subject">Save</Chip>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("togglebutton");
    expect(subject.props.onPress).toEqual(expect.any(Function));
    expect(renderer!.root.findAll((node) => node.props.children === "Save").length).toBeGreaterThan(0);
  });
  it("maps aria-pressed to React Native toggle-button accessibility state", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Chip ariaPressed={true} testID="subject">Save</Chip>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("togglebutton");
    expect(subject.props.accessibilityState).toMatchObject({ selected: true });
  });
  it("realizes pressed state styles via the style function", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Chip testID="subject">Save</Chip>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(typeof subject.props.style).toBe("function");
    const styleOf = subject.props.style as (state: { pressed: boolean }) => unknown;
    const flatten = (style: unknown): Record<string, unknown> =>
      Object.assign({}, ...(Array.isArray(style) ? style.flat(Infinity) : [style]).filter(Boolean));
    expect(flatten(styleOf({ pressed: true })).backgroundColor).toBe("#cecece");
    expect(flatten(styleOf({ pressed: false })).backgroundColor).toBe("#fafafa");
  });
});
// @generated:end
