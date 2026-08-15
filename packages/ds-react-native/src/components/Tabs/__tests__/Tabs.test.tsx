// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Tabs, TabsList, TabsTab, TabsPanel } from "../Tabs";
// @generated:end

// @generated:start tests
describe("Tabs React Native compound selection", () => {
  it("pressing a tab drives onValueChange and flips accessibilityState.selected", () => {
    const changes: string[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Tabs defaultValue="a" onValueChange={(value: string) => changes.push(value)}>
      <TabsList>
        <TabsTab value="a" testID="tab-a">A</TabsTab>
        <TabsTab value="b" testID="tab-b">B</TabsTab>
      </TabsList>
      <TabsPanel value="a" testID="panel-a">Content A</TabsPanel>
      <TabsPanel value="b" testID="panel-b">Content B</TabsPanel>
</Tabs>,);
  });
    const tabB = renderer!.root.findAllByProps({ testID: "tab-b" }).at(-1)!;
    expect(tabB.props.accessibilityRole).toBe("tab");
    expect(tabB.props.accessibilityState).toMatchObject({ selected: false });
    act(() => {
      tabB.props.onPress();
    });
    expect(changes).toEqual(["b"]);
    expect(tabB.props.accessibilityState).toMatchObject({ selected: true });
    expect(renderer!.root.findAll((node) => String(node.type) === "View" && node.props.testID === "panel-b").length).toBe(1);
    expect(renderer!.root.findAll((node) => String(node.type) === "View" && node.props.testID === "panel-a").length).toBe(0);
  });

  it("controlled value overrides internal selection state", () => {
    const changes: string[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Tabs value="a" onValueChange={(value: string) => changes.push(value)}>
      <TabsList>
        <TabsTab value="a" testID="tab-a">A</TabsTab>
        <TabsTab value="b" testID="tab-b">B</TabsTab>
      </TabsList>
      <TabsPanel value="a" testID="panel-a">Content A</TabsPanel>
      <TabsPanel value="b" testID="panel-b">Content B</TabsPanel>
</Tabs>,);
  });
    const tabB = renderer!.root.findAllByProps({ testID: "tab-b" }).at(-1)!;
    act(() => {
      tabB.props.onPress();
    });
    expect(changes).toEqual(["b"]);
    expect(tabB.props.accessibilityState).toMatchObject({ selected: false });
    expect(renderer!.root.findAll((node) => String(node.type) === "View" && node.props.testID === "panel-b").length).toBe(0);
    expect(renderer!.root.findAll((node) => String(node.type) === "View" && node.props.testID === "panel-a").length).toBe(1);
  });

  it("throws when a tab renders outside the compound provider", () => {
    expect(() => {
      act(() => {
        TestRenderer.create(<TabsTab value="a">A</TabsTab>);
      });
    }).toThrow(/compound component used outside/);
  });
});
// @generated:end
