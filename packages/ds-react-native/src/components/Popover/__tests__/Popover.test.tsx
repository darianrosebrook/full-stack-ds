// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Modal } from "react-native";
import { Popover } from "../Popover";
// @generated:end

// @generated:start tests
describe("Popover React Native", () => {
  it("opens the anchored surface from the trigger interaction", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Popover onOpenChange={(next: boolean) => seen.push(next)} content="Surface body" testID="subject">Anchor</Popover>);
  });
    const modalBefore = renderer!.root.findByType(Modal);
    expect(modalBefore.props.visible).toBe(false);
    const anchor = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    act(() => { anchor.props.onPress(); });
    expect(seen).toEqual([true]);
    const modal = renderer!.root.findByType(Modal);
    expect(modal.props.visible).toBe(true);
    expect(modal.props.transparent).toBe(true);
    // The surface container is absolutely positioned (anchored). Exact
    // measured coords come from native layout (measureInWindow), which
    // react-test-renderer does not run — so we assert the positioning
    // style is applied, not specific pixel values.
    const content = renderer!.root.findAll((node) => typeof node.type === "string" && Array.isArray(node.props.style) && node.props.style.some((entry: { position?: string }) => entry?.position === "absolute")).at(-1);
    expect(content).toBeTruthy();
    expect(renderer!.root.findAll((node) => typeof node.type === "string" && node.props.children === "Surface body").length).toBeGreaterThan(0);
  });
  it("dismisses on backdrop press", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Popover onOpenChange={(next: boolean) => seen.push(next)} content="Surface body" testID="subject">Anchor</Popover>);
  });
    const anchor = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    act(() => { anchor.props.onPress(); });
    const backdrop = renderer!.root.findAll((node) => typeof node.type === "string" && node.props.accessible === false && typeof node.props.onPress === "function").at(-1)!;
    act(() => { backdrop.props.onPress(); });
    expect(seen).toEqual([true, false]);
    expect(renderer!.root.findByType(Modal).props.visible).toBe(false);
  });
});
// @generated:end
