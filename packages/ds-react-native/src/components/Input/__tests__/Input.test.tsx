// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Input } from "../Input";
// @generated:end

// @generated:start tests
describe("Input React Native", () => {
  it("renders text input value and change handler", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Input value="Ada" onChange={() => undefined} placeholder="Name" testID="subject" />);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.value).toBe("Ada");
    expect(subject.props.placeholder).toBe("Name");
    expect(subject.props.onChangeText).toEqual(expect.any(Function));
  });
});
// @generated:end
