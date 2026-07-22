// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Modal } from "react-native";
import { Command } from "../Command";
// @generated:end

// @generated:start tests
describe("Command React Native", () => {
  it("renders a native modal bound to the open channel", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Command open onOpenChange={(next: boolean) => seen.push(next)} testID="subject">Body</Command>);
  });
    const modal = renderer!.root.findByType(Modal);
    expect(modal.props.visible).toBe(true);
    expect(modal.props.transparent).toBe(true);
    act(() => { modal.props.onRequestClose(); });
    expect(seen).toEqual([false]);
  });
  it("hides the modal when closed", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Command open={false} testID="subject">Body</Command>);
  });
    const modal = renderer!.root.findByType(Modal);
    expect(modal.props.visible).toBe(false);
  });
  it("dismisses on overlay press", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Command open onOpenChange={(next: boolean) => seen.push(next)} testID="subject">Body</Command>);
  });
    const overlay = renderer!.root.findAll((node) => node.props.accessible === false && typeof node.props.onPress === "function").at(-1)!;
    act(() => { overlay.props.onPress(); });
    expect(seen).toEqual([false]);
  });
});
// @generated:end
