// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Modal } from "react-native";
import { Toast } from "../Toast";
// @generated:end

// @generated:start tests
describe("Toast React Native", () => {
  it("renders a non-blocking live region without a modal host", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Toast open testID="subject">Body</Toast>);
  });
    expect(renderer!.root.findAllByType(Modal)).toHaveLength(0);
    expect(renderer!.root.findAll((node) => node.props.accessibilityLiveRegion !== undefined).length).toBeGreaterThan(0);
    expect(renderer!.root.findAll((node) => typeof node.type === "string" && node.props.children === "Body").length).toBeGreaterThan(0);
  });
  it("hides content when the open channel is false", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Toast open={false} testID="subject">Body</Toast>);
  });
    expect(renderer!.root.findAll((node) => typeof node.type === "string" && node.props.children === "Body")).toHaveLength(0);
  });
});
// @generated:end
