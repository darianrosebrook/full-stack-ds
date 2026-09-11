import { expect, it, vi } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { RadioGroup } from "../RadioGroup";

it("exposes labeled native press targets and updates one checked choice", () => {
  let renderer: ReactTestRenderer;
  const change = vi.fn();
  act(() => {
    renderer = TestRenderer.create(<RadioGroup name="colors" defaultValue="red" onChange={change} options={[
      { value: "red", label: "Red" }, { value: "blue", label: "Blue" },
      { value: "grey", label: "Unavailable", disabled: true },
    ]} />);
  });
  const radio = (label: string) => renderer!.root.findAllByProps({ accessibilityRole: "radio", accessibilityLabel: label }).at(-1)!;
  expect(radio("Red").props.accessibilityState.checked).toBe(true);
  expect(radio("Unavailable").props.disabled).toBe(true);
  expect(JSON.stringify(renderer!.toJSON())).toContain("○ ");
  act(() => radio("Blue").props.onPress());
  expect(change).toHaveBeenCalledWith("blue");
  expect(radio("Blue").props.accessibilityState.checked).toBe(true);
  expect(radio("Red").props.accessibilityState.checked).toBe(false);
  expect(JSON.stringify(renderer!.toJSON())).toContain("◉ ");
  act(() => renderer!.unmount());
});
