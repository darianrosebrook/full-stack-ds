// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Modal } from "react-native";
import { BackHandler } from "../../../test-react-native";
import { Dialog } from "../Dialog";
// @generated:end

// @generated:start tests
describe("Dialog React Native", () => {
  it("renders a native modal bound to the open channel", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Dialog open onOpenChange={(next: boolean) => seen.push(next)} testID="subject">Body</Dialog>);
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
    renderer = TestRenderer.create(<Dialog open={false} testID="subject">Body</Dialog>);
  });
    const modal = renderer!.root.findByType(Modal);
    expect(modal.props.visible).toBe(false);
  });
  it("renders in-tree with no Modal host and no overlay when modal is false", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Dialog open modal={false} testID="subject">Body</Dialog>);
  });
    expect(renderer!.root.findAllByType(Modal)).toHaveLength(0);
    expect(renderer!.root.findAll((node) => typeof node.type === "string" && node.props.children === "Body").length).toBeGreaterThan(0);
    expect(renderer!.root.findAll((node) => typeof node.type === "string" && node.props.accessible === false && typeof node.props.onPress === "function")).toHaveLength(0);
    act(() => { renderer!.unmount(); });
  });
  it("renders nothing in-tree while closed when modal is false", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Dialog open={false} modal={false} testID="subject">Body</Dialog>);
  });
    expect(renderer!.toJSON()).toBeNull();
    act(() => { renderer!.unmount(); });
  });
  it("keeps the Modal host and overlay when modal is omitted", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Dialog open testID="subject">Body</Dialog>);
  });
    expect(renderer!.root.findAllByType(Modal)).toHaveLength(1);
    expect(renderer!.root.findAll((node) => typeof node.type === "string" && node.props.accessible === false && typeof node.props.onPress === "function")).toHaveLength(1);
    act(() => { renderer!.unmount(); });
  });
  it("dismisses on hardware back only while open and non-modal", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Dialog open onOpenChange={(next: boolean) => seen.push(next)} testID="subject">Body</Dialog>);
  });
    expect(BackHandler.listenerCount()).toBe(0);
    act(() => { renderer!.update(<Dialog open modal={false} onOpenChange={(next: boolean) => seen.push(next)} testID="subject">Body</Dialog>); });
    let consumed = false;
    act(() => { consumed = BackHandler.press(); });
    expect(consumed).toBe(true);
    expect(seen).toEqual([false]);
    act(() => { renderer!.unmount(); });
    expect(BackHandler.listenerCount()).toBe(0);
  });
  it("hands hardware back to navigation when closeOnEscape is false", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Dialog open modal={false} closeOnEscape={false} onOpenChange={(next: boolean) => seen.push(next)} testID="subject">Body</Dialog>);
  });
    let consumed = true;
    act(() => { consumed = BackHandler.press(); });
    expect(consumed).toBe(false);
    expect(seen).toEqual([]);
    act(() => { renderer!.unmount(); });
  });
  it("dismisses on overlay press", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Dialog open onOpenChange={(next: boolean) => seen.push(next)} testID="subject">Body</Dialog>);
  });
    const overlay = renderer!.root.findAll((node) => node.props.accessible === false && typeof node.props.onPress === "function").at(-1)!;
    act(() => { overlay.props.onPress(); });
    expect(seen).toEqual([false]);
  });
});
// @generated:end
